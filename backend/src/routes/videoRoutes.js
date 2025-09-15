import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import EnhancedProfile from '../models/enhancedProfile.js';

const router = express.Router();

/**
 * @route   GET /api/users/:userId/videos
 * @desc    Get all featured videos for a user
 * @access  Private
 */
router.get('/:userId/videos', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find the user's profile
    const profile = await EnhancedProfile.findOne({ user: userId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Return the featured videos
    return res.status(200).json(profile.featuredVideos || []);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/users/:userId/videos
 * @desc    Add a new featured video
 * @access  Private
 */
router.post('/:userId/videos', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { title, videoUrl, description, thumbnailUrl, platform = 'Other' } = req.body;
    
    // Validate required fields
    if (!title || !videoUrl) {
      return res.status(400).json({ message: 'Title and video URL are required' });
    }
    
    // Find the user's profile
    const profile = await EnhancedProfile.findOne({ user: userId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Create new video object
    const newVideo = {
      title,
      videoUrl,
      platform,
      description,
      // If a thumbnailUrl is provided, use it
      ...(thumbnailUrl && { 
        thumbnail: {
          contentType: 'image/jpeg',
          filename: thumbnailUrl.split('/').pop()
        }
      }),
      isPublic: true,
      views: 0,
      // Add any additional fields as needed
    };
    
    // Add to featured videos array
    profile.featuredVideos.push(newVideo);
    
    // Save the profile
    await profile.save();
    
    // Return the newly added video
    return res.status(201).json(profile.featuredVideos[profile.featuredVideos.length - 1]);
  } catch (error) {
    console.error('Error adding video:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   DELETE /api/users/:userId/videos/:videoId
 * @desc    Delete a featured video
 * @access  Private
 */
router.delete('/:userId/videos/:videoId', auth, async (req, res) => {
  try {
    const { userId, videoId } = req.params;
    
    // Find the user's profile
    const profile = await EnhancedProfile.findOne({ user: userId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Find the video index
    const videoIndex = profile.featuredVideos.findIndex(
      video => video._id.toString() === videoId
    );
    
    if (videoIndex === -1) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Remove the video
    profile.featuredVideos.splice(videoIndex, 1);
    
    // Save the profile
    await profile.save();
    
    return res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;