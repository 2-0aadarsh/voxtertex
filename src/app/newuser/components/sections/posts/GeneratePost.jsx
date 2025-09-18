"use client";
import { useState, useRef } from "react";
import { FiImage, FiFileText, FiX } from "react-icons/fi";
import { LiaTelegramPlane } from "react-icons/lia";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../../../store/hooks";
import FileUploadModal from "@/components/FileUploadModal";

const ActionButton = ({ icon: Icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center space-x-2 bg-white border border-gray-300 rounded-2xl px-7 py-2 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
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
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [currentUploadType, setCurrentUploadType] = useState("");

  const auth = useAuth();

  const handlePhotoClick = () => {
    setCurrentUploadType("photos");
    setIsPhotoModalOpen(true);
  };

  const handleFileClick = () => {
    setCurrentUploadType("files");
    setIsFileModalOpen(true);
  };

  const handleFilesSelected = (files, previews) => {
    console.log("📁 Files selected from modal:", files);
    console.log("📸 Preview URLs from modal:", previews);
    console.log(
      "📸 Preview URLs structure check:",
      previews.map((p) => ({
        hasUrl: !!p.url,
        type: p.type,
        name: p.name,
        urlType: typeof p.url,
      }))
    );

    setSelectedFiles((prev) => {
      const updated = [...prev, ...files];
      console.log("📁 Updated selectedFiles:", updated);
      return updated;
    });

    setPreviewUrls((prev) => {
      const updated = [...prev, ...previews];
      console.log("📸 Updated previewUrls:", updated);
      return updated;
    });
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
      formData.append("caption", content); // Changed from "content" to "caption" to match backend schema
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

      // Upload to server with Cloudinary integration
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
      }/post/create-with-media`;
      const res = await fetch(apiUrl, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await res.json();

      // Log the response for debugging
      console.log("📥 Server response:", data);
      if (data.post && data.post.media) {
        console.log("📷 Media in response:", data.post.media);
      }
      if (res.ok) {
        // Format the post for the UI
        const formattedPost = {
          ...data.post,
          date: new Date(data.post.createdAt).toLocaleString(),
          likes: data.post.likesCount || 0,
          comments: data.post.commentsCount || 0,
          // Add media information if available
          media: data.post.media || [],
          // Use caption as content (matches backend schema)
          content: data.post.caption,
        };

        // Add the new post to the UI
        onPost(formattedPost);

        // Reset form
        setContent("");
        setSelectedFiles([]);
        setPreviewUrls([]);
        toast.success("Post created successfully!");
      } else {
        setError(data.message || "Failed to create post");
        toast.error(data.message || "Failed to create post");
      }
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
          <div className="mt-4 flex flex-wrap gap-3">
            {console.log("🎨 Rendering previews:", previewUrls)}
            {console.log(
              "🎨 Preview URLs details:",
              previewUrls.map((p) => ({
                hasUrl: !!p.url,
                url: p.url,
                type: p.type,
                name: p.name,
              }))
            )}
            {previewUrls.map((file, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border border-gray-200"
              >
                {file.type === "image" ? (
                  <div className="w-24 h-24 relative bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
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
                      <span className="text-xs">Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-100 flex items-center justify-center">
                    <div className="text-center p-2">
                      <FiFileText className="mx-auto text-gray-500 text-xl" />
                      <p className="text-xs text-gray-500 truncate mt-1 max-w-[80px]">
                        {file.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Remove button */}
                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <FiX className="text-red-500" size={14} />
                  </button>
                )}
              </div>
            ))}
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

      {/* Action Row */}
      <div className="flex justify-between items-center mt-5">
        <div className="flex gap-3">
          <ActionButton
            icon={FiImage}
            label="Photo"
            onClick={() => !isUploading && handlePhotoClick()}
          />
          <ActionButton
            icon={FiFileText}
            label="File"
            onClick={() => !isUploading && handleFileClick()}
          />
        </div>

        <PrimaryButton
          label={isUploading ? "Uploading..." : "Post"}
          disabled={
            isUploading || (!content.trim() && selectedFiles.length === 0)
          }
        />
      </div>

      {/* File Upload Modals */}
      <FileUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onFilesSelected={handleFilesSelected}
        uploadType="photos"
        allowMultiple={true}
        isUploading={isUploading}
      />

      <FileUploadModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onFilesSelected={handleFilesSelected}
        uploadType="files"
        allowMultiple={true}
        isUploading={isUploading}
      />
    </form>
  );
};

export default GeneratePost;
