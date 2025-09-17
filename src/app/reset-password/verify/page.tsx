'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import ImageCarousel from '../../signup/components/ImageCarousel'

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockTime, setLockTime] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  useEffect(() => {
    if (!email) {
      router.push('/forgot-password')
    }
  }, [email, router])

  useEffect(() => {
    if (isLocked && lockTime > 0) {
      const timer = setTimeout(() => {
        setLockTime(lockTime - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (isLocked && lockTime === 0) {
      setIsLocked(false)
      setAttempts(0)
    }
  }, [isLocked, lockTime])

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

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    // Handle backspace to move to previous field
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
    
    // Handle arrow keys for navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
    
    if (e.key === 'ArrowRight' && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '')
    
    if (pastedData.length > 0) {
      const newOtp = [...otp]
      
      // Fill the OTP array with pasted digits
      for (let i = 0; i < Math.min(pastedData.length, otp.length); i++) {
        newOtp[i] = pastedData[i]
      }
      
      setOtp(newOtp)
      
      // Focus on the next empty field or the last field
      const nextEmptyIndex = newOtp.findIndex(digit => digit === '')
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : otp.length - 1
      const nextInput = document.getElementById(`otp-${focusIndex}`)
      nextInput?.focus()
    }
  }

  const handleVerify = async () => {
    if (isLocked) return
    
    setIsVerifying(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email,
          otp: otp.join('') 
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/reset-password/new?email=${encodeURIComponent(email || '')}&token=${data.token}`)
      }, 1000)
    } catch (err) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      if (newAttempts >= 3) {
        setIsLocked(true)
        setLockTime(900) // 15 minutes
        setError('Too many failed attempts. Please try again in 15 minutes.')
      } else {
        setError(err instanceof Error ? err.message : 'Verification failed')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/resend-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Could not resend verification code')
      }
      
      // Reset OTP fields
      setOtp(['', '', '', '', '', ''])
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resend failed')
    } finally {
      setResendLoading(false)
    }
  }

  if (success) {
    return (
      <div className="h-screen flex overflow-hidden">
        <div className="hidden lg:flex lg:w-1/2 relative">
          <ImageCarousel />
        </div>

        <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center px-12">
          <div className="w-full max-w-lg text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            </motion.div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">OTP Verified!</h1>
            <p className="text-gray-500 text-sm mb-6">Redirecting to password reset form...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <ImageCarousel />
      </div>

      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center px-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <button
              onClick={() => router.push('/forgot-password')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Verify Your Email</h1>
            <p className="text-gray-500 text-sm">
              We sent a 6-digit code to <span className="font-medium">{email}</span>
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800">{error}</p>
                {isLocked && (
                  <p className="text-xs text-red-600 mt-1">
                    Try again in {Math.floor(lockTime / 60)}:{(lockTime % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onPaste={handlePaste}
                  disabled={isLocked}
                  className="w-10 h-12 text-center text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              ))}
            </div>

            <div className="flex justify-between items-center mt-3">
              <button
                onClick={handleResend}
                disabled={resendLoading || isLocked}
                className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${resendLoading ? "animate-spin" : ""}`} /> 
                Resend Code
              </button>
              <button
                onClick={handleVerify}
                disabled={isVerifying || otp.join("").length !== 6 || isLocked}
                className="px-5 py-2 bg-orange-500 text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
            </div>

            {attempts > 0 && attempts < 3 && (
              <p className="text-xs text-orange-600 text-center">
                {3 - attempts} attempts remaining
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}




