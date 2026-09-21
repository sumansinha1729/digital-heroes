import express from "express";
import cors from "cors";
import { env } from "./config/env.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port}`);
});
