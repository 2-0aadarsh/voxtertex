import express from "express";
import { authenticateJWT, authorizeRoles } from "../middleware/jwtAuth.js";
import { getAllSpeakerProfiles, createSpeakerBooking } from "../controllers/bookSpeakerController.js";

const router = express.Router();

router.get(
  "/",
  authenticateJWT,              // ✅ First check JWT
  authorizeRoles("Organizer"),  // ✅ Only organizers allowed (check your role name!)
  getAllSpeakerProfiles
);
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("Organizer"), // ✅ only organizers allowed
  createSpeakerBooking
);

export default router;  // ✅ THIS FIXES THE ERROR
