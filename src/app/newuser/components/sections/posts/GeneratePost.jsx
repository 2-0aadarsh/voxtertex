"use client";
import { useState, useRef } from "react";
import { FiImage, FiFileText, FiX } from "react-icons/fi";
import { LiaTelegramPlane } from "react-icons/lia";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../../../store/hooks";
import { useCreatePostWithMediaMutation } from "../../../../../store/slices/postsSlice";
import { useAppDispatch } from "../../../../../store/hooks";
import {
  feedApi,
  useAddNewPostToFeedMutation,
  useGetFeedPostsQuery,
} from "../../../../../store/slices/feedSlice";

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  count = null,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center space-x-2 bg-white border border-gray-300 rounded-2xl px-7 py-2 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer relative ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    }`}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
    {count !== null && count > 0 && (
      <span className="absolute -top-2 -right-2 bg-[#FF6B35] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
        {count}
      </span>
    )}
  </button>
);

const PrimaryButton = ({ label, disabled }) => (
  <motion.button
    type="submit"
    disabled={disabled}
    whileHover={
      !disabled
        ? { scale: 1.05, boxShadow: "0px 4px 10px rgba(0,0,0,0.15)" }
        : {}
    }
    whileTap={!disabled ? { scale: 0.95 } : {}}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={`flex items-center justify-between gap-2 bg-gradient-to-r from-[#FF6B35]/90 to-[#FF6B35] 
      border border-[#FF6B35] text-white px-6 py-2 rounded-2xl font-semibold text-sm shadow-sm
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    <LiaTelegramPlane className="text-xl stroke-[1]" />
    {label}
  </motion.button>
);

const GeneratePost = ({ onPost }) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const auth = useAuth();
  const dispatch = useAppDispatch();

  // RTK Query mutation for creating posts with media
  const [createPostWithMedia, { isLoading: isCreatingPost }] =
    useCreatePostWithMediaMutation();

  // RTK Query mutation for optimistic feed updates
  const [addNewPostToFeed] = useAddNewPostToFeedMutation();

  // Get refetch function for feed posts
  const { refetch: refetchFeed } = useGetFeedPostsQuery({
    page: 1,
    limit: 100,
  });

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    console.log(
      "📁 Files selected:",
      files.map((f) => ({
        name: f.name,
        type: f.type,
        size: f.size,
        lastModified: f.lastModified,
      }))
    );

    // Check total file count limit (max 10 files total)
    const currentFileCount = selectedFiles.length;
    const newFileCount = files.length;
    const totalCount = currentFileCount + newFileCount;

    if (totalCount > 10) {
      toast.error(
        `Maximum 10 files allowed. You currently have ${currentFileCount} files selected.`
      );
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      // Check file size (max 5MB per file)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 5MB)`);
        return false;
      }

      // Check file type based on upload type
      if (type === "photo") {
        const validImageTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!validImageTypes.includes(file.type)) {
          toast.error(`File ${file.name} is not a valid image`);
          return false;
        }
      } else if (type === "file") {
        const validFileTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
        ];
        if (!validFileTypes.includes(file.type)) {
          toast.error(`File ${file.name} is not a supported document type`);
          return false;
        }
      }

      return true;
    });

    if (!validFiles.length) return;

    // Show success message for multiple files
    if (validFiles.length > 1) {
      toast.success(`${validFiles.length} files selected successfully!`);
    } else {
      toast.success(`${validFiles[0].name} selected successfully!`);
    }

    // Create preview URLs for images
    const newPreviewUrls = validFiles.map((file) => {
      if (file.type.startsWith("image/")) {
        const objectURL = URL.createObjectURL(file);
        console.log("🖼️ Created object URL for:", file.name, "URL:", objectURL);
        return {
          url: objectURL,
          type: "image",
          name: file.name,
          file: file, // Keep reference to original file for debugging
        };
      } else {
        return {
          url: null,
          type: "document",
          name: file.name,
        };
      }
    });

    console.log("📸 Setting preview URLs:", newPreviewUrls);
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => {
      const updated = [...prev, ...newPreviewUrls];
      console.log("📸 Updated preview URLs:", updated);
      return updated;
    });

    // Clear the input so the same file can be selected again if needed
    e.target.value = "";
  };

  const removeFile = (index) => {
    // Release object URL to prevent memory leaks
    if (previewUrls[index].url) {
      URL.revokeObjectURL(previewUrls[index].url);
    }

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) {
      setError("Post cannot be empty. Add text or attach files.");
      return;
    }
    setError("");
    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append("caption", content);
      formData.append("visibility", "public");
      formData.append("category", "general");

      // Add files to FormData
      selectedFiles.forEach((file) => {
        formData.append("media", file);
      });

      // Simulate progress (for better UX)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);

      // Log what we're sending
      console.log(
        "📤 Sending files:",
        selectedFiles.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
        }))
      );

      // Use RTK Query mutation for creating posts with media
      const result = await createPostWithMedia(formData).unwrap();

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Log the response for debugging
      console.log("📥 Server response:", result);
      if (result.post && result.post.media) {
        console.log("📷 Media in response:", result.post.media);
      }

      // Format the post for the UI with all required fields for home feed
      const formattedPost = {
        ...result.post,
        date: new Date(result.post.createdAt).toLocaleString(),
        likes: result.post.likesCount || 0,
        comments: result.post.commentsCount || 0,
        // Add media information if available
        media: result.post.media || [],
        // Use caption as content (matches backend schema)
        content: result.post.caption,
        // Ensure we have all required fields for home feed
        _id: result.post._id,
        caption: result.post.caption,
        createdAt: result.post.createdAt,
        likesCount: result.post.likesCount || 0,
        commentsCount: result.post.commentsCount || 0,
        isLiked: result.post.isLiked || false,
        user: result.post.user,
        userName: result.post.userName,
        userProfileImage: result.post.userProfileImage,
      };

      console.log("📝 Formatted post for UI:", formattedPost);

      // Add the new post to the local UI (for RecentPosts section)
      console.log("📄 Adding post to RecentPosts section...");
      onPost(formattedPost);

      // COMPREHENSIVE HOME FEED UPDATE - Multiple strategies for maximum reliability
      console.log("🏠 Starting comprehensive home feed update...");

      // Strategy 1: RTK Query Optimistic Update
      console.log("🔄 Strategy 1: RTK Query optimistic update...");
      try {
        addNewPostToFeed(formattedPost);
        console.log("✅ RTK Query optimistic update completed");
      } catch (error) {
        console.log("⚠️ RTK Query optimistic update failed:", error);
      }

      // Strategy 2: Update multiple possible cache entries
      console.log("🔄 Strategy 2: Updating multiple cache entries...");
      const possibleQueries = [
        { page: 1, limit: 5 },
        { page: 1, limit: 10 },
        { page: 1, limit: 20 },
        { page: 1, limit: 50 },
        { page: 1, limit: 100 },
      ];

      possibleQueries.forEach((queryParams) => {
        try {
          dispatch(
            feedApi.util.updateQueryData(
              "getFeedPosts",
              queryParams,
              (draft) => {
                if (draft.data?.posts) {
                  console.log(`📄 Updating cache for:`, queryParams);
                  draft.data.posts.unshift(formattedPost);
                  if (draft.data.pagination) {
                    draft.data.pagination.total += 1;
                  }
                  console.log(`✅ Cache updated for:`, queryParams);
                }
              }
            )
          );
        } catch (error) {
          console.log(
            `⚠️ Cache update failed for ${JSON.stringify(queryParams)}:`,
            error
          );
        }
      });

      // Strategy 3: Cache invalidation
      console.log("🔄 Strategy 3: Invalidating feed cache tags...");
      dispatch(feedApi.util.invalidateTags(["FeedPost"]));

      // Strategy 4: Direct refetch
      setTimeout(() => {
        console.log("🔄 Strategy 4: Force refetching feed...");
        refetchFeed();
      }, 100);

      // Strategy 5: Custom event for cross-component communication
      setTimeout(() => {
        console.log("🔄 Strategy 5: Dispatching custom event...");
        window.dispatchEvent(
          new CustomEvent("newPostCreated", {
            detail: { post: formattedPost },
          })
        );
        console.log("✅ Custom event dispatched");
      }, 200);

      // Strategy 6: Final fallback invalidation
      setTimeout(() => {
        console.log("🔄 Strategy 6: Final fallback invalidation...");
        dispatch(feedApi.util.invalidateTags(["FeedPost"]));
      }, 500);

      console.log("✅ All home feed update strategies completed!");

      // Reset form
      setContent("");
      setSelectedFiles([]);
      setPreviewUrls([]);
      toast.success("Post created successfully!");
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Something went wrong");
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 border-b border-gray-200 space-y-4"
    >
      {/* Input Area */}
      <div className="bg-[rgba(255,107,53,0.05)] border border-[#FF6B35] rounded-2xl p-5">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Share insights, achievements, or professional updates..."
          className="w-full bg-transparent outline-none resize-none text-[#FF6B35] placeholder-[#FF6B35]/70 text-base h-[120px]"
          disabled={isUploading}
        />

        {/* File Previews */}
        {previewUrls.length > 0 && (
          <div className="mt-4">
            {/* File count indicator */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600 font-medium">
                {previewUrls.length} file{previewUrls.length !== 1 ? "s" : ""}{" "}
                selected
              </p>
              {!isUploading && (
                <button
                  type="button"
                  onClick={() => {
                    // Clear all files
                    previewUrls.forEach((preview) => {
                      if (preview.url) {
                        URL.revokeObjectURL(preview.url);
                      }
                    });
                    setSelectedFiles([]);
                    setPreviewUrls([]);
                    toast.success("All files removed");
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* File preview grid */}
            <div
              className={`grid gap-3 ${
                previewUrls.length === 1
                  ? "grid-cols-1 max-w-[200px]"
                  : previewUrls.length === 2
                  ? "grid-cols-2 max-w-[400px]"
                  : previewUrls.length <= 4
                  ? "grid-cols-2 max-w-[400px]"
                  : "grid-cols-3 max-w-[600px]"
              }`}
            >
              {previewUrls.map((file, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden border border-gray-200 bg-white"
                >
                  {file.type === "image" ? (
                    <div className="w-full aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onLoad={(e) => {
                          console.log(
                            "✅ Image loaded successfully:",
                            file.name,
                            "URL:",
                            file.url
                          );
                        }}
                        onError={(e) => {
                          console.error(
                            "❌ Preview image failed to load:",
                            file.name,
                            "URL:",
                            file.url
                          );
                          e.target.onerror = null;
                          e.target.style.display = "none";
                          // Show fallback
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                      {/* Simple fallback */}
                      <div
                        className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center text-gray-500"
                        style={{ display: "none" }}
                      >
                        <FiImage className="text-xl mb-1" />
                        <span className="text-xs">Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center rounded-lg">
                      <div className="text-center p-2">
                        <FiFileText className="mx-auto text-gray-500 text-xl mb-1" />
                        <p className="text-xs text-gray-500 truncate max-w-[80px]">
                          {file.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* File name overlay for images */}
                  {file.type === "image" && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                      <p className="text-xs truncate">{file.name}</p>
                    </div>
                  )}

                  {/* Remove button */}
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50"
                      title={`Remove ${file.name}`}
                    >
                      <FiX className="text-red-500" size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-orange-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {uploadProgress < 100 ? "Uploading..." : "Processing..."}
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={photoInputRef}
        onChange={(e) => handleFileSelect(e, "photo")}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        multiple
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileSelect(e, "file")}
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        multiple
      />

      {/* Action Row */}
      <div className="flex justify-between items-center mt-5">
        <div className="flex gap-3">
          <ActionButton
            icon={FiImage}
            label="Photos"
            onClick={() => !isUploading && photoInputRef.current.click()}
            disabled={isUploading}
            count={previewUrls.filter((f) => f.type === "image").length}
          />
          <ActionButton
            icon={FiFileText}
            label="Files"
            onClick={() => !isUploading && fileInputRef.current.click()}
            disabled={isUploading}
            count={previewUrls.filter((f) => f.type === "document").length}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* File count indicator */}
          {selectedFiles.length > 0 && (
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {selectedFiles.length}/10 files
            </div>
          )}

          <PrimaryButton
            label={isUploading ? "Uploading..." : "Post"}
            disabled={
              isUploading || (!content.trim() && selectedFiles.length === 0)
            }
          />
        </div>
      </div>
    </form>
  );
};

export default GeneratePost;
