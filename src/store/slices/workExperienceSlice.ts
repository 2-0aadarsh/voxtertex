// ============================================================================
// WORK EXPERIENCE SLICE - Work Experience Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import type { 
  WorkExperienceState, 
  WorkExperience, 
  CreateWorkExperienceRequest,
  ApiResponse 
} from '../types';

// Initial state
const initialState: WorkExperienceState = {
  experiences: [],
  currentExperience: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
};

// Work Experience slice
const workExperienceSlice = createSlice({
  name: 'workExperience',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.isError = false;
      state.error = null;
    },
    
    // Set experiences
    setExperiences: (state, action: PayloadAction<WorkExperience[]>) => {
      state.experiences = action.payload.sort((a, b) => b.order - a.order);
      state.isLoading = false;
      state.isSuccess = true;
    },
    
    // Add experience
    addExperience: (state, action: PayloadAction<WorkExperience>) => {
      state.experiences.unshift(action.payload);
      state.experiences.sort((a, b) => b.order - a.order);
    },
    
    // Update experience
    updateExperience: (state, action: PayloadAction<{ id: string; updates: Partial<WorkExperience> }>) => {
      const index = state.experiences.findIndex(exp => exp._id === action.payload.id);
      if (index !== -1) {
        state.experiences[index] = { ...state.experiences[index], ...action.payload.updates };
        state.experiences.sort((a, b) => b.order - a.order);
      }
      if (state.currentExperience && state.currentExperience._id === action.payload.id) {
        state.currentExperience = { ...state.currentExperience, ...action.payload.updates };
      }
    },
    
    // Remove experience
    removeExperience: (state, action: PayloadAction<string>) => {
      state.experiences = state.experiences.filter(exp => exp._id !== action.payload);
      if (state.currentExperience && state.currentExperience._id === action.payload) {
        state.currentExperience = null;
      }
    },
    
    // Set current experience
    setCurrentExperience: (state, action: PayloadAction<WorkExperience | null>) => {
      state.currentExperience = action.payload;
    },
    
    // Reorder experiences
    reorderExperiences: (state, action: PayloadAction<{ id: string; newOrder: number }[]>) => {
      action.payload.forEach(({ id, newOrder }) => {
        const experience = state.experiences.find(exp => exp._id === id);
        if (experience) {
          experience.order = newOrder;
        }
      });
      state.experiences.sort((a, b) => b.order - a.order);
    },
    
    // Set error
    setError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.isError = false;
      state.error = null;
    },
    
    // Reset work experience
    resetWorkExperience: () => initialState,
  },
});

// Work Experience API endpoints
export const workExperienceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all work experiences
    getWorkExperiences: builder.query<ApiResponse<WorkExperience[]>, string | void>({
      query: (userId) => userId ? `/work-experience?userId=${userId}` : '/work-experience',
      providesTags: ['WorkExperience'],
    }),
    
    // Get single work experience
    getWorkExperience: builder.query<ApiResponse<WorkExperience>, string>({
      query: (experienceId) => `/work-experience/${experienceId}`,
      providesTags: (result, error, id) => [{ type: 'WorkExperience', id }],
    }),
    
    // Create work experience
    createWorkExperience: builder.mutation<
      ApiResponse<WorkExperience>,
      CreateWorkExperienceRequest
    >({
      query: (experienceData) => ({
        url: '/work-experience',
        method: 'POST',
        body: experienceData,
      }),
      invalidatesTags: ['WorkExperience', 'Profile'],
      // Add onQueryStarted to handle errors properly
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Error creating work experience:', error);
        }
      },
    }),
    
    // Update work experience
    updateWorkExperience: builder.mutation<
      ApiResponse<WorkExperience>,
      { id: string; updates: Partial<CreateWorkExperienceRequest> }
    >({
      query: ({ id, updates }) => ({
        url: `/work-experience/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['WorkExperience', 'Profile'],
    }),
    
    // Delete work experience
    deleteWorkExperience: builder.mutation<ApiResponse, string>({
      query: (experienceId) => ({
        url: `/work-experience/${experienceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WorkExperience', 'Profile'],
    }),
    
    // Reorder work experiences
    reorderWorkExperiences: builder.mutation<
      ApiResponse<WorkExperience[]>,
      { id: string; newOrder: number }[]
    >({
      query: (orderData) => ({
        url: '/work-experience/reorder',
        method: 'PATCH',
        body: { experiences: orderData },
      }),
      invalidatesTags: ['WorkExperience', 'Profile'],
    }),
  }),
});

// Export actions
export const {
  setLoading,
  setExperiences,
  addExperience,
  updateExperience,
  removeExperience,
  setCurrentExperience,
  reorderExperiences,
  setError,
  clearError,
  resetWorkExperience,
} = workExperienceSlice.actions;

// Export API hooks
export const {
  useGetWorkExperiencesQuery,
  useGetWorkExperienceQuery,
  useCreateWorkExperienceMutation,
  useUpdateWorkExperienceMutation,
  useDeleteWorkExperienceMutation,
  useReorderWorkExperiencesMutation,
} = workExperienceApi;

// Selectors
export const selectWorkExperiences = (state: { workExperience: WorkExperienceState }) => 
  state.workExperience.experiences;
export const selectCurrentWorkExperience = (state: { workExperience: WorkExperienceState }) => 
  state.workExperience.currentExperience;
export const selectWorkExperienceLoading = (state: { workExperience: WorkExperienceState }) => 
  state.workExperience.isLoading;
export const selectWorkExperienceError = (state: { workExperience: WorkExperienceState }) => 
  state.workExperience.error;

// Export reducer
export default workExperienceSlice.reducer;

