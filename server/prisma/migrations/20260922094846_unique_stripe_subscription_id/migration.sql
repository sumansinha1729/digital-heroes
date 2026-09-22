-- Prevents the same Stripe subscription from ever being represented by more than one
-- Subscription row. Guards against a webhook-delivery race where handleCheckoutCompleted
-- and the invoice.paid fallback path could otherwise both create a row for the same
-- Stripe subscription if their existence checks ran concurrently.
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
