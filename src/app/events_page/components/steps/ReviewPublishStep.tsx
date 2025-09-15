interface ReviewPublishStepProps {
  formData: {
    eventName: string
    startDate: string
    endDate: string
    eventMode: 'offline' | 'online' | 'hybrid'
    location: string
    description: string
    image: File | null
    tags: string[]
    ticketTypes: Array<{
      name: string
      price: string
      quantity: string
    }>
    speakers: Array<{
      name: string
      title: string
      bio: string
    }>
    addons: {
      featureOnHome: boolean
      includeInNewsletter: boolean
      socialMediaPromotion: boolean
    }
  }
  onStepChange: (step: number) => void
  onSubmit: () => void
  isLoading: boolean
}

export default function ReviewPublishStep({ formData, onStepChange, onSubmit, isLoading }: ReviewPublishStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Review & Publish</h3>
        <p className="text-gray-600 mb-6">Review your event details before publishing</p>
      </div>

      {/* Review Sections */}
      <div className="space-y-6">
        {/* Core Details Section */}
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm mr-2">1</span>
              Core Details
            </h4>
            <button
              type="button"
              onClick={() => onStepChange(1)}
              className="text-orange-500 text-sm font-medium hover:text-orange-600"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Event Name:</span>
              <p className="font-medium">{formData.eventName || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-600">Event Mode:</span>
              <p className="font-medium capitalize">{formData.eventMode}</p>
            </div>
            <div>
              <span className="text-gray-600">Start Date:</span>
              <p className="font-medium">{formData.startDate || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-gray-600">End Date:</span>
              <p className="font-medium">{formData.endDate || 'Not specified'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-600">Location:</span>
              <p className="font-medium">{formData.location || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Branding & Content Section */}
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm mr-2">2</span>
              Branding & Content
            </h4>
            <button
              type="button"
              onClick={() => onStepChange(2)}
              className="text-orange-500 text-sm font-medium hover:text-orange-600"
            >
              Edit
            </button>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-600">Banner Image:</span>
              <p className="font-medium">{formData.image ? formData.image.name : 'No image uploaded'}</p>
            </div>
            <div>
              <span className="text-gray-600">Event Description:</span>
              <p className="font-medium">{formData.description || 'No description added'}</p>
            </div>
            <div>
              <span className="text-gray-600">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.tags?.length ? formData.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                    {tag}
                  </span>
                )) : <span className="font-medium">No tags selected</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Ticketing Section */}
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm mr-2">3</span>
              Ticketing
            </h4>
            <button
              type="button"
              onClick={() => onStepChange(3)}
              className="text-orange-500 text-sm font-medium hover:text-orange-600"
            >
              Edit
            </button>
          </div>
          <div className="text-sm">
            {formData.ticketTypes?.length ? (
              <div className="space-y-2">
                {formData.ticketTypes.map((ticket, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium">{ticket.name}</span>
                    <div className="text-right">
                      <div className="font-medium">${ticket.price || '0'}</div>
                      <div className="text-xs text-gray-500">Qty: {ticket.quantity || '0'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-medium text-gray-500">No ticket tiers added</p>
            )}
          </div>
        </div>

        {/* Speakers Section */}
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm mr-2">4</span>
              Speakers
            </h4>
            <button
              type="button"
              onClick={() => onStepChange(4)}
              className="text-orange-500 text-sm font-medium hover:text-orange-600"
            >
              Edit
            </button>
          </div>
          <div className="text-sm">
            {formData.speakers?.length ? (
              <div className="space-y-3">
                {formData.speakers.map((speaker, index) => (
                  <div key={index} className="flex items-start space-x-3 py-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-xs">
                        {speaker.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{speaker.name}</p>
                      <p className="text-gray-600 text-xs">{speaker.title}</p>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{speaker.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-medium text-gray-500">No speakers added</p>
            )}
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm mr-2">5</span>
              Add-ons
            </h4>
            <button
              type="button"
              onClick={() => onStepChange(5)}
              className="text-orange-500 text-sm font-medium hover:text-orange-600"
            >
              Edit
            </button>
          </div>
          <div className="text-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Feature on Home:</span>
              <span className={`font-medium ${formData.addons.featureOnHome ? 'text-green-600' : 'text-gray-500'}`}>
                {formData.addons.featureOnHome ? '✓ Selected ($50)' : 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Newsletter inclusion:</span>
              <span className={`font-medium ${formData.addons.includeInNewsletter ? 'text-green-600' : 'text-gray-500'}`}>
                {formData.addons.includeInNewsletter ? '✓ Selected ($25)' : 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Social Media promotion:</span>
              <span className={`font-medium ${formData.addons.socialMediaPromotion ? 'text-green-600' : 'text-gray-500'}`}>
                {formData.addons.socialMediaPromotion ? '✓ Selected ($30)' : 'Not selected'}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-medium">Total Add-ons Cost:</span>
                <span className="font-bold text-orange-600">
                  ${(formData.addons.featureOnHome ? 50 : 0) + 
                    (formData.addons.includeInNewsletter ? 25 : 0) + 
                    (formData.addons.socialMediaPromotion ? 30 : 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Action Buttons */}
      <div className="flex justify-center space-x-4 pt-6">
        <button
          type="button"
          className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Publishing...' : 'Publish Event'}
        </button>
      </div>
    </div>
  )
}