"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import FormInput from "../common/FormInput"
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
      <div className="relative">
        <FormInput
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ password: e.target.value })}
          placeholder="Create a secure password"
          error={formData.password && !isPasswordValid(formData.password) ? "Password must be at least 6 characters long and contain uppercase, lowercase, and special characters" : ""}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-1">
        Password must contain at least 6 characters, including uppercase, lowercase, and special characters.
      </p>
      
      <div className="relative">
        <FormInput
          id="confirmPassword"
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ confirmPassword: e.target.value })}
          placeholder="Confirm your password"
          error={isPasswordMismatch ? "Passwords do not match" : ""}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      
      {isPasswordMatch && (
        <p className="text-xs text-green-600 mt-1">
          ✓ Passwords match
        </p>
      )}
    </div>
  )
}