import express from "express";
import { authenticateJWT, authorizeRoles } from "../middleware/jwtAuth.js";
import { addSpeakerTag, removeSpeakerTag } from "../controllers/tagSpeakerController.js";

const router = express.Router();

// ✅ Organizer can directly add a tag to a speaker
router.post("/:speakerId", authenticateJWT, authorizeRoles("Organizer"), addSpeakerTag);
router.delete("/:speakerId",  authenticateJWT, authorizeRoles("Organizer"), removeSpeakerTag);


export default router;
