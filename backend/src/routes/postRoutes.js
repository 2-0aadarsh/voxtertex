import { Router } from "express";
import { authenticateJWT } from "../middleware/jwtAuth.js";
import { v2 as cloudinary } from 'cloudinary';
import multer from "multer";
import EnhancedPost from "../models/enhancedPost.js";
import EnhancedUser from "../models/enhancedUser.js";
import { Readable } from 'stream';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Supported types: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX, TXT'), false);
    }
  }
});

/**
 * Create a new post with text only
 * @route POST /api/post/create
 */
router.post("/create", authenticateJWT, async (req, res) => {
  try {
    const { content, visibility = 'public', category = 'general' } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }
    
    // Get user information
    const user = await EnhancedUser.findById(req.user._id)
      .select('firstName lastName professionalTitle profileImage profileImageUrl');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create new post
    const post = new EnhancedPost({
      user: req.user._id,
      userName: `${user.firstName} ${user.lastName}`,
      userProfileImage: user.profileImage,
      userProfileImageUrl: user.profileImageUrl,
      userProfessionalTitle: user.professionalTitle || '',
      caption: content, // Map content to caption as required by the model
      visibility,
      category
    });
    
    await post.save();
    
    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create post'
    });
  }
});

/**
 * Create a new post with media files (Cloudinary integration)
 * @route POST /api/post/create-with-media
 */
router.post("/create-with-media", authenticateJWT, upload.array('media', 5), async (req, res) => {
  try {
    const { caption, content, visibility = 'public', category = 'general' } = req.body;
    
    // Use caption if provided, otherwise fall back to content for backward compatibility
    const postContent = caption || content;
    
    if (!postContent && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Post must contain either text content or media files'
      });
    }
    
    // Get user information
    const user = await EnhancedUser.findById(req.user._id)
      .select('firstName lastName professionalTitle profileImage profileImageUrl');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Process media files with Cloudinary
    const mediaItems = [];
    
    if (req.files && req.files.length > 0) {
      // Upload each file to Cloudinary
      for (const file of req.files) {
        try {
          // Create a stream from the buffer
          const stream = Readable.from(file.buffer);
          
          // Determine media type
          const mediaType = file.mimetype.startsWith('image') ? 'image' : 'document';
          
          // Upload to Cloudinary
          const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'posts',
                resource_type: mediaType === 'image' ? 'image' : 'auto',
                public_id: `post_${Date.now()}_${mediaItems.length}`,
                transformation: mediaType === 'image' ? [
                  { quality: 'auto' },
                  { fetch_format: 'auto' }
                ] : []
              },
              (error, result) => {
                if (error) {
                  console.error('Cloudinary upload error:', error);
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );
            
            // Pipe the stream to the upload stream
            stream.pipe(uploadStream);
          });
          
          // Log successful upload
          console.log(`✅ File uploaded to Cloudinary: ${file.originalname}`, {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            type: mediaType
          });
          
          // Add to media items
          mediaItems.push({
            type: mediaType,
            url: uploadResult.secure_url,
            filename: file.originalname,
            size: file.size,
            cloudinaryId: uploadResult.public_id
          });
        } catch (uploadError) {
          console.error('Error uploading file to Cloudinary:', uploadError);
          // Continue with other files if one fails
        }
      }
    }
    
    // Create new post
    const post = new EnhancedPost({
      user: req.user._id,
      userName: `${user.firstName} ${user.lastName}`,
      userProfileImage: user.profileImage,
      userProfileImageUrl: user.profileImageUrl,
      userProfessionalTitle: user.professionalTitle || '',
      caption: postContent, // Use the processed post content (caption or content)
      visibility,
      category,
      media: mediaItems
    });
    
    await post.save();
    
    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Error creating post with media:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create post'
    });
  }
});

/**
 * Get all posts by current user
 * @route GET /api/post/my-posts
 */
router.get("/my-posts", authenticateJWT, async (req, res) => {
  try {
    const posts = await EnhancedPost.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    return res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch posts'
    });
  }
});

/**
 * Get post by ID
 * @route GET /api/post/:postId
 */
router.get("/:postId", authenticateJWT, async (req, res) => {
  try {
    const post = await EnhancedPost.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch post'
    });
  }
});

/**
 * Delete post by ID
 * @route DELETE /api/post/:postId
 */
router.delete("/:postId", authenticateJWT, async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Find the post
    const post = await EnhancedPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if the user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post'
      });
    }
    
    // Delete any Cloudinary images if present
    if (post.media && post.media.length > 0) {
      for (const mediaItem of post.media) {
        if (mediaItem.cloudinaryId) {
          try {
            await cloudinary.uploader.destroy(mediaItem.cloudinaryId);
            console.log(`✅ Deleted media from Cloudinary: ${mediaItem.cloudinaryId}`);
          } catch (cloudinaryError) {
            console.error('Error deleting from Cloudinary:', cloudinaryError);
            // Continue with post deletion even if Cloudinary deletion fails
          }
        }
      }
    }
    
    // Delete the post
    await EnhancedPost.findByIdAndDelete(postId);
    
    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete post'
    });
  }
});

export default router;