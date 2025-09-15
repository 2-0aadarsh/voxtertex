import { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause, FaRegEye, FaExpand } from "react-icons/fa";

const VideoCard = ({ title, duration, views, thumbnail, videoUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  // Debug logging and URL validation
  useEffect(() => {
    console.log("🎬 VideoCard props:", {
      title,
      duration,
      views,
      thumbnail,
      videoUrl,
      videoUrlType: typeof videoUrl,
      videoUrlLength: videoUrl?.length,
    });

    // Test if video URL is accessible
    if (videoUrl) {
      const testVideo = document.createElement("video");
      testVideo.preload = "metadata";
      testVideo.onloadedmetadata = () => {
        console.log("✅ Video metadata loaded successfully:", videoUrl);
        console.log("📹 Video duration:", testVideo.duration);
        console.log(
          "📹 Video dimensions:",
          testVideo.videoWidth,
          "x",
          testVideo.videoHeight
        );
      };
      testVideo.onerror = (e) => {
        console.error("❌ Video URL test failed:", videoUrl, e);
      };
      testVideo.src = videoUrl;
    }
  }, [title, duration, views, thumbnail, videoUrl]);

  // Process video URL to ensure it's in the correct format
  const getProcessedVideoUrl = (url) => {
    if (!url) return null;

    let processedUrl = url;

    // If it's already a full URL, return as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      processedUrl = url;
    }
    // If it's a relative path, make it absolute
    else if (url.startsWith("/")) {
      processedUrl = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      }${url}`;
    }
    // If it's a Cloudinary URL without protocol, add https
    else if (url.includes("cloudinary.com")) {
      processedUrl = url.startsWith("//") ? `https:${url}` : `https://${url}`;
    }

    // Ensure the URL ends with .mp4 for web compatibility
    if (
      processedUrl.includes("cloudinary.com") &&
      !processedUrl.includes(".mp4")
    ) {
      // Replace the file extension with .mp4
      processedUrl = processedUrl.replace(/\.[^/.]+$/, ".mp4");
      console.log("🔄 Converted video URL to MP4:", processedUrl);
    }

    return processedUrl;
  };

  const processedVideoUrl = getProcessedVideoUrl(videoUrl);

  // Handle video play/pause
  const togglePlay = () => {
    if (!processedVideoUrl) {
      setError("Video URL is not available");
      return;
    }

    if (isPlaying) {
      // Pause the video
      videoRef.current?.pause();
      setIsPlaying(false);
      setIsLoading(false);
    } else {
      // Start playing
      console.log("🎬 Attempting to play video:", processedVideoUrl);
      setIsLoading(true);

      const playPromise = videoRef.current?.play();

      // Handle play promise (might be rejected if autoplay is blocked)
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("✅ Video started playing successfully");
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err) => {
            console.error("❌ Error playing video:", err);
            setError("Could not play video. Please try again.");
            setIsLoading(false);
            setIsPlaying(false);
          });
      } else {
        // If no promise returned, assume it's playing
        setIsPlaying(true);
        setIsLoading(false);
      }
    }
  };

  // Handle video events
  const handleVideoLoaded = () => {
    setIsLoading(false);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    setIsLoading(false); // Reset loading state when paused
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    setIsLoading(false); // Reset loading state when playing
  };

  const handleVideoError = (e) => {
    console.error("❌ Video error:", e);
    console.error("❌ Original video URL:", videoUrl);
    console.error("❌ Processed video URL:", processedVideoUrl);
    console.error("❌ Video element:", videoRef.current);

    if (videoRef.current) {
      const errorDetails = {
        error: videoRef.current.error,
        networkState: videoRef.current.networkState,
        readyState: videoRef.current.readyState,
        src: videoRef.current.src,
      };
      console.error("❌ Video error details:", errorDetails);

      // Provide more specific error messages
      if (videoRef.current.error) {
        const error = videoRef.current.error;
        switch (error.code) {
          case 1: // MEDIA_ERR_ABORTED
            setError("Video loading was aborted");
            break;
          case 2: // MEDIA_ERR_NETWORK
            setError("Network error while loading video");
            break;
          case 3: // MEDIA_ERR_DECODE
            setError("Video format not supported by browser");
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            setError(
              "Video format not supported. Please try uploading an MP4 file."
            );
            break;
          default:
            setError("Error loading video. Please try again.");
        }
      } else {
        setError("Error loading video. Please try again.");
      }
    } else {
      setError("Error loading video. Please try again.");
    }

    setIsLoading(false);
    setIsPlaying(false);
  };

  // Handle fullscreen
  const toggleFullscreen = (e) => {
    e.stopPropagation();

    if (!videoRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    }
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="w-[352px] h-[437px] bg-white rounded-2xl overflow-hidden shadow-lg flex-shrink-0 flex flex-col">
      {/* Thumbnail / Video container */}
      <div
        className="relative h-[369px] bg-gray-100 flex items-center justify-center cursor-pointer"
        onClick={togglePlay}
      >
        {/* Video element (always present but only visible when playing) */}
        <video
          ref={videoRef}
          src={processedVideoUrl}
          className={`absolute inset-0 w-full h-full object-cover ${
            isPlaying ? "opacity-100" : "opacity-0"
          }`}
          preload="metadata"
          controls={isPlaying}
          muted={false}
          crossOrigin="anonymous"
          onLoadedData={handleVideoLoaded}
          onError={handleVideoError}
          onEnded={handleVideoPause}
          onPause={handleVideoPause}
          onPlay={handleVideoPlay}
        />

        {/* Thumbnail or placeholder (only visible when not playing) */}
        {!isPlaying && (
          <div className="absolute inset-0 w-full h-full">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-lg">No thumbnail</span>
              </div>
            )}
          </div>
        )}

        {/* Play/Pause button overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
          } bg-black/20`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-105"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
              <FaPause className="text-[#FF6B35] text-xl" />
            ) : (
              <FaPlay className="text-[#FF6B35] text-xl ml-1" />
            )}
          </button>
        </div>

        {/* Duration badge */}
        {!isPlaying && duration && (
          <div className="absolute top-4 right-4 bg-[#FF6B35] text-white text-xs px-2 py-1 rounded">
            {duration}
          </div>
        )}

        {/* Fullscreen button (only when playing) */}
        {isPlaying && (
          <button
            onClick={toggleFullscreen}
            className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <FaExpand size={14} />
          </button>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white text-sm p-2 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-[#FF6B35] text-white p-4 flex-1 flex flex-col justify-center">
        <h3 className="font-medium text-base mb-2 line-clamp-2 leading-[150%] tracking-[8%]">
          {title}
        </h3>
        <div className="flex items-center text-sm opacity-90">
          <FaRegEye className="mr-1.5" />
          <span>
            {typeof views === "number" ? views.toLocaleString() : views} views
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
