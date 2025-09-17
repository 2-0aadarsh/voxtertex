/**
 * Featured Video Service
 * Handles API calls for featured videos including fetching, uploading, and managing videos
 */

// Base API URL - should be configured from environment variables in production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Fetch all featured videos for the current authenticated user
 * @returns {Promise} - Promise with the videos data
 */
export const getFeaturedVideos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/featured-videos/current`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching videos: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch featured videos:', error);
    throw error;
  }
};

/**
 * Get a specific featured video by ID
 * @param {string} userId - The user ID
 * @param {string} videoId - The video ID
 * @returns {Promise} - Promise with the video data
 */
export const getFeaturedVideo = async (userId, videoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/featured-videos/${userId}/${videoId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching video: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch featured video:', error);
    throw error;
  }
};

/**
 * Upload video and optional thumbnail to server which then uploads to Cloudinary
 * @param {File} videoFile - The video file to upload
 * @param {File} thumbnailFile - The optional thumbnail file to upload
 * @param {Function} onProgress - Optional callback for upload progress
 * @returns {Promise} - Promise with the Cloudinary upload result
 */
export const uploadVideoWithThumbnail = async (videoFile, thumbnailFile = null, onProgress) => {
  try {
    // Check file size
    const maxSize = 50 * 1024 * 1024; // 50MB limit
    if (videoFile.size > maxSize) {
      throw new Error(`File size exceeds the 50MB limit. Your file is ${(videoFile.size / (1024 * 1024)).toFixed(2)}MB`);
    }
    
    // Check thumbnail file size if provided
    if (thumbnailFile && thumbnailFile.size > 5 * 1024 * 1024) { // 5MB limit for thumbnails
      throw new Error(`Thumbnail file size exceeds the 5MB limit. Your file is ${(thumbnailFile.size / (1024 * 1024)).toFixed(2)}MB`);
    }
    
    console.log('Uploading files:', {
      video: `${videoFile.name} (${(videoFile.size / (1024 * 1024)).toFixed(2)}MB)`,
      thumbnail: thumbnailFile ? `${thumbnailFile.name} (${(thumbnailFile.size / (1024 * 1024)).toFixed(2)}MB)` : 'None'
    });
    
    // Create form data for the file upload
    const formData = new FormData();
    formData.append('video', videoFile);
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }
    
    // Use XMLHttpRequest for better upload handling
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
          // Call the progress callback if provided
          if (typeof onProgress === 'function') {
            onProgress(percentComplete);
          }
        }
      };
      
      // Handle completion
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('✅ Upload success response:', response);
            resolve(response);
          } catch (e) {
            console.error('❌ Failed to parse server response:', xhr.responseText);
            reject(new Error('Invalid response from server'));
          }
        } else {
          console.error('❌ Upload failed with status:', xhr.status);
          console.error('❌ Response text:', xhr.responseText);
          
          let errorMessage = `Upload failed with status ${xhr.status}`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.message || errorResponse.error || errorMessage;
          } catch (e) {
            // Use default error message
          }
          
          reject(new Error(errorMessage));
        }
      };
      
      // Handle errors
      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };
      
      // Handle timeouts - increased for large video files
      xhr.timeout = 600000; // 10 minutes for large video uploads
      xhr.ontimeout = () => {
        reject(new Error('Upload timed out after 10 minutes. Please try with a smaller file or check your internet connection.'));
      };
      
      // Open and send the request
      xhr.open('POST', `${API_BASE_URL}/upload/video-with-thumbnail`, true);
      xhr.withCredentials = true; // Include credentials
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Failed to upload video:', error);
    throw error;
  }
};

/**
 * Upload video to server which then uploads to Cloudinary (backward compatibility)
 * @param {File} videoFile - The video file to upload
 * @param {Function} onProgress - Optional callback for upload progress
 * @returns {Promise} - Promise with the Cloudinary upload result
 */
export const uploadVideo = async (videoFile, onProgress) => {
  return uploadVideoWithThumbnail(videoFile, null, onProgress);
};

/**
 * Save featured video data to the database for the current authenticated user
 * @param {Object} videoData - The video data to save
 * @returns {Promise} - Promise with the saved video data
 */
export const saveFeaturedVideo = async (videoData) => {
  try {
    // Prepare the data for the new FeaturedVideo model
    const payload = {
      title: videoData.title,
      description: videoData.description,
      videoUrl: videoData.videoUrl,
      thumbnailUrl: videoData.thumbnailUrl,
      publicId: videoData.publicId || videoData.videoUrl.split('/').pop().split('.')[0],
      format: videoData.format || 'mp4',
      duration: videoData.duration || 0,
      platform: videoData.platform || 'Cloudinary',
      size: videoData.size,
      metadata: videoData.metadata || {}
    };

    console.log('Saving video data:', payload);
    
    const response = await fetch(`${API_BASE_URL}/featured-videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from server:', errorText);
      throw new Error('Failed to save video data');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to save featured video:', error);
    throw error;
  }
};

/**
 * Update a featured video
 * @param {string} userId - The user ID
 * @param {string} videoId - The video ID
 * @param {Object} videoData - The updated video data
 * @returns {Promise} - Promise with the updated video data
 */
export const updateFeaturedVideo = async (userId, videoId, videoData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/featured-videos/${userId}/${videoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(videoData),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Error updating video: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to update featured video:', error);
    throw error;
  }
};

/**
 * Delete a featured video
 * @param {string} userId - The user ID
 * @param {string} videoId - The video ID to delete
 * @returns {Promise} - Promise with the deletion result
 */
export const deleteFeaturedVideo = async (userId, videoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/featured-videos/${userId}/${videoId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting video: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to delete featured video:', error);
    throw error;
  }
};

/**
 * Like a featured video
 * @param {string} userId - The user ID
 * @param {string} videoId - The video ID to like
 * @returns {Promise} - Promise with the updated likes count
 */
export const likeFeaturedVideo = async (userId, videoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/featured-videos/${userId}/${videoId}/like`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Error liking video: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to like featured video:', error);
    throw error;
  }
};

/**
 * Search for featured videos
 * @param {string} query - The search query
 * @returns {Promise} - Promise with the search results
 */
export const searchFeaturedVideos = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/featured-videos/search/${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error searching videos: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to search featured videos:', error);
    throw error;
  }
};