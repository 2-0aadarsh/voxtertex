// ============================================================================
// AWARDS SLICE - Awards & Certifications Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import type { 
  AwardsState, 
  Award, 
  CreateAwardRequest,
  ApiResponse 
} from '../types';

// Initial state
const initialState: AwardsState = {
  awards: [],
  currentAward: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
};

// Awards slice
const awardsSlice = createSlice({
  name: 'awards',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.isError = false;
      state.error = null;
    },
    
    setAwards: (state, action: PayloadAction<Award[]>) => {
      state.awards = action.payload.sort((a, b) => 
        new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime()
      );
      state.isLoading = false;
      state.isSuccess = true;
    },
    
    addAward: (state, action: PayloadAction<Award>) => {
      state.awards.unshift(action.payload);
      state.awards.sort((a, b) => 
        new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime()
      );
    },
    
    updateAward: (state, action: PayloadAction<{ id: string; updates: Partial<Award> }>) => {
      const index = state.awards.findIndex(award => award._id === action.payload.id);
      if (index !== -1) {
        state.awards[index] = { ...state.awards[index], ...action.payload.updates };
        state.awards.sort((a, b) => 
          new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime()
        );
      }
      if (state.currentAward && state.currentAward._id === action.payload.id) {
        state.currentAward = { ...state.currentAward, ...action.payload.updates };
      }
    },
    
    removeAward: (state, action: PayloadAction<string>) => {
      state.awards = state.awards.filter(award => award._id !== action.payload);
      if (state.currentAward && state.currentAward._id === action.payload) {
        state.currentAward = null;
      }
    },
    
    setCurrentAward: (state, action: PayloadAction<Award | null>) => {
      state.currentAward = action.payload;
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
    
    resetAwards: () => initialState,
  },
});

// Awards API endpoints
export const awardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAwards: builder.query<ApiResponse<Award[]>, { userId?: string; type?: string }>({
      query: (params) => ({
        url: '/awards',
        params,
      }),
      providesTags: ['Award'],
    }),
    
    getAward: builder.query<ApiResponse<Award>, string>({
      query: (awardId) => `/awards/${awardId}`,
      providesTags: (result, error, id) => [{ type: 'Award', id }],
    }),
    
    createAward: builder.mutation<ApiResponse<Award>, CreateAwardRequest>({
      query: (awardData) => ({
        url: '/awards',
        method: 'POST',
        body: awardData,
      }),
      invalidatesTags: ['Award', 'Profile'],
      // Add onQueryStarted to handle errors properly
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Error creating award:', error);
        }
      },
    }),
    
    updateAward: builder.mutation<
      ApiResponse<Award>,
      { id: string; updates: Partial<CreateAwardRequest> }
    >({
      query: ({ id, updates }) => ({
        url: `/awards/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Award', 'Profile'],
    }),
    
    deleteAward: builder.mutation<ApiResponse, string>({
      query: (awardId) => ({
        url: `/awards/${awardId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Award', 'Profile'],
    }),
    
    verifyCredential: builder.mutation<
      ApiResponse<{ isValid: boolean; details: any }>,
      { awardId: string; credentialId: string }
    >({
      query: ({ awardId, credentialId }) => ({
        url: `/awards/${awardId}/verify`,
        method: 'POST',
        body: { credentialId },
      }),
    }),
  }),
});

// Export actions and hooks
export const {
  setLoading,
  setAwards,
  addAward,
  updateAward,
  removeAward,
  setCurrentAward,
  setError,
  clearError,
  resetAwards,
} = awardsSlice.actions;

export const {
  useGetAwardsQuery,
  useGetAwardQuery,
  useCreateAwardMutation,
  useUpdateAwardMutation,
  useDeleteAwardMutation,
  useVerifyCredentialMutation,
} = awardsApi;

// Selectors
export const selectAwards = (state: { awards: AwardsState }) => state.awards.awards;
export const selectCurrentAward = (state: { awards: AwardsState }) => state.awards.currentAward;
export const selectAwardsLoading = (state: { awards: AwardsState }) => state.awards.isLoading;
export const selectAwardsError = (state: { awards: AwardsState }) => state.awards.error;

// Filtered selectors
export const selectAwardsByType = (state: { awards: AwardsState }, type: string) =>
  state.awards.awards.filter(award => award.type === type);

export const selectCertifications = (state: { awards: AwardsState }) =>
  state.awards.awards.filter(award => award.type === 'certification');

export const selectAchievements = (state: { awards: AwardsState }) =>
  state.awards.awards.filter(award => award.type === 'award');

export default awardsSlice.reducer;

