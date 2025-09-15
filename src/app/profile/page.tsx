"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectUserRole, selectIsAuthenticated, selectAuthLoading } from '@/store/slices/authSlice';
import { useGetCurrentUserQuery } from '@/store/slices/authSlice';

/**
 * Profile Route Component
 * 
 * This component handles role-based redirection for the /profile route.
 * Users are automatically redirected based on their role:
 * - speaker → /speakerUser
 * - organizer → /newuser  
 * - participant → /participant
 */
export default function ProfilePage() {
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const authLoading = useSelector(selectAuthLoading);

  // Fetch current user data to ensure we have the latest role information
  const {
    data: currentUserData,
    isLoading: isUserLoading,
    error: userError,
  } = useGetCurrentUserQuery();

  // Determine if we're still loading
  const isLoading = authLoading || isUserLoading;

  useEffect(() => {
    // Don't redirect if we're still loading user data
    if (isLoading) {
      console.log('⏳ Still loading user data...');
      return;
    }

    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log('🔒 User not authenticated, redirecting to login');
      router.push('/signup/login');
      return;
    }

    // Determine the role to use
    let roleToUse = userRole;
    
    // If no role from Redux, try to get it from current user data
    if (!roleToUse && currentUserData?.user?.role) {
      roleToUse = currentUserData.user.role;
      console.log(`🔄 Using role from current user data: ${roleToUse}`);
    }

    // If we have a role, redirect based on role
    if (roleToUse) {
      console.log(`🔄 Redirecting user with role: ${roleToUse}`);
      
      switch (roleToUse) {
        case 'speaker':
          router.push('/speakerUser');
          break;
        case 'organizer':
          router.push('/newuser');
          break;
        case 'participant':
          router.push('/participant');
          break;
        default:
          console.error('❌ Unknown user role:', roleToUse);
          // Fallback to a default route
          router.push('/newuser');
      }
    } else {
      console.error('❌ No user role available after login');
      console.log('🔍 Debug info:', {
        userRole,
        currentUserData: currentUserData?.user,
        isAuthenticated,
        isLoading
      });
      
      // Fallback to default route
      router.push('/newuser');
    }
  }, [
    isAuthenticated,
    userRole,
    isLoading,
    currentUserData,
    router
  ]);

  // Show loading state while determining redirect
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Profile</h2>
          <p className="text-gray-500">Determining your profile access...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an issue
  if (userError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-semibold">Profile Access Error</h3>
            <p className="text-sm mt-1">
              There was an error loading your profile information.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg hover:bg-[#E55A2B] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // This should rarely be seen as redirects happen quickly
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-8 w-8 bg-[#FF6B35] rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Redirecting...</h2>
          <p className="text-gray-500">Taking you to your profile</p>
        </div>
      </div>
    </div>
  );
}
