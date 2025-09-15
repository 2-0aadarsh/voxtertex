"use client";

import { useState } from "react";

const Logo = ({ className = "", absolute = false }) => {
  const [imageError, setImageError] = useState(false);

  const baseClasses = absolute
    ? `absolute w-[88px] h-[50px] top-[10px] bg-cover bg-center cursor-pointer bg-no-repeat ${className}`
    : `w-[88px] h-[50px] bg-cover bg-center bg-no-repeat ${className}`;

  return (
    <div
      className={baseClasses}
      style={{
        backgroundImage: !imageError ? "url(/logo.svg)" : "none",
        backgroundSize: "contain",
      }}
    >
      {/* Fallback text logo if image doesn't load */}
      {imageError && (
        <div className="w-full h-full flex items-center justify-center">
          <span
            className="text-[#FF6B35] font-serif text-4xl font-bold"
            style={{
              textShadow: "0 0 8px rgba(255, 107, 53, 0.3)",
              filter: "blur(0.5px)",
            }}
          >
            V
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
