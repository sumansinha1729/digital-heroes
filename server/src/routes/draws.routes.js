import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listDraws, getDrawById, getMyUpcomingEntry, DrawError } from "../services/draws.service.js";

const router = Router();

function publicDraw(draw) {
  // Winning numbers and pool figures are only meaningful (and fair to show) once published.
  if (draw.status !== "PUBLISHED") {
    const { winningNumbers, ...rest } = draw;
    return rest;
  }
  return draw;
}

router.get("/", async (req, res) => {
  try {
    const draws = await listDraws();
    res.json({ draws: draws.map(publicDraw) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/me/upcoming", requireAuth, async (req, res) => {
  try {
    const result = await getMyUpcomingEntry(req.user.userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const draw = await getDrawById(req.params.id);
    res.json({ draw: publicDraw(draw) });
  } catch (err) {
    if (err instanceof DrawError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
