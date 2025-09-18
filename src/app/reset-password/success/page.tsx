'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import ImageCarousel from '../../signup/components/ImageCarousel'

export default function ResetPasswordSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto redirect to login after 5 seconds
    const timer = setTimeout(() => {
      router.push('/signup/login')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

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
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-bold text-blue-900 mb-4"
          >
            Password Reset Complete!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-500 text-sm mb-6"
          >
            Your password has been successfully updated. You can now sign in with your new password.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="space-y-4"
          >
            <button
              onClick={() => router.push('/signup/login')}
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition-all duration-200 text-sm flex items-center justify-center gap-2"
            >
              Continue to Login
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <p className="text-xs text-gray-400">
              You will be automatically redirected in 5 seconds
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <h3 className="text-sm font-medium text-blue-900 mb-2">Security Tips:</h3>
            <ul className="text-xs text-blue-700 space-y-1 text-left">
              <li>• Use a strong, unique password</li>
              <li>• Don't share your password with anyone</li>
              <li>• Log out from shared devices</li>
              <li>• Enable two-factor authentication if available</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  )
}





