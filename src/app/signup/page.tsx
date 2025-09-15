'use client'

import ImageCarousel from './components/ImageCarousel'
import SignupForm from './components/SignupForm'
import { SignupProvider } from './context/SignupContext'

export default function SignupPage() {
  return (
    <div className="h-screen flex overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <ImageCarousel />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-md">
          <SignupProvider>
            <SignupForm />
          </SignupProvider>
          
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Already have an account?{' '}
              <button 
                onClick={() => {
                  window.location.href = '/signup/login'
                }}
                className="text-orange-500 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}