import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createCheckoutSession,
  getMySubscription,
  cancelMySubscription,
  changeMyCharity,
  SubscriptionError,
} from "../services/subscriptions.service.js";

const router = Router();

function handleServiceError(err, res) {
  if (err instanceof SubscriptionError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: "Something went wrong" });
}

router.use(requireAuth);

router.post("/", async (req, res) => {
  const { plan, charityId, charityPercentage } = req.body;
  try {
    const result = await createCheckoutSession(req.user.userId, { plan, charityId, charityPercentage });
    res.status(201).json(result);
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.get("/me", async (req, res) => {
  try {
    const subscription = await getMySubscription(req.user.userId);
    res.json({ subscription });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.post("/cancel", async (req, res) => {
  try {
    const subscription = await cancelMySubscription(req.user.userId);
    res.json({ subscription });
  } catch (err) {
    handleServiceError(err, res);
  }
});

router.put("/charity", async (req, res) => {
  const { charityId, charityPercentage } = req.body;
  try {
    const subscription = await changeMyCharity(req.user.userId, { charityId, charityPercentage });
    res.json({ subscription });
  } catch (err) {
    handleServiceError(err, res);
  }
});

export default router;
