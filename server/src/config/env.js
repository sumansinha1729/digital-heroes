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
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET || "winner-proofs",
};

const requiredVars = [
  "databaseUrl",
  "jwtSecret",
  "stripeSecretKey",
  "stripePriceMonthly",
  "stripePriceYearly",
  "supabaseUrl",
  "supabaseServiceRoleKey",
];
for (const key of requiredVars) {
  if (!env[key]) {
    throw new Error(`Missing required environment variable for "${key}" — check your .env file`);
  }
}
