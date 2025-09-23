import { DisputeFormData } from "../../types/disputeTypes";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface DisputeDetailsStepProps {
  formData: DisputeFormData;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export default function DisputeDetailsStep({
  formData,
  onInputChange,
}: DisputeDetailsStepProps) {
  // Categories act as the "dispute reason" options
  const categories = [
    { id: "refund", title: "Refund Request", desc: "Issues related to ticket or service refunds" },
    { id: "cancellation", title: "Event/Speaker Cancellation", desc: "Cancellation compensation claims" },
    { id: "quality", title: "Quality of Service", desc: "Service delivery below expectations" },
    { id: "venue", title: "Venue/Location Issues", desc: "Problems with event location or facilities" },
    { id: "schedule", title: "Schedule Changes", desc: "Disputes over timing or agenda changes" },
    { id: "accessibility", title: "Accessibility Concerns", desc: "Accommodation or accessibility issues" },
    { id: "billing", title: "Billing/Payment Dispute", desc: "Payment processing or billing errors" },
    { id: "conduct", title: "Code of Conduct Violation", desc: "Inappropriate behavior or policy violations" },
    { id: "technical", title: "Technical Issues", desc: "Platform or technical service problems" },
    { id: "other", title: "Other", desc: "Disputes not covered by other categories" },
  ];

  // Initialize selected category. If formData already has category or disputeReason, try to reflect it.
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    if (formData.category) return formData.category;
    if (formData.disputeReason) {
      const found = categories.find((c) => c.title === formData.disputeReason);
      return found ? found.id : null;
    }
    return null;
  });

  // Keep local selectedCategory in sync if parent formData changes externally
  useEffect(() => {
    if (formData.category) {
      setSelectedCategory(formData.category);
    } else if (formData.disputeReason) {
      const found = categories.find((c) => c.title === formData.disputeReason);
      setSelectedCategory(found ? found.id : null);
    } else {
      setSelectedCategory(null);
    }
  }, [formData.category, formData.disputeReason]);

  const handleCategorySelect = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    setSelectedCategory(id);

    // Update parent: set both category (id) and disputeReason (readable title)
    onInputChange({ target: { name: "category", value: id } } as any);
    if (cat) {
      onInputChange({ target: { name: "disputeReason", value: cat.title } } as any);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <h3 className="text-lg font-semibold text-orange-500">Dispute Details</h3>

      {/* Category Selection (these are the dispute reasons) */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Dispute Reason</p>
        <p className="text-sm text-gray-500 mb-2">Select the reason that best describes your dispute</p>

        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all 
                ${
                  selectedCategory === cat.id
                    ? "border-orange-400 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
            >
              <div>
                <p className="font-medium text-gray-900">{cat.title}</p>
                <p className="text-xs text-gray-500">{cat.desc}</p>
              </div>

              {/* Check Icon */}
              <div
                className={`w-5 h-5 flex items-center justify-center rounded-full border-2 
                ${
                  selectedCategory === cat.id
                    ? "border-orange-500 bg-orange-500"
                    : "border-gray-300 bg-white"
                }`}
              >
                {selectedCategory === cat.id && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-2">Selecting a reason will set the dispute reason shown in the review step.</p>
      </div>

      {/* Dispute Title */}
      <div className="space-y-4 mt-6">
        <div>
          <label className="block text-sm font-medium text-orange-500">Dispute Title</label>
          <input
            type="text"
            name="disputeTitle"
            value={formData.disputeTitle || ""}
            onChange={onInputChange}
            required
            className="w-full border-0 border-b border-gray-300 focus:border-orange-500 focus:ring-0 placeholder-gray-400"
            placeholder="Enter Title"
          />
        </div>

        {/* Dispute Amount */}
        <div>
          <label className="block text-sm font-medium text-orange-500">Dispute Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount || ""}
            onChange={onInputChange}
            className="w-full border-0 border-b border-gray-300 focus:border-orange-500 focus:ring-0 placeholder-gray-400"
            placeholder="Enter Amount"
          />
        </div>
      </div>
    </div>
  );
}
