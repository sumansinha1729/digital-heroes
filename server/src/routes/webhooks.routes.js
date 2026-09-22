import { Router } from "express";
import express from "express";
import { env } from "../config/env.js";
import { constructStripeEvent, processStripeEvent } from "../services/webhooks.service.js";

const router = Router();

router.post("/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = constructStripeEvent(req.body, signature, env.stripeWebhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  try {
    await processStripeEvent(event);
    res.json({ received: true });
  } catch (err) {
    console.error("Error processing Stripe webhook:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
