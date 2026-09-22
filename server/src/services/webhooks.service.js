import { prisma } from "../config/prisma.js";
import { stripe } from "../config/stripe.js";

// Stripe API versions from 2025-03-31 onward nest the subscription reference under
// invoice.parent.subscription_details.subscription instead of the older top-level
// invoice.subscription field. Support both so this doesn't silently break on a version bump.
function getInvoiceSubscriptionId(invoice) {
  return invoice.subscription || invoice.parent?.subscription_details?.subscription || null;
}

function addInterval(date, plan) {
  const result = new Date(date);
  if (plan === "YEARLY") {
    result.setFullYear(result.getFullYear() + 1);
  } else {
    result.setMonth(result.getMonth() + 1);
  }
  return result;
}

// Creates the Subscription row for this Stripe subscription if it doesn't exist yet, or returns
// the existing one if it does. Prisma's upsert reduces the race window between two concurrent
// webhook deliveries for the same Stripe subscription (e.g. invoice.paid and
// checkout.session.completed landing close together) but is NOT fully atomic under Postgres —
// it's implemented as a SELECT followed by an INSERT or UPDATE, so two upserts can both see "no
// row yet" and both attempt to INSERT. The DB's unique constraint on stripeSubscriptionId still
// guarantees only one row ever exists, but the "loser" of that race gets a P2002 error from
// upsert instead of gracefully returning the winner's row — so we catch that specific case and
// re-fetch the row the other call just created.
async function upsertSubscriptionFromCheckoutMetadata({ userId, plan, charityId, charityPercentage }, stripeCustomerId, stripeSubscriptionId) {
  const periodStart = new Date();
  const periodEnd = addInterval(periodStart, plan);

  try {
    return await prisma.subscription.upsert({
      where: { stripeSubscriptionId },
      create: {
        userId,
        plan,
        status: "ACTIVE",
        charityId,
        charityPercentage: Number(charityPercentage),
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        stripeCustomerId,
        stripeSubscriptionId,
      },
      update: {},
    });
  } catch (err) {
    if (err.code === "P2002") {
      return prisma.subscription.findFirstOrThrow({ where: { stripeSubscriptionId } });
    }
    throw err;
  }
}

// Looks up a subscription by Stripe subscription ID. If it doesn't exist yet — which can happen
// because Stripe does not guarantee webhook delivery order, so invoice.paid can arrive before
// checkout.session.completed has created the row — this reconstructs it from Stripe's own
// Checkout Session data (where we stashed userId/plan/charityId/charityPercentage as metadata).
async function findOrCreateSubscription(stripeSubscriptionId) {
  const existing = await prisma.subscription.findFirst({ where: { stripeSubscriptionId } });
  if (existing) return existing;

  const sessions = await stripe.checkout.sessions.list({
    subscription: stripeSubscriptionId,
    limit: 1,
  });
  const session = sessions.data[0];
  if (!session || !session.metadata?.userId) return null;

  return upsertSubscriptionFromCheckoutMetadata(
    session.metadata,
    session.customer,
    stripeSubscriptionId
  );
}

async function handleCheckoutCompleted(session) {
  await upsertSubscriptionFromCheckoutMetadata(session.metadata, session.customer, session.subscription);
}

async function handleInvoicePaid(invoice) {
  const stripeSubscriptionId = getInvoiceSubscriptionId(invoice);
  if (!stripeSubscriptionId) {
    console.warn(`invoice.paid event ${invoice.id} has no resolvable subscription ID — skipping`);
    return;
  }

  const subscription = await findOrCreateSubscription(stripeSubscriptionId);
  if (!subscription) {
    console.warn(`invoice.paid event ${invoice.id}: could not find or reconstruct subscription ${stripeSubscriptionId}`);
    return;
  }

  const amount = invoice.amount_paid / 100;
  const charityAmount = Math.round(((amount * Number(subscription.charityPercentage)) / 100) * 100) / 100;
  const poolAmount = Math.round((amount - charityAmount) * 100) / 100;

  await prisma.payment.create({
    data: {
      subscriptionId: subscription.id,
      amount,
      charityAmount,
      poolAmount,
      stripeRef: invoice.id,
      status: "SUCCEEDED",
    },
  });

  const periodStart = new Date();
  const periodEnd = addInterval(periodStart, subscription.plan);
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "ACTIVE", currentPeriodStart: periodStart, currentPeriodEnd: periodEnd },
  });
}

async function handleInvoicePaymentFailed(invoice) {
  const stripeSubscriptionId = getInvoiceSubscriptionId(invoice);
  if (!stripeSubscriptionId) return;

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId },
    data: { status: "LAPSED" },
  });
}

async function handleSubscriptionDeleted(stripeSubscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: stripeSubscription.id },
    data: { status: "CANCELLED" },
  });
}

export async function processStripeEvent(event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;
    case "invoice.paid":
      await handleInvoicePaid(event.data.object);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object);
      break;
    default:
      break;
  }
}

export function constructStripeEvent(rawBody, signature, webhookSecret) {
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}
