interface AddonsStepProps {
  formData: {
    addons: {
      featureOnHome: boolean
      includeInNewsletter: boolean
      socialMediaPromotion: boolean
    }
  }
  onFormDataUpdate: (data: any) => void
}

export default function AddonsStep({ formData, onFormDataUpdate }: AddonsStepProps) {
  const updateAddon = (field: string, value: boolean) => {
    onFormDataUpdate({
      addons: {
        ...formData.addons,
        [field]: value
      }
    })
  }

  const totalCost = (formData.addons.featureOnHome ? 50 : 0) + 
                   (formData.addons.includeInNewsletter ? 25 : 0) + 
                   (formData.addons.socialMediaPromotion ? 30 : 0)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Add-ons</h3>
        <p className="text-gray-600 mb-6">Additional options</p>
      </div>

      {/* Promotional Add-ons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Promotional Add-ons
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Boost additional promotional features for your event
        </p>

        <div className="space-y-4">
          {/* Feature on Home */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="featureOnHome"
              checked={formData.addons.featureOnHome}
              onChange={(e) => updateAddon('featureOnHome', e.target.checked)}
              className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <div className="flex-1">
              <label htmlFor="featureOnHome" className="text-sm font-medium text-gray-900 cursor-pointer">
                Feature on Home
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Your event will be featured prominently on the homepage
              </p>
            </div>
          </div>

          {/* Include in targeted newsletter */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="includeInNewsletter"
              checked={formData.addons.includeInNewsletter}
              onChange={(e) => updateAddon('includeInNewsletter', e.target.checked)}
              className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <div className="flex-1">
              <label htmlFor="includeInNewsletter" className="text-sm font-medium text-gray-900 cursor-pointer">
                Include in targeted newsletter
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Event will be included in our weekly newsletter to relevant audiences
              </p>
            </div>
          </div>

          {/* Social Media promotion */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="socialMediaPromotion"
              checked={formData.addons.socialMediaPromotion}
              onChange={(e) => updateAddon('socialMediaPromotion', e.target.checked)}
              className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <div className="flex-1">
              <label htmlFor="socialMediaPromotion" className="text-sm font-medium text-gray-900 cursor-pointer">
                Social Media promotion
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Promote your event across our social media channels
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h4 className="font-medium text-orange-900 mb-2">Promotional Pricing</h4>
          <div className="text-sm text-orange-800 space-y-1">
            <p>• Feature on Home: $50</p>
            <p>• Newsletter inclusion: $25</p>
            <p>• Social Media promotion: $30</p>
          </div>
          <div className="mt-3 pt-3 border-t border-orange-200">
            <p className="font-medium text-orange-900">
              Total Add-ons Cost: ${totalCost}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}