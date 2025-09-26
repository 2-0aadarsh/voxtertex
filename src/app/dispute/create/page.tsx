'use client';

import { useState } from 'react';
import { DisputeFormData, UrgencyLevel } from '../types/disputeTypes';
import ProgressIndicator from '../components/ProgressIndicator';

// Steps
import EventSelectionStep from '../components/steps/EventSelectionStep';
import PartiesInvolvedStep from '../components/steps/PartiesInvolvedStep';
import DisputeDetailsStep from '../components/steps/DisputeDetailsStep';
import DescriptionStep from '../components/steps/DescriptionStep';
import ReviewStep from '../components/steps/ReviewStep';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL as string) || 'http://localhost:3001';
interface CreateDisputeProps {
  onClose: () => void;  // define the prop
}

export default function CreateDispute({ onClose }: CreateDisputeProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<DisputeFormData>({
    eventName: '',
    eventId: '',
    disputeReason: '',
    disputeTitle: '',
    amount: 0,
    description: '',
    evidence: null,
    attachments: [],
    partiesInvolved: [],
    preferredResolution: '',
    urgencyLevel: UrgencyLevel.Medium,
    addons: {
      requestMediation: false,
      escalateToLegal: false,
      notifyAllParties: true,
    },
  });

  const totalSteps = 5;
  const stepTitles = [
    'Event Selection',
    'Parties Involved',
    'Dispute Details',
    'Description',
    'Review',
  ];

  const updateFormData = (data: Partial<DisputeFormData>) =>
    setFormData(prev => ({ ...prev, ...data }));

  const handleNext = () => setCurrentStep(s => Math.min(s + 1, totalSteps));
  const handlePrevious = () => setCurrentStep(s => Math.max(s - 1, 1));

  // helper to map urgency enum to priority string expected by backend
  const mapUrgencyToPriority = (u: UrgencyLevel | undefined) => {
    switch (u) {
      case UrgencyLevel.Low: return 'low';
      case UrgencyLevel.High: return 'high';
      case UrgencyLevel.Medium:
      default:
        return 'medium';
    }
  };

  // Try to find respondentId from partiesInvolved (common keys)
  const resolveRespondentId = (): string | null => {
    if (!formData.partiesInvolved || formData.partiesInvolved.length === 0) return null;
    const p = formData.partiesInvolved[0];
    // common id keys that might exist
    // @ts-ignore
    return p._id || p.id || p.userId || p.respondentId || null;
  };

  const handleSubmit = async () => {
    // Validate required fields expected by backend controller
    const title = formData.disputeTitle?.trim();
    const description = (formData.description || (formData as any).detailedDescription || '').trim();
    const category = formData.disputeReason?.trim();
    const respondentId = resolveRespondentId();

    if (!title || !description || !category || !respondentId) {
      alert('Please ensure Title, Description, Dispute Reason (category) and Respondent are filled/selected. Respondent must be a registered user (ID).');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title,
        description,
        category,
        priority: mapUrgencyToPriority(formData.urgencyLevel),
        respondentId,
      };

      const res = await fetch(`${API_BASE}/api/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // include credentials so server-side session/cookie auth works
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || `Failed to create dispute (status ${res.status})`);
      }

      alert('Dispute filed successfully!');
      // Redirect or close modal — change as per your UX
      window.location.href = '/dispute';
    } catch (err: any) {
      console.error('Error filing dispute', err);
      alert(err?.message || 'Error filing dispute');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <EventSelectionStep formData={formData} onFormDataUpdate={updateFormData} />;
      case 2:
        return <PartiesInvolvedStep formData={formData} onFormDataUpdate={updateFormData} />;
      case 3:
        return <DisputeDetailsStep formData={formData} onInputChange={(e) => updateFormData({ [e.target.name]: e.target.value })} />;
      case 4:
        return <DescriptionStep formData={formData} onInputChange={(e) => updateFormData({ [e.target.name]: e.target.value })} onFormDataUpdate={updateFormData} />;
      case 5:
        return <ReviewStep formData={formData} onStepChange={setCurrentStep} onClose={() => window.location.href = '/dispute'}  onSubmit={handleSubmit} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main className="flex-1 bg-white rounded-lg shadow-sm p-8">
          <div className="w-full px-6">
            <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} stepTitles={stepTitles} />
          </div>

          <div className="px-6 mt-10">{renderStepContent()}</div>

          {currentStep < totalSteps && (
            <div className="flex justify-center items-center gap-4 mt-10 pt-6 border-t border-gray-200 px-6">
              <button type="button" onClick={handlePrevious} disabled={currentStep === 1} className="px-6 py-2 border-2 border-orange-500 text-orange-500 rounded-full font-medium hover:bg-orange-50 transition disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              <button type="button" onClick={handleNext} className="px-8 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition">Next</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
