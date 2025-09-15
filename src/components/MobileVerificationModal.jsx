"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, RefreshCw, X } from "lucide-react";
import SMSService from "@/services/smsService";

const MobileVerificationModal = ({
  isOpen,
  onClose,
  mobileNo,
  onVerificationSuccess,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Timer for OTP expiration
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Send OTP when modal opens
  useEffect(() => {
    if (isOpen && mobileNo) {
      handleSendOTP();
    }
  }, [isOpen, mobileNo]);

  const handleSendOTP = async () => {
    setIsSendingOTP(true);
    setError("");
    setSuccess(false);
    setOtp(["", "", "", "", "", ""]);

    try {
      const result = await SMSService.sendOTP(mobileNo);
      if (result.success) {
        setTimeLeft(result.data.expiresIn || 600); // 10 minutes
        setCanResend(false);
        console.log("OTP sent successfully:", result);
      } else {
        setError(result.error || "Failed to send OTP");
      }
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError("");

    try {
      const result = await SMSService.sendOTP(mobileNo);
      if (result.success) {
        setTimeLeft(result.data.expiresIn || 600); // 10 minutes
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        console.log("OTP resent successfully:", result);
      } else {
        setError(result.error || "Failed to resend OTP");
      }
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`mobile-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`mobile-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const result = await SMSService.verifyOTP(mobileNo, otpString);
      if (result.success) {
        setSuccess(true);

        // Call success callback after a short delay
        setTimeout(() => {
          onVerificationSuccess(result.data.user);
          onClose();
        }, 1500);
      } else {
        setError(result.error || "Verification failed");
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (err) {
      setError(err.message || "Verification failed");
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Verify Mobile Number
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                We sent a 6-digit OTP to{" "}
                <span className="font-medium">{mobileNo}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mobile number verified successfully!
            </motion.div>
          )}

          {/* OTP Input */}
          <div className="mb-6">
            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`mobile-otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 text-center text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={isVerifying || isSendingOTP}
                />
              ))}
            </div>

            {/* Timer */}
            {timeLeft > 0 && (
              <p className="text-center text-sm text-gray-600">
                OTP expires in {formatTime(timeLeft)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleResendOTP}
              disabled={!canResend || isResending || isVerifying}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`}
              />
              {isResending ? "Resending..." : "Resend OTP"}
            </button>

            <button
              onClick={handleVerify}
              disabled={
                isVerifying || otp.join("").length !== 6 || isSendingOTP
              }
              className="px-6 py-2 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </button>
          </div>

          {/* Loading State */}
          {isSendingOTP && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Sending OTP...
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileVerificationModal;
