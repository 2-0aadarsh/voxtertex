// ============================================================================
// PROFILE SLICE - User Profile Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import type { 
  ProfileState, 
  Profile, 
  UpdateProfileRequest,
  ApiResponse 
} from '../types';

// Initial state
const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
};

// Profile slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.isError = false;
      state.error = null;
    },
    
    // Set profile
    setProfile: (state, action: PayloadAction<Profile>) => {
      state.profile = action.payload;
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.error = null;
    },
    
    // Update profile
    updateProfile: (state, action: PayloadAction<Partial<Profile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    
    // Set error
    setError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = true;
      state.error = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.isError = false;
      state.error = null;
    },
    
    // Reset profile
    resetProfile: () => initialState,
  },
});

// Profile API endpoints
export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user profile
    getProfile: builder.query<ApiResponse<Profile>, string | void>({
      query: (userId) => userId ? `/profile/${userId}` : '/auth/profile/enhanced',
      providesTags: ['Profile'],
    }),
    
    // Update profile
    updateProfile: builder.mutation<
      ApiResponse<Profile>,
      UpdateProfileRequest
    >({
      query: (profileData) => ({
        url: '/profile/me',
        method: 'PATCH',
        body: profileData,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),
    
    // Upload profile image
    uploadProfileImage: builder.mutation<
      ApiResponse<{ profileImage: string }>,
      FormData
    >({
      query: (formData) => ({
        url: '/profile/upload-image',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),
    
    // Delete profile image
    deleteProfileImage: builder.mutation<ApiResponse, void>({
      query: () => ({
        url: '/profile/delete-image',
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile', 'User'],
    }),
    
    // Get profile stats
    getProfileStats: builder.query<
      ApiResponse<{
        connections: number;
        projects: number;
        experience: string;
        profileViews: number;
        postsCount: number;
      }>,
      void
    >({
      query: () => '/profile/stats',
      providesTags: ['Profile'],
    }),
    
    // Update profile visibility
    updateProfileVisibility: builder.mutation<
      ApiResponse<Profile>,
      { isPublic: boolean }
    >({
      query: (visibilityData) => ({
        url: '/profile/visibility',
        method: 'PATCH',
        body: visibilityData,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

// Export actions
export const {
  setLoading,
  setProfile,
  updateProfile,
  setError,
  clearError,
  resetProfile,
} = profileSlice.actions;

// Export API hooks
export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadProfileImageMutation,
  useDeleteProfileImageMutation,
  useGetProfileStatsQuery,
  useUpdateProfileVisibilityMutation,
} = profileApi;

// Selectors
export const selectProfile = (state: { profile: ProfileState }) => state.profile.profile;
export const selectProfileLoading = (state: { profile: ProfileState }) => state.profile.isLoading;
export const selectProfileError = (state: { profile: ProfileState }) => state.profile.error;

// Export reducer
export default profileSlice.reducer;


