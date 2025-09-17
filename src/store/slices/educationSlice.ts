// ============================================================================
// EDUCATION SLICE - Education Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import type { 
  EducationState, 
  Education, 
  CreateEducationRequest,
  ApiResponse 
} from '../types';

// Initial state
const initialState: EducationState = {
  educations: [],
  currentEducation: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
};

// Education slice
const educationSlice = createSlice({
  name: 'education',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.isError = false;
      state.error = null;
    },
    
    setEducations: (state, action: PayloadAction<Education[]>) => {
      state.educations = action.payload.sort((a, b) => b.order - a.order);
      state.isLoading = false;
      state.isSuccess = true;
    },
    
    addEducation: (state, action: PayloadAction<Education>) => {
      state.educations.unshift(action.payload);
      state.educations.sort((a, b) => b.order - a.order);
    },
    
    updateEducation: (state, action: PayloadAction<{ id: string; updates: Partial<Education> }>) => {
      const index = state.educations.findIndex(edu => edu._id === action.payload.id);
      if (index !== -1) {
        state.educations[index] = { ...state.educations[index], ...action.payload.updates };
        state.educations.sort((a, b) => b.order - a.order);
      }
      if (state.currentEducation && state.currentEducation._id === action.payload.id) {
        state.currentEducation = { ...state.currentEducation, ...action.payload.updates };
      }
    },
    
    removeEducation: (state, action: PayloadAction<string>) => {
      state.educations = state.educations.filter(edu => edu._id !== action.payload);
      if (state.currentEducation && state.currentEducation._id === action.payload) {
        state.currentEducation = null;
      }
    },
    
    setCurrentEducation: (state, action: PayloadAction<Education | null>) => {
      state.currentEducation = action.payload;
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.isError = false;
      state.error = null;
    },
    
    resetEducation: () => initialState,
  },
});

// Education API endpoints
export const educationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEducations: builder.query<ApiResponse<Education[]>, string | void>({
      query: (userId) => userId ? `/education?userId=${userId}` : '/education',
      providesTags: ['Education'],
    }),
    
    getEducation: builder.query<ApiResponse<Education>, string>({
      query: (educationId) => `/education/${educationId}`,
      providesTags: (result, error, id) => [{ type: 'Education', id }],
    }),
    
    createEducation: builder.mutation<ApiResponse<Education>, CreateEducationRequest>({
      query: (educationData) => ({
        url: '/education',
        method: 'POST',
        body: educationData,
      }),
      invalidatesTags: ['Education', 'Profile'],
      // Add onQueryStarted to handle errors properly
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Error creating education:', error);
        }
      },
    }),
    
    updateEducation: builder.mutation<
      ApiResponse<Education>,
      { id: string; updates: Partial<CreateEducationRequest> }
    >({
      query: ({ id, updates }) => ({
        url: `/education/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Education', 'Profile'],
    }),
    
    deleteEducation: builder.mutation<ApiResponse, string>({
      query: (educationId) => ({
        url: `/education/${educationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Education', 'Profile'],
    }),
  }),
});

// Export actions and hooks
export const {
  setLoading,
  setEducations,
  addEducation,
  updateEducation,
  removeEducation,
  setCurrentEducation,
  setError,
  clearError,
  resetEducation,
} = educationSlice.actions;

export const {
  useGetEducationsQuery,
  useGetEducationQuery,
  useCreateEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
} = educationApi;

// Selectors
export const selectEducations = (state: { education: EducationState }) => state.education.educations;
export const selectCurrentEducation = (state: { education: EducationState }) => state.education.currentEducation;
export const selectEducationLoading = (state: { education: EducationState }) => state.education.isLoading;
export const selectEducationError = (state: { education: EducationState }) => state.education.error;

export default educationSlice.reducer;

