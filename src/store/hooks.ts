// ============================================================================
// TYPED REDUX HOOKS - Production Ready Hooks
// ============================================================================

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Typed versions of useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ============================================================================
// CUSTOM HOOKS FOR COMMON PATTERNS
// ============================================================================

import { useCallback } from 'react';
import { 
  selectAuth, 
  selectUser, 
  selectIsAuthenticated,
  logout,
  useLogoutMutation
} from './slices/authSlice';
import { resetStore } from './index';

// Auth hooks
export const useAuth = () => {
  const auth = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();
  
  const handleLogout = useCallback(async () => {
    try {
      console.log('🚪 Starting logout process...');
      
      // Call the logout API mutation (this will clear server-side cookies)
      await logoutMutation();
      
      console.log('✅ Logout API call completed');
      
      // Reset entire storew
      resetStore();
      
      console.log('✅ Store reset completed');
      
      // Redirect to home
      window.location.href = '/home';
      
      console.log('✅ Redirected to home');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if logout fails, still redirect to home
      window.location.href = '/home';
    }
  }, [logoutMutation]);
  
  return {
    ...auth,
    logout: handleLogout,
  };
};

// User hook
export const useUser = () => {
  return useAppSelector(selectUser);
};

// Authentication status hook
export const useIsAuthenticated = () => {
  return useAppSelector(selectIsAuthenticated);
};

// ============================================================================
// FEATURE-SPECIFIC HOOKS
// ============================================================================

import { 
  selectProfile,
  selectProfileLoading,
  selectProfileError 
} from './slices/profileSlice';

import { 
  selectPosts,
  selectCurrentPost,
  selectPostsLoading,
  selectPostsError 
} from './slices/postsSlice';

import { 
  selectWorkExperiences,
  selectWorkExperienceLoading,
  selectWorkExperienceError 
} from './slices/workExperienceSlice';

import { 
  selectEducations,
  selectEducationLoading,
  selectEducationError 
} from './slices/educationSlice';

import { 
  selectAwards,
  selectAwardsLoading,
  selectAwardsError 
} from './slices/awardsSlice';

import { 
  selectVideos,
  selectVideosLoading,
  selectVideosError 
} from './slices/videosSlice';

import { 
  selectCalendarEvents,
  selectCalendarLoading,
  selectCalendarError,
  selectSelectedDate,
  selectCalendarView 
} from './slices/calendarSlice';

// Profile hooks
export const useProfile = () => {
  const profile = useAppSelector(selectProfile);
  const isLoading = useAppSelector(selectProfileLoading);
  const error = useAppSelector(selectProfileError);
  
  return { profile, isLoading, error };
};

// Posts hooks
export const usePosts = () => {
  const posts = useAppSelector(selectPosts);
  const currentPost = useAppSelector(selectCurrentPost);
  const isLoading = useAppSelector(selectPostsLoading);
  const error = useAppSelector(selectPostsError);
  
  return { posts, currentPost, isLoading, error };
};

// Work Experience hooks
export const useWorkExperience = () => {
  const experiences = useAppSelector(selectWorkExperiences);
  const isLoading = useAppSelector(selectWorkExperienceLoading);
  const error = useAppSelector(selectWorkExperienceError);
  
  return { experiences, isLoading, error };
};

// Education hooks
export const useEducation = () => {
  const educations = useAppSelector(selectEducations);
  const isLoading = useAppSelector(selectEducationLoading);
  const error = useAppSelector(selectEducationError);
  
  return { educations, isLoading, error };
};

// Awards hooks
export const useAwards = () => {
  const awards = useAppSelector(selectAwards);
  const isLoading = useAppSelector(selectAwardsLoading);
  const error = useAppSelector(selectAwardsError);
  
  return { awards, isLoading, error };
};

// Videos hooks
export const useVideos = () => {
  const videos = useAppSelector(selectVideos);
  const isLoading = useAppSelector(selectVideosLoading);
  const error = useAppSelector(selectVideosError);
  
  return { videos, isLoading, error };
};

// Calendar hooks
export const useCalendar = () => {
  const events = useAppSelector(selectCalendarEvents);
  const selectedDate = useAppSelector(selectSelectedDate);
  const view = useAppSelector(selectCalendarView);
  const isLoading = useAppSelector(selectCalendarLoading);
  const error = useAppSelector(selectCalendarError);
  
  return { events, selectedDate, view, isLoading, error };
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

// Loading state aggregator
export const useGlobalLoading = () => {
  const authLoading = useAppSelector(state => state.auth.isLoading);
  const profileLoading = useAppSelector(state => state.profile.isLoading);
  const postsLoading = useAppSelector(state => state.posts.isLoading);
  const workExperienceLoading = useAppSelector(state => state.workExperience.isLoading);
  const educationLoading = useAppSelector(state => state.education.isLoading);
  const awardsLoading = useAppSelector(state => state.awards.isLoading);
  const videosLoading = useAppSelector(state => state.videos.isLoading);
  const calendarLoading = useAppSelector(state => state.calendar.isLoading);
  
  return {
    isAnyLoading: authLoading || profileLoading || postsLoading || 
                  workExperienceLoading || educationLoading || 
                  awardsLoading || videosLoading || calendarLoading,
    loadingStates: {
      auth: authLoading,
      profile: profileLoading,
      posts: postsLoading,
      workExperience: workExperienceLoading,
      education: educationLoading,
      awards: awardsLoading,
      videos: videosLoading,
      calendar: calendarLoading,
    },
  };
};

// Error state aggregator
export const useGlobalErrors = () => {
  const authError = useAppSelector(state => state.auth.error);
  const profileError = useAppSelector(state => state.profile.error);
  const postsError = useAppSelector(state => state.posts.error);
  const workExperienceError = useAppSelector(state => state.workExperience.error);
  const educationError = useAppSelector(state => state.education.error);
  const awardsError = useAppSelector(state => state.awards.error);
  const videosError = useAppSelector(state => state.videos.error);
  const calendarError = useAppSelector(state => state.calendar.error);
  
  const errors = [
    authError,
    profileError,
    postsError,
    workExperienceError,
    educationError,
    awardsError,
    videosError,
    calendarError,
  ].filter(Boolean);
  
  return {
    hasErrors: errors.length > 0,
    errors,
    errorStates: {
      auth: authError,
      profile: profileError,
      posts: postsError,
      workExperience: workExperienceError,
      education: educationError,
      awards: awardsError,
      videos: videosError,
      calendar: calendarError,
    },
  };
};




