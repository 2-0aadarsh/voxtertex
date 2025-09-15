interface CoreDetailsStepProps {
  formData: {
    eventName: string
    startDate: string
    endDate: string
    eventMode: 'offline' | 'online' | 'hybrid'
    location: string
  }
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export default function CoreDetailsStep({ formData, onInputChange }: CoreDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
          Event Name *
        </label>
        <input
          type="text"
          id="eventName"
          name="eventName"
          value={formData.eventName}
          onChange={onInputChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Enter event name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={onInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
            End Date *
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={onInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Mode *
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="eventMode"
              value="offline"
              checked={formData.eventMode === 'offline'}
              onChange={onInputChange}
              className="mr-2"
            />
            <span>Offline</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="eventMode"
              value="online"
              checked={formData.eventMode === 'online'}
              onChange={onInputChange}
              className="mr-2"
            />
            <span>Online</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="eventMode"
              value="hybrid"
              checked={formData.eventMode === 'hybrid'}
              onChange={onInputChange}
              className="mr-2"
            />
            <span className="text-orange-600 font-medium">Hybrid</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Location *
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={onInputChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Enter event location"
        />
      </div>
    </div>
  )
}