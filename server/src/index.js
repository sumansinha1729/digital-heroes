import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import scoresRoutes from "./routes/scores.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/scores", scoresRoutes);

app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port}`);
});
