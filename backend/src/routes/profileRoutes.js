// routes/profileRoutes.js
import { Router } from "express";
import { ensureAuthenticated } from "../middleware/ensureAuth.js";
import { authenticateJWT } from "../middleware/jwtAuth.js";
import upload from "../middleware/upload.js";
import {
  getProfile,
  updateBio,
  updateProfileImage,
  updateAbout,
  addSkill,
  removeSkill,
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
  addAward,
  updateAward,
  removeAward,
  addVideo,
  updateVideo,
  deleteVideo,
  deleteExperienceCertificate,
  deleteEducationCertificate,
  deleteAwardCertificate,
  deleteVideoThumbnail,
  addMutualReview,
  getMutualReviews
} from "../controllers/profileController.js";

const router = Router();

// Get full profile
router.get("/", authenticateJWT, getProfile);

// Bio routes
router.put("/bio", authenticateJWT, updateBio);

// Profile image routes
router.put("/image", authenticateJWT, upload.single('image'), updateProfileImage);

// About routes
router.put("/about", authenticateJWT, updateAbout);

// Skills routes
router.post("/skills", authenticateJWT, addSkill);
router.delete("/skills/:skill", authenticateJWT, removeSkill);

// Experience routes
router.post("/experience", authenticateJWT, upload.single('certificate'), addExperience);
router.put("/experience/:expId", authenticateJWT, upload.single('certificate'), updateExperience);
router.delete("/experience/:expId", authenticateJWT, removeExperience);
router.delete("/experience/:expId/certificate", authenticateJWT, deleteExperienceCertificate);


// Education routes
router.post("/education", authenticateJWT, upload.single('certificate'), addEducation);
router.put("/education/:eduId", authenticateJWT, upload.single('certificate'), updateEducation);
router.delete("/education/:eduId", authenticateJWT, removeEducation);
router.delete("/education/:eduId/certificate", authenticateJWT, deleteEducationCertificate);

// Awards routes
router.post("/awards", authenticateJWT, upload.single('certificate'), addAward);
router.put("/awards/:awardId", authenticateJWT, upload.single('certificate'), updateAward);
router.delete("/awards/:awardId", authenticateJWT, removeAward);
router.delete("/awards/:awardId/certificate", authenticateJWT, deleteAwardCertificate);

// Video routes
router.post("/videos", authenticateJWT, upload.single('image'), addVideo);
router.put("/videos/:videoId", authenticateJWT, upload.single('image'), updateVideo);
router.delete("/videos/:videoId", authenticateJWT, deleteVideo);
router.delete("/videos/:videoId/thumbnail", authenticateJWT, deleteVideoThumbnail);

// Mutual reviews routes
router.post('/:profileId/mutual-reviews', authenticateJWT, addMutualReview);
router.get('/:profileId/mutual-reviews', getMutualReviews);

export default router;
