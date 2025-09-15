import React, { useRef, useEffect, useState } from "react";
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi";

const CustomScrollbar = ({
  children,
  className = "",
  scrollbarColor = "#FF6B35",
  trackColor = "rgba(255,107,53,0.06)",
  showArrows = true,
  maxHeight = "200px",
}) => {
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;

    setScrollProgress(Math.min(100, Math.max(0, progress)));
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollState();
    container.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [children]);

  return (
    <div className={`custom-scrollbar-container ${className}`}>
      {/* Scrollable content */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide"
        style={{ maxHeight }}
      >
        {children}
      </div>

      {/* Custom scrollbar */}
      <div className="w-full h-5 flex items-center justify-center gap-2 mt-2 relative">
        {/* Left arrow */}
        {showArrows && (
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`transition-opacity duration-200 ${
              canScrollLeft
                ? "opacity-100 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <BiSolidLeftArrow
              className="text-xl"
              style={{ color: scrollbarColor }}
            />
          </button>
        )}

        {/* Progress track */}
        <div
          className="h-2.5 rounded-full flex-1"
          style={{ backgroundColor: trackColor }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${scrollProgress}%`,
              backgroundColor: scrollbarColor,
            }}
          ></div>
        </div>

        {/* Right arrow */}
        {showArrows && (
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`transition-opacity duration-200 ${
              canScrollRight
                ? "opacity-100 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <BiSolidRightArrow
              className="text-xl"
              style={{ color: scrollbarColor }}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomScrollbar;

