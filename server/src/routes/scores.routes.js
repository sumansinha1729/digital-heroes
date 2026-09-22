import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listRecentScores,
  createScore,
  updateScore,
  deleteScore,
  ScoreError,
} from "../services/scores.service.js";

const router = Router();

function isValidScoreValue(scoreValue) {
  return Number.isInteger(scoreValue) && scoreValue >= 1 && scoreValue <= 45;
}

function isValidScoreDate(scoreDate) {
  if (typeof scoreDate !== "string") return false;
  const parsed = new Date(scoreDate);
  return !Number.isNaN(parsed.getTime());
}

function handleServiceError(err, res) {
  if (err instanceof ScoreError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: "Something went wrong" });
}

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const scores = await listRecentScores(req.user.userId);
    res.json({ scores });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.post("/", async (req, res) => {
  const { scoreValue, scoreDate } = req.body;

  if (!isValidScoreValue(scoreValue)) {
    return res.status(400).json({ error: "scoreValue must be an integer between 1 and 45" });
  }
  if (!isValidScoreDate(scoreDate)) {
    return res.status(400).json({ error: "scoreDate must be a valid date" });
  }

  try {
    const score = await createScore(req.user.userId, { scoreValue, scoreDate });
    res.status(201).json({ score });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.put("/:id", async (req, res) => {
  const { scoreValue, scoreDate } = req.body;

  if (!isValidScoreValue(scoreValue)) {
    return res.status(400).json({ error: "scoreValue must be an integer between 1 and 45" });
  }
  if (!isValidScoreDate(scoreDate)) {
    return res.status(400).json({ error: "scoreDate must be a valid date" });
  }

  try {
    const score = await updateScore(req.user.userId, req.params.id, { scoreValue, scoreDate });
    res.json({ score });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deleteScore(req.user.userId, req.params.id);
    res.status(204).send();
  } catch (err) {
    handleServiceError(err, res);
  }
});

export default router;
