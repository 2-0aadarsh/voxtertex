'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Plus, Eye, Edit, Trash2, Calendar, Users, DollarSign } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { useAuth } from '@/store/hooks'
import { useGetCurrentUserQuery } from '@/store/slices/authSlice'
import { IoIosArrowDown } from 'react-icons/io'

interface Event {
  id: string
  title: string
  date: string
  status: 'Published' | 'Draft' | 'Postponed'
  attendees: string
  revenue: string
}

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  
  // Router and authentication hooks
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { data: currentUserData } = useGetCurrentUserQuery()

  // Helper function to get profile image URL
  const getProfileImageUrl = (profileImage: { data?: Buffer | string; contentType?: string; url?: string } | string | null) => {
    if (!profileImage) {
      return null;
    }
    
    // Check if it's already a URL string
    if (typeof profileImage === 'string') {
      return profileImage;
    }
    
    // Check if it has data and contentType (binary data)
    if (profileImage.data && profileImage.contentType) {
      const dataUrl = `data:${profileImage.contentType};base64,${profileImage.data.toString('base64')}`;
      return dataUrl;
    }
    
    // Check if it has a url property
    if (profileImage.url) {
      return profileImage.url;
    }
    
    return null;
  };

  // Sample event data
  useEffect(() => {
    const sampleEvents: Event[] = [
      {
        id: '1',
        title: 'Innovate 2025',
        date: 'Sep 4, 2025',
        status: 'Published',
        attendees: '250/300',
        revenue: '$12,500'
      },
      {
        id: '2',
        title: 'Tech Summit 2025',
        date: 'Sep 10, 2025',
        status: 'Draft',
        attendees: '0/500',
        revenue: '$0'
      },
      {
        id: '3',
        title: 'AI Conference',
        date: 'Sep 15, 2025',
        status: 'Published',
        attendees: '180/200',
        revenue: '$9,000'
      },
      {
        id: '4',
        title: 'Digital Marketing Workshop',
        date: 'Sep 20, 2025',
        status: 'Postponed',
        attendees: '50/100',
        revenue: '$2,500'
      }
    ]
    setEvents(sampleEvents)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800'
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'Postponed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All Statuses' || event.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo absolute={true} />
            </div>

            {/* Search Bar - Right after logo */}
            <div className="flex-1 max-w-xl ml-24">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search Events"
                  className="w-full pl-10 pr-10 py-2.5 border border-blue-400 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-600 text-sm bg-white"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity">
                  <img 
                    src="/vector1.png" 
                    alt="Filter" 
                    className="w-4 h-4"
                  />
                </button>
              </div>
            </div>

            {/* Navigation - Right aligned */}
            <nav className="flex items-center space-x-8 ml-auto">
              <button 
                onClick={() => router.push('/profile')}
                className="text-gray-900 hover:text-[#FF6B35] font-medium text-sm transition-colors duration-200 hover:scale-105"
              >
                About
              </button>
              <button 
                onClick={() => router.push('/newuser')}
                className="text-gray-900 hover:text-[#FF6B35] font-medium text-sm transition-colors duration-200 hover:scale-105"
              >
                Speaker
              </button>
              <button 
                onClick={() => router.push('/events_page')}
                className="text-[#FF6B35] font-medium text-sm transition-colors duration-200 hover:scale-105"
              >
                Events
              </button>
              
              {/* Conditional rendering based on authentication */}
              {isAuthenticated && (user || currentUserData?.user) ? (
                <button className="w-40 h-10 cursor-pointer flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {getProfileImageUrl(user?.profileImageUrl || currentUserData?.user?.profileImageUrl) ? (
                      <img
                        src={getProfileImageUrl(user?.profileImageUrl || currentUserData?.user?.profileImageUrl) || ''}
                        alt="profile"
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          e.currentTarget.style.display = "none";
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm"
                      style={{
                        display: getProfileImageUrl(user?.profileImageUrl || currentUserData?.user?.profileImageUrl) ? "none" : "flex",
                      }}
                    >
                      {(user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : currentUserData?.user?.firstName && currentUserData?.user?.lastName
                        ? `${currentUserData.user.firstName} ${currentUserData.user.lastName}`
                        : "User")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  </div>
                  <h2 className="text-sm font-medium">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : currentUserData?.user?.firstName && currentUserData?.user?.lastName
                      ? `${currentUserData.user.firstName} ${currentUserData.user.lastName}`
                      : "User"}
                  </h2>
                  <IoIosArrowDown className="cursor-pointer w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => router.push('/signup/login')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-colors"
                >
                  Login
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white rounded-lg shadow-sm p-6 mr-8">
            <nav className="space-y-2">
              <Link href="/dashboard" className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 py-2 px-3 rounded-lg">
                <Users className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <Link href="/dashboard" className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 py-2 px-3 rounded-lg">
                <Calendar className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
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
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
                <p className="text-gray-600 mt-1">View, create, and manage all your events.</p>
              </div>
              <Link 
                href="/events_page/create"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Event</span>
              </Link>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search Events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option>All Statuses</option>
                  <option>Published</option>
                  <option>Draft</option>
                  <option>Postponed</option>
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Events Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-medium text-gray-700">Event Title</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-700">Attendees</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-700">Revenue</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{event.title}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{event.date}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{event.attendees}</td>
                      <td className="py-4 px-4 text-gray-600">{event.revenue}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'All Statuses' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by creating your first event.'
                  }
                </p>
                <Link 
                  href="/events_page/create"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Event</span>
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}