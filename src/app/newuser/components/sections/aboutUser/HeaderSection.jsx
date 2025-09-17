"use client";

import { useState, useRef, useEffect } from "react";
import { RiEditBoxFill } from "react-icons/ri";
import { MdOutlineCameraAlt } from "react-icons/md";
import { motion } from "framer-motion";
import EditProfile from "./EditProfile";
import { useAuth } from "../../../../../store/hooks";
import { useAppDispatch } from "../../../../../store/hooks";
import { updateUser } from "../../../../../store/slices/authSlice";
import { toast } from "react-hot-toast";

const HeaderSection = ({ name, role, description, domains, profilePic }) => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const auth = useAuth();
  const dispatch = useAppDispatch();

  const visibleDomains = domains.slice(0, 3);
  const remainingCount = domains.length - visibleDomains.length;

  const handleEditProfileClick = () => {
    setIsEditProfileOpen(true);
  };

  const handleCloseEditProfile = () => {
    setIsEditProfileOpen(false);
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Create form data
      const formData = new FormData();
      formData.append("image", file);

      // Simulate progress (for better UX)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);

      // Upload image to server
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
      }/auth/profile/image`;
      const response = await fetch(apiUrl, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload image");
      }

      setUploadProgress(100);

      // Get updated user data
      const data = await response.json();

      // Implement optimistic UI update
      if (data.success && data.user) {
        // Add profileImageUrl to user data if it's missing
        const updatedUser = {
          ...data.user,
          profileImageUrl:
            data.user.profileImageUrl || data.user.profileImage?.url,
          // If the user has _doc property, update that too for consistency
          ...(data.user._doc
            ? {
                _doc: {
                  ...data.user._doc,
                  profileImageUrl:
                    data.user._doc.profileImageUrl ||
                    data.user.profileImage?.url,
                },
              }
            : {}),
        };

        console.log("📸 Updated user with profile image:", updatedUser);

        // Update Redux store with new user data
        dispatch(updateUser(updatedUser));
        toast.success("Profile picture updated successfully!");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full flex items-start justify-between bg-[#FF6B35] p-5 rounded-t-lg"
        style={{ minHeight: "193px", height: "auto" }}
      >
        {/* Profile Picture */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-[128px] h-[138px] bg-white rounded-lg p-[5px] relative"
        >
          {/* Check if user has a profile image */}
          {auth.user?.profileImageUrl ? (
            <img
              src={auth.user.profileImageUrl}
              className="w-full h-full object-cover object-center rounded-lg"
              alt="Profile"
              onError={(e) => {
                console.error("Profile image failed to load");
                // Hide the image and show avatar instead
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling.style.display = "flex";
              }}
            />
          ) : null}

          {/* Avatar with initials - shown when no profile image */}
          <div
            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-4xl rounded-lg"
            style={{
              display: auth.user?.profileImageUrl ? "none" : "flex",
            }}
          >
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/jpeg,image/png,image/jpg,image/webp"
            className="hidden"
          />

          {/* Camera icon button */}
          <motion.div
            onClick={handleImageClick}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="absolute -bottom-3 -right-1 w-[50px] h-[50px] p-3 bg-[#FF6B35] flex items-center justify-center rounded-full shadow-md cursor-pointer"
          >
            {isUploading ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 rounded-full">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-white opacity-20"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-white"
                      strokeWidth="8"
                      strokeDasharray={264}
                      strokeDashoffset={264 - (uploadProgress / 100) * 264}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                </div>
                <span className="text-white text-xs font-bold">
                  {uploadProgress}%
                </span>
              </div>
            ) : (
              <MdOutlineCameraAlt className="text-white text-2xl" />
            )}
          </motion.div>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col w-full mx-4 text-white justify-between"
          style={{ minHeight: "138px", height: "auto" }}
        >
          <div>
            <h1 className="font-semibold text-black text-[25px]">{name}</h1>
            <p
              className="text-[16px] opacity-90 font-medium"
              style={{
                maxWidth: "200px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={role}
            >
              {role}
            </p>
          </div>

          <p
            className="text-[13px] leading-relaxed mt-1"
            style={{
              wordWrap: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "pre-wrap",
              width: "100%",
              maxWidth: "850px",
            }}
            title={description}
          >
            {description}
          </p>

          {/* Domains */}
          <motion.div
            className="flex gap-2 mt-3 flex-wrap"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {visibleDomains.map((domain, index) => (
              <motion.span
                key={index}
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  show: { opacity: 1, scale: 1 },
                }}
                className="bg-white/30 text-white px-3 py-1 rounded-xl text-sm font-medium shadow border border-white/60"
                style={{
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={domain}
              >
                {domain}
              </motion.span>
            ))}
            {remainingCount > 0 && (
              <motion.span
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  show: { opacity: 1, scale: 1 },
                }}
                className="bg-white/30 text-white px-3 py-1 rounded-md text-sm font-medium shadow border border-white/60"
              >
                +{remainingCount}
              </motion.span>
            )}
          </motion.div>
        </motion.div>

        {/* Edit Button */}
        <motion.button
          onClick={handleEditProfileClick}
          whileHover={{
            color: "#FF6B35",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.25)",
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
            color: { duration: 0.3, ease: "easeInOut" },
            boxShadow: { duration: 0.3, ease: "easeInOut" },
          }}
          className="w-[140px] h-[35px] bg-white text-black rounded-md 
               shadow font-medium text-sm transition 
               flex items-center justify-center gap-1 px-2 cursor-pointer"
        >
          <RiEditBoxFill />
          Edit Profile
        </motion.button>
      </motion.div>

      {/* Edit Profile Modal */}
      <EditProfile
        isOpen={isEditProfileOpen}
        onClose={handleCloseEditProfile}
      />
    </>
  );
};
export default HeaderSection;
