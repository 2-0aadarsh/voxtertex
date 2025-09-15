import { Router } from "express";
import { ensureAuthenticated } from "../middleware/ensureAuth.js";
import ProfileService from "../services/profile.service.js";
import multer from "multer";

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

/**
 * Get user profile
 * @route GET /api/profile/:userId
 */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await ProfileService.getProfile(userId);
    
    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Add work experience
 * @route POST /api/profile/experience
 */
router.post("/experience", ensureAuthenticated, upload.single('certificate'), async (req, res) => {
  try {
    const experienceData = req.body;
    
    // Add certificate if uploaded
    if (req.file) {
      experienceData.certificate = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      };
    }
    
    const profile = await ProfileService.addExperience(req.user._id, experienceData);
    
    return res.status(201).json({
      success: true,
      message: 'Experience added successfully',
      profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Update work experience
 * @route PUT /api/profile/experience/:experienceId
 */
router.put("/experience/:experienceId", ensureAuthenticated, upload.single('certificate'), async (req, res) => {
  try {
    const { experienceId } = req.params;
    const updateData = req.body;
    
    // Add certificate if uploaded
    if (req.file) {
      updateData.certificate = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      };
    }
    
    const profile = await ProfileService.updateExperience(req.user._id, experienceId, updateData);
    
    return res.status(200).json({
      success: true,
      message: 'Experience updated successfully',
      profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Delete work experience
 * @route DELETE /api/profile/experience/:experienceId
 */
router.delete("/experience/:experienceId", ensureAuthenticated, async (req, res) => {
  try {
    const { experienceId } = req.params;
    const profile = await ProfileService.removeExperience(req.user._id, experienceId);
    
    return res.status(200).json({
      success: true,
      message: 'Experience removed successfully',
      profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Add education
 * @route POST /api/profile/education
 */
router.post("/education", ensureAuthenticated, upload.single('certificate'), async (req, res) => {
  try {
    const educationData = req.body;
    
    // Add certificate if uploaded
    if (req.file) {
      educationData.certificate = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      };
    }
    
    const profile = await ProfileService.addEducation(req.user._id, educationData);
    
    return res.status(201).json({
      success: true,
      message: 'Education added successfully',
      profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Update education
 * @route PUT /api/profile/education/:educationId
 */
router.put("/education/:educationId", ensureAuthenticated, upload.single('certificate'), async (req, res) => {
  try {
    const { educationId } = req.params;
    const updateData = req.body;
    
    // Add certificate if uploaded
    if (req.file) {
      updateData.certificate = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      };
    }
    
    const profile = await ProfileService.updateEducation(req.user._id, educationId, updateData);
    
    return res.status(200).json({
      success: true,
      message: 'Education updated successfully',
      profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Delete education
 * @route DELETE /api/profile/education/:educationId
 */
router.delete("/education/:educationId", ensureAuthenticated, async (req, res) => {
  try {
    const { educationId } = req.params;
    const profile = await ProfileService.removeEducation(req.user._id, educationId);
    
    return res.status(200).json({
      success: true,
      message: 'Education removed successfully',
      profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Add award
 * @route POST /api/profile/awards
 */
router.post("/awards", ensureAuthenticated, upload.single('certificate'), async (req, res) => {
  try {
    const awardData = req.body;
    
    // Add certificate if uploaded
    if (req.file) {
      awardData.certificate = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      };
    }
    
    const profile = await ProfileService.addAward(req.user._id, awardData);
    
    return res.status(201).json({
      success: true,
      message: 'Award added successfully',
      profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Update award
 * @route PUT /api/profile/awards/:awardId
 */
router.put("/awards/:awardId", ensureAuthenticated, upload.single('certificate'), async (req, res) => {
  try {
    const { awardId } = req.params;
    const updateData = req.body;
    
    // Add certificate if uploaded
    if (req.file) {
      updateData.certificate = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      };
    }
    
    const profile = await ProfileService.updateAward(req.user._id, awardId, updateData);
    
    return res.status(200).json({
      success: true,
      message: 'Award updated successfully',
      profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Delete award
 * @route DELETE /api/profile/awards/:awardId
 */
router.delete("/awards/:awardId", ensureAuthenticated, async (req, res) => {
  try {
    const { awardId } = req.params;
    const profile = await ProfileService.removeAward(req.user._id, awardId);
    
    return res.status(200).json({
      success: true,
      message: 'Award removed successfully',
      profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Add featured video
 * @route POST /api/profile/videos
 */
router.post("/videos", ensureAuthenticated, upload.single('thumbnail'), async (req, res) => {
  try {
    const videoData = req.body;
    
    // Add thumbnail if uploaded
    if (req.file) {
      videoData.thumbnail = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      };
    }
    
    const profile = await ProfileService.addVideo(req.user._id, videoData);
    
    return res.status(201).json({
      success: true,
      message: 'Video added successfully',
      profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Update featured video
 * @route PUT /api/profile/videos/:videoId
 */
router.put("/videos/:videoId", ensureAuthenticated, upload.single('thumbnail'), async (req, res) => {
  try {
    const { videoId } = req.params;
    const updateData = req.body;
    
    // Add thumbnail if uploaded
    if (req.file) {
      updateData.thumbnail = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      };
    }
    
    const profile = await ProfileService.updateVideo(req.user._id, videoId, updateData);
    
    return res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Delete featured video
 * @route DELETE /api/profile/videos/:videoId
 */
router.delete("/videos/:videoId", ensureAuthenticated, async (req, res) => {
  try {
    const { videoId } = req.params;
    const profile = await ProfileService.removeVideo(req.user._id, videoId);
    
    return res.status(200).json({
      success: true,
      message: 'Video removed successfully',
      profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Update skills
 * @route PUT /api/profile/skills
 */
router.put("/skills", ensureAuthenticated, async (req, res) => {
  try {
    const { skills } = req.body;
    const profile = await ProfileService.updateSkills(req.user._id, skills);
    
    return res.status(200).json({
      success: true,
      message: 'Skills updated successfully',
      profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Add review
 * @route POST /api/profile/:userId/reviews
 */
router.post("/:userId/reviews", ensureAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const reviewData = {
      ...req.body,
      reviewer: req.user._id
    };
    
    const profile = await ProfileService.addReview(userId, reviewData);
    
    return res.status(201).json({
      success: true,
      message: 'Review added successfully',
      profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Update privacy settings
 * @route PUT /api/profile/privacy
 */
router.put("/privacy", ensureAuthenticated, async (req, res) => {
  try {
    const profile = await ProfileService.updatePrivacySettings(req.user._id, req.body);
    
    return res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully',
      profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get profile statistics
 * @route GET /api/profile/stats
 */
router.get("/stats", ensureAuthenticated, async (req, res) => {
  try {
    const stats = await ProfileService.getProfileStats(req.user._id);
    
    return res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Search profiles
 * @route GET /api/profile/search
 */
router.get("/search", async (req, res) => {
  try {
    const { q: query, minRating, skillLevel } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const filters = {};
    if (minRating) filters.minRating = parseFloat(minRating);
    if (skillLevel) filters.skillLevel = skillLevel;
    
    const profiles = await ProfileService.searchProfiles(query, filters);
    
    return res.status(200).json({
      success: true,
      profiles
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export default router;


