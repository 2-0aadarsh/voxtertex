// ============================================================================
// AVAILABILITY SLICE - Calendar Availability Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import type { 
  AvailabilityState, 
  Availability, 
  CreateAvailabilityRequest,
  ApiResponse 
} from '../types';

// Initial state
const initialState: AvailabilityState = {
  availabilities: [],
  currentAvailability: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
};

// Availability slice
const availabilitySlice = createSlice({
  name: 'availability',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.isError = false;
      state.error = null;
    },
    
    setAvailabilities: (state, action: PayloadAction<Availability[]>) => {
      state.availabilities = action.payload;
      state.isLoading = false;
      state.isSuccess = true;
    },
    
    addAvailability: (state, action: PayloadAction<Availability>) => {
      state.availabilities.unshift(action.payload);
    },
    
    updateAvailability: (state, action: PayloadAction<{ id: string; updates: Partial<Availability> }>) => {
      const index = state.availabilities.findIndex(availability => availability._id === action.payload.id);
      if (index !== -1) {
        state.availabilities[index] = { ...state.availabilities[index], ...action.payload.updates };
      }
      if (state.currentAvailability && state.currentAvailability._id === action.payload.id) {
        state.currentAvailability = { ...state.currentAvailability, ...action.payload.updates };
      }
    },
    
    removeAvailability: (state, action: PayloadAction<string>) => {
      state.availabilities = state.availabilities.filter(availability => availability._id !== action.payload);
      if (state.currentAvailability && state.currentAvailability._id === action.payload) {
        state.currentAvailability = null;
      }
    },
    
    setCurrentAvailability: (state, action: PayloadAction<Availability | null>) => {
      state.currentAvailability = action.payload;
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
    
    resetAvailability: () => initialState,
  },
});

// Availability API endpoints
export const availabilityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAvailabilities: builder.query<
      ApiResponse<Availability[]>, 
      { year: number; month: number }
    >({
      query: ({ year, month }) => ({
        url: `/availability/${year}/${month}`,
      }),
      providesTags: ['Availability'],
    }),
    
    getAvailabilityById: builder.query<ApiResponse<Availability>, string>({
      query: (availabilityId) => `/availability/${availabilityId}`,
      providesTags: (result, error, id) => [{ type: 'Availability', id }],
    }),
    
    createAvailability: builder.mutation<ApiResponse<Availability>, CreateAvailabilityRequest>({
      query: (availabilityData) => ({
        url: '/availability',
        method: 'POST',
        body: availabilityData,
      }),
      invalidatesTags: ['Availability'],
    }),
    
    updateAvailability: builder.mutation<
      ApiResponse<Availability>,
      { id: string; updates: Partial<CreateAvailabilityRequest> }
    >({
      query: ({ id, updates }) => ({
        url: `/availability/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Availability', id }],
    }),
    
    deleteAvailability: builder.mutation<ApiResponse, { dates: string[] }>({
      query: (data) => ({
        url: '/availability',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['Availability'],
    }),
    
    getAvailabilityByDateRange: builder.query<
      ApiResponse<Availability[]>,
      { startDate: string; endDate: string }
    >({
      query: ({ startDate, endDate }) => ({
        url: '/availability/range',
        params: { startDate, endDate },
      }),
      providesTags: ['Availability'],
    }),
  }),
});

// Export actions and hooks
export const {
  setLoading,
  setAvailabilities,
  addAvailability,
  updateAvailability,
  removeAvailability,
  setCurrentAvailability,
  setError,
  clearError,
  resetAvailability,
} = availabilitySlice.actions;

export const {
  useGetAvailabilitiesQuery,
  useGetAvailabilityByIdQuery,
  useCreateAvailabilityMutation,
  useUpdateAvailabilityMutation,
  useDeleteAvailabilityMutation,
  useGetAvailabilityByDateRangeQuery,
} = availabilityApi;

// Selectors
export const selectAvailabilities = (state: { availability: AvailabilityState }) => state.availability.availabilities;
export const selectCurrentAvailability = (state: { availability: AvailabilityState }) => state.availability.currentAvailability;
export const selectAvailabilityLoading = (state: { availability: AvailabilityState }) => state.availability.isLoading;
export const selectAvailabilityError = (state: { availability: AvailabilityState }) => state.availability.error;

// Filtered selectors
export const selectAvailabilitiesByDate = (state: { availability: AvailabilityState }, date: string) =>
  state.availability.availabilities.filter(availability => 
    availability.dates.some(d => new Date(d).toDateString() === new Date(date).toDateString())
  );

export const selectAvailabilitiesByMode = (state: { availability: AvailabilityState }, mode: string) =>
  state.availability.availabilities.filter(availability => 
    availability.modes.includes(mode)
  );

export default availabilitySlice.reducer;





