import { useState } from 'react'
import { Users, Calendar } from 'lucide-react'

interface Speaker {
  name: string
  title: string
  bio: string
}

interface SpeakersStepProps {
  formData: {
    speakers: Speaker[]
  }
  onFormDataUpdate: (data: any) => void
}

export default function SpeakersStep({ formData, onFormDataUpdate }: SpeakersStepProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'available'>('manual')
  const [newSpeaker, setNewSpeaker] = useState({
    name: '',
    title: '',
    bio: ''
  })

  const availableSpeakers = [
    {
      name: 'Sarah Johnson',
      title: 'CEO of TechCorp',
      bio: 'Leading expert in AI and machine learning with 15 years experience in developing cutting-edge technology...',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face'
    },
    {
      name: 'Michael Chen',
      title: 'Data Science Director', 
      bio: 'Pioneering data scientist with expertise in machine learning algorithms and big data analytics...',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'
    },
    {
      name: 'Emily Rodriguez',
      title: 'Product Innovation Lead',
      bio: 'Award-winning product manager specializing in user experience and digital transformation...',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
    },
    {
      name: 'David Kim',
      title: 'Tech Entrepreneur',
      bio: 'Serial entrepreneur and startup mentor with multiple successful exits in the tech industry...',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face'
    },
    {
      name: 'Lisa Zhang',
      title: 'Marketing Strategist',
      bio: 'Digital marketing expert helping companies scale through innovative growth strategies...',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face'
    },
    {
      name: 'Alex Thompson',
      title: 'Blockchain Specialist',
      bio: 'Cryptocurrency and blockchain technology expert with deep knowledge of DeFi and Web3...',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face'
    }
  ]

  const addManualSpeaker = () => {
    if (newSpeaker.name && newSpeaker.title && newSpeaker.bio) {
      onFormDataUpdate({
        speakers: [...formData.speakers, { ...newSpeaker }]
      })
      setNewSpeaker({ name: '', title: '', bio: '' })
    }
  }

  const addAvailableSpeaker = (speaker: any) => {
    const isAlreadyAdded = formData.speakers.some(s => s.name === speaker.name)
    if (!isAlreadyAdded) {
      onFormDataUpdate({
        speakers: [
          ...formData.speakers,
          { name: speaker.name, title: speaker.title, bio: speaker.bio }
        ]
      })
    }
  }

  const removeSpeaker = (index: number) => {
    onFormDataUpdate({
      speakers: formData.speakers.filter((_, i) => i !== index)
    })
  }

  const updateSpeaker = (index: number, field: keyof Speaker, value: string) => {
    const newSpeakers = [...formData.speakers]
    newSpeakers[index][field] = value
    onFormDataUpdate({ speakers: newSpeakers })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Speakers</h3>
        <p className="text-gray-600 mb-6">Add event speakers</p>
      </div>

      {/* Event Speakers Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Event Speakers
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Add speakers manually or select from our available speakers database
        </p>

        {/* Tabs */}
        <div className="flex mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 px-4 font-medium rounded-l-lg transition-colors ${
              activeTab === 'manual'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-3 px-4 font-medium rounded-r-lg transition-colors ${
              activeTab === 'available'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Available Speakers
          </button>
        </div>

        {/* Manual Entry Tab Content */}
        {activeTab === 'manual' && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">Create a new speaker profile</p>
            
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <h4 className="font-medium text-gray-900 mb-4">Add New Speaker</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Speaker Name *
                    </label>
                    <input
                      type="text"
                      value={newSpeaker.name}
                      onChange={(e) => setNewSpeaker(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter speaker name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title/Position *
                    </label>
                    <input
                      type="text"
                      value={newSpeaker.title}
                      onChange={(e) => setNewSpeaker(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="e.g., CEO of TechCorp"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio/Description *
                  </label>
                  <textarea
                    value={newSpeaker.bio}
                    onChange={(e) => setNewSpeaker(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    placeholder="Speaker biography and expertise..."
                  />
                </div>
                
                <button
                  type="button"
                  onClick={addManualSpeaker}
                  disabled={!newSpeaker.name || !newSpeaker.title || !newSpeaker.bio}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Speaker to Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Available Speakers Tab Content */}
        {activeTab === 'available' && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">Select from our verified speakers database</p>
            
            {/* Available Speakers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {availableSpeakers.map((speaker, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <img
                      src={speaker.image}
                      alt={speaker.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">{speaker.name}</h4>
                      <p className="text-xs text-orange-600 mb-2">{speaker.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{speaker.bio}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addAvailableSpeaker(speaker)}
                    disabled={formData.speakers.some(s => s.name === speaker.name)}
                    className={`w-full mt-3 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      formData.speakers.some(s => s.name === speaker.name)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {formData.speakers.some(s => s.name === speaker.name) ? 'Already Added' : 'Add Speaker'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Added Speakers Section */}
        {formData.speakers.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">
              Added Speakers ({formData.speakers.length})
            </h4>
            
            <div className="space-y-4">
              {formData.speakers.map((speaker, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          {speaker.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">Speaker {index + 1}</h5>
                        <p className="text-sm text-gray-600">{speaker.name}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpeaker(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={speaker.name}
                        onChange={(e) => updateSpeaker(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={speaker.title}
                        onChange={(e) => updateSpeaker(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={speaker.bio}
                      onChange={(e) => updateSpeaker(index, 'bio', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                      placeholder="Speaker biography..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for speakers */}
        {formData.speakers.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No speakers added yet</p>
              <p className="text-sm">Click "Add Speaker" to add event speakers</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}