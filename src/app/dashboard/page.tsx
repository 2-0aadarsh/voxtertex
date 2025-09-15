'use client';

import { useEffect, useState } from 'react';
import { CiUser } from "react-icons/ci";
import { IoCalendarOutline } from "react-icons/io5";
import { LuMessageCircleMore } from "react-icons/lu";
import { CalendarDays, RefreshCw } from "lucide-react";
import { VscCreditCard } from "react-icons/vsc";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
// import { BiSupport } from "react-icons/bi";
// import { CiSettings } from "react-icons/ci";

// Import Redux store and hooks
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useAuth, useProfile, usePosts } from '@/store/hooks';
import { useValidateTokenQuery, useGetCurrentUserQuery, setAuthSuccess } from '@/store/slices/authSlice';

export default function Dashboard() {
  // Get Redux store data
  const auth = useAuth();
  const profile = useProfile();
  const posts = usePosts();
  const fullStore = useAppSelector(state => state);
  const dispatch = useAppDispatch();
  
  // State for manual refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use RTK Query hooks
  const { data: tokenData, isLoading: tokenLoading, refetch: refetchToken } = useValidateTokenQuery();
  const { refetch: refetchUser } = useGetCurrentUserQuery(undefined, { 
    skip: !auth.isAuthenticated 
  });
  
  // Function to manually refresh user data
  const refreshUserData = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Manually refreshing user data...');
      const tokenResult = await refetchToken();
      if (tokenResult.data?.success) {
        const userResult = await refetchUser();
        console.log('✅ User data refreshed:', userResult.data);
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Try to fetch user data directly if not available
  useEffect(() => {
    const fetchDirectUserData = async () => {
      if (!auth.user && auth.isAuthenticated && !auth.isLoading) {
        try {
          console.log('🔍 Fetching user data directly...');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/me`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });
          
          const data = await response.json();
          if (data.success && data.user) {
            console.log('👤 Direct user data fetched:', data.user);
            dispatch(setAuthSuccess({ user: data.user }));
          }
        } catch (error) {
          console.error('❌ Direct user fetch error:', error);
        }
      }
    };
    
    fetchDirectUserData();
  }, [auth.user, auth.isAuthenticated, auth.isLoading, dispatch]);

  // Console log the store data
  useEffect(() => {
    console.log('🔍 REDUX STORE DATA:');
    console.log('📊 Full Store State:', fullStore);
    console.log('🔐 Auth State:', auth);
    console.log('👤 Profile State:', profile);
    console.log('📝 Posts State:', posts);
    console.log('🎯 User Data:', auth.user);
    console.log('✅ Is Authenticated:', auth.isAuthenticated);
    console.log('🔄 Loading States:', {
      auth: auth.isLoading,
      profile: profile.isLoading,
      posts: posts.isLoading,
      token: tokenLoading
    });
  }, [fullStore, auth, profile, posts, tokenLoading]);
  
  // Debug token validation
  useEffect(() => {
    if (tokenData) {
      console.log('🔑 Token validation data:', tokenData);
      console.log('👤 User from token:', tokenData.user);
    }
  }, [tokenData]);

  const quickActions = [
    {
      icon: <CiUser className="text-2xl" />,
      title: "Profile",
      description: "Manage your profile information",
      href: "/newuser",
      color: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      icon: <LuMessageCircleMore className="text-2xl" />,
      title: "Messages",
      description: "Check your messages",
      href: "/messages",
      color: "bg-green-50 text-green-600",
      borderColor: "border-green-200"
    },
    {
      icon: <IoCalendarOutline className="text-2xl" />,
      title: "Bookings",
      description: "View your bookings",
      href: "/bookings",
      color: "bg-orange-50 text-orange-600",
      borderColor: "border-orange-200"
    },
    {
      icon: <CalendarDays className="text-2xl" />,
      title: "Events",
      description: "Manage your events",
      href: "/events",
      color: "bg-purple-50 text-purple-600",
      borderColor: "border-purple-200"
    },
    {
      icon: <VscCreditCard className="text-2xl" />,
      title: "Payments",
      description: "Track your payments",
      href: "/payments",
      color: "bg-indigo-50 text-indigo-600",
      borderColor: "border-indigo-200"
    },
    {
      icon: <FaMoneyBillTrendUp className="text-2xl" />,
      title: "Dispute",
      description: "Handle disputes",
      href: "/dispute",
      color: "bg-red-50 text-red-600",
      borderColor: "border-red-200"
    }
  ];

  const stats = [
    { label: "Total Events", value: "24", change: "+12%", color: "text-green-600" },
    { label: "Active Bookings", value: "8", change: "+5%", color: "text-blue-600" },
    { label: "Messages", value: "156", change: "+8%", color: "text-orange-600" },
    { label: "Revenue", value: "$12,450", change: "+15%", color: "text-green-600" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <button 
              onClick={refreshUserData}
              disabled={isRefreshing}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
          <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your account.</p>
          
          {/* User Info Display */}
          {auth.isLoading ? (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/5 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/5 mb-2"></div>
                </div>
              </div>
            </div>
          ) : auth.user ? (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">👤 Current User</h3>
              
              {/* Role Badge */}
              <div className="mb-3">
                {(() => {
                  const role = auth.user._doc ? auth.user._doc.role : auth.user.role;
                  return (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                      ${role === 'speaker' ? 'bg-purple-100 text-purple-800' : 
                        role === 'organizer' ? 'bg-green-100 text-green-800' : 
                        'bg-orange-100 text-orange-800'}`}>
                      {role === 'speaker' ? '🎤 Speaker' : 
                       role === 'organizer' ? '📋 Organizer' : 
                       '👥 Participant'}
                    </span>
                  );
                })()}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Name:</strong> {auth.user._doc ? `${auth.user._doc.firstName} ${auth.user._doc.lastName}` : `${auth.user.firstName || ''} ${auth.user.lastName || ''}`}</p>
                  <p><strong>Email:</strong> {auth.user._doc ? auth.user._doc.email : auth.user.email}</p>
                  <p><strong>Role:</strong> <span className="font-semibold">{auth.user._doc ? auth.user._doc.role : auth.user.role}</span></p>
                </div>
                <div>
                  <p><strong>Verified:</strong> {(auth.user._doc ? auth.user._doc.isEmailVerified : auth.user.isEmailVerified) ? '✅' : '❌'}</p>
                  <p><strong>Profile Complete:</strong> {(auth.user._doc ? auth.user._doc.isProfileComplete : auth.user.isProfileComplete) ? '✅' : '❌'}</p>
                  <p><strong>Authenticated:</strong> {auth.isAuthenticated ? '✅' : '❌'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Not Authenticated</h3>
              <p className="text-sm text-yellow-700">
                User data is not available. Please check your login status or try refreshing the page.
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`text-sm font-medium ${stat.color}`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className={`block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 ${action.borderColor}`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${action.color} mb-4`}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CalendarDays className="text-blue-600 text-sm" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New event booking received</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <LuMessageCircleMore className="text-green-600 text-sm" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">3 new messages received</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <VscCreditCard className="text-orange-600 text-sm" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Payment of $500 processed</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Section - Development Only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🔧 Redux Store Debug Info</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Auth State */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">🔐 Auth State</h3>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify({
                    isAuthenticated: auth.isAuthenticated,
                    isLoading: auth.isLoading,
                    isSuccess: auth.isSuccess,
                    isError: auth.isError,
                    error: auth.error,
                    user: auth.user ? {
                      id: auth.user._id,
                      name: `${auth.user.firstName} ${auth.user.lastName}`,
                      email: auth.user.email,
                      role: auth.user.role,
                      roleDetails: {
                        isParticipant: auth.user.role === 'participant',
                        isSpeaker: auth.user.role === 'speaker',
                        isOrganizer: auth.user.role === 'organizer'
                      },
                      verified: auth.user.isEmailVerified,
                      profileComplete: auth.user.isProfileComplete
                    } : null
                  }, null, 2)}
                </pre>
              </div>

              {/* Profile State */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">👤 Profile State</h3>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify({
                    isLoading: profile.isLoading,
                    error: profile.error,
                    hasProfile: !!profile.profile
                  }, null, 2)}
                </pre>
              </div>

              {/* Posts State */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">📝 Posts State</h3>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify({
                    isLoading: posts.isLoading,
                    error: posts.error,
                    postsCount: posts.posts?.length || 0,
                    hasCurrentPost: !!posts.currentPost
                  }, null, 2)}
                </pre>
              </div>

              {/* API Cache */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">🌐 API Cache</h3>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify({
                    queries: Object.keys(fullStore.api?.queries || {}).length,
                    mutations: Object.keys(fullStore.api?.mutations || {}).length,
                    subscriptions: Object.keys(fullStore.api?.subscriptions || {}).length
                  }, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  console.log('🔍 Full Redux Store State:', fullStore);
                  console.log('📊 Store Keys:', Object.keys(fullStore));
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                📊 Log Full Store to Console
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}