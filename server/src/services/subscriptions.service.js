import { prisma } from "../config/prisma.js";
import { stripe } from "../config/stripe.js";
import { env } from "../config/env.js";

const MIN_CHARITY_PERCENTAGE = 10;

export class SubscriptionError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

function priceIdForPlan(plan) {
  return plan === "YEARLY" ? env.stripePriceYearly : env.stripePriceMonthly;
}

export async function createCheckoutSession(userId, { plan, charityId, charityPercentage }) {
  if (plan !== "MONTHLY" && plan !== "YEARLY") {
    throw new SubscriptionError("plan must be MONTHLY or YEARLY", 400);
  }

  const pct = charityPercentage ?? MIN_CHARITY_PERCENTAGE;
  if (typeof pct !== "number" || pct < MIN_CHARITY_PERCENTAGE || pct > 100) {
    throw new SubscriptionError(`charityPercentage must be between ${MIN_CHARITY_PERCENTAGE} and 100`, 400);
  }

  const charity = await prisma.charity.findUnique({ where: { id: charityId } });
  if (!charity) {
    throw new SubscriptionError("Charity not found", 404);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  const existingActive = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
  });
  if (existingActive) {
    throw new SubscriptionError("You already have an active subscription", 409);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [{ price: priceIdForPlan(plan), quantity: 1 }],
    success_url: `${env.clientUrl}/dashboard?subscribed=true`,
    cancel_url: `${env.clientUrl}/dashboard?subscribed=false`,
    metadata: {
      userId,
      plan,
      charityId,
      charityPercentage: String(pct),
    },
  });

  return { checkoutUrl: session.url };
}

export async function getMySubscription(userId) {
  return prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { charity: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function cancelMySubscription(userId) {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
  });
  if (!subscription) {
    throw new SubscriptionError("No active subscription found", 404);
  }

  if (subscription.stripeSubscriptionId) {
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
  }

  return prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "CANCELLED" },
  });
}

export async function changeMyCharity(userId, { charityId, charityPercentage }) {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
  });
  if (!subscription) {
    throw new SubscriptionError("No active subscription found", 404);
  }

  const charity = await prisma.charity.findUnique({ where: { id: charityId } });
  if (!charity) {
    throw new SubscriptionError("Charity not found", 404);
  }

  const pct = charityPercentage ?? subscription.charityPercentage;
  if (typeof pct !== "number" || pct < MIN_CHARITY_PERCENTAGE || pct > 100) {
    throw new SubscriptionError(`charityPercentage must be between ${MIN_CHARITY_PERCENTAGE} and 100`, 400);
  }

  return prisma.subscription.update({
    where: { id: subscription.id },
    data: { charityId, charityPercentage: pct },
  });
}
