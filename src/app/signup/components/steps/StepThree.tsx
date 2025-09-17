import FormSelect from "../common/FormSelect"
import { getAvailableActivities } from "../utils/formHelpers"
import { FormData } from "../../types"

interface StepThreeProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
}

export default function StepThree({ formData, updateFormData }: StepThreeProps) {
  const handleIndustryChange = (industry: string) => {
    updateFormData({ companyTitle: industry, activity: [] })
  }

  const handleActivityToggle = (activityValue: string) => {
    const current = formData.activity || []
    if (current.includes(activityValue)) {
      updateFormData({ activity: current.filter((a: string) => a !== activityValue) })
    } else if (current.length < 3) {
      updateFormData({ activity: [...current, activityValue] })
    }
  }

  return (
    <div className="space-y-3">
      <FormSelect
        id="whoAreYou"
        label="Who are you?"
        value={formData.whoAreYou}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFormData({ whoAreYou: e.target.value })}
        options={[
          { value: "", label: "Select your role" },
          { value: "speaker", label: "Speaker" },
          { value: "organizer", label: "Organizer" },
          { value: "participant", label: "Participant" },
        ]}
      />

      <FormSelect
        id="companyTitle"
        label="Industry"
        value={formData.companyTitle}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleIndustryChange(e.target.value)}
        options={[
          { value: "", label: "Select your industry" },
          { value: "technology", label: "Technology" },
          { value: "healthcare", label: "Healthcare and Medicine" },
          { value: "finance", label: "Finance and Banking" },
          { value: "education", label: "Education" },
          { value: "business", label: "Business and Management" },
          { value: "engineering", label: "Engineering" },
          { value: "art", label: "Art and Entertainment" },
          { value: "law", label: "Law and Legal Studies" },
          { value: "marketing", label: "Marketing and Communications" },
          { value: "environmental", label: "Environmental and Sustainability" },
          { value: "manufacturing", label: "Manufacturing and Industry" },
          { value: "social", label: "Social Sciences and Humanities" },
          { value: "retail", label: "Retail and E-Commerce" },
          { value: "energy", label: "Energy and Utilities" },
          { value: "realestate", label: "Real Estate and Property Development" },
        ]}
      />

      {formData.companyTitle && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-700">Primary Activities</label>
            <span className="text-xs text-gray-500">
              {formData.activity?.length || 0}/3 selected
            </span>
          </div>
          
          <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg bg-white">
            {getAvailableActivities(formData.companyTitle).map((activity) => {
              const isSelected = formData.activity?.includes(activity) || false
              const isDisabled = !isSelected && (formData.activity?.length || 0) >= 3
              
              return (
                <label 
                  key={activity} 
                  className={`flex items-center space-x-3 p-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'bg-orange-50 border-l-4 border-l-orange-500' 
                      : isDisabled 
                        ? 'bg-gray-50 cursor-not-allowed opacity-60' 
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleActivityToggle(activity)}
                      disabled={isDisabled}
                      className="w-4 h-4 rounded border-2 border-gray-300 text-orange-500 focus:ring-orange-500 focus:ring-2 disabled:opacity-50"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className={`text-sm flex-1 ${
                    isSelected ? 'text-orange-700 font-medium' : 'text-gray-700'
                  }`}>
                    {activity}
                  </span>
                  {isSelected && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </label>
              )
            })}
          </div>
          
          {(formData.activity?.length || 0) > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-600">
                Selected: <span className="font-medium text-orange-600">
                  {formData.activity?.join(', ')}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
