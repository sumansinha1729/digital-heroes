import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import {
  createCharity,
  updateCharity,
  deleteCharity,
  CharityError,
} from "../services/charities.service.js";
import { createEvent, updateEvent, deleteEvent, EventError } from "../services/events.service.js";
import { createDraw, simulateDraw, publishDraw, listDraws, getDrawById, DrawError } from "../services/draws.service.js";
import { listAdminWinners, approveWinner, rejectWinner, markWinnerPaid, WinnerError } from "../services/winners.service.js";
import { listUsers, getUserDetail, updateUser, updateUserSubscription, UserError } from "../services/users.service.js";
import { adminUpdateScore, ScoreError } from "../services/scores.service.js";
import { getReports } from "../services/reports.service.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

// CharityError, EventError, DrawError, WinnerError, UserError, and ScoreError all carry
// { message, statusCode }.
function handleServiceError(err, res) {
  if (
    err instanceof CharityError ||
    err instanceof EventError ||
    err instanceof DrawError ||
    err instanceof WinnerError ||
    err instanceof UserError ||
    err instanceof ScoreError
  ) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: "Something went wrong" });
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

router.post("/charities", async (req, res) => {
  const { name, description, imageUrl, isFeatured } = req.body;

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ error: "name is required" });
  }
  if (!isNonEmptyString(description)) {
    return res.status(400).json({ error: "description is required" });
  }

  try {
    const charity = await createCharity({ name, description, imageUrl, isFeatured });
    res.status(201).json({ charity });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.put("/charities/:id", async (req, res) => {
  const { name, description, imageUrl, isFeatured } = req.body;

  try {
    const charity = await updateCharity(req.params.id, { name, description, imageUrl, isFeatured });
    res.json({ charity });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.delete("/charities/:id", async (req, res) => {
  try {
    await deleteCharity(req.params.id);
    res.status(204).send();
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.post("/charities/:id/events", async (req, res) => {
  const { title, description, eventDate, imageUrl } = req.body;

  if (!isNonEmptyString(title)) {
    return res.status(400).json({ error: "title is required" });
  }
  if (!isNonEmptyString(description)) {
    return res.status(400).json({ error: "description is required" });
  }
  if (!eventDate || Number.isNaN(new Date(eventDate).getTime())) {
    return res.status(400).json({ error: "eventDate must be a valid date" });
  }

  try {
    const event = await createEvent(req.params.id, { title, description, eventDate, imageUrl });
    res.status(201).json({ event });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.put("/events/:id", async (req, res) => {
  const { title, description, eventDate, imageUrl } = req.body;

  try {
    const event = await updateEvent(req.params.id, { title, description, eventDate, imageUrl });
    res.json({ event });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.delete("/events/:id", async (req, res) => {
  try {
    await deleteEvent(req.params.id);
    res.status(204).send();
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.get("/draws", async (req, res) => {
  try {
    const draws = await listDraws();
    res.json({ draws });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.get("/draws/:id", async (req, res) => {
  try {
    const draw = await getDrawById(req.params.id);
    res.json({ draw });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.post("/draws", async (req, res) => {
  const { drawMonth, periodStart, periodEnd, logicType } = req.body;

  if (!drawMonth || Number.isNaN(new Date(drawMonth).getTime())) {
    return res.status(400).json({ error: "drawMonth must be a valid date" });
  }
  if (!periodStart || Number.isNaN(new Date(periodStart).getTime())) {
    return res.status(400).json({ error: "periodStart must be a valid date" });
  }
  if (!periodEnd || Number.isNaN(new Date(periodEnd).getTime())) {
    return res.status(400).json({ error: "periodEnd must be a valid date" });
  }

  try {
    const draw = await createDraw({ drawMonth, periodStart, periodEnd, logicType });
    res.status(201).json({ draw });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.post("/draws/:id/simulate", async (req, res) => {
  try {
    const result = await simulateDraw(req.params.id);
    res.json(result);
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.post("/draws/:id/publish", async (req, res) => {
  try {
    const draw = await publishDraw(req.params.id);
    res.json({ draw });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.get("/winners", async (req, res) => {
  try {
    const winners = await listAdminWinners({ status: req.query.status });
    res.json({ winners });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.put("/winners/:id/verify", async (req, res) => {
  const { decision, reason } = req.body;

  if (decision !== "APPROVED" && decision !== "REJECTED") {
    return res.status(400).json({ error: "decision must be APPROVED or REJECTED" });
  }
  if (decision === "REJECTED" && !(typeof reason === "string" && reason.trim().length > 0)) {
    return res.status(400).json({ error: "A reason is required when rejecting a winner" });
  }

  try {
    const winner =
      decision === "APPROVED"
        ? await approveWinner(req.user.userId, req.params.id)
        : await rejectWinner(req.user.userId, req.params.id, reason);
    res.json({ winner });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.put("/winners/:id/payout", async (req, res) => {
  try {
    const winner = await markWinnerPaid(req.params.id);
    res.json({ winner });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await listUsers({ search: req.query.search });
    res.json({ users });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const user = await getUserDetail(req.params.id);
    res.json({ user });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.put("/users/:id", async (req, res) => {
  const { fullName, role } = req.body;
  try {
    const user = await updateUser(req.params.id, { fullName, role });
    res.json({ user });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.put("/users/:id/subscription", async (req, res) => {
  const { status, charityId, charityPercentage } = req.body;
  try {
    const subscription = await updateUserSubscription(req.params.id, {
      status,
      charityId,
      charityPercentage,
    });
    res.json({ subscription });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.put("/scores/:id", async (req, res) => {
  const { scoreValue, scoreDate } = req.body;

  if (!Number.isInteger(scoreValue) || scoreValue < 1 || scoreValue > 45) {
    return res.status(400).json({ error: "scoreValue must be an integer between 1 and 45" });
  }
  if (!scoreDate || Number.isNaN(new Date(scoreDate).getTime())) {
    return res.status(400).json({ error: "scoreDate must be a valid date" });
  }

  try {
    const score = await adminUpdateScore(req.params.id, { scoreValue, scoreDate });
    res.json({ score });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.get("/reports", async (req, res) => {
  try {
    const reports = await getReports();
    res.json(reports);
  } catch (err) {
    handleServiceError(err, res);
  }
});

export default router;
