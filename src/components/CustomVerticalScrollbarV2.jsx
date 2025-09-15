import React, { useRef, useEffect, useState } from "react";
import { BiSolidUpArrow, BiSolidDownArrow } from "react-icons/bi";

const CustomVerticalScrollbarV2 = ({
  children,
  className = "",
  scrollbarColor = "#FF6B35",
  trackColor = "rgba(255,107,53,0.06)",
  showArrows = true,
  maxHeight = "200px",
}) => {
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const updateScrollState = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;

    setScrollProgress(Math.min(100, Math.max(0, progress)));
    setCanScrollUp(scrollTop > 0);
    setCanScrollDown(scrollTop < scrollHeight - clientHeight - 1);
  };

  const scrollUp = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ top: -100, behavior: "smooth" });
    }
  };

  const scrollDown = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ top: 100, behavior: "smooth" });
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ top: e.deltaY, behavior: "auto" });
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const container = scrollContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const trackHeight = rect.height;
    const clickY = e.clientY - rect.top;
    const percentage = clickY / trackHeight;
    const maxScroll = container.scrollHeight - container.clientHeight;

    container.scrollTop = percentage * maxScroll;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const container = scrollContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const trackHeight = rect.height;
    const clickY = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, clickY / trackHeight));
    const maxScroll = container.scrollHeight - container.clientHeight;

    container.scrollTop = percentage * maxScroll;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollState();
    container.addEventListener("scroll", updateScrollState);
    container.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("resize", updateScrollState);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      container.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", updateScrollState);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [children, isDragging]);

  return (
    <div className={`custom-vertical-scrollbar-v2-container ${className}`}>
      <div className="flex items-start gap-2 relative">
        {/* Scrollable content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-hidden"
          style={{ maxHeight }}
        >
          {children}
        </div>

        {/* Custom vertical scrollbar - positioned absolutely to overlay */}
        <div className="absolute right-0 top-0 bottom-0 flex flex-col items-center justify-center gap-2 w-6">
          {/* Up arrow */}
          {showArrows && (
            <button
              onClick={scrollUp}
              disabled={!canScrollUp}
              className={`transition-opacity duration-200 ${
                canScrollUp
                  ? "opacity-100 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <BiSolidUpArrow
                className="text-sm"
                style={{ color: scrollbarColor }}
              />
            </button>
          )}

          {/* Progress track */}
          <div
            className="w-2 rounded-full flex-1 min-h-[60px] cursor-pointer"
            style={{ backgroundColor: trackColor }}
            onMouseDown={handleMouseDown}
          >
            <div
              className="w-full rounded-full transition-all duration-300"
              style={{
                height: `${scrollProgress}%`,
                backgroundColor: scrollbarColor,
              }}
            ></div>
          </div>

          {/* Down arrow */}
          {showArrows && (
            <button
              onClick={scrollDown}
              disabled={!canScrollDown}
              className={`transition-opacity duration-200 ${
                canScrollDown
                  ? "opacity-100 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <BiSolidDownArrow
                className="text-sm"
                style={{ color: scrollbarColor }}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomVerticalScrollbarV2;

