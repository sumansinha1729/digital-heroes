import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
};

const requiredVars = ["databaseUrl", "jwtSecret"];
for (const key of requiredVars) {
  if (!env[key]) {
    throw new Error(`Missing required environment variable for "${key}" — check your .env file`);
  }
}
