"use client";

import { useState, useEffect } from "react";
import { BsGraphUpArrow } from "react-icons/bs";
import { CiStar } from "react-icons/ci";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { useAuth, useProfile } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/store/slices/authSlice";
import { useGetProfileQuery } from "@/store/slices/profileSlice";

import HeaderSection from "./HeaderSection";
import InfoCard from "./InfoCard";
import ContactCard from "./ContactCard";

// Custom inline SVG as a React component
const EventIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 14 14"
    className={props.className}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.2}
    >
      <path d="M9.5 3.5h4v4"></path>
      <path d="M13.5 3.5L7.85 9.15a.5.5 0 0 1-.7 0l-2.3-2.3a.5.5 0 0 0-.7 0L.5 10.5"></path>
    </g>
  </svg>
);

const AboutUser = () => {
  // Get user data from Redux store
  const auth = useAuth();
  const profile = useProfile();

  // Fetch current user data dynamically
  const {
    data: currentUserData,
    isLoading: isUserLoading,
    error: userError,
    refetch: refetchUser,
  } = useGetCurrentUserQuery();

  // Fetch profile data including yearsOfExperience
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useGetProfileQuery();

  // State for processed user data
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Process user data when it's available
  useEffect(() => {
    const processUserData = () => {
      // Use current user data from API if available, otherwise fall back to auth store
      const user = currentUserData?.user || auth.user?._doc || auth.user;

      if (!user) {
        setIsLoading(true);
        return;
      }

      console.log("🔄 Processing user data:", user);

      // Extract domains/expertise from user data
      const domains =
        user.areaOfExpertise ||
        (user.roleSpecificData?.activities || []).slice(0, 5) ||
        [];

      // Prepare dynamic user data
      const dynamicUserData = {
        name:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.name || "User",
        role:
          user.professionalTitle ||
          (user.role === "organizer"
            ? "Event Organizer"
            : user.role === "speaker"
            ? "Speaker"
            : user.role || "Professional"),
        description: user.bio || user.about || "No description available",
        profilePic: user.profileImageUrl || user.profileImage?.url || null,
        domains: domains,
        stats: [
          {
            icon: EventIcon,
            value: profile.profile?.stats?.projects || "0",
            label: "Events Organized",
          },
          {
            icon: EventIcon,
            value:
              profileData?.data?.yearsOfExperience ||
              user.yearsOfExperience ||
              profile.profile?.yearsOfExperience ||
              profile.profile?.stats?.experience ||
              "0",
            label: "Experience",
          },
        ],
        contacts: [
          {
            icon: FiPhone,
            label: "Contact Number",
            value:
              user.mobileNo ||
              profile.profile?.contacts?.phone ||
              "Not provided",
          },
          {
            icon: FiMail,
            label: "Email Address",
            value:
              user.email || profile.profile?.contacts?.email || "Not provided",
          },
          {
            icon: FiMapPin,
            label: "Location",
            value:
              user.location ||
              profile.profile?.contacts?.address ||
              "Not provided",
          },
        ],
      };

      setUserData(dynamicUserData);
      setIsLoading(false);
    };

    processUserData();
  }, [currentUserData, auth.user, profile.profile, profileData]);

  // Refetch user data on component mount if not available
  useEffect(() => {
    if (!auth.user && !isUserLoading && !userError) {
      refetchUser();
    }
  }, [auth.user, isUserLoading, userError, refetchUser]);

  // Show loading state
  if (isLoading || isUserLoading || isProfileLoading || !userData) {
    return (
      <div className="w-full max-w-[1154px] h-auto bg-[#FFFDFB] shadow-md rounded-lg mx-auto p-4 animate-pulse">
        <div className="h-40 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (userError) {
    return (
      <div className="w-full max-w-[1154px] h-auto bg-[#FFFDFB] shadow-md rounded-lg mx-auto p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Unable to load profile
          </h3>
          <p className="text-gray-500 mb-4">
            There was an error loading your profile data.
          </p>
          <button
            onClick={() => refetchUser()}
            className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E55A2B] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1154px] h-auto bg-[#FFFDFB] shadow-md rounded-lg mx-auto">
      <HeaderSection
        name={userData.name}
        role={userData.role}
        description={userData.description}
        domains={userData.domains}
        profilePic={userData.profilePic}
      />

      {/* Info Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 p-4 lg:p-8">
        {userData.stats.map((stat, idx) => (
          <InfoCard key={idx} {...stat} />
        ))}
      </div>

      {/* Contact Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-4 lg:px-6 pb-6">
        {userData.contacts.map((contact, idx) => (
          <ContactCard key={idx} {...contact} />
        ))}
      </div>
    </div>
  );
};

export default AboutUser;
