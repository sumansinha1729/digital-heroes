import { Router } from "express";
import { signup, login, getCurrentUser, AuthError } from "../services/auth.service.js";
import { isValidEmail, isValidPassword, isValidFullName } from "../utils/validation.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

router.post("/signup", async (req, res) => {
  const { email, password, fullName } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "A valid email is required" });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  if (!isValidFullName(fullName)) {
    return res.status(400).json({ error: "Full name is required" });
  }

  try {
    const { token, user } = await signup({ email, password, fullName });
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!isValidEmail(email) || typeof password !== "string" || password.length === 0) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const { token, user } = await login({ email, password });
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.userId);
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
