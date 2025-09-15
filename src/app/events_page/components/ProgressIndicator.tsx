import { Check } from 'lucide-react'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  stepTitles: string[]
}

export default function ProgressIndicator({ currentStep, totalSteps, stepTitles }: ProgressIndicatorProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold text-orange-500 mb-4">Create New Event</h1>
      
      {/* Step Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        {stepTitles.map((title, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index + 1 === currentStep 
                ? 'bg-orange-500 text-white' 
                : index + 1 < currentStep 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1 < currentStep ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            {index < stepTitles.length - 1 && (
              <div className={`w-8 h-0.5 mx-2 ${
                index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      
      {/* Current Step Title */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{stepTitles[currentStep - 1]}</h2>
        <p className="text-gray-600 mt-1">
          {currentStep === 1 && 'Basic event information'}
          {currentStep === 2 && 'Visual elements and content'}
          {currentStep === 3 && 'Ticket types and pricing'}
          {currentStep === 4 && 'Speaker information'}
          {currentStep === 5 && 'Additional features'}
          {currentStep === 6 && 'Final review and publishing'}
        </p>
      </div>
    </div>
  )
}