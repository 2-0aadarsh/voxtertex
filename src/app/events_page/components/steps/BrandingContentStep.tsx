import { Upload } from 'lucide-react'

interface BrandingContentStepProps {
  formData: {
    description: string
    image: File | null
    tags: string[]
  }
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onFormDataUpdate: (data: any) => void
}

export default function BrandingContentStep({ formData, onInputChange, onFormDataUpdate }: BrandingContentStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Branding & Content</h3>
        <p className="text-gray-600 mb-6">Images and description</p>
      </div>

      {/* Upload Banner Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Banner Image *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-gray-600 mb-2">Drag to upload event banner</p>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
            Browse File
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null
              onFormDataUpdate({ image: file })
            }}
            className="hidden"
            id="banner-image"
          />
          <label htmlFor="banner-image" className="cursor-pointer">
            <div className="mt-2 text-xs text-gray-500">
              Supported formats: JPG, PNG (Max 5MB)
            </div>
          </label>
          {formData.image && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                ✓ {formData.image.name} uploaded successfully
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Event Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Event Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          required
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          placeholder="Describe your event..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Tell attendees what makes your event special and what they can expect.
        </p>
      </div>

      {/* Event Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {['Technology', 'Innovation', 'Networking', 'Professional Development', 'Leadership'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                const currentTags = formData.tags || []
                if (currentTags.includes(tag)) {
                  onFormDataUpdate({
                    tags: currentTags.filter(t => t !== tag)
                  })
                } else {
                  onFormDataUpdate({
                    tags: [...currentTags, tag]
                  })
                }
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                formData.tags?.includes(tag)
                  ? 'bg-orange-100 text-orange-700 border-orange-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Select relevant tags to help attendees find your event.
        </p>
      </div>
    </div>
  )
}