import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateJWT } from '../middleware/jwtAuth.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure local storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer with disk storage for videos
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for better reliability
  },
  fileFilter: function (req, file, cb) {
    // Accept video files only
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// Configure multer for thumbnails (images)
const thumbnailUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for thumbnails
  },
  fileFilter: function (req, file, cb) {
    // Accept image files only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails!'), false);
    }
  }
});

// Configure multer for both video and thumbnail
const multiUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for videos, 5MB for thumbnails
  },
  fileFilter: function (req, file, cb) {
    // Accept both video and image files
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video and image files are allowed!'), false);
    }
  }
});

/**
 * @route   POST /api/upload/video
 * @desc    Upload video to Cloudinary
 * @access  Private
 */
router.post('/video', authenticateJWT, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File size exceeds the 50MB limit' });
      }
      return res.status(400).json({ message: err.message || 'Error uploading file' });
    }
    next();
  });
}, async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('📁 File uploaded to local storage:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    // Upload the file to Cloudinary
    try {
      console.log('☁️ Starting Cloudinary upload...');
      
      // Try simple upload first
      let result;
      try {
        // For large files (>20MB), use basic upload without transformations
        const fileSizeMB = req.file.size / (1024 * 1024);
        console.log(`📊 File size: ${fileSizeMB.toFixed(2)}MB`);
        
        if (fileSizeMB > 20) {
          console.log('📦 Large file detected, using basic upload without transformations...');
          result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'video',
            folder: 'featuredVideos',
            overwrite: true,
            // No transformations for large files to avoid timeouts
            use_filename: true,
            unique_filename: true
          });
        } else {
          console.log('📦 Small file detected, using optimized upload with transformations...');
          result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'video',
            folder: 'featuredVideos',
            overwrite: true,
            // Simple transformation for web compatibility
            transformation: [
              { quality: 'auto', fetch_format: 'auto' }
            ],
            eager: [
              { 
                format: 'mp4', 
                transformation: [
                  { quality: 'auto', fetch_format: 'auto' }
                ]
              }
            ],
            eager_async: true, // Allow async processing
            eager_notification_url: process.env.CLOUDINARY_NOTIFICATION_URL,
            notification_url: process.env.CLOUDINARY_NOTIFICATION_URL
          });
        }
      } catch (transformationError) {
        console.log('⚠️ Transformation failed, trying basic upload...', transformationError.message);
        // Fallback to basic upload without transformations
        result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'video',
          folder: 'featuredVideos',
          overwrite: true,
          use_filename: true,
          unique_filename: true
        });
      }

      console.log('Cloudinary upload result:', result);

      // Generate thumbnail URL
      const thumbnailUrl = cloudinary.url(result.public_id, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [
          { width: 640, height: 360, crop: "fill" },
          { fetch_format: "auto" }
        ]
      });

      // Delete the local file after upload to Cloudinary
      fs.unlinkSync(req.file.path);

      // Extract video metadata
      const metadata = {
        width: result.width,
        height: result.height,
        aspectRatio: result.width && result.height ? `${result.width}:${result.height}` : undefined,
        bitRate: result.bit_rate,
        frameRate: result.frame_rate,
        codec: result.video?.codec,
        audio: {
          codec: result.audio?.codec,
          channels: result.audio?.channels,
          sampleRate: result.audio?.frequency
        }
      };

      // Ensure the video URL is in MP4 format for web compatibility
      const videoUrl = result.secure_url.includes('.mp4') 
        ? result.secure_url 
        : result.secure_url.replace(/\.[^/.]+$/, '.mp4');

      console.log('📹 Original URL:', result.secure_url);
      console.log('📹 Processed URL:', videoUrl);
      console.log('📹 Format:', result.format);

      // Return the Cloudinary response with enhanced metadata
      return res.status(200).json({
        success: true,
        videoUrl: videoUrl,
        publicId: result.public_id,
        format: 'mp4', // Force MP4 format for web compatibility
        thumbnailUrl,
        duration: result.duration || 0,
        size: result.bytes,
        metadata,
        original_filename: req.file.originalname
      });
    } catch (cloudinaryError) {
      console.error('❌ Error uploading to Cloudinary:', cloudinaryError);
      console.error('❌ Cloudinary error details:', {
        message: cloudinaryError.message,
        http_code: cloudinaryError.http_code,
        name: cloudinaryError.name,
        stack: cloudinaryError.stack
      });
      
      // Clean up the local file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(500).json({ 
        message: 'Error uploading to Cloudinary', 
        error: cloudinaryError.message,
        details: cloudinaryError.http_code || 'Unknown error'
      });
    }
  } catch (error) {
    console.error('General error in upload route:', error);
    
    // Clean up the local file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/upload/thumbnail
 * @desc    Upload custom thumbnail to Cloudinary
 * @access  Private
 */
router.post('/thumbnail', authenticateJWT, upload.single('file'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'thumbnails',
      overwrite: true,
      transformation: [
        { width: 640, height: 360, crop: "fill" },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    // Delete the local file after upload to Cloudinary
    fs.unlinkSync(req.file.path);

    // Return the Cloudinary response
    return res.status(200).json({
      success: true,
      thumbnailUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Error uploading thumbnail to Cloudinary:', error);
    
    // Clean up the local file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/upload/video-with-thumbnail
 * @desc    Upload video and optional thumbnail to Cloudinary
 * @access  Private
 */
router.post('/video-with-thumbnail', authenticateJWT, (req, res, next) => {
  multiUpload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File size exceeds the limit' });
      }
      return res.status(400).json({ message: err.message || 'Error uploading files' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const videoFile = req.files?.video?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    // Check if video was uploaded
    if (!videoFile) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    console.log('📁 Files uploaded to local storage:', {
      video: videoFile ? {
        filename: videoFile.filename,
        originalname: videoFile.originalname,
        mimetype: videoFile.mimetype,
        size: videoFile.size
      } : null,
      thumbnail: thumbnailFile ? {
        filename: thumbnailFile.filename,
        originalname: thumbnailFile.originalname,
        mimetype: thumbnailFile.mimetype,
        size: thumbnailFile.size
      } : null
    });

    let videoResult, thumbnailResult = null;

    try {
      // Upload video to Cloudinary
      console.log('☁️ Starting video upload to Cloudinary...');
      
      let result;
      try {
        // For large files (>20MB), use basic upload without transformations
        const fileSizeMB = videoFile.size / (1024 * 1024);
        console.log(`📊 File size: ${fileSizeMB.toFixed(2)}MB`);
        
        if (fileSizeMB > 20) {
          console.log('📦 Large file detected, using basic upload without transformations...');
          result = await cloudinary.uploader.upload(videoFile.path, {
            resource_type: 'video',
            folder: 'featuredVideos',
            overwrite: true,
            // No transformations for large files to avoid timeouts
            use_filename: true,
            unique_filename: true
          });
        } else {
          console.log('📦 Small file detected, using optimized upload with transformations...');
          result = await cloudinary.uploader.upload(videoFile.path, {
            resource_type: 'video',
            folder: 'featuredVideos',
            overwrite: true,
            transformation: [
              { quality: 'auto', fetch_format: 'auto' }
            ],
            eager: [
              { 
                format: 'mp4', 
                transformation: [
                  { quality: 'auto', fetch_format: 'auto' }
                ]
              }
            ],
            eager_async: true,
            eager_notification_url: process.env.CLOUDINARY_NOTIFICATION_URL,
            notification_url: process.env.CLOUDINARY_NOTIFICATION_URL
          });
        }
      } catch (transformationError) {
        console.log('⚠️ Video transformation failed, trying basic upload...', transformationError.message);
        result = await cloudinary.uploader.upload(videoFile.path, {
          resource_type: 'video',
          folder: 'featuredVideos',
          overwrite: true,
          use_filename: true,
          unique_filename: true
        });
      }

      videoResult = result;
      console.log('✅ Video uploaded successfully:', result.public_id);

      // Upload thumbnail to Cloudinary if provided
      if (thumbnailFile) {
        console.log('☁️ Starting thumbnail upload to Cloudinary...');
        thumbnailResult = await cloudinary.uploader.upload(thumbnailFile.path, {
          folder: 'featuredVideos/thumbnails',
          overwrite: true,
          transformation: [
            { width: 640, height: 360, crop: "fill" },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        });
        console.log('✅ Thumbnail uploaded successfully:', thumbnailResult.public_id);
      }

      // Clean up local files
      fs.unlinkSync(videoFile.path);
      if (thumbnailFile) {
        fs.unlinkSync(thumbnailFile.path);
      }

      // Generate auto thumbnail URL if no custom thumbnail was provided
      let finalThumbnailUrl;
      if (thumbnailResult) {
        finalThumbnailUrl = thumbnailResult.secure_url;
      } else {
        finalThumbnailUrl = cloudinary.url(videoResult.public_id, {
          resource_type: 'video',
          format: 'jpg',
          transformation: [
            { width: 640, height: 360, crop: "fill" },
            { fetch_format: "auto" }
          ]
        });
      }

      // Extract video metadata
      const metadata = {
        width: videoResult.width,
        height: videoResult.height,
        aspectRatio: videoResult.width && videoResult.height ? `${videoResult.width}:${videoResult.height}` : undefined,
        bitRate: videoResult.bit_rate,
        frameRate: videoResult.frame_rate,
        codec: videoResult.video?.codec,
        audio: {
          codec: videoResult.audio?.codec,
          channels: videoResult.audio?.channels,
          sampleRate: videoResult.audio?.frequency
        }
      };

      // Ensure the video URL is in MP4 format for web compatibility
      const videoUrl = videoResult.secure_url.includes('.mp4') 
        ? videoResult.secure_url 
        : videoResult.secure_url.replace(/\.[^/.]+$/, '.mp4');

      console.log('📹 Final URLs:', {
        videoUrl,
        thumbnailUrl: finalThumbnailUrl,
        format: videoResult.format
      });

      // Return the upload results
      return res.status(200).json({
        success: true,
        videoUrl: videoUrl,
        publicId: videoResult.public_id,
        format: 'mp4',
        thumbnailUrl: finalThumbnailUrl,
        thumbnailPublicId: thumbnailResult?.public_id || null,
        duration: videoResult.duration || 0,
        size: videoResult.bytes,
        metadata,
        original_filename: videoFile.originalname,
        hasCustomThumbnail: !!thumbnailResult
      });

    } catch (cloudinaryError) {
      console.error('❌ Error uploading to Cloudinary:', cloudinaryError);
      
      // Clean up local files
      if (fs.existsSync(videoFile.path)) {
        fs.unlinkSync(videoFile.path);
      }
      if (thumbnailFile && fs.existsSync(thumbnailFile.path)) {
        fs.unlinkSync(thumbnailFile.path);
      }
      
      return res.status(500).json({ 
        message: 'Error uploading to Cloudinary', 
        error: cloudinaryError.message,
        details: cloudinaryError.http_code || 'Unknown error'
      });
    }
  } catch (error) {
    console.error('General error in upload route:', error);
    
    // Clean up local files if they exist
    if (req.files?.video?.[0]?.path && fs.existsSync(req.files.video[0].path)) {
      fs.unlinkSync(req.files.video[0].path);
    }
    if (req.files?.thumbnail?.[0]?.path && fs.existsSync(req.files.thumbnail[0].path)) {
      fs.unlinkSync(req.files.thumbnail[0].path);
    }
    
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;