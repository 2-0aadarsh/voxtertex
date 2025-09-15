"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProfileButton from "../common/ProfileButton";
import { LuBell } from "react-icons/lu";
import Logo from "@/components/Logo";

const ProfileHeader = () => {
  const [notifications, setNotifications] = useState(3);
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/home");
  };

  return (
    <header className="relative w-full h-20 bg-[#FFFFFF] flex items-center justify-between px-6 text-[#000000] shadow-sm">
      {/* Logo Section */}
      <div className="flex items-center">
        <div onClick={handleLogoClick} className="cursor-pointer">
          <Logo />
        </div>
      </div>

      {/* Right Section - Notifications and Profile */}
      <div className="flex items-center gap-8 ">
        {/* Notification Bell */}
        <div className="relative cursor-pointer">
          <LuBell className="w-6 h-6 font-[800]" />

          {/* Show badge if notifications exist */}
          {notifications > 0 && (
            <span className="absolute -top-3 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-[#FF6B35] text-white text-xs font-bold leading-[150.7%] tracking-[8%]">
              {notifications}
            </span>
          )}
        </div>
        <ProfileButton />
      </div>
    </header>
  );
};

export default ProfileHeader;
