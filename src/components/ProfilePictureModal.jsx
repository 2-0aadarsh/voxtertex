"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineCameraAlt, MdDelete, MdVisibility } from "react-icons/md";
import { toast } from "react-hot-toast";

const ProfilePictureModal = ({
  isOpen,
  onClose,
  profilePic,
  onImageUpload,
  onImageRemove,
  isUploading = false,
}) => {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Call the upload handler
    if (onImageUpload) {
      await onImageUpload(file);
    }
  };

  const handleRemoveClick = () => {
    if (onImageRemove) {
      onImageRemove();
    }
  };

  const handleViewClick = () => {
    if (profilePic) {
      // Open image in new tab/window
      window.open(profilePic, "_blank");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#FF6B35]">
                  Profile Picture
                </h2>
                <button
                  onClick={onClose}
                  className="text-[#FF6B35] hover:text-[#E55A2B] text-3xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {/* View Profile Picture */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleViewClick}
                  disabled={!profilePic}
                  className="w-full flex items-center gap-3 p-4 bg-[#FFF1EB] border border-[#FFD8C7] rounded-xl hover:bg-[#FFE2D8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <MdVisibility className="text-[#FF6B35] text-xl" />
                  </div>
                  <span className="text-[#FF6B35] font-medium">
                    View Profile Picture
                  </span>
                </motion.button>

                {/* Upload New Image */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="w-full flex items-center gap-3 p-4 bg-[#FFF1EB] border border-[#FFD8C7] rounded-xl hover:bg-[#FFE2D8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <MdOutlineCameraAlt className="text-[#FF6B35] text-xl" />
                  </div>
                  <span className="text-[#FF6B35] font-medium">
                    {isUploading ? "Uploading..." : "Upload New Image"}
                  </span>
                </motion.button>

                {/* Remove Image */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRemoveClick}
                  disabled={!profilePic || isUploading}
                  className="w-full flex items-center gap-3 p-4 bg-red-50 border-2 border-[#DC2626]/12 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10  rounded-full flex items-center justify-center">
                    <MdDelete className="text-[#DC2626] text-xl" />
                  </div>
                  <span className="text-[#DC2626] font-medium">
                    Remove Image
                  </span>
                </motion.button>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfilePictureModal;
