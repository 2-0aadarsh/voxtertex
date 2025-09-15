import { Router } from "express";
import { ensureAuthenticated } from "../middleware/ensureAuth.js";
import { authenticateJWT } from "../middleware/jwtAuth.js";
import PostService from "../services/post.service.js";
import multer from "multer";
import jwt from "jsonwebtoken";

const router = Router();

// Test endpoint
router.get("/test", (req, res) => {
  res.json({ message: "Enhanced posts route is working!", timestamp: new Date().toISOString() });
});

// Database test endpoint
router.get("/db-test", async (req, res) => {
  try {
    const EnhancedPost = (await import('../models/enhancedPost.js')).default;
    const postCount = await EnhancedPost.countDocuments();
    res.json({ 
      message: "Database connection working!", 
      postCount,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Database connection failed!", 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
});

// Debug endpoint to check total posts in database
router.get("/debug-posts", async (req, res) => {
  try {
    const EnhancedPost = (await import("../models/enhancedPost.js")).default;
    
    // Get total count of all posts
    const totalPosts = await EnhancedPost.countDocuments();
    
    // Get count of active public posts
    const activePublicPosts = await EnhancedPost.countDocuments({
      status: 'active',
      visibility: 'public'
    });
    
    // Get count of posts excluding current user (if authenticated)
    let currentUserId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
      } catch (error) {
        console.log('Invalid JWT token:', error.message);
      }
    }
    
    let userExcludedPosts = activePublicPosts;
    if (currentUserId) {
      userExcludedPosts = await EnhancedPost.countDocuments({
        status: 'active',
        visibility: 'public',
        user: { $ne: currentUserId }
      });
    }
    
    // Get sample posts
    const samplePosts = await EnhancedPost.find({
      status: 'active',
      visibility: 'public'
    })
    .select('_id title caption user createdAt')
    .populate('user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
    
    res.json({
      success: true,
      data: {
        totalPosts,
        activePublicPosts,
        userExcludedPosts,
        currentUserId,
        samplePosts: samplePosts.map(post => ({
          id: post._id,
          title: post.title,
          caption: post.caption?.substring(0, 50) + '...',
          user: post.user,
          createdAt: post.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Debug posts error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test user likes endpoint
router.get("/test-user-likes", async (req, res) => {
  try {
    console.log('=== TEST USER LIKES ROUTE ===');
    
    // Get current user ID from JWT if available
    let currentUserId = null;
    let isAuthenticated = false;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
        isAuthenticated = true;
        console.log('✅ User authenticated:', currentUserId);
      } catch (error) {
        console.log('❌ Invalid JWT token:', error.message);
      }
    } else {
      console.log('❌ No JWT token provided');
    }
    
    // Get user's liked posts if authenticated
    let likedPosts = [];
    if (currentUserId) {
      const EnhancedUser = (await import("../models/enhancedUser.js")).default;
      const user = await EnhancedUser.findById(currentUserId).select('likedPosts');
      likedPosts = user?.likedPosts || [];
      console.log('👤 User liked posts:', likedPosts.length);
    }
    
    res.json({
      success: true,
      data: {
        userId: currentUserId,
        likedPosts: likedPosts,
        isAuthenticated: isAuthenticated
      }
    });
  } catch (error) {
    console.error('Test user likes error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, and documents
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  }
});

/**
 * Create a new post
 * @route POST /api/posts
 */
router.post("/", authenticateJWT, upload.array('media', 10), async (req, res) => {
  try {
    const postData = req.body;
    
    // Process uploaded media files
    if (req.files && req.files.length > 0) {
      postData.media = req.files.map(file => ({
        type: file.mimetype.startsWith('image') ? 'image' : 
              file.mimetype.startsWith('video') ? 'video' : 'document',
        url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        filename: file.originalname,
        size: file.size
      }));
    }
    
    const post = await PostService.createPost(req.user._id, postData);
    
    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get feed posts
 * @route GET /api/posts/feed
 */
router.get("/feed", async (req, res) => {
  try {
    console.log('=== BACKEND FEED ROUTE DEBUG ===');
    console.log('🚀 Feed route hit!');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request query:', req.query);
    console.log('Request params:', req.params);
    
    const { page = 1, limit = 100 } = req.query;
    console.log('📄 Query params:', { page, limit });
    
    // Check if user is authenticated (check for JWT token)
    let currentUserId = null;
    console.log('🔐 Checking authentication...');
    console.log('Authorization header:', req.headers.authorization);
    
    // Try to extract user ID from JWT token if present
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
        console.log('✅ User authenticated via JWT:', currentUserId);
      } catch (error) {
        console.log('❌ Invalid JWT token:', error.message);
      }
    } else {
      console.log('❌ No JWT token provided');
    }
    
    // Get posts based on authentication status
    console.log('📞 Calling PostService.getEnhancedPosts...');
    const result = await PostService.getEnhancedPosts(
      parseInt(page), 
      parseInt(limit), 
      currentUserId
    );
    
    // Extract posts and total count from result
    const posts = result.posts || result;
    const totalCount = result.totalCount || posts.length;
    
    console.log('📊 Posts retrieved:', posts.length);
    console.log('📊 Total posts available:', totalCount);
    console.log('📊 Result structure:', {
      hasPosts: !!result.posts,
      hasTotalCount: !!result.totalCount,
      resultKeys: Object.keys(result)
    });
    console.log('📋 Sample post (if any):', posts[0] ? {
      id: posts[0]._id,
      title: posts[0].title,
      caption: posts[0].caption?.substring(0, 50) + '...',
      user: posts[0].user,
      userProfileImageUrl: posts[0].user?.profileImageUrl
    } : 'No posts found');
    
    const response = {
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount
        },
        userAuthenticated: !!currentUserId
      }
    };
    
    console.log('📤 Sending response:', {
      success: response.success,
      postsCount: response.data.posts.length,
      pagination: response.data.pagination,
      userAuthenticated: response.data.userAuthenticated
    });
    console.log('===============================');
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('=== BACKEND FEED ROUTE ERROR ===');
    console.error('❌ Feed route error:', error);
    console.error('Error stack:', error.stack);
    console.error('===============================');
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get post by ID
 * @route GET /api/posts/:postId
 */
router.get("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await PostService.getPostById(postId);
    
    // Increment views
    await PostService.incrementViews(postId);
    
    return res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get user's posts
 * @route GET /api/posts/user/:userId
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await PostService.getUserPosts(userId, parseInt(page), parseInt(limit));
    
    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: posts.length
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get public posts feed
 * @route GET /api/posts/feed/public
 */
router.get("/feed/public", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await PostService.getPublicPosts(parseInt(page), parseInt(limit));
    
    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: posts.length
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


/**
 * Get trending posts
 * @route GET /api/posts/feed/trending
 */
router.get("/feed/trending", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await PostService.getTrendingPosts(parseInt(page), parseInt(limit));
    
    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: posts.length
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Update post
 * @route PUT /api/posts/:postId
 */
router.put("/:postId", authenticateJWT, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await PostService.updatePost(postId, req.user._id, req.body);
    
    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Delete post
 * @route DELETE /api/posts/:postId
 */
router.delete("/:postId", authenticateJWT, async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await PostService.deletePost(postId, req.user._id);
    
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Like/Unlike post
 * @route POST /api/posts/:postId/like
 */
router.post("/:postId/like", authenticateJWT, async (req, res) => {
  try {
    console.log('=== LIKE ROUTE DEBUG ===');
    console.log('Post ID:', req.params.postId);
    console.log('User ID:', req.user._id);
    console.log('User data:', req.user);
    console.log('========================');
    
    const { postId } = req.params;
    const result = await PostService.toggleLike(postId, req.user._id);
    
    console.log('✅ Like toggled successfully, result:', result);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Like route error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Add comment to post
 * @route POST /api/posts/:postId/comments
 */
router.post("/:postId/comments", authenticateJWT, async (req, res) => {
  try {
    console.log('=== COMMENT ROUTE DEBUG ===');
    console.log('Post ID:', req.params.postId);
    console.log('User ID:', req.user._id);
    console.log('Request body:', req.body);
    console.log('User data:', req.user);
    console.log('===========================');
    
    const { postId } = req.params;
    const post = await PostService.addComment(postId, req.user._id, req.body);
    
    console.log('✅ Comment added successfully, returning post:', post._id);
    
    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { post }
    });
  } catch (error) {
    console.error('❌ Comment route error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Update comment
 * @route PUT /api/posts/:postId/comments/:commentId
 */
router.put("/:postId/comments/:commentId", authenticateJWT, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await PostService.updateComment(postId, commentId, req.user._id, req.body);
    
    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      post
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Delete comment
 * @route DELETE /api/posts/:postId/comments/:commentId
 */
router.delete("/:postId/comments/:commentId", authenticateJWT, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await PostService.deleteComment(postId, commentId, req.user._id);
    
    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      post
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Share post
 * @route POST /api/posts/:postId/share
 */
router.post("/:postId/share", authenticateJWT, async (req, res) => {
  try {
    const { postId } = req.params;
    const { shareNote } = req.body;
    
    const result = await PostService.sharePost(postId, req.user._id, shareNote);
    
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Report post
 * @route POST /api/posts/:postId/report
 */
router.post("/:postId/report", authenticateJWT, async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await PostService.reportPost(postId, req.user._id, req.body);
    
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Search posts
 * @route GET /api/posts/search
 */
router.get("/search", async (req, res) => {
  try {
    const { q: query, page = 1, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const posts = await PostService.searchPosts(query, parseInt(page), parseInt(limit));
    
    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: posts.length
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get posts by category
 * @route GET /api/posts/category/:category
 */
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await PostService.getPostsByCategory(category, parseInt(page), parseInt(limit));
    
    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: posts.length
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Pin/Unpin post
 * @route POST /api/posts/:postId/pin
 */
router.post("/:postId/pin", authenticateJWT, async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await PostService.togglePinPost(postId, req.user._id);
    
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export default router;












