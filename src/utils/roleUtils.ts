/**
 * Role Utility Functions
 * Helper functions for working with user roles in the application
 */

import { useSelector } from 'react-redux';
import { selectUserRole, selectUser } from '@/store/slices/authSlice';
import type { User } from '@/store/types';

/**
 * Hook to get the current user's role
 * @returns The current user's role or null if not authenticated
 */
export const useUserRole = () => {
  return useSelector(selectUserRole);
};

/**
 * Hook to get the current user
 * @returns The current user object or null if not authenticated
 */
export const useCurrentUser = () => {
  return useSelector(selectUser);
};

/**
 * Check if the current user has a specific role
 * @param role - The role to check for
 * @returns boolean indicating if the user has the specified role
 */
export const useHasRole = (role: 'speaker' | 'organizer' | 'participant') => {
  const userRole = useSelector(selectUserRole);
  return userRole === role;
};

/**
 * Check if the current user is a speaker
 * @returns boolean indicating if the user is a speaker
 */
export const useIsSpeaker = () => {
  return useHasRole('speaker');
};

/**
 * Check if the current user is an organizer
 * @returns boolean indicating if the user is an organizer
 */
export const useIsOrganizer = () => {
  return useHasRole('organizer');
};

/**
 * Check if the current user is a participant
 * @returns boolean indicating if the user is a participant
 */
export const useIsParticipant = () => {
  return useHasRole('participant');
};

/**
 * Get role-specific features or permissions
 * @param userRole - The user's role
 * @returns Object containing role-specific features
 */
export const getRoleFeatures = (userRole: string | null) => {
  switch (userRole) {
    case 'speaker':
      return {
        canSetAvailability: true,
        canCreateEvents: true,
        canManageProfile: true,
        canViewAnalytics: true,
        canAccessCalendar: true,
        canUploadVideos: true,
        canCreatePosts: true,
      };
    case 'organizer':
      return {
        canSetAvailability: false,
        canCreateEvents: true,
        canManageProfile: true,
        canViewAnalytics: true,
        canAccessCalendar: true,
        canUploadVideos: false,
        canCreatePosts: true,
      };
    case 'participant':
      return {
        canSetAvailability: false,
        canCreateEvents: false,
        canManageProfile: true,
        canViewAnalytics: false,
        canAccessCalendar: false,
        canUploadVideos: false,
        canCreatePosts: true,
      };
    default:
      return {
        canSetAvailability: false,
        canCreateEvents: false,
        canManageProfile: false,
        canViewAnalytics: false,
        canAccessCalendar: false,
        canUploadVideos: false,
        canCreatePosts: false,
      };
  }
};

/**
 * Get role display name
 * @param role - The role string
 * @returns Human-readable role name
 */
export const getRoleDisplayName = (role: string | null): string => {
  switch (role) {
    case 'speaker':
      return 'Speaker';
    case 'organizer':
      return 'Event Organizer';
    case 'participant':
      return 'Participant';
    default:
      return 'Unknown';
  }
};

/**
 * Get role-specific color theme
 * @param role - The role string
 * @returns CSS color classes for the role
 */
export const getRoleTheme = (role: string | null) => {
  switch (role) {
    case 'speaker':
      return {
        primary: 'bg-orange-500',
        secondary: 'bg-orange-100',
        text: 'text-orange-600',
        border: 'border-orange-200',
      };
    case 'organizer':
      return {
        primary: 'bg-blue-500',
        secondary: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200',
      };
    case 'participant':
      return {
        primary: 'bg-green-500',
        secondary: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200',
      };
    default:
      return {
        primary: 'bg-gray-500',
        secondary: 'bg-gray-100',
        text: 'text-gray-600',
        border: 'border-gray-200',
      };
  }
};





