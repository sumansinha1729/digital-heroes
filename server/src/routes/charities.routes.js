import { Router } from "express";
import {
  listCharities,
  getFeaturedCharity,
  getCharityById,
  getCharityStats,
  CharityError,
} from "../services/charities.service.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const charities = await listCharities({ search: req.query.search });
    res.json({ charities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const charity = await getFeaturedCharity();
    res.json({ charity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const charity = await getCharityById(req.params.id);
    res.json({ charity });
  } catch (err) {
    if (err instanceof CharityError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/:id/stats", async (req, res) => {
  try {
    const stats = await getCharityStats(req.params.id);
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
