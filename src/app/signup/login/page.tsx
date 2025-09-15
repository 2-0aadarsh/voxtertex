'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import ImageCarousel from '../components/ImageCarousel'
import { useAuth } from '@/store/hooks'
import { useLoginMutation } from '@/store/slices/authSlice'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  
  // Redux store hooks
  const { user, isAuthenticated } = useAuth()
  const [loginUser] = useLoginMutation()

  const isFormValid = email.trim() !== '' && password.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleLogin = async () => {
    if (!isFormValid) return

    setIsLoading(true)
    setApiError('')

    try {
      console.log('🔍 Attempting login with Redux slice...')
      
      // Use Redux store login
      const result = await loginUser({
        email: email.trim(),
        password: password.trim(),
      }).unwrap()
      
      console.log('🎉 LOGIN SUCCESS - Redux Store Data:')
      console.log('📊 Login Result:', result)
      console.log('📋 Result Structure:', Object.keys(result))
      console.log('👤 User Data:', result.user)
      console.log('🔑 Tokens:', result.tokens)
      console.log('🎯 Redirect URL:', result.redirectUrl)
      
      setIsSuccess(true)
      setSuccessMessage('Login successful!')
      
      // Reset form
      setEmail('')
      setPassword('')
      
      // Log store state after login
      setTimeout(() => {
        console.log('🔍 Store State After Login:')
        console.log('✅ Is Authenticated:', isAuthenticated)
        console.log('👤 Current User:', user)
      }, 1000)
      
      // Redirect directly to role-specific page based on user role
      setTimeout(() => {
        const userRole = result.user?.role;
        console.log('🎯 User role for redirect:', userRole);
        
        switch (userRole) {
          case 'speaker':
            router.push('/speakerUser');
            break;
          case 'organizer':
            router.push('/newuser');
            break;
          case 'participant':
            router.push('/participant');
            break;
          default:
            router.push('/newuser'); // fallback
        }
      }, 1500) // Reduced delay for faster redirect
    } catch (error: unknown) {
      console.error('❌ Login error:', error)
      
      // Handle different types of errors
      let errorMessage = 'Login failed. Please try again.';
      
      if (error && typeof error === 'object') {
        const errorObj = error as Record<string, unknown>;
        if (errorObj?.data && typeof errorObj.data === 'object') {
          const data = errorObj.data as Record<string, unknown>;
          if (typeof data.message === 'string') {
            errorMessage = data.message;
          }
        } else if (typeof errorObj?.message === 'string') {
          errorMessage = errorObj.message;
        } else if (errorObj?.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (errorObj?.status === 404) {
          errorMessage = 'Login service is currently unavailable. Please try again later.';
        } else if (typeof errorObj?.status === 'number' && errorObj.status >= 500) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else if (errorObj?.name === 'TypeError' && typeof errorObj?.message === 'string' && errorObj.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      
      setApiError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid && !isLoading) {
      handleLogin()
    }
  }

  if (isSuccess) {
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
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            </motion.div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-500 text-sm mb-6">{successMessage}</p>
            <p className="text-gray-400 text-xs">Redirecting to your dashboard...</p>
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
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-500 text-sm">Login to your account</p>
          </div>

          {/* Error Message */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800">{apiError}</p>
              </div>
            </motion.div>
          )}

          <div className="space-y-4" onKeyPress={handleKeyPress}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (apiError) setApiError('')
                }}
                placeholder="Enter Email"
                className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-sm transition-colors ${
                  email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                required
              />
              {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                <p className="text-xs text-red-600 mt-1">Please enter a valid email address</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (apiError) setApiError('')
                  }}
                  placeholder="Enter Password"
                  className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-left">
              <button
                type="button"
                className="text-xs text-gray-600 hover:text-gray-800 underline transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={!isFormValid || isLoading}
              className={`w-full py-3 px-4 rounded-md font-medium text-white transition-all duration-200 text-sm ${
                isFormValid && !isLoading
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </div>
              ) : (
                'Log in'
              )}
            </button>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-600">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    router.push('/signup')
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}