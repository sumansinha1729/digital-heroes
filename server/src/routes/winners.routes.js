import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { getMyWinners, submitProof, WinnerError } from "../services/winners.service.js";
import { StorageError } from "../services/storage.service.js";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only PNG, JPEG, or WEBP images are allowed"));
    }
    cb(null, true);
  },
});

const router = Router();

router.use(requireAuth);

router.get("/me", async (req, res) => {
  try {
    const winners = await getMyWinners(req.user.userId);
    res.json({ winners });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/:id/proof", (req, res) => {
  upload.single("proof")(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ error: uploadErr.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const winner = await submitProof(req.user.userId, req.params.id, req.file);
      res.json({ winner });
    } catch (err) {
      if (err instanceof WinnerError || err instanceof StorageError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      console.error(err);
      res.status(500).json({ error: "Something went wrong" });
    }
  });
});

export default router;
