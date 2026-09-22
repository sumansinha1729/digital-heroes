import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createDonation, DonationError } from "../services/donations.service.js";

const router = Router();

function isValidAmount(amount) {
  return typeof amount === "number" && amount > 0;
}

router.post("/", requireAuth, async (req, res) => {
  const { charityId, amount } = req.body;

  if (!charityId || typeof charityId !== "string") {
    return res.status(400).json({ error: "charityId is required" });
  }
  if (!isValidAmount(amount)) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  try {
    const donation = await createDonation(req.user.userId, { charityId, amount });
    res.status(201).json({ donation });
  } catch (err) {
    if (err instanceof DonationError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
