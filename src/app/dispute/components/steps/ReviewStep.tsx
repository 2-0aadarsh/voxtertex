import { DisputeFormData } from '../../types/disputeTypes';
import { Edit } from 'lucide-react';
import axios from 'axios';
import { useState } from 'react';

interface ReviewStepProps {
  formData: DisputeFormData;
  onStepChange: (step: number) => void;
  onSubmit?: () => void; // optional now because we'll handle submit here
  isLoading?: boolean;
}

export default function ReviewStep({
  formData,
  onStepChange,
}: ReviewStepProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Helper to safely show text or a dash if empty/whitespace
  const safeText = (value?: string | number) =>
    typeof value === 'string'
      ? value.trim() || '-'
      : value ?? '-';

  // Handle submission
  const handleSubmit = async () => {
    setIsLoading(true);

    // Get all respondent IDs from partiesInvolved
   const respondentIds = formData.partiesInvolved
  ?.map((p) => p.userId)   // pick userId from each party
  .filter((id): id is string => !!id) // keep only non-null, non-undefined
  || [];

if (respondentIds.length === 0) {
  alert('Please select at least one respondent.');
  return;
}

    try {
      const payload = {
        title: formData.disputeTitle,
        description: formData.detailedDescription,
        category: formData.disputeReason,
        priority: 'medium',
        respondentId: respondentIds[0], // backend expects one respondent
      };

      const response = await axios.post('/api/disputes', payload);
      alert('Dispute created successfully!');
      // Optionally redirect or clear form here
    } catch (error: any) {
      console.error('Submit dispute error:', error);
      alert(error?.response?.data?.message || 'Failed to submit dispute.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-orange-500 mb-4">
        Review & Submit
      </h3>

      {/* Event Information */}
      <SectionCard
        title="Event Information"
        step={1}
        onStepChange={onStepChange}
        content={
          <>
            <h5 className="font-medium text-gray-900">
              {safeText(formData.eventName)}
            </h5>
            {formData.eventDate && (
              <p className="text-sm text-gray-600">
                Date: {new Date(formData.eventDate).toLocaleDateString()}
              </p>
            )}
          </>
        }
      />

      {/* Parties Involved */}
      <SectionCard
        title="Parties Involved"
        step={2}
        onStepChange={onStepChange}
        content={
          <p className="text-gray-900">
            {formData.partiesInvolved && formData.partiesInvolved.length > 0
              ? formData.partiesInvolved
                  .map((p) => `${p.name} (${p.role})`)
                  .join(', ')
              : '-'}
          </p>
        }
      />

      {/* Dispute Details */}
      <SectionCard
        title="Dispute Details"
        step={3}
        onStepChange={onStepChange}
        content={
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Title</span>
              <span className="text-sm text-gray-900">
                {safeText(formData.disputeTitle)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Reason</span>
              <span className="text-sm text-gray-900">
                {safeText(formData.disputeReason)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-sm text-gray-900">{formData.amount ?? 0}</span>
            </div>
          </div>
        }
      />

      {/* Description */}
      <SectionCard
        title="Description & Evidence"
        step={4}
        onStepChange={onStepChange}
        content={
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-900">{safeText(formData.detailedDescription)}</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-1">Requested Resolution</h5>
              <p className="text-sm text-gray-900">{safeText(formData.preferredResolution)}</p>
            </div>
            {formData.supportingDocument && (
              <div className="mt-2">
                <h5 className="font-medium text-gray-700 mb-1">Supporting Document</h5>
                <p className="text-sm text-gray-900">{formData.supportingDocument.name}</p>
              </div>
            )}
            {formData.preferredContact && (
              <div>
                <span className="text-sm text-gray-600">Preferred Contact</span>:{" "}
                <span className="text-sm text-gray-900">{formData.preferredContact}</span>
              </div>
            )}
          </div>
        }
      />

      {/* Submit & Previous Buttons */}
      <div className="flex justify-center items-center gap-4 pt-6">
        <button
          type="button"
          onClick={() => onStepChange(4)}
          className="px-6 py-2 border-2 border-orange-500 text-orange-500 rounded-full font-medium hover:bg-orange-50 transition"
        >
          Previous
        </button>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-8 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Submit Dispute'}
        </button>
      </div>
    </div>
  );
}

/** Reusable SectionCard */
interface SectionCardProps {
  title: string;
  content: React.ReactNode;
  step: number;
  onStepChange: (step: number) => void;
}

function SectionCard({ title, content, step, onStepChange }: SectionCardProps) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-orange-500">{title}</h4>
        <button
          onClick={() => onStepChange(step)}
          className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-orange-600 flex items-center gap-1"
        >
          <Edit size={16} /> Edit
        </button>
      </div>
      {content}
    </div>
  );
}
