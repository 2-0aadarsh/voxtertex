'use client'

import { useState } from 'react'
import { ArrowLeft, Calendar, Users, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { EventFormData } from '../types/eventTypes'
import ProgressIndicator from '../components/ProgressIndicator'
import CoreDetailsStep from '../components/steps/CoreDetailsStep'
import BrandingContentStep from '../components/steps/BrandingContentStep'
import TicketingStep from '../components/steps/TicketingStep'
import SpeakersStep from '../components/steps/SpeakersStep'
import AddonsStep from '../components/steps/AddonsStep'
import ReviewPublishStep from '../components/steps/ReviewPublishStep'

export default function CreateEvent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<EventFormData>({
    eventName: '',
    startDate: '',
    endDate: '',
    eventMode: 'offline',
    location: '',
    description: '',
    image: null,
    tags: [],
    ticketTypes: [],
    speakers: [],
    addons: {
      featureOnHome: false,
      includeInNewsletter: false,
      socialMediaPromotion: true
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  const totalSteps = 6
  const stepTitles = [
    'Core Details',
    'Branding & Content', 
    'Ticketing',
    'Speakers',
    'Add-ons',
    'Review & Publish'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const updateFormData = (data: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3004/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Event created successfully!')
        window.location.href = '/events_page'
      } else {
        alert('Failed to create event')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Error creating event')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CoreDetailsStep 
            formData={formData}
            onInputChange={handleInputChange}
          />
        )
      
      case 2:
        return (
          <BrandingContentStep 
            formData={formData}
            onInputChange={handleInputChange}
            onFormDataUpdate={updateFormData}
          />
        )
      
      case 3:
        return (
          <TicketingStep 
            formData={formData}
            onFormDataUpdate={updateFormData}
          />
        )
      
      case 4:
        return (
          <SpeakersStep 
            formData={formData}
            onFormDataUpdate={updateFormData}
          />
        )
      
      case 5:
        return (
          <AddonsStep 
            formData={formData}
            onFormDataUpdate={updateFormData}
          />
        )
      
      case 6:
        return (
          <ReviewPublishStep 
            formData={formData}
            onStepChange={setCurrentStep}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/events_page" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">VoxVertex</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">JD</span>
                </div>
                <span className="text-sm font-medium text-gray-700">John Doe</span>
                <span className="text-xs text-gray-500">Senior Product Manager</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white rounded-lg shadow-sm p-6 mr-8">
            <nav className="space-y-2">
              <div className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 py-2 px-3 rounded-lg">
                <Users className="w-5 h-5" />
                <span>Profile</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 py-2 px-3 rounded-lg">
                <Calendar className="w-5 h-5" />
                <span>Dashboard</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 py-2 px-3 rounded-lg">
                <Users className="w-5 h-5" />
                <span>Messages</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 py-2 px-3 rounded-lg">
                <Calendar className="w-5 h-5" />
                <span>Bookings</span>
              </div>
              <div className="flex items-center space-x-3 text-orange-600 bg-orange-50 py-2 px-3 rounded-lg font-medium">
                <Calendar className="w-5 h-5" />
                <span>Events</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 py-2 px-3 rounded-lg">
                <DollarSign className="w-5 h-5" />
                <span>Payments</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 py-2 px-3 rounded-lg">
                <Users className="w-5 h-5" />
                <span>Dispute</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 py-2 px-3 rounded-lg">
                <Users className="w-5 h-5" />
                <span>Support</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 py-2 px-3 rounded-lg">
                <Users className="w-5 h-5" />
                <span>Settings</span>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white rounded-lg shadow-sm p-8">
            {/* Progress Header */}
            <ProgressIndicator 
              currentStep={currentStep}
              totalSteps={totalSteps}
              stepTitles={stepTitles}
            />

            {/* Step Content */}
            <div className="max-w-2xl mx-auto">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            {currentStep < 6 && (
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}