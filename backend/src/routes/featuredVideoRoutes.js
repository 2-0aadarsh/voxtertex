import express from 'express';
import { authenticateJWT } from '../middleware/jwtAuth.js';
import FeaturedVideo from '../models/featuredVideo.js';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @route   GET /api/featured-videos/current
 * @desc    Get all featured videos for the current authenticated user
 * @access  Private
 */
router.get('/current', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Finding videos for authenticated user:', userId);
    
    const videos = await FeaturedVideo.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    return res.status(200).json(videos || []);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/featured-videos/:userId
 * @desc    Get all featured videos for a user (public access)
 * @access  Public
 */
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Finding videos for user:', userId);
    
    const videos = await FeaturedVideo.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    return res.status(200).json(videos || []);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/featured-videos/:userId/:videoId
 * @desc    Get a specific video by ID
 * @access  Public
 */
router.get('/:userId/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // Find the video
    const video = await FeaturedVideo.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Increment view count
    video.views += 1;
    await video.save();
    
    return res.status(200).json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/featured-videos
 * @desc    Add a new featured video for the current authenticated user
 * @access  Private
 */
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      title, 
      videoUrl, 
      description, 
      thumbnailUrl, 
      publicId,
      thumbnailPublicId,
      format = 'mp4',
      duration = 0,
      platform = 'Cloudinary', 
      tags = [],
      size,
      metadata = {},
      hasCustomThumbnail = false
    } = req.body;
    
    console.log('Received video data for user:', userId, req.body);
    
    // Validate required fields
    if (!title || !videoUrl || !thumbnailUrl) {
      return res.status(400).json({ message: 'Title, video URL, and thumbnail URL are required' });
    }
    
    // Format duration
    const durationInSeconds = Number(duration) || 0;
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    const durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Create new video object
    const newVideo = new FeaturedVideo({
      user: userId,
      title,
      description,
      videoUrl,
      publicId: publicId || videoUrl.split('/').pop().split('.')[0],
      thumbnailUrl,
      thumbnailPublicId: thumbnailPublicId || null,
      duration: durationInSeconds,
      durationFormatted,
      platform,
      tags,
      size,
      metadata,
      hasCustomThumbnail,
      status: 'ready',
      isFeatured: true
    });
    
    // Save the video
    await newVideo.save();
    console.log('Video saved successfully:', newVideo._id);
    
    // Return the newly added video
    return res.status(201).json(newVideo);
  } catch (error) {
    console.error('Error adding video:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/featured-videos/:videoId
 * @desc    Update a featured video
 * @access  Private
 */
router.put('/:videoId', authenticateJWT, async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;
    
    // Find the video
    const video = await FeaturedVideo.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if the video belongs to the user
    if (video.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this video' });
    }
    
    // Update the video
    Object.keys(updateData).forEach(key => {
      if (key !== 'user' && key !== '_id') { // Prevent changing user or ID
        video[key] = updateData[key];
      }
    });
    
    // Save the updated video
    await video.save();
    
    return res.status(200).json(video);
  } catch (error) {
    console.error('Error updating video:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   DELETE /api/featured-videos/:videoId
 * @desc    Delete a featured video
 * @access  Private
 */
router.delete('/:videoId', authenticateJWT, async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;
    
    // Find the video
    const video = await FeaturedVideo.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if the video belongs to the user
    if (video.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }
    
    // Delete the video
    await FeaturedVideo.findByIdAndDelete(videoId);
    
    return res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/featured-videos/:videoId/like
 * @desc    Like a video
 * @access  Private
 */
router.post('/:videoId/like', authenticateJWT, async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // Find the video
    const video = await FeaturedVideo.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Increment likes
    await video.like();
    
    return res.status(200).json({ likes: video.likes });
  } catch (error) {
    console.error('Error liking video:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/featured-videos/search/:query
 * @desc    Search for videos
 * @access  Public
 */
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    // Search for videos
    const videos = await FeaturedVideo.search(query);
    
    return res.status(200).json(videos);
  } catch (error) {
    console.error('Error searching videos:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;