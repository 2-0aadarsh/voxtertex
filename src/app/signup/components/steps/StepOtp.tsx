"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, RefreshCw } from "lucide-react"
import ErrorMessage from "../common/ErrorMessage"

interface StepOtpProps {
  email: string
  onVerifySuccess: () => void
}

export default function StepOtp({ email, onVerifySuccess }: StepOtpProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // auto focus next
    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleVerify = async () => {
    setIsVerifying(true)
    setError("")
    try {
      const response = await fetch("http://localhost:3001/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join("") }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Invalid OTP")

      setSuccess(true)
      setTimeout(() => onVerifySuccess(), 1000) // move to next step
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError("")
    try {
      const response = await fetch("http://localhost:3001/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Could not resend verification code")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resend failed")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-base font-semibold text-gray-800">Verify your email</h2>
        <p className="text-sm text-gray-600">We sent a 6-digit OTP to <span className="font-medium">{email}</span></p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="flex justify-center gap-2">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            id={`otp-${idx}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, idx)}
            className="w-10 h-12 text-center text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        ))}
      </div>

      <div className="flex justify-between items-center mt-3">
        <button
          onClick={handleResend}
          disabled={resendLoading}
          className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-800"
        >
          <RefreshCw className={`w-4 h-4 ${resendLoading ? "animate-spin" : ""}`} /> Resend OTP
        </button>
        <button
          onClick={handleVerify}
          disabled={isVerifying || otp.join("").length !== 6}
          className="px-5 py-2 bg-orange-500 text-white rounded-md text-sm disabled:opacity-50"
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </button>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-green-600 text-sm"
        >
          <CheckCircle className="w-4 h-4" /> Verified successfully
        </motion.div>
      )}
    </div>
  )
}
