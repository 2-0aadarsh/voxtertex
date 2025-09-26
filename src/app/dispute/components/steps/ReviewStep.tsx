import { DisputeFormData } from '../../types/disputeTypes';
import { Edit } from 'lucide-react';
import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { log } from 'util';

interface ReviewStepProps {
  formData: DisputeFormData;
  onStepChange: (step: number) => void;
  onSubmit?: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function ReviewStep({
  formData,
  onStepChange,
  onClose,
}: ReviewStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Safely display value or a dash
  const safeText = (value?: string | number) =>
    typeof value === 'string' ? value.trim() || '-' : value ?? '-';
  if(formData){
    console.log("paries involved", formData.partiesInvolved);
    
  }

  /** Submit dispute to backend API */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const respondentIds =
      formData.partiesInvolved
        ?.map((p) => p.userId)
        .filter((id): id is string => !!id) || [];

    if (respondentIds.length === 0) {
      alert('Please select at least one respondent.');
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        title: formData.disputeTitle,
        description: formData.detailedDescription,
        category: formData.disputeReason,
        priority: 'medium',
        respondentId: respondentIds[0],
      };
      console.log("access token is", localStorage.getItem('accessToken'))

      // 👉  call your backend server, not Next.js /api
      const token = localStorage.getItem('accessToken');
if (!token) {
  alert('Please log in first!');
  return;
}
       try {
    const response = await axios.post(
      'http://localhost:3001/api/disputes',
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
        // withCredentials: true, // if backend uses cookies
      }
    );

    console.log('API response:', response.data);
  } catch (error: any) {
    console.error('API call error:', error.response?.data || error.message);
  }

      alert('Dispute created successfully!');
      onClose();
      router.push('/dispute');
    } catch (error: any) {
      console.error('Submit dispute error:', error);
      alert(error?.response?.data?.message || 'Failed to submit dispute.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-medium text-orange-500 mb-4">
        Review & Submit
      </h3>

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

      <SectionCard
        title="Parties Involved"
        step={2}
        onStepChange={onStepChange}
        content={
          <p className="text-gray-900">
            {formData.partiesInvolved?.length
              ? formData.partiesInvolved
                  .map((p) => `${p.name} (${p.role})`)
                  .join(', ')
              : '-'}
          </p>
        }
      />

      <SectionCard
        title="Dispute Details"
        step={3}
        onStepChange={onStepChange}
        content={
          <div className="space-y-1">
            <InfoRow label="Title" value={formData.disputeTitle} />
            <InfoRow label="Reason" value={formData.disputeReason} />
            <InfoRow label="Amount" value={formData.amount ?? 0} />
          </div>
        }
      />

      <SectionCard
        title="Description & Evidence"
        step={4}
        onStepChange={onStepChange}
        content={
          <div className="space-y-2">
            <p className="text-sm text-gray-900">
              {safeText(formData.detailedDescription)}
            </p>
            <div>
              <h5 className="font-medium text-gray-700 mb-1">
                Requested Resolution
              </h5>
              <p className="text-sm text-gray-900">
                {safeText(formData.preferredResolution)}
              </p>
            </div>
            {formData.supportingDocument && (
              <div className="mt-2">
                <h5 className="font-medium text-gray-700 mb-1">
                  Supporting Document
                </h5>
                <p className="text-sm text-gray-900">
                  {formData.supportingDocument.name}
                </p>
              </div>
            )}
            {formData.preferredContact && (
              <div>
                <span className="text-sm text-gray-600">Preferred Contact</span>{' '}
                <span className="text-sm text-gray-900">
                  {formData.preferredContact}
                </span>
              </div>
            )}
          </div>
        }
      />

      <div className="flex justify-center items-center gap-4 pt-6">
        <button
          type="button"
          onClick={() => onStepChange(4)}
          className="px-6 py-2 border-2 border-orange-500 text-orange-500 rounded-full font-medium hover:bg-orange-50 transition"
        >
          Previous
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Submit Dispute'}
        </button>
      </div>
    </form>
  );
}

/** Helper row for label/value pairs */
function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm text-gray-900">
        {typeof value === 'string' ? value || '-' : value ?? '-'}
      </span>
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
