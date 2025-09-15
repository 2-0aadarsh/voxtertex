import express from "express";
import { sendOtp, verifyOtp, resendOtp } from "../controllers/otpController.js";

const router = express.Router();

/**
 * @route POST /api/auth/send-otp
 * @desc Send OTP to user's email for verification
 * @access Public
 */
router.post("/send-otp", sendOtp);

/**
 * @route POST /api/auth/verify-otp
 * @desc Verify OTP sent to user's email
 * @access Public
 */
router.post("/verify-otp", verifyOtp);

/**
 * @route POST /api/auth/resend-otp
 * @desc Resend OTP to user's email
 * @access Public
 */
router.post("/resend-otp", resendOtp);

export default router;