"use client";

import { IoIosArrowDown } from "react-icons/io";
import { useAuth } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/store/slices/authSlice";

const ProfileButton = () => {
  const { user } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  // Get user details from Redux store or current user data
  const userDetails = {
    name:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : currentUserData?.user?.firstName && currentUserData?.user?.lastName
        ? `${currentUserData.user.firstName} ${currentUserData.user.lastName}`
        : "User",
    profileImageUrl:
      user?.profileImageUrl || currentUserData?.user?.profileImageUrl,
  };

  return (
    <button className="w-40 h-10 cursor-pointer flex items-center justify-between">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
        {userDetails.profileImageUrl ? (
          <img
            src={userDetails.profileImageUrl}
            alt="profile"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm"
          style={{
            display: userDetails.profileImageUrl ? "none" : "flex",
          }}
        >
          {userDetails.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
      </div>
      <h2 className="text-sm font-medium">{userDetails.name}</h2>
      <IoIosArrowDown className="cursor-pointer w-4 h-4" />
    </button>
  );
};

export default ProfileButton;
