import express from "express";
import { getProfile, updateProfile } from "../controllers/myProfileController.js";
import { protect } from "../middleware/protectedMidlleware.js";

const router = express.Router();

// GET dummy profile
router.get("/", protect, getProfile);

// PUT dummy update profile
router.put("/", protect, updateProfile);

export default router;
