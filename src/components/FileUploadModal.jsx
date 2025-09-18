"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUpload, FiX, FiImage, FiFileText } from "react-icons/fi";
import { toast } from "react-hot-toast";

const FileUploadModal = ({
  isOpen,
  onClose,
  onFilesSelected,
  uploadType = "photos", // "photos" or "files"
  allowMultiple = true,
  isUploading = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);

  // File type configurations
  const fileConfigs = {
    photos: {
      title: "Add Photos",
      accept: "image/jpeg,image/png,image/gif,image/webp",
      supportedTypes: [], // No file type tags for photos as per design
      maxSize: 5 * 1024 * 1024, // 5MB
      selectionOptions: [
        { label: "Select Single Image", multiple: false },
        { label: "Select Multiple Images", multiple: true },
      ],
    },
    files: {
      title: "Attach Files",
      accept: ".pdf,.doc,.docx,.ppt,.pptx,.zip",
      supportedTypes: [
        { name: "PDF", color: "bg-red-100 text-red-700" },
        { name: "DOCX", color: "bg-blue-100 text-blue-700" },
        { name: "PPT", color: "bg-yellow-100 text-yellow-700" },
        { name: "ZIP", color: "bg-purple-100 text-purple-700" },
      ],
      maxSize: 10 * 1024 * 1024, // 10MB
      selectionOptions: [], // No selection options for files - only drag & drop
    },
  };

  const config = fileConfigs[uploadType];

  const validateFile = (file) => {
    // Check file size
    if (file.size > config.maxSize) {
      toast.error(
        `File ${file.name} is too large (max ${Math.round(
          config.maxSize / (1024 * 1024)
        )}MB)`
      );
      return false;
    }

    // Check file type
    if (uploadType === "photos") {
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
    } else if (uploadType === "files") {
      const validFileTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/zip",
      ];
      if (!validFileTypes.includes(file.type)) {
        toast.error(`File ${file.name} is not a supported document type`);
        return false;
      }
    }

    return true;
  };

  const processFiles = (files) => {
    const validFiles = Array.from(files).filter(validateFile);
    if (!validFiles.length) return;

    console.log("📁 FileUploadModal: Processing files:", validFiles);

    // Create preview URLs for images
    const newPreviewUrls = validFiles.map((file) => {
      if (file.type.startsWith("image/")) {
        const objectURL = URL.createObjectURL(file);
        console.log("🖼️ Created object URL for:", file.name, "URL:", objectURL);
        return {
          url: objectURL,
          type: "image",
          name: file.name,
          file: file,
        };
      } else {
        return {
          url: null,
          type: "document",
          name: file.name,
          file: file,
        };
      }
    });

    console.log("📸 FileUploadModal: Created preview URLs:", newPreviewUrls);

    setSelectedFiles((prev) => {
      const updated = [...prev, ...validFiles];
      console.log("📁 FileUploadModal: Updated selectedFiles:", updated);
      return updated;
    });

    setPreviewUrls((prev) => {
      const updated = [...prev, ...newPreviewUrls];
      console.log("📸 FileUploadModal: Updated previewUrls:", updated);
      return updated;
    });
  };

  const handleFileInput = (e) => {
    processFiles(e.target.files);
  };

  const handleSelectionOption = (multiple) => {
    if (fileInputRef.current) {
      fileInputRef.current.multiple = multiple;
      fileInputRef.current.click();
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  }, []);

  const removeFile = (index) => {
    // Release object URL to prevent memory leaks
    if (previewUrls[index]?.url) {
      URL.revokeObjectURL(previewUrls[index].url);
    }

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddFiles = () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    console.log("🚀 FileUploadModal: About to pass files to parent");
    console.log("🚀 Files being passed:", selectedFiles);
    console.log("🚀 Preview URLs being passed:", previewUrls);
    console.log(
      "🚀 Preview URLs structure:",
      previewUrls.map((p) => ({
        hasUrl: !!p.url,
        type: p.type,
        name: p.name,
        urlType: typeof p.url,
      }))
    );

    // Pass files and previews to parent component for UI display
    // No server upload happens here - just selection and preview
    onFilesSelected(selectedFiles, previewUrls);

    // Close modal without cleaning up URLs - parent component needs them
    setSelectedFiles([]);
    setPreviewUrls([]);
    onClose();
  };

  const handleClose = () => {
    // Clean up object URLs only when closing without passing files to parent
    previewUrls.forEach((preview) => {
      if (preview.url) {
        URL.revokeObjectURL(preview.url);
      }
    });

    setSelectedFiles([]);
    setPreviewUrls([]);
    onClose();
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
            className="fixed inset-0 bg-black/50 z-40 w-screen h-screen "
            onClick={handleClose}
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
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 min-w-[800px] min-h-[520px] ">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#FF6B35]">
                  {config.title}
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-[#FF6B35] hover:text-[#E55A2B] text-3xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Supported File Types - Only show for files, not photos */}
              {config.supportedTypes.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Supported file types:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {config.supportedTypes.map((type, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${type.color}`}
                      >
                        {type.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selection Options - Only show if there are options */}
              {config.selectionOptions.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {config.selectionOptions.map((option, index) => (
                    <motion.button
                      key={index}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectionOption(option.multiple)}
                      disabled={isUploading}
                      className="flex items-center gap-2 p-3 bg-[#FFF1EB] border border-[#FFD8C7] rounded-xl hover:bg-[#FFE2D8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center">
                        {uploadType === "photos" ? (
                          <FiImage className="text-[#FF6B35] text-lg" />
                        ) : (
                          <FiFileText className="text-[#FF6B35] text-lg" />
                        )}
                      </div>
                      <span className="text-[#FF6B35] font-medium text-sm">
                        {option.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Drag & Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? "border-[#FF6B35] bg-[#FFF1EB]"
                    : "border-[#FF6B35] bg-white"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center mb-4">
                    <FiUpload className="text-white text-2xl" />
                  </div>
                  <p className="text-gray-700 font-medium mb-1">
                    Drag & drop {uploadType === "photos" ? "images" : "files"}{" "}
                    here
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    or click to browse files
                  </p>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#E55A2B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Browse File
                  </motion.button>
                </div>
              </div>

              {/* File Previews */}
              {previewUrls.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Selected {uploadType} ({previewUrls.length}):
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {previewUrls.map((file, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border border-gray-200"
                      >
                        {file.type === "image" ? (
                          <div className="w-16 h-16 relative bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center">
                            <div className="text-center p-1">
                              <FiFileText className="mx-auto text-gray-500 text-lg" />
                              <p className="text-xs text-gray-500 truncate max-w-[50px]">
                                {file.name.split(".")[0]}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Remove button */}
                        {!isUploading && (
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <FiX className="text-red-500" size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  disabled={isUploading}
                  className="px-6 py-2 rounded-lg border border-[#FF6B35] text-[#FF6B35] bg-white hover:bg-[#FFF1EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddFiles}
                  disabled={isUploading || selectedFiles.length === 0}
                  className="px-6 py-2 rounded-lg bg-[#FF6B35] text-white hover:bg-[#E55A2B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadType === "photos" ? "Select Photos" : "Select Files"} (
                  {selectedFiles.length})
                </motion.button>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept={config.accept}
                className="hidden"
                multiple={allowMultiple}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FileUploadModal;
