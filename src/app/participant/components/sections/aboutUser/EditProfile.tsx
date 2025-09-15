"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/store/hooks";
import { useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/store/slices/authSlice";
import { useGetCurrentUserQuery } from "@/store/slices/authSlice";
import { useGetProfileQuery } from "@/store/slices/profileSlice";
import SMSService from "@/services/smsService";

interface EditProfileProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function EditProfile({ isOpen, onClose }: EditProfileProps) {
  // Get user data from Redux store
  const auth = useAuth();
  const dispatch = useAppDispatch();
  
  // Get refetch function for current user query
  const { refetch: refetchCurrentUser } = useGetCurrentUserQuery();
  
  // Get refetch function for profile query
  const { refetch: refetchProfile } = useGetProfileQuery();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [expertiseList, setExpertiseList] = useState<string[]>([]);
  const [currentExpertise, setCurrentExpertise] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  
  // Inline OTP verification state
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);
  
  // Character limits
  const BIO_MAX_LENGTH = 500;
  const TITLE_MAX_LENGTH = 100;
  const EXPERTISE_MAX_LENGTH = 50;

  // OTP Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen && auth.user) {
      const user = auth.user._doc || auth.user;
      
      // Debug: Log user data to see what's available
      console.log('🔍 User data for EditProfile (participant):', {
        user,
        yearsOfExperience: (user as { yearsOfExperience?: number | string }).yearsOfExperience,
        type: typeof (user as { yearsOfExperience?: number | string }).yearsOfExperience
      });
      
      // Set name from user data (disabled field)
      setFullName(`${user.firstName} ${user.lastName}`);
      
      // Set email from user data (disabled field)
      setEmail(user.email || "");
      
      // Set phone from user data
      setPhone(user.mobileNo || "");
      
      // Set bio from user data
      setBio(user.bio || "");
      
      // Set professional title from user data
      setTitle(user.professionalTitle || "");
      
      // Set location from user data
      setLocation(user.location || "");
      
      // Set expertise from user data
      setExpertiseList(user.areaOfExpertise || []);
      
      // Set years of experience from user data - handle both number and string types
      const userExperience = (user as { yearsOfExperience?: number | string }).yearsOfExperience;
      if (userExperience !== undefined && userExperience !== null) {
        // Convert to number if it's a string, otherwise use as is
        const experienceValue = typeof userExperience === 'string' ? parseInt(userExperience, 10) : userExperience;
        setYearsOfExperience(isNaN(experienceValue) ? 0 : experienceValue);
      } else {
        setYearsOfExperience(0);
      }
      
      // Set mobile verification status
      setIsMobileVerified((user as { isMobileVerified?: boolean }).isMobileVerified || false);
    }
  }, [isOpen, auth.user]);

  // Body scroll lock effect
  useEffect(() => {
    if (isOpen) {
      // Simple and effective scroll prevention
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    // Clear any error/success messages
    setError("");
    setSuccess("");
    
    // Reset OTP verification state
    setShowOTPInput(false);
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setTimeLeft(0);
    setCanResend(false);
    
    if (onClose) onClose();
  };

  // Helper function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  };

  // Helper function to handle bio input with character limit
  const handleBioChange = (value: string) => {
    if (value.length <= BIO_MAX_LENGTH) {
      setBio(value);
    }
  };

  // Helper function to handle title input with character limit
  const handleTitleChange = (value: string) => {
    if (value.length <= TITLE_MAX_LENGTH) {
      setTitle(value);
    }
  };

  // Helper function to handle expertise input with character limit
  const handleExpertiseChange = (value: string) => {
    if (value.length <= EXPERTISE_MAX_LENGTH) {
      setCurrentExpertise(value);
    }
  };

  const addExpertise = () => {
    const trimmedExpertise = currentExpertise.trim();
    if (trimmedExpertise && !expertiseList.includes(trimmedExpertise)) {
      // Truncate expertise if it's too long
      const finalExpertise = truncateText(trimmedExpertise, EXPERTISE_MAX_LENGTH);
      setExpertiseList([...expertiseList, finalExpertise]);
      setCurrentExpertise("");
    }
  };

  const removeExpertise = (expertise: string) => {
    setExpertiseList(expertiseList.filter(item => item !== expertise));
  };

  // OTP input handlers
  const handleOTPChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    // Auto focus next input
    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOTPKeyDown = (e: React.KeyboardEvent, index: number) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSendOTP = async () => {
    if (!phone.trim()) {
      setError("Please enter a mobile number first");
      return;
    }
    
    // Basic phone number validation - more lenient
    const cleanedPhone = phone.replace(/\s/g, '');
    const phoneRegex = /^[\+]?[1-9][\d]{9,15}$/;
    
    if (!phoneRegex.test(cleanedPhone)) {
      setError("Please enter a valid 10-digit mobile number (e.g., 9876543210)");
      return;
    }

    setIsSendingOTP(true);
    setOtpError("");
    setOtp(["", "", "", "", "", ""]);

    try {
      const result = await SMSService.sendOTP(phone);
      if (result.success) {
        setTimeLeft(result.data.expiresIn || 600); // 10 minutes
        setCanResend(false);
        setShowOTPInput(true);
        setSuccess("OTP sent successfully!");
        console.log("OTP sent successfully:", result);
      } else {
        setOtpError(result.error || "Failed to send OTP");
      }
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    setIsSendingOTP(true);
    setOtpError("");

    try {
      const result = await SMSService.sendOTP(phone);
      if (result.success) {
        setTimeLeft(result.data.expiresIn || 600); // 10 minutes
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        setSuccess("OTP resent successfully!");
        console.log("OTP resent successfully:", result);
      } else {
        setOtpError(result.error || "Failed to resend OTP");
      }
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setOtpError("Please enter the complete 6-digit OTP");
      return;
    }

    setIsVerifyingOTP(true);
    setOtpError("");

    try {
      const result = await SMSService.verifyOTP(phone, otpString);
      if (result.success) {
        setIsMobileVerified(true);
        setSuccess("Mobile number verified successfully!");
        
        // Update Redux store
        if (result.data.user) {
          dispatch(updateUser(result.data.user));
        }
        
        // Trigger refetch
        refetchCurrentUser();
        
        // Hide OTP input after successful verification
        setShowOTPInput(false);
        setOtp(["", "", "", "", "", ""]);
      } else {
        setOtpError(result.error || "Verification failed");
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Verification failed");
      setOtp(["", "", "", "", "", ""]);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");
      
      if (!auth.user) {
        throw new Error("User not authenticated");
      }
      
      // Prepare final expertise list - include current expertise if it's typed but not added
      const finalExpertiseList = [...expertiseList];
      if (currentExpertise.trim() && !expertiseList.includes(currentExpertise.trim())) {
        finalExpertiseList.push(currentExpertise.trim());
      }
      
      console.log('📋 Final expertise list:', finalExpertiseList);
      
      // Prepare payload for API request
      const userPayload = {
        mobileNo: phone,
        bio,
        professionalTitle: title,
        location,
        areaOfExpertise: finalExpertiseList,
        yearsOfExperience,
      };
      
      console.log('📤 Sending payload to server:', JSON.stringify(userPayload, null, 2));

      // Make API request to update user basic info
      const userApiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/profile/basic`;
      const userRes = await fetch(userApiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Send cookies for authentication
        body: JSON.stringify(userPayload),
      });

      if (!userRes.ok) {
        const errorData = await userRes.json();
        throw new Error(errorData.message || "Failed to update user profile");
      }

      const userData = await userRes.json();
      console.log("User profile updated:", userData);
      
      // Update Redux store with the updated user data
      if (userData.success && userData.user) {
        dispatch(updateUser(userData.user));
        console.log('✅ Redux store updated with server response:', userData.user);
      }
      
      // Trigger refetch of current user data to update UI immediately
      try {
        await refetchCurrentUser();
        console.log('🔄 Current user data refetched successfully');
      } catch (refetchError) {
        console.warn('⚠️ Failed to refetch current user data:', refetchError);
      }
      
      // Trigger refetch of profile data to update UI immediately
      try {
        await refetchProfile();
        console.log('🔄 Profile data refetched successfully');
      } catch (refetchError) {
        console.warn('⚠️ Failed to refetch profile data:', refetchError);
      }
      
      // Show success message
      setSuccess("Profile updated successfully!");
      
      // Log successful update
      console.log('✅ Profile update successful');
      
      // Close modal after a delay to show success message
      setTimeout(() => {
        handleClose();
      }, 1500);
      
    } catch (err: unknown) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Removed for cleaner look */}

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 max-h-[95vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-orange-500">Edit Profile</h2>
                  <p className="text-gray-500 text-[11px] mt-1">
                    Update your personal and professional information.
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2">* Indicates required</p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                >
                  ×
                </button>
              </div>

              {/* Form */}
              <div className="mt-4 space-y-4">
                {/* Full Name - Disabled */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-gray-500">
                    Full Name (Cannot be changed)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    disabled
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-[11px] text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Email - Disabled */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-gray-500">
                    Email Address (Cannot be changed)
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-[11px] text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter Phone Number"
                      className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                    />
                    {phone.trim() && !isMobileVerified && !showOTPInput && (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={isSendingOTP}
                        className="px-3 py-2 bg-orange-500 text-white text-[11px] rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingOTP ? "Sending..." : "Verify"}
                      </button>
                    )}
                    {isMobileVerified && (
                      <div className="flex items-center px-3 py-2 bg-green-100 text-green-700 text-[11px] rounded-md">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Verified
                      </div>
                    )}
                  </div>
                  {phone.trim() && !isMobileVerified && !showOTPInput && (
                    <p className="text-[10px] text-orange-500 mt-1">
                      Click &quot;Verify&quot; to verify your mobile number
                    </p>
                  )}
                </div>

                {/* Inline OTP Verification */}
                {showOTPInput && !isMobileVerified && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-orange-50 border border-orange-200 rounded-md p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-medium text-orange-700">
                          Enter 6-digit OTP sent to {phone}
                        </p>
                        {timeLeft > 0 && (
                          <p className="text-[10px] text-orange-600 mt-1">
                            OTP expires in {formatTime(timeLeft)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowOTPInput(false)}
                        className="text-orange-400 hover:text-orange-600 text-sm"
                      >
                        ×
                      </button>
                    </div>

                    {/* OTP Input Fields */}
                    <div className="flex justify-center gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOTPChange(e.target.value, index)}
                          onKeyDown={(e) => handleOTPKeyDown(e, index)}
                          className="w-8 h-8 text-center text-sm border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          disabled={isVerifyingOTP || isSendingOTP}
                        />
                      ))}
                    </div>

                    {/* OTP Error */}
                    {otpError && (
                      <p className="text-[10px] text-red-600 text-center">
                        {otpError}
                      </p>
                    )}

                    {/* OTP Actions */}
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={!canResend || isSendingOTP || isVerifyingOTP}
                        className="text-[10px] text-orange-600 hover:text-orange-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingOTP ? "Resending..." : "Resend OTP"}
                      </button>

                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={isVerifyingOTP || otp.join("").length !== 6 || isSendingOTP}
                        className="px-4 py-1 bg-orange-500 text-white text-[10px] rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isVerifyingOTP ? "Verifying..." : "Verify OTP"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Bio */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500">
                    Bio * ({bio.length}/{BIO_MAX_LENGTH})
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => handleBioChange(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className={`w-full rounded-md border px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none min-h-[80px] resize-none ${
                      bio.length > BIO_MAX_LENGTH * 0.9 
                        ? 'border-orange-300' 
                        : 'border-gray-300'
                    }`}
                    style={{ 
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  ></textarea>
                  {bio.length > BIO_MAX_LENGTH * 0.9 && (
                    <p className="text-[10px] text-orange-500 mt-1">
                      {BIO_MAX_LENGTH - bio.length} characters remaining
                    </p>
                  )}
                </div>

                {/* Professional Title + Expertise */}
                <div className="flex gap-2 items-end">
                  <div className="relative flex-1">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500">
                      Professional Title * ({title.length}/{TITLE_MAX_LENGTH})
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="eg. Senior Software Engineer"
                      className={`w-full rounded-md border px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none ${
                        title.length > TITLE_MAX_LENGTH * 0.9 
                          ? 'border-orange-300' 
                          : 'border-gray-300'
                      }`}
                    />
                    {title.length > TITLE_MAX_LENGTH * 0.9 && (
                      <p className="text-[10px] text-orange-500 mt-1">
                        {TITLE_MAX_LENGTH - title.length} characters remaining
                      </p>
                    )}
                  </div>
                  <div className="relative flex-1">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500">
                      Area of Expertise * ({currentExpertise.length}/{EXPERTISE_MAX_LENGTH})
                    </label>
                    <input
                      type="text"
                      placeholder="eg. Machine Learning"
                      value={currentExpertise}
                      onChange={(e) => handleExpertiseChange(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addExpertise())
                      }
                      className={`w-full rounded-md border px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none ${
                        currentExpertise.length > EXPERTISE_MAX_LENGTH * 0.9 
                          ? 'border-orange-300' 
                          : 'border-gray-300'
                      }`}
                    />
                    {currentExpertise.trim() && (
                      <p className="text-[10px] text-green-600 mt-1">
                        Press Enter or click + to add this expertise
                      </p>
                    )}
                    {currentExpertise.length > EXPERTISE_MAX_LENGTH * 0.9 && (
                      <p className="text-[10px] text-orange-500 mt-1">
                        {EXPERTISE_MAX_LENGTH - currentExpertise.length} characters remaining
                      </p>
                    )}
                    {expertiseList.length === 0 && !currentExpertise.trim() && (
                      <p className="text-[10px] text-orange-500 mt-1">
                        Add at least one area of expertise
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={addExpertise}
                    className="h-[40px] w-[40px] flex items-center justify-center rounded-md bg-orange-500 text-white text-lg hover:bg-orange-600 transition-colors"
                    style={{
                      backgroundImage: "url('/orange_button.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Selected Areas of Expertise */}
                {expertiseList.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-medium text-orange-500 mb-2">
                      Selected Area of Expertise ({expertiseList.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {expertiseList.map((expertise, index) => (
                        <div
                          key={`expertise-${expertise}-${index}`}
                          className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2 max-w-full"
                        >
                          <span 
                            className="text-[11px] text-orange-600 truncate"
                            title={expertise}
                            style={{ 
                              maxWidth: '180px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {expertise}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeExpertise(expertise)}
                            className="text-orange-400 hover:text-orange-600 text-sm flex-shrink-0"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter Location"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                  />
                </div>

                {/* Years of Experience */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-orange-500">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                    placeholder="Enter years of experience"
                    min="0"
                    max="50"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-[11px] focus:ring-1 focus:ring-orange-400 outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Enter your total years of professional experience (0-50 years)
                  </p>
                </div>

                {/* Error and Success Messages */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-[11px]">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md text-[11px] flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {success}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-6 py-2 rounded-md border border-orange-500 text-[11px] text-orange-500 bg-white hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-6 py-2 rounded-md text-[11px] text-white bg-orange-500 hover:bg-orange-600 hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    style={{
                      backgroundImage: "url('/orange_button.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
      
    </AnimatePresence>
  );
}
