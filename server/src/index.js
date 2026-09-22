import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import scoresRoutes from "./routes/scores.routes.js";
import subscriptionsRoutes from "./routes/subscriptions.routes.js";
import charitiesRoutes from "./routes/charities.routes.js";
import donationsRoutes from "./routes/donations.routes.js";
import drawsRoutes from "./routes/draws.routes.js";
import winnersRoutes from "./routes/winners.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import webhooksRoutes from "./routes/webhooks.routes.js";

const app = express();

app.use(cors());

// Mounted before express.json() — Stripe webhook signature verification
// needs the raw, unparsed request body, not a JSON-parsed object.
app.use("/api/webhooks", webhooksRoutes);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/scores", scoresRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/charities", charitiesRoutes);
app.use("/api/donations", donationsRoutes);
app.use("/api/draws", drawsRoutes);
app.use("/api/winners", winnersRoutes);
app.use("/api/admin", adminRoutes);

app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port}`);
});
