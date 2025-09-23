import { DisputeFormData } from '../../types/disputeTypes'
import { Upload } from 'lucide-react'

interface BrandingContentStepProps {
  formData: DisputeFormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onFormDataUpdate: (data: Partial<DisputeFormData>) => void
}

export default function BrandingContentStep({ formData, onInputChange, onFormDataUpdate }: BrandingContentStepProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    onFormDataUpdate({ evidence: file })
  }

  const handleContactMethodChange = (method: string) => {
    onFormDataUpdate({ preferredResolution: method })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-orange-500 mb-2">Description & Evidence</h3>
      </div>

      {/* Detailed Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detailed Description
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Provide a comprehensive description of the dispute, including what happened, when it occurred, and what resolution you're seeking.
        </p>
        <textarea
          name="description"
          value={formData.description}
          onChange={onInputChange}
          placeholder="Please provide a detailed description of the dispute..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Requested Resolution */}
      <div>
        <label className="block text-sm font-medium text-orange-500 mb-2">
          Requested Resolution
        </label>
        <p className="text-sm text-gray-600 mb-3">
          What specific outcome or resolution are you seeking?
        </p>
        <textarea
          name="preferredResolution"
          value={formData.preferredResolution}
          onChange={onInputChange}
          placeholder="What specific outcome or resolution are you seeking?"
          rows={3}
          className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Supporting Documents */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Supporting Documents
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 transition-colors">
          <div className="space-y-2 text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <div className="text-sm text-gray-600">
              <span className="font-medium">Upload screenshots, emails, receipts, or other supporting evidence</span>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
            <button
              type="button"
              className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600"
            >
              Choose File
            </button>
          </div>
        </div>
      </div>

      {/* Preferred Contact Method */}
      <div>
        <label className="block text-sm font-medium text-orange-500 mb-3">
          Preferred Contact Method
        </label>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              id="email-only"
              name="contact-method"
              type="radio"
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
              onChange={() => handleContactMethodChange('email')}
            />
            <label htmlFor="email-only" className="ml-3 block text-sm text-gray-700">
              Email Only
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="phone-only"
              name="contact-method"
              type="radio"
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
              onChange={() => handleContactMethodChange('phone')}
            />
            <label htmlFor="phone-only" className="ml-3 block text-sm text-gray-700">
              Phone Only
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="both-methods"
              name="contact-method"
              type="radio"
              defaultChecked
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
              onChange={() => handleContactMethodChange('both')}
            />
            <label htmlFor="both-methods" className="ml-3 block text-sm text-gray-700">
              Both email and phone
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}