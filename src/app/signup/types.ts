export interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  whoAreYou: string
  companyTitle: string
  activity: string[]
  isEmailVerified: boolean
}

export interface Slide {
  image: string
  tagline: string
  subtitle: string
}

export interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export interface SignupFormProps {
  currentStep: number
  setCurrentStep: (step: number) => void
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
}

// API Response Types
export interface ApiError {
  field: string
  message: string
}

export interface SignupResponse {
  success: boolean
  message: string
  user?: {
    id: string
    fullName: string
    email: string
    whoAreYou: string
    companyTitle: string
    activity: string[]
  }
  errors?: ApiError[]
}