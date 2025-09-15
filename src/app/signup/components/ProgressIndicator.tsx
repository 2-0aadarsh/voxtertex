'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { ProgressIndicatorProps } from '../types'

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, index) => index + 1)
  
  const stepNames = ['Personal Info', 'Security', 'Password', 'Professional']

  return (
    <div className="mb-4">
      <div className="flex items-start">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className="relative">
                <motion.div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                    step < currentStep
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : step === currentStep
                      ? 'border-orange-500 text-orange-500 bg-white'
                      : 'border-gray-300 text-gray-300 bg-white'
                  }`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {step < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="font-medium text-xs">{step}</span>
                  )}
                </motion.div>
              </div>
              
              <span className="text-xs text-gray-500 mt-1.5 text-center max-w-16">
                {stepNames[index]}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 mt-4">
                <motion.div
                  className={`h-0.5 transition-colors duration-300 ${
                    step < currentStep ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: step < currentStep ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}