import { Router } from "express";
import { listCharities } from "../services/charities.service.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const charities = await listCharities();
    res.json({ charities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
