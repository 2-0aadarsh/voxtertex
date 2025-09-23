import { DisputeFormData } from '../../types/disputeTypes';
import { Upload } from 'lucide-react';
import { useState } from 'react';

interface DescriptionStepProps {
  formData: DisputeFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFormDataUpdate: (data: Partial<DisputeFormData>) => void;
}

export default function DescriptionStep({
  formData,
  onInputChange,
  onFormDataUpdate,
}: DescriptionStepProps) {
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onFormDataUpdate({ supportingDocument: file });

    // Optional: Preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <h3 className="text-xl font-semibold text-orange-500">Description & Evidence</h3>

      {/* Detailed Description */}
      <div>
        <label className="block text-sm font-semibold mb-1">Detailed Description</label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={onInputChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Please provide a detailed description of the dispute..."
          rows={4}
        />
      </div>

      {/* Requested Resolution */}
      <div className="relative border border-gray-300 rounded-lg p-4">
        <label className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium text-orange-500">
          Requested Resolution
        </label>
        <input
          type="text"
          name="preferredResolution"
          value={formData.preferredResolution || ''}
          onChange={onInputChange}
          className="w-full outline-none border-none bg-transparent mt-2"
          placeholder="What specific outcome or resolution are you seeking?"
        />
      </div>

      {/* Supporting Documents */}
      <div className="border-2 border-dashed border-orange-400 rounded-lg p-6 mt-6 text-center relative">
        <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-medium text-orange-500">
          Supporting Documents
        </label>
        <div className="flex justify-center items-center mb-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100">
            <Upload className="text-orange-500" size={28} />
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-1">
          Upload screenshots, emails, receipts, or other supporting evidence
          <br />
          <span className="text-xs text-gray-400 mb-3">(PDF, DOC, JPG, PNG, max up to 10MB each)</span>
        </p>
        <label className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl inline-block shadow-md transition">
          Browse File
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {filePreview && (
          <div className="mt-3">
            <img src={filePreview} alt="Preview" className="max-h-40 mx-auto" />
          </div>
        )}

        {formData.supportingDocument && !filePreview && (
          <p className="mt-2 text-sm text-gray-600">{formData.supportingDocument.name}</p>
        )}
      </div>

      {/* Preferred Contact Method */}
      <div className="relative border border-gray-300 rounded-lg p-4 mt-6">
        <label className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium text-orange-500">
          Preferred Contact Method
        </label>
        <div className="space-y-3">
          {['Email Only', 'Phone Only', 'Both email and phone'].map(option => {
            const isSelected = formData.preferredContact === option;
            return (
              <label
                key={option}
                className={`flex items-center space-x-3 w-1/2 px-4 py-2 rounded-md border transition-all cursor-pointer
                  ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-300'}`}
              >
                <input
                  type="radio"
                  name="preferredContact"
                  value={option}
                  checked={isSelected}
                  onChange={(e) =>onFormDataUpdate({preferredContact: e.target.value as
                     | 'Email Only'
                      | 'Phone Only'
                      | 'Both email and phone',
                    })}
                  className="hidden peer"
                />
                <span
                  className={`relative w-5 h-5 flex items-center justify-center rounded-full border-2 
                    ${isSelected ? 'border-orange-500' : 'border-gray-400'}`}
                >
                  {isSelected && <span className="absolute w-2.5 h-2.5 rounded-full bg-orange-500"></span>}
                </span>
                <span className="text-gray-700">{option}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
