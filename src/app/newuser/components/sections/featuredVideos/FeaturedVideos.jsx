"use client";

import { useState, useEffect } from "react";
import SectionHeader from "../../common/SectionHeader";
import VideoCard from "./VideoCard";
import AddFeaturedVideo from "./AddFeaturedVideo";
import { FaPlus } from "react-icons/fa6";
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi";
import {
  useGetVideosQuery,
  useCreateVideoMutation,
} from "@/store/slices/videosSlice";
import { useGetCurrentUserQuery } from "@/store/slices/authSlice";

const FeaturedVideos = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Get current user data
  const {
    data: currentUserData,
    isLoading: isUserLoading,
    error: userError,
  } = useGetCurrentUserQuery();

  // Get videos using Redux
  const {
    data: videosData,
    isLoading: isVideosLoading,
    error: videosError,
    refetch: refetchVideos,
  } = useGetVideosQuery({});

  // Create video mutation
  const [createVideo, { isLoading: isCreatingVideo }] =
    useCreateVideoMutation();

  const videos = videosData || [];
  const isLoading = isVideosLoading;
  const error = videosError
    ? "Failed to load videos. Please try again later."
    : null;

  // Debug logging
  useEffect(() => {
    console.log("📹 FeaturedVideos data:", {
      videosData,
      videos,
      videosLength: videos.length,
      isLoading,
      error: videosError,
    });

    if (videos.length > 0) {
      console.log("📹 First video data:", videos[0]);
    }
  }, [videosData, videos, isLoading, videosError]);

  const handleAddVideo = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  const handleSaveVideo = async (videoData) => {
    try {
      // The video has already been uploaded and saved to database by AddFeaturedVideo component
      // We just need to refresh the videos list to show the new video
      console.log("🔄 Refreshing videos after successful upload...");
      await refetchVideos();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error refreshing videos:", error);
      // Still close the modal even if refresh fails
      setIsAddModalOpen(false);
    }
  };

  // Function to refresh videos
  const refreshVideos = () => {
    refetchVideos();
  };

  return (
    <>
      <section className="w-[1154px] bg-[#ffffff] py-4 shadow-md rounded-[13.01px]">
        {/* Header section */}
        <div className="w-[90%] mx-auto ">
          <SectionHeader
            id="featuredVideos"
            title="Featured Videos"
            onAddClick={handleAddVideo}
          />

          {/* Videos grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-12">
            {isLoading ? (
              // Loading state
              <div className="col-span-3 flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : error ? (
              // Error state
              <div className="col-span-3 text-center py-12">
                <p className="text-red-500">{error}</p>
                <button
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  onClick={refreshVideos}
                >
                  Try Again
                </button>
              </div>
            ) : videos.length === 0 ? (
              // Empty state
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">
                  No videos yet. Add your first featured video!
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  onClick={handleAddVideo}
                >
                  Add Video
                </button>
              </div>
            ) : (
              // Videos list
              videos.map((video) => (
                <VideoCard
                  key={video._id}
                  title={video.title}
                  duration={video.duration || video.durationFormatted || "0:00"}
                  views={
                    typeof video.views === "number"
                      ? video.views.toLocaleString()
                      : video.views || "0"
                  }
                  thumbnail={video.thumbnail || video.thumbnailUrl}
                  videoUrl={video.videoUrl}
                />
              ))
            )}
          </div>

          {/* Progress indicator - only show if there are videos */}
          {videos.length > 0 && (
            <div className="w-full h-5 flex items-center justify-center gap-2 mt-8 relative">
              {/* Left arrow */}
              <BiSolidLeftArrow className="text-[#FF6B35] text-xl cursor-pointer" />
              <div className="w-[1031px] h-2.5 bg-[rgba(255,107,53,0.06)] rounded-full">
                <div
                  className="h-full bg-[#FF6B35] rounded-full transition-all duration-300"
                  style={{ width: "28%" }}
                ></div>
              </div>
              {/* Right arrow */}
              <BiSolidRightArrow className="text-[#FF6B35] text-xl cursor-pointer" />
            </div>
          )}
        </div>
      </section>

      {/* Add Video Modal */}
      <AddFeaturedVideo
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveVideo}
      />
    </>
  );
};

export default FeaturedVideos;
