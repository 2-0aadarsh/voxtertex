"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { isPasswordValid } from "../utils/validations"
import { FormData } from "../../types"

interface StepTwoProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
}

export default function StepTwo({ formData, updateFormData }: StepTwoProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isPasswordMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
  const isPasswordMismatch = formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="password" className="block text-xs font-medium text-gray-700">Password</label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ password: e.target.value })}
            placeholder="Create a secure password"
            className={`w-full px-3 py-3 pr-10 text-sm bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              formData.password && !isPasswordValid(formData.password) ? "border-red-300 ring-2 ring-red-300" : "border-gray-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {formData.password && !isPasswordValid(formData.password) && (
          <p className="text-xs text-red-600">Password must be at least 6 characters long and contain uppercase, lowercase, and special characters</p>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-1">
        Password must contain at least 6 characters, including uppercase, lowercase, and special characters.
      </p>
      
      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700">Confirm Password</label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ confirmPassword: e.target.value })}
            placeholder="Confirm your password"
            className={`w-full px-3 py-3 pr-10 text-sm bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              isPasswordMismatch ? "border-red-300 ring-2 ring-red-300" : "border-gray-300"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {isPasswordMismatch && (
          <p className="text-xs text-red-600">Passwords do not match</p>
        )}
      </div>
      
      {isPasswordMatch && (
        <p className="text-xs text-green-600 mt-1">
          ✓ Passwords match
        </p>
      )}
    </div>
  )
}