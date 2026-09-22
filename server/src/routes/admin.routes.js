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

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

// Both CharityError and EventError carry { message, statusCode } — treated the same way here.
function handleServiceError(err, res) {
  if (err instanceof CharityError || err instanceof EventError) {
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

export default router;
