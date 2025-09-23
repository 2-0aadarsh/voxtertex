'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Users, DollarSign, FileText, Send } from 'lucide-react'
import Link from 'next/link'

interface DisputeDetail {
  id: string
  eventName: string
  disputeReason: string
  caseDate: string
  disputeId: string
  currentStage: string
  partiesInvolved: string
  status: string
  reason: string
  description: string
  timeline: Array<{
    id: string
    author: string
    message: string
    timestamp: string
    type: 'message' | 'system'
  }>
}

export default function DisputeDetailPage({ params }: { params: { id: string } }) {
  console.log('Loaded dispute ID:', params.id) 
  const [dispute, setDispute] = useState<DisputeDetail | null>(null)
  const [newMessage, setNewMessage] = useState('')

  // Sample dispute detail data
  useEffect(() => {
    const sampleDisputeDetail: DisputeDetail = {
      id: params.id,
      eventName: 'Future of Finance Conference 2024',
      disputeReason: 'Refund Request - Speaker Cancellation',
      caseDate: '8/10/2024',
      disputeId: 'DIS-2024-001',
      currentStage: 'Peer to peer',
      partiesInvolved: 'John Smith, Event Organizer',
      status: 'Active',
      reason: 'Refund Request - Speaker Cancellation',
      description: 'I am requesting a full refund for my VIP ticket. The main speaker I was interested in has cancelled and this was my primary reason for attending. I understand the terms but feel this is exceptional circumstances.',
      timeline: [
        {
          id: '1',
          author: 'Participant',
          message: 'Hi, I\'m requesting a full refund for my VIP ticket. The main speaker I was interested in has cancelled and this was my primary reason for attending.',
          timestamp: 'Aug 15, 04:00 PM',
          type: 'message'
        },
        {
          id: '2',
          author: 'Organiser',
          message: 'Hi, I\'m requesting a full refund for my VIP ticket. The main speaker I was interested in has cancelled and this was my primary reason for attending.',
          timestamp: 'Aug 15, 04:00 PM',
          type: 'system'
        },
        {
          id: '3',
          author: 'Organiser',
          message: 'Hi, I\'m requesting a full refund for my VIP ticket. The main speaker I was interested in has cancelled and this was my primary reason for attending.',
          timestamp: 'Aug 15, 04:00 PM',
          type: 'message'
        },
        {
          id: '4',
          author: 'Participant',
          message: 'Hi, I\'m requesting a full refund for my VIP ticket. The main speaker I was interested in has cancelled and this was my primary reason for attending.',
          timestamp: 'Aug 15, 04:00 PM',
          type: 'message'
        }
      ]
    }
    setDispute(sampleDisputeDetail)
  }, [params.id])

  const handleSendMessage = () => {
    if (newMessage.trim() && dispute) {
      const newMsg = {
        id: String(dispute.timeline.length + 1),
        author: 'John Doe',
        message: newMessage,
        timestamp: new Date().toLocaleString(),
        type: 'message' as const
      }
      setDispute({
        ...dispute,
        timeline: [...dispute.timeline, newMsg]
      })
      setNewMessage('')
    }
  }

  const handleMarkAsResolved = () => {
    if (dispute) {
      setDispute({
        ...dispute,
        status: 'Resolved',
        currentStage: 'Resolved'
      })
      alert('Dispute marked as resolved!')
    }
  }

  const handleRequestMediation = () => {
    if (dispute) {
      setDispute({
        ...dispute,
        currentStage: 'Mediation'
      })
      alert('Mediation requested!')
    }
  }

  if (!dispute) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dispute" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <span className="text-sm text-gray-500">Back to Dashboard</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 py-2 px-3 rounded-lg">
                <Calendar className="w-5 h-5" />
                <span>Events</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 py-2 px-3 rounded-lg">
                <DollarSign className="w-5 h-5" />
                <span>Payments</span>
              </div>
              <div className="flex items-center space-x-3 text-orange-600 bg-orange-50 py-2 px-3 rounded-lg font-medium">
                <FileText className="w-5 h-5" />
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
          <main className="flex-1">
            {/* Dispute Resolution Center Header */}
           {/* Header Section */}
<header className="bg-[#FFF9F5] py-4">
  {/* Back Link */}
  <Link
    href="/dispute"
    className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium mb-4"
  >
    <ArrowLeft className="w-4 h-4 mr-2" />
    Back to Dashboard
  </Link>

  {/* Title Bar */}
  <div className="bg-gradient-to-r from-[#FF7F50] to-[#FFB899] rounded-xl px-6 py-4">
    <h1 className="text-2xl font-semibold text-black">
      Dispute Resolution Center
    </h1>
    <p className="text-sm text-white">
      Manage and resolve disputes efficiently
    </p>
  </div>
</header>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Dispute Details */}
              <div className="lg:col-span-1">
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-orange-200 space-y-6">

    {/* Section Title */}
    <h2 className="text-xl font-bold text-orange-600">Dispute Details</h2>

    {/* Basic Information */}
    <div className="border border-orange-200 rounded-xl p-5 space-y-5 bg-orange-50/20">
      <h3 className="text-orange-600 font-medium text-base">Basic Information</h3>

      {/* Event */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Event</span>
        <span className="text-gray-800">{dispute.eventName}</span>
      </div>

      {/* Event Date */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Event Date</span>
        <span className="text-gray-800">12/15/2024</span>
      </div>

      {/* Filed Date */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Filed Date</span>
        <span className="text-gray-800">{dispute.caseDate}</span>
      </div>

      {/* Dispute ID */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Dispute ID</span>
        <span className="text-gray-800">{dispute.disputeId}</span>
      </div>

      {/* Current Stage */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Current Stage</span>
        <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
          {dispute.currentStage}
        </span>
      </div>

      {/* Parties Involved */}
      <div className="space-y-2">
        <span className="text-gray-500 text-sm block">Parties Involved</span>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-300 rounded-full text-xs">
            John Smith
          </span>
          <span className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-300 rounded-full text-xs">
            Organizer
          </span>
        </div>
      </div>

      {/* Reason */}
      <div>
        <span className="text-gray-500 text-sm block mb-1">Reason</span>
        <p className="text-gray-800 font-medium">{dispute.reason}</p>
      </div>

      {/* Description */}
      <div>
        <span className="text-gray-500 text-sm block mb-1">Description</span>
        <p className="text-gray-700 leading-relaxed text-sm">
          {dispute.description}
        </p>
      </div>
    </div>

    {/* Ticket Information */}
    <div className="border border-orange-200 rounded-xl p-5 space-y-3 bg-orange-50/20">
      <h3 className="text-orange-600 font-medium text-base">Ticket Information</h3>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Type & Price</span>
        <span className="text-gray-800">VIP - $299</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Participant Email</span>
        <span className="text-gray-800">john.smith@gmail.com</span>
      </div>
    </div>

    {/* Action Buttons */}
    <div>
      <p className="text-sm text-gray-500 mb-3">Actions</p>
      <div className="flex gap-3">
        <button
          onClick={handleMarkAsResolved}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-medium"
        >
          Mark as Resolved
        </button>
        <button
          onClick={handleRequestMediation}
          className="flex-1 border border-orange-500 text-orange-500 hover:bg-orange-50 py-2 rounded-xl font-medium"
        >
          Request Mediation
        </button>
      </div>
    </div>
  </div>
</div>


              {/* Right Column - Communication Timeline */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                  {/* Header */}
                  <div className="bg-orange-500 text-white p-4 rounded-t-lg">
                    <h2 className="text-lg font-semibold">Communication Timeline</h2>
                  </div>

                  {/* Timeline Messages */}
               {/* Messages container */}
<div className="p-6 space-y-4 max-h-[36rem] overflow-y-auto">
  {dispute.timeline.map((message) => {
    const isParticipant = message.author === "Participant";

    return (
      <div key={message.id} className="w-full">
        {/* Author + Timestamp Row */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${
              isParticipant
                ? "bg-orange-50 text-orange-700 border-orange-300"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            {message.author}
          </span>
          <span className="text-[11px] text-gray-400">{message.timestamp}</span>
        </div>

        {/* Message Bubble */}
        <div
          className={`w-full px-4 py-3 rounded-lg border text-sm break-words ${
            isParticipant
              ? "bg-orange-50 text-orange-600 border-orange-300"
              : "bg-gray-50 text-gray-700 border-gray-300"
          }`}
        >
          {message.message}
        </div>
      </div>
    );
  })}
</div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}