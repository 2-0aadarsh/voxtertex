import FormSelect from "../common/FormSelect"
import { getAvailableActivities } from "../utils/formHelpers"

export default function StepThree({ formData, updateFormData }) {
  const handleIndustryChange = (industry: string) => {
    updateFormData({ companyTitle: industry, activity: [] })
  }

  const handleActivityToggle = (activityValue: string) => {
    const current = formData.activity || []
    if (current.includes(activityValue)) {
      updateFormData({ activity: current.filter((a) => a !== activityValue) })
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
        onChange={(e) => updateFormData({ whoAreYou: e.target.value })}
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
        onChange={(e) => handleIndustryChange(e.target.value)}
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
          <label className="block text-xs font-medium text-gray-700">Primary Activities (max 3)</label>
          <div className="h-24 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
            {getAvailableActivities(formData.companyTitle).map((activity) => (
              <label key={activity} className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.activity.includes(activity)}
                  onChange={() => handleActivityToggle(activity)}
                  disabled={!formData.activity.includes(activity) && formData.activity.length >= 3}
                  className="rounded text-orange-500"
                />
                <span>{activity}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
