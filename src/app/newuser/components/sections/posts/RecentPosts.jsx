"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiDownload,
  FiMoreVertical,
  FiTrash2,
  FiEdit,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { Document, Page, pdfjs } from "react-pdf";

// Add custom styles for react-pdf
const pdfStyles = `
  .react-pdf__Page {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin: 0 auto;
  }
  .react-pdf__Page__canvas {
    display: block;
    margin: 0 auto;
  }
  .react-pdf__Page__textContent {
    position: absolute;
    top: 0;
    left: 0;
    color: transparent;
    transform-origin: 0% 0%;
    white-space: pre;
    cursor: text;
  }
  .react-pdf__Page__textContent span {
    color: transparent;
    position: absolute;
    white-space: pre;
    cursor: text;
    transform-origin: 0% 0%;
  }
`;

// Configure PDF.js worker with fallback
if (typeof window !== "undefined") {
  // Try to load from CDN, fallback to local if needed
  const workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
}

// PDF Viewer Component
const PdfViewer = ({ url, filename }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [pdfUrl, setPdfUrl] = useState(url);

  // Process PDF URL for better compatibility
  useEffect(() => {
    let processedUrl = url;

    // If it's a Cloudinary URL, try to optimize it for PDF viewing
    if (url.includes("cloudinary.com")) {
      // Remove any existing transformations and ensure it's raw
      processedUrl = url.replace(/\/image\/upload\/[^\/]*\//, "/raw/upload/");
      processedUrl = url.replace(/\/raw\/upload\/[^\/]*\//, "/raw/upload/");

      // Add parameters to force inline viewing
      if (!processedUrl.includes("fl_inline")) {
        processedUrl = processedUrl.replace(
          "/raw/upload/",
          "/raw/upload/fl_inline/"
        );
      }

      console.log("🔧 Original URL:", url);
      console.log("🔧 Processed URL:", processedUrl);
    }

    setPdfUrl(processedUrl);
  }, [url]);

  // Inject PDF styles into document head
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = pdfStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    console.log("✅ PDF loaded successfully:", numPages, "pages");
    console.log("✅ PDF URL that worked:", url);
  };

  const onDocumentLoadError = (error) => {
    console.error("❌ PDF load error:", error);
    console.error("❌ PDF URL that failed:", pdfUrl);
    console.error("❌ Error details:", error.message, error.name);

    // Try fallback URL if current one failed
    if (pdfUrl !== url) {
      console.log("🔄 Trying original URL as fallback:", url);
      setPdfUrl(url);
      setError(null);
      setLoading(true);
    } else {
      setError(error);
      setLoading(false);
    }
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        {/* PDF Header */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FiFileText className="text-red-600 text-xl" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">
                  {filename || "PDF Document"}
                </h4>
                <p className="text-xs text-gray-500">PDF Document</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  console.log("🔍 Testing PDF URL:", url);
                  console.log("🔍 Processed PDF URL:", pdfUrl);
                  console.log("🔍 PDF filename:", filename);
                  // Test if URL is accessible
                  fetch(pdfUrl, { method: "HEAD" })
                    .then((response) => {
                      console.log(
                        "✅ PDF URL is accessible:",
                        response.status,
                        response.headers.get("content-type")
                      );
                      console.log(
                        "✅ Response headers:",
                        Object.fromEntries(response.headers.entries())
                      );
                    })
                    .catch((error) => {
                      console.error("❌ PDF URL is not accessible:", error);
                    });
                }}
                className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                title="Test PDF URL"
              >
                Test
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center space-x-1"
                title="Open in new tab"
              >
                <span>Open</span>
                <FiDownload className="text-xs" />
              </a>
            </div>
          </div>
        </div>

        {/* PDF Navigation */}
        {numPages && (
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {numPages > 1 && (
                  <>
                    <button
                      onClick={goToPrevPage}
                      disabled={pageNumber <= 1}
                      className="px-3 py-1 text-xs font-medium text-gray-600 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-gray-200 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-600">
                      Page {pageNumber} of {numPages}
                    </span>
                    <button
                      onClick={goToNextPage}
                      disabled={pageNumber >= numPages}
                      className="px-3 py-1 text-xs font-medium text-gray-600 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-gray-200 transition-colors"
                    >
                      Next
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={zoomOut}
                    className="px-2 py-1 text-xs font-medium text-gray-600 bg-white hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                    title="Zoom Out"
                  >
                    -
                  </button>
                  <span className="text-xs text-gray-600 min-w-[3rem] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={zoomIn}
                    className="px-2 py-1 text-xs font-medium text-gray-600 bg-white hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    onClick={resetZoom}
                    className="px-2 py-1 text-xs font-medium text-gray-600 bg-white hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                    title="Reset Zoom"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer Container */}
        <div className="relative bg-gray-50">
          <div className="w-full h-96 relative overflow-auto">
            {loading && (
              <div className="absolute inset-0 bg-white flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading PDF...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex-col items-center justify-center text-gray-500 p-6 flex">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiFileText className="text-2xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    PDF Preview Unavailable
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 max-w-sm">
                    The PDF cannot be displayed. You can still view it by
                    opening in a new tab.
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        console.log("🔄 Retrying PDF load with URL:", pdfUrl);
                        setError(null);
                        setLoading(true);
                        setPdfUrl(url); // Reset to original URL
                      }}
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <FiDownload className="mr-2" />
                      Open PDF
                    </a>
                  </div>
                </div>
              </div>
            )}

            {!error && (
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                className="w-full"
                options={{
                  cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
                  cMapPacked: true,
                  standardFontDataUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/standard_fonts/`,
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  className="mx-auto shadow-sm"
                  width={Math.min(
                    600 * scale,
                    (typeof window !== "undefined"
                      ? window.innerWidth - 100
                      : 500) * scale
                  )}
                  scale={scale}
                />
              </Document>
            )}
          </div>
        </div>

        {/* PDF Footer */}
        <div className="bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>PDF Document Viewer</span>
            <span>Use controls above to navigate and zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaGallery = ({ media }) => {
  if (!media || media.length === 0) return null;

  // Debug media items
  console.log("🖼️ Media items in gallery:", media);

  return (
    <div className="mt-3 mb-4">
      <div className="flex flex-wrap gap-2">
        {media.map((item, idx) => {
          // Debug individual item
          console.log(`Media item ${idx}:`, item);

          // Handle different media object structures
          let mediaUrl = null;
          let mediaType = null;
          let mediaFilename = null;

          // Check if item has cloudinaryUrl (from server response)
          if (item.cloudinaryUrl) {
            mediaUrl = item.cloudinaryUrl;
            mediaType = item.type;
            mediaFilename = item.filename;
          }
          // Check if item has url property (from client preview)
          else if (item.url) {
            mediaUrl = item.url;
            mediaType = item.type;
            mediaFilename = item.filename;
          }
          // Handle direct string URLs
          else if (typeof item === "string") {
            mediaUrl = item;
            // Try to determine type from URL
            if (
              item.includes("image") ||
              /\.(jpg|jpeg|png|gif|webp)$/i.test(item)
            ) {
              mediaType = "image";
            } else {
              mediaType = "document";
            }
            mediaFilename = "File";
          }

          // Force PDF detection based on URL if type is not set correctly
          if (mediaUrl && mediaUrl.toLowerCase().includes(".pdf")) {
            mediaType = "document";
            console.log("🔍 Force-detected PDF from URL:", mediaUrl);
          }

          console.log(`Processed media item ${idx}:`, {
            mediaUrl,
            mediaType,
            mediaFilename,
            isPdf: mediaUrl && mediaUrl.toLowerCase().includes(".pdf"),
            originalItem: item,
          });

          // Test if image URL is accessible
          if (mediaType === "image" && mediaUrl) {
            const testImg = new Image();
            testImg.onload = () => {
              console.log(
                "🔍 Test image loaded successfully:",
                mediaUrl,
                "Dimensions:",
                testImg.naturalWidth,
                "x",
                testImg.naturalHeight
              );
            };
            testImg.onerror = () => {
              console.error("🔍 Test image failed to load:", mediaUrl);
            };
            testImg.src = mediaUrl;
          }

          if (mediaType === "image") {
            return (
              <div
                key={idx}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.open(mediaUrl, "_blank");
                  }
                }}
                style={{ cursor: "pointer", display: "inline-block" }}
              >
                <img
                  src={mediaUrl}
                  alt={mediaFilename || "Post image"}
                  width="96"
                  height="96"
                  style={{
                    objectFit: "cover",
                    borderRadius: "8px",
                    display: "block",
                  }}
                  onLoad={() => {
                    console.log("✅ Image loaded successfully:", mediaUrl);
                  }}
                  onError={() => {
                    console.error("❌ Image failed to load:", mediaUrl);
                  }}
                />
              </div>
            );
          } else {
            // For PDF documents, show inline viewer instead of download link
            // Check both type and URL to ensure PDF detection
            const isPdf =
              (mediaType === "document" &&
                mediaUrl &&
                mediaUrl.toLowerCase().includes(".pdf")) ||
              (mediaUrl && mediaUrl.toLowerCase().includes(".pdf"));

            if (isPdf) {
              console.log("🔍 Rendering PDF viewer for:", mediaUrl);
              return (
                <PdfViewer key={idx} url={mediaUrl} filename={mediaFilename} />
              );
            } else {
              // For other document types, check if it might be a PDF that wasn't detected
              const mightBePdf =
                mediaUrl &&
                (mediaUrl.toLowerCase().includes(".pdf") ||
                  mediaFilename?.toLowerCase().includes(".pdf") ||
                  (mediaType === "document" &&
                    mediaUrl.includes("cloudinary.com")));

              if (mightBePdf) {
                console.log(
                  "🔍 Detected potential PDF that wasn't caught earlier:",
                  mediaUrl
                );
                // Treat as PDF and show inline viewer
                console.log(
                  "🔍 Rendering PDF viewer for potential PDF:",
                  mediaUrl
                );
                return (
                  <PdfViewer
                    key={idx}
                    url={mediaUrl}
                    filename={mediaFilename}
                  />
                );
              }

              // For other document types, show download link
              return (
                <div key={idx} className="w-full max-w-sm">
                  <a
                    href={mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 hover:border-gray-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiFileText className="text-blue-600 text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {mediaFilename || "Document"}
                        </h4>
                        <p className="text-xs text-gray-500">Document File</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                          <FiDownload className="text-gray-600 text-sm" />
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              );
            }
          }
        })}
      </div>
    </div>
  );
};

// Post menu component
const PostMenu = ({ postId, post, onDelete, onEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(
    post?.caption || post?.content || ""
  );

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleEdit = async () => {
    if (isEditing) return;

    try {
      setIsEditing(true);

      // Call API to update post using the correct enhanced-posts endpoint
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
      }/enhanced-posts/${postId}`;
      const response = await fetch(apiUrl, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caption: editContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update post");
      }

      const result = await response.json();

      // Close menu and notify parent with updated post
      setIsOpen(false);
      setIsEditing(false);
      onEdit(postId, result.post);
      toast.success("Post updated successfully");
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error(error.message || "Failed to update post");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);

      // Call API to delete post using the correct enhanced-posts endpoint
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
      }/enhanced-posts/${postId}`;
      const response = await fetch(apiUrl, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete post");
      }

      // Close menu and notify parent
      setIsOpen(false);
      onDelete(postId);
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(error.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={toggleMenu}
        whileHover={{ scale: 1.2, rotate: 10, color: "#FF6B35" }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="text-[rgba(107,114,128,0.65)] p-1 rounded-full hover:bg-gray-100"
      >
        <FiMoreVertical size={18} />
      </motion.button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                setIsEditing(true);
              }}
            >
              <FiEdit className="mr-2" /> Edit
            </button>
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
              role="menuitem"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <FiTrash2 className="mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Edit Post
            </h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="What's on your mind?"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post?.caption || post?.content || "");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={isEditing || !editContent.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isEditing ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RecentPosts = ({ recentPosts, onPostDelete, onPostEdit }) => {
  // Limit to showing only the 3 most recent posts
  const displayPosts = recentPosts.slice(0, 3);

  const handlePostDelete = (postId) => {
    if (onPostDelete) {
      onPostDelete(postId);
    }
  };

  const handlePostEdit = (postId, updatedPost) => {
    if (onPostEdit) {
      onPostEdit(postId, updatedPost);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-black font-medium text-lg">Recent Posts</h3>

        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05, color: "#FF6B35" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-[#FF6B35] text-sm font-medium flex items-center cursor-pointer"
          >
            View All ({recentPosts.length})
          </motion.button>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {displayPosts.length > 0 ? (
          displayPosts.map((post, index) => (
            <motion.div
              key={post._id || index}
              whileHover={{
                scale: 1.001,
                boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
              }}
              transition={{ type: "spring", stiffness: 250, damping: 18 }}
              className="bg-[rgba(255,107,53,0.1)] border border-[rgba(255,107,53,0.24)] rounded-2xl p-5 transition-all"
            >
              {/* Post content */}
              <p className="text-[rgba(0,0,0,0.6)] text-sm leading-relaxed">
                {post.caption || post.content}
              </p>

              {/* Media gallery */}
              <MediaGallery media={post.media} />

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-[rgba(107,114,128,0.65)] font-medium">
                    {post.date}
                  </span>
                  <span className="text-xs text-[rgba(107,114,128,0.65)] font-medium">
                    {post.likes} likes
                  </span>
                  <span className="text-xs text-[rgba(107,114,128,0.65)] font-medium">
                    {post.comments} comments
                  </span>
                </div>

                <PostMenu
                  postId={post._id}
                  post={post}
                  onDelete={handlePostDelete}
                  onEdit={handlePostEdit}
                />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No posts yet. Be the first to share something!
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentPosts;
