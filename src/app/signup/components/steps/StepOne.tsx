import FormInput from "../common/FormInput"
import { isEmailValid } from "../utils/validations"
import { FormData } from "../../types"

interface StepOneProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
}

export default function StepOne({ formData, updateFormData }: StepOneProps) {
  return (
    <div className="space-y-3">

      <div className="grid grid-cols-2 gap-3">
        <FormInput
          id="firstName"
          label="First Name"
          value={formData.firstName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ firstName: e.target.value })}
          placeholder="First name"
          error={formData.firstName && formData.firstName.trim().length < 2 ? "First name must be at least 2 characters" : ""}
        />
        <FormInput
          id="lastName"
          label="Last Name"
          value={formData.lastName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ lastName: e.target.value })}
          placeholder="Last name"
          error={formData.lastName && formData.lastName.trim().length < 2 ? "Last name must be at least 2 characters" : ""}
        />
      </div>
      <FormInput
        id="email"
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ email: e.target.value })}
        placeholder="Enter your email address"
        error={formData.email && !isEmailValid(formData.email) ? "Please enter a valid email" : ""}
      />
    </div>
  )
}
