"use client";

import { CiSettings, CiUser } from "react-icons/ci";
import { IoCalendarOutline } from "react-icons/io5";
import { LuMessageCircleMore } from "react-icons/lu";
import { MdLogout, MdOutlineDashboard } from "react-icons/md";
import { CalendarDays } from "lucide-react";
import { VscCreditCard } from "react-icons/vsc";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { BiSupport } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/store/slices/authSlice";

const Sidebar = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: currentUserData, isLoading: isUserLoading } =
    useGetCurrentUserQuery();

  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out user...");

      // Call logout from Redux store (this will clear tokens and cookies and redirect)
      await logout();

      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  // Debug: Log user data to understand the structure
  console.log("🔍 Sidebar Debug - User data:", {
    user: user,
    currentUserData: currentUserData,
    userFirstName: user?.firstName,
    userLastName: user?.lastName,
    userProfileImageUrl: user?.profileImageUrl,
    currentUserFirstName: currentUserData?.user?.firstName,
    currentUserLastName: currentUserData?.user?.lastName,
    currentUserProfileImageUrl: currentUserData?.user?.profileImageUrl,
  });

  // Get user details from Redux store or current user data
  const userDetails = {
    name:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : currentUserData?.user?.firstName && currentUserData?.user?.lastName
        ? `${currentUserData.user.firstName} ${currentUserData.user.lastName}`
        : "User",
    email: user?.email || currentUserData?.user?.email || "user@example.com",
  };

  const navigationItems = [
    {
      icon: <CiUser />,
      label: "Profile",
      href: "/",
      active: true,
    },
    {
      icon: <MdOutlineDashboard />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <LuMessageCircleMore />,
      label: "Messages",
      href: "/messages",
    },
    {
      icon: <IoCalendarOutline />,
      label: "Bookings",
      href: "/bookings",
    },
    {
      icon: <CalendarDays />,
      label: "Events",
      href: "/events",
    },
    {
      icon: <VscCreditCard />,
      label: "Payments",
      href: "/payments",
    },
    {
      icon: <FaMoneyBillTrendUp />,
      label: "Dispute",
      href: "/dispute",
    },
  ];

  const bottomItems = [
    {
      icon: <BiSupport />,
      label: "Support",
      href: "/support",
    },
    {
      icon: <CiSettings />,
      label: "Settings",
      href: "/settings",
    },
  ];

  return (
    <div className="flex flex-col justify-between items-between  w-[20%]  shadow-md">
      <div className="flex flex-col gap-6 p-10">
        {navigationItems.map((item, index) => (
          <div
            key={index}
            onClick={() => router.push(item.href)}
            className={`cursor-pointer px-7 flex items-center justify-start text-[19.64px] font-semibold gap-5 w-[199px] h-[48px] rounded-[10px] ${
              item.active && `text-[#FF6B35] bg-[#FFE2D7] `
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-8 ">
        <div className="flex flex-col gap-6 px-10">
          {bottomItems.map((item, index) => (
            <div
              key={index}
              className={` cursor-pointer px-7 flex items-center justify-start text-[19.64px] font-semibold gap-5 w-[199px] h-[48px] rounded-[10px] `}
            >
              {item.icon}
              <a href="/">{item.label}</a>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-[#000000]/19 p-5 flex items-center justify-between ">
          <div className=" profileImg w-[46px] h-[46px] overflow-hidden cursor-pointer flex items-center justify-center rounded-full bg-gray-200">
            {user?.profileImageUrl || currentUserData?.user?.profileImageUrl ? (
              <img
                src={
                  user?.profileImageUrl ||
                  currentUserData?.user?.profileImageUrl
                }
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
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg"
              style={{
                display:
                  user?.profileImageUrl ||
                  currentUserData?.user?.profileImageUrl
                    ? "none"
                    : "flex",
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

          <div className=" profileDetails flex flex-col items-start justify-center ">
            <h2 className="text-lg font-bold leading-[150.7%] tracking-[8%] cursor-pointer ">
              {userDetails.name}
            </h2>
            <p className="text-[13px] text-[#6B7280] leading-[150.7%] tracking-[8%]">
              {userDetails.email}
            </p>
          </div>

          <div className="logout">
            <MdLogout
              className="text-[#DC2626] text-[33px] cursor-pointer hover:text-red-700 transition-colors"
              onClick={handleLogout}
              title="Logout"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
