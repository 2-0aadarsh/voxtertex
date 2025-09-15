"use client";

import { useState, useEffect } from "react";
import { BsGraphUpArrow } from "react-icons/bs";
import { CiStar } from "react-icons/ci";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { MdEventAvailable } from "react-icons/md";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { useAuth, useProfile } from "@/store/hooks";
import { useGetProfileQuery } from "@/store/slices/profileSlice";

import HeaderSection from "../../../../newuser/components/sections/aboutUser/HeaderSection";
import InfoCard from "../../../../newuser/components/sections/aboutUser/InfoCard";
import ContactCard from "../../../../newuser/components/sections/aboutUser/ContactCard";

// Custom inline SVG as a React component for events attended
const EventAttendedIcon = (props) => (
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
      <path d="M2 7l3 3L12 3"></path>
      <circle cx="7" cy="7" r="6"></circle>
    </g>
  </svg>
);

const AboutUser = () => {
  // Get user data from Redux store
  const auth = useAuth();
  const profile = useProfile();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile data including yearsOfExperience
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useGetProfileQuery();

  // Default fallback data for participant
  const defaultData = {
    name: "Elena Roy",
    role: "Participant",
    description:
      "Passionate about attending industry events, networking with professionals, and staying updated with the latest trends.",
    profilePic: "/profile.png",
    domains: [
      "Professional Networking",
      "Industry Events",
      "Technology Trends",
    ],
    stats: [
      { icon: BsGraphUpArrow, value: "0", label: "Active Projects" },
      { icon: BsGraphUpArrow, value: "0", label: "Experience" },
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
    if (auth.user) {
      const user = auth.user._doc || auth.user;

      // Extract domains/expertise from user data
      const domains =
        user.areaOfExpertise ||
        (user.roleSpecificData?.activities || []).slice(0, 5) ||
        defaultData.domains;

      // Prepare dynamic user data for participant
      const dynamicUserData = {
        name: `${user.firstName} ${user.lastName}`,
        role:
          user.professionalTitle ||
          (user.role === "participant" ? "Event Participant" : user.role),
        description: user.bio || defaultData.description,
        profilePic: user.profileImage?.data || defaultData.profilePic,
        domains: domains,
        stats: [
          {
            icon: EventAttendedIcon,
            value: profile.profile?.stats?.projects || "0",
            label: "Active Projects",
          },
          {
            icon: BsGraphUpArrow,
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
    }
  }, [auth.user, profile.profile, profileData]);

  // Show loading state
  if ((isLoading && !auth.user) || isProfileLoading) {
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
