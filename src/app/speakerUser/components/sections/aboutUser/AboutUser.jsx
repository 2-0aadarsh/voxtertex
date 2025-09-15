"use client";

import { useState, useEffect } from "react";
import { BsGraphUpArrow } from "react-icons/bs";
import { CiStar } from "react-icons/ci";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { useAuth, useProfile } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/store/slices/authSlice";

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
  const [isLoading, setIsLoading] = useState(true);

  // Get current user data using RTK Query
  const {
    data: currentUserData,
    isLoading: isUserLoading,
    error: userError,
    refetch: refetchUser,
  } = useGetCurrentUserQuery();

  // Default fallback data for speaker
  const defaultData = {
    name: "John Doe",
    role: "Event Speaker",
    description:
      "Experienced speaker with expertise in various domains. Passionate about sharing knowledge and inspiring audiences.",
    profilePic: "/profile.png",
    domains: ["Public Speaking", "Leadership", "Communication"],
    stats: [
      { icon: EventIcon, value: "0", label: "Total Bookings" },
      { icon: EventIcon, value: "$ 0", label: "Revenue" },
      { icon: EventIcon, value: "0", label: "Total Videos" },
      { icon: EventIcon, value: "0", label: "Available Slots" },
    ],
    contacts: [
      { icon: FiPhone, label: "Contact Number", value: "Not provided" },
      { icon: FiMail, label: "Email Address", value: "Not provided" },
      { icon: FiMapPin, label: "Location", value: "Not provided" },
    ],
  };

  // Prepare user data with dynamic values from Redux store
  const [userData, setUserData] = useState(defaultData);

  useEffect(() => {
    const processUserData = () => {
      const user = currentUserData?.user || auth.user?._doc || auth.user;
      if (!user) {
        setIsLoading(true);
        return;
      }

      // Extract domains/expertise from user data
      const domains =
        user.areaOfExpertise ||
        (user.roleSpecificData?.activities || []).slice(0, 5) ||
        defaultData.domains;

      // Prepare dynamic user data for speaker
      const dynamicUserData = {
        name:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          defaultData.name,
        role:
          user.professionalTitle ||
          (user.role === "speaker" ? "Professional Speaker" : user.role) ||
          defaultData.role,
        description: user.bio || defaultData.description,
        profilePic: user.profileImage || defaultData.profilePic,
        domains: domains,
        stats: [
          {
            icon: EventIcon,
            value: profile.profile?.stats?.bookings || "0",
            label: "Total Bookings",
          },
          {
            icon: EventIcon,
            value: `$ ${profile.profile?.stats?.revenue || "0"}`,
            label: "Revenue",
          },
          {
            icon: EventIcon,
            value: profile.profile?.stats?.videos || "0",
            label: "Total Videos",
          },
          {
            icon: EventIcon,
            value: profile.profile?.stats?.availableSlots || "0",
            label: "Available Slots",
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
  }, [currentUserData, auth.user, profile.profile]);

  // Show error state
  if (userError) {
    return (
      <div className="w-full max-w-[1154px] h-auto bg-[#FFFDFB] shadow-md rounded-lg mx-auto p-8 text-center">
        <p className="text-red-500 mb-4">Failed to load user data</p>
        <button
          onClick={() => refetchUser()}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show loading state
  if (isLoading || isUserLoading || !userData) {
    return (
      <div className="w-full max-w-[1154px] h-auto bg-[#FFFDFB] shadow-md rounded-lg mx-auto p-4 animate-pulse">
        <div className="h-40 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
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
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 p-4 lg:p-8">
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
