import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePriceMonthly: process.env.STRIPE_PRICE_MONTHLY,
  stripePriceYearly: process.env.STRIPE_PRICE_YEARLY,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

const requiredVars = [
  "databaseUrl",
  "jwtSecret",
  "stripeSecretKey",
  "stripePriceMonthly",
  "stripePriceYearly",
];
for (const key of requiredVars) {
  if (!env[key]) {
    throw new Error(`Missing required environment variable for "${key}" — check your .env file`);
  }
}
