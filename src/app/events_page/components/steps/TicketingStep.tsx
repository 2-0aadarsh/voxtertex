import { Calendar, Plus } from 'lucide-react'

interface TicketType {
  name: string
  price: string
  quantity: string
}

interface TicketingStepProps {
  formData: {
    ticketTypes: TicketType[]
  }
  onFormDataUpdate: (data: any) => void
}

export default function TicketingStep({ formData, onFormDataUpdate }: TicketingStepProps) {
  const addTicketTier = () => {
    onFormDataUpdate({
      ticketTypes: [
        ...formData.ticketTypes,
        { name: `Ticket Tier ${formData.ticketTypes.length + 1}`, price: '', quantity: '' }
      ]
    })
  }

  const removeTicketTier = (index: number) => {
    onFormDataUpdate({
      ticketTypes: formData.ticketTypes.filter((_, i) => i !== index)
    })
  }

  const updateTicketTier = (index: number, field: keyof TicketType, value: string) => {
    const newTickets = [...formData.ticketTypes]
    newTickets[index][field] = value
    onFormDataUpdate({ ticketTypes: newTickets })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ticketing</h3>
        <p className="text-gray-600 mb-6">Ticket tiers and pricing</p>
      </div>

      {/* Ticket Tiers Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Ticket Tiers
          </label>
          <button
            type="button"
            onClick={addTicketTier}
            className="text-orange-500 text-sm font-medium hover:text-orange-600 flex items-center space-x-1"
          >
            <span>+ Add Ticket Tier</span>
          </button>
        </div>

        {/* No tickets state */}
        {formData.ticketTypes.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-500 mb-4">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No ticket tiers added yet</p>
              <p className="text-sm">Click "Add Ticket Tier" to create your first ticket type</p>
            </div>
          </div>
        )}

        {/* Ticket Tiers List */}
        <div className="space-y-4">
          {formData.ticketTypes.map((ticket, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900">{ticket.name}</h4>
                <button
                  type="button"
                  onClick={() => removeTicketTier(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticket Name
                  </label>
                  <input
                    type="text"
                    value={ticket.name}
                    onChange={(e) => updateTicketTier(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., General Admission"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={ticket.price}
                    onChange={(e) => updateTicketTier(index, 'price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={ticket.quantity}
                    onChange={(e) => updateTicketTier(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Available tickets"
                  />
                </div>
              </div>

              {/* Additional ticket options */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Early Bird Discount (%)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale End Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticket Description
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    placeholder="What's included with this ticket..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add first ticket button if none exist */}
        {formData.ticketTypes.length === 0 && (
          <button
            type="button"
            onClick={() => {
              onFormDataUpdate({
                ticketTypes: [{ name: 'General Admission', price: '', quantity: '' }]
              })
            }}
            className="w-full py-4 border-2 border-dashed border-orange-300 rounded-lg text-orange-600 font-medium hover:bg-orange-50 transition-colors"
          >
            + Add Your First Ticket Tier
          </button>
        )}
      </div>
    </div>
  )
}