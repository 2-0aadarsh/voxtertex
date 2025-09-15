"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadVideo, saveFeaturedVideo } from "../../../../../services/featuredVideoService";

interface VideoData {
  videoFile: File | null;
  title: string;
  description: string;
  customThumbnailUrl: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  publicId?: string;
}

interface UploadStatus {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

interface AddFeaturedVideoProps {
  isOpen: boolean;
  onClose?: () => void;
  onSave?: (videoData: VideoData) => void;
}

export default function AddFeaturedVideo({ isOpen, onClose, onSave }: AddFeaturedVideoProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState("");
  const [category, setCategory] = useState("Other");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isUploading: false,
    progress: 0,
    error: null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle the case where onClose might be undefined
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Body scroll lock effect
  useEffect(() => {
    if (isOpen) {
      // Simple and effective scroll prevention
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size - limit to 50MB
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        alert(`File is too large. Maximum size is 50MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        event.target.value = ''; // Clear the input
        return;
      }

      // Check file format - prefer web-compatible formats
      const supportedFormats = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/mkv'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const webCompatibleFormats = ['mp4', 'webm', 'ogg'];
      
      if (!supportedFormats.includes(file.type) && !fileExtension) {
        alert('Please select a valid video file.');
        event.target.value = '';
        return;
      }

      // Warn about non-web-compatible formats
      if (fileExtension && !webCompatibleFormats.includes(fileExtension)) {
        const proceed = confirm(
          `Warning: ${fileExtension.toUpperCase()} format may not be supported by all browsers. ` +
          `The video will be converted to MP4 during upload. Do you want to continue?`
        );
        if (!proceed) {
          event.target.value = '';
          return;
        }
      }
      
      setVideoFile(file);
    }
  };

  const handleBrowseFile = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!videoFile || !videoTitle || !description) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // Set upload status
      setUploadStatus({
        isUploading: true,
        progress: 0,
        error: null
      });

      // 1. Upload video to Cloudinary via server
      console.log('Starting video upload to Cloudinary...');
      const uploadResult = await uploadVideo(videoFile, (progress: number) => {
        setUploadStatus(prev => ({
          ...prev,
          progress: Math.min(progress, 95) // Cap at 95% until fully complete
        }));
      });
      
      console.log('📤 Upload result from server:', uploadResult);
      
      // 2. Save video data to database using the new model structure
      const videoData = {
        title: videoTitle,
        description,
        videoUrl: uploadResult.videoUrl || uploadResult.secure_url,
        thumbnailUrl: customThumbnailUrl || uploadResult.thumbnailUrl,
        publicId: uploadResult.publicId,
        format: uploadResult.format || 'mp4',
        duration: uploadResult.duration || 0,
        platform: 'Cloudinary',
        category: category,
        size: uploadResult.size,
        metadata: uploadResult.metadata || {}
      };
      
      console.log('💾 Saving video data to database for current user:', videoData);
      const savedVideo = await saveFeaturedVideo(videoData);
      console.log('✅ Video saved successfully:', savedVideo);
      
      // 3. Update UI
      setUploadStatus({
        isUploading: false,
        progress: 100,
        error: null
      });
      
      // 4. Pass data back to parent component to update the UI
    if (onSave) {
      onSave({
          videoFile,
        title: videoTitle,
        description,
          customThumbnailUrl,
          videoUrl: videoData.videoUrl,
          thumbnailUrl: videoData.thumbnailUrl,
          duration: savedVideo.durationFormatted || savedVideo.formattedDuration,
          publicId: videoData.publicId
        });
      }
      
      // 5. Reset form
      setVideoFile(null);
    setVideoTitle("");
    setDescription("");
    setCustomThumbnailUrl("");
      setCategory("Other");
      
    } catch (error) {
      console.error('Error uploading video:', error);
      
      // Set error message
      setUploadStatus({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  };

  const handleCancel = () => {
    setVideoFile(null);
    setVideoTitle("");
    setDescription("");
    setCustomThumbnailUrl("");
    setCategory("Other");
    if (onClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <> 
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent z-40"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 max-h-[95vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-orange-500">Add Featured Video</h2>
                  <p className="text-gray-500 text-[11px] mt-1">
                    Add a video to showcase your speaking or presentation skills.
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2">* Indicates required</p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                >
                  ×
                </button>
              </div>

              {/* Form */}
              <div className="mt-4 space-y-6">
                {/* How would you like to add your video */}
                <div>
                  <h3 className="text-[11px] font-medium text-orange-500 mb-4">
                    How would you like to add your video?
                  </h3>
                  
                  {/* Upload Video Option Button */}
                  <div className="mb-6">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 px-16 py-3 rounded-md text-white bg-orange-500 text-[11px] font-medium hover:bg-orange-600 transition-colors min-w-[150px]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Video
                    </button>
                  </div>
                </div>

                {/* Upload Video */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Upload Video *
                  </label>
                  <div className="w-full rounded-md border border-gray-300 px-4 py-8 text-center bg-white">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      {/* Upload Icon */}
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      
                      {uploadStatus.isUploading ? (
                        <div className="w-full">
                          <div className="text-center mb-2">
                            <p className="text-[11px] text-gray-700 font-medium">Uploading video...</p>
                            <p className="text-[10px] text-gray-500">{uploadStatus.progress}%</p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                            <div 
                              className="bg-orange-500 h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${uploadStatus.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : videoFile ? (
                        <div className="text-center">
                          <p className="text-[11px] text-gray-700 font-medium">{videoFile.name}</p>
                          <p className="text-[10px] text-gray-500">
                            {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-[11px] text-gray-600 font-medium">Tap to upload Video</p>
                          <p className="text-[10px] text-gray-400">
                            Supported formats: MP4, AVI, MOV, WEBM, MKV
                          </p>
                          <p className="text-[10px] font-bold text-orange-500">
                            Maximum file size: 50MB
                          </p>
                        </div>
                      )}
                      
                      {!uploadStatus.isUploading && (
                        <button
                          type="button"
                          onClick={handleBrowseFile}
                          className="px-5 py-1 rounded-md text-[10px] text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                          disabled={uploadStatus.isUploading}
                        >
                          Browse File
                        </button>
                      )}
                      
                      {uploadStatus.error && (
                        <p className="text-[10px] text-red-500">{uploadStatus.error}</p>
                      )}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Video Title */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Video Title"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                    required
                  />
                </div>

                {/* Description */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Description *
                  </label>
                  <textarea
                    placeholder="Describe what this video is about, what topics you cover, or any key takeaway..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none min-h-[80px] resize-none"
                    required
                  ></textarea>
                </div>

                {/* Category */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                  >
                    <option value="Presentation">Presentation</option>
                    <option value="Interview">Interview</option>
                    <option value="Lecture">Lecture</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Conference">Conference</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Custom Thumbnail URL (Optional) */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500 z-10">
                    Custom Thumbnail URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://"
                    value={customThumbnailUrl}
                    onChange={(e) => setCustomThumbnailUrl(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                  />
                  <p className="text-[10px] text-orange-400 mt-1">
                    Provide a custom thumbnail image URL or leave empty to use auto-generated thumbnail
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 rounded-md border border-orange-500 text-[11px] text-orange-500 bg-white hover:bg-orange-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={uploadStatus.isUploading}
                    className={`px-6 py-2 rounded-md text-[11px] text-white bg-orange-500 hover:bg-orange-600 hover:scale-105 transition-all duration-200 ${uploadStatus.isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                      backgroundImage: "url('/orange_button.png')",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {uploadStatus.isUploading ? 'Uploading...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}