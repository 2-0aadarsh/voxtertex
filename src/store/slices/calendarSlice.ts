// ============================================================================
// CALENDAR SLICE - Calendar & Availability Management (Speakers)
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import type { 
  CalendarState, 
  CalendarEvent, 
  CreateCalendarEventRequest,
  ApiResponse 
} from '../types';

// Initial state
const initialState: CalendarState = {
  events: [],
  selectedDate: null,
  currentEvent: null,
  view: 'month',
  filters: {},
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
};

// Calendar slice
const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.isError = false;
      state.error = null;
    },
    
    setEvents: (state, action: PayloadAction<CalendarEvent[]>) => {
      state.events = action.payload.sort((a, b) => 
        new Date(a.date + ' ' + a.startTime).getTime() - 
        new Date(b.date + ' ' + b.startTime).getTime()
      );
      state.isLoading = false;
      state.isSuccess = true;
    },
    
    addEvent: (state, action: PayloadAction<CalendarEvent>) => {
      state.events.push(action.payload);
      state.events.sort((a, b) => 
        new Date(a.date + ' ' + a.startTime).getTime() - 
        new Date(b.date + ' ' + b.startTime).getTime()
      );
    },
    
    updateEvent: (state, action: PayloadAction<{ id: string; updates: Partial<CalendarEvent> }>) => {
      const index = state.events.findIndex(event => event._id === action.payload.id);
      if (index !== -1) {
        state.events[index] = { ...state.events[index], ...action.payload.updates };
        state.events.sort((a, b) => 
          new Date(a.date + ' ' + a.startTime).getTime() - 
          new Date(b.date + ' ' + b.startTime).getTime()
        );
      }
      if (state.currentEvent && state.currentEvent._id === action.payload.id) {
        state.currentEvent = { ...state.currentEvent, ...action.payload.updates };
      }
    },
    
    removeEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(event => event._id !== action.payload);
      if (state.currentEvent && state.currentEvent._id === action.payload) {
        state.currentEvent = null;
      }
    },
    
    setCurrentEvent: (state, action: PayloadAction<CalendarEvent | null>) => {
      state.currentEvent = action.payload;
    },
    
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    
    setView: (state, action: PayloadAction<CalendarState['view']>) => {
      state.view = action.payload;
    },
    
    setFilters: (state, action: PayloadAction<CalendarState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {};
    },
    
    // Bulk operations for availability
    setMultipleAvailability: (state, action: PayloadAction<CalendarEvent[]>) => {
      // Remove existing availability events for the same dates
      const newEventDates = action.payload.map(event => event.date);
      state.events = state.events.filter(event => 
        !(event.type === 'available' && newEventDates.includes(event.date))
      );
      
      // Add new availability events
      state.events.push(...action.payload);
      state.events.sort((a, b) => 
        new Date(a.date + ' ' + a.startTime).getTime() - 
        new Date(b.date + ' ' + b.startTime).getTime()
      );
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
    
    resetCalendar: () => initialState,
  },
});

// Calendar API endpoints
export const calendarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get events with date range and filters
    getCalendarEvents: builder.query<
      ApiResponse<CalendarEvent[]>,
      {
        startDate?: string;
        endDate?: string;
        type?: string;
        status?: string;
        userId?: string;
      }
    >({
      query: (params) => ({
        url: '/calendar/events',
        params,
      }),
      providesTags: ['CalendarEvent'],
    }),
    
    // Get availability for a specific month/year
    getAvailability: builder.query<
      ApiResponse<CalendarEvent[]>,
      { year: number; month: number }
    >({
      query: ({ year, month }) => `/availability/${year}/${month}`,
      providesTags: ['CalendarEvent'],
    }),
    
    // Get single event
    getCalendarEvent: builder.query<ApiResponse<CalendarEvent>, string>({
      query: (eventId) => `/calendar/events/${eventId}`,
      providesTags: (result, error, id) => [{ type: 'CalendarEvent', id }],
    }),
    
    // Create event/availability
    createCalendarEvent: builder.mutation<
      ApiResponse<CalendarEvent>,
      CreateCalendarEventRequest
    >({
      query: (eventData) => ({
        url: '/calendar/events',
        method: 'POST',
        body: eventData,
      }),
      invalidatesTags: ['CalendarEvent'],
    }),
    
    // Create multiple availability slots
    createMultipleAvailability: builder.mutation<
      ApiResponse<CalendarEvent[]>,
      {
        dates: string[];
        startTime: string;
        endTime: string;
        rate?: number;
        currency?: string;
      }
    >({
      query: (availabilityData) => ({
        url: '/availability/bulk',
        method: 'POST',
        body: availabilityData,
      }),
      invalidatesTags: ['CalendarEvent'],
    }),
    
    // Update event
    updateCalendarEvent: builder.mutation<
      ApiResponse<CalendarEvent>,
      { id: string; updates: Partial<CreateCalendarEventRequest> }
    >({
      query: ({ id, updates }) => ({
        url: `/calendar/events/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'CalendarEvent', id }],
    }),
    
    // Delete event
    deleteCalendarEvent: builder.mutation<ApiResponse, string>({
      query: (eventId) => ({
        url: `/calendar/events/${eventId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'CalendarEvent', id }],
    }),
    
    // Book an available slot
    bookAvailableSlot: builder.mutation<
      ApiResponse<CalendarEvent>,
      {
        eventId: string;
        clientInfo: {
          name: string;
          email: string;
          phone?: string;
        };
        meetingDetails?: {
          location?: string;
          meetingUrl?: string;
          notes?: string;
        };
      }
    >({
      query: ({ eventId, ...bookingData }) => ({
        url: `/calendar/events/${eventId}/book`,
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'CalendarEvent', id: eventId }],
    }),
    
    // Confirm/Cancel booking
    updateBookingStatus: builder.mutation<
      ApiResponse<CalendarEvent>,
      { eventId: string; status: 'confirmed' | 'cancelled' }
    >({
      query: ({ eventId, status }) => ({
        url: `/calendar/events/${eventId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'CalendarEvent', id: eventId }],
    }),
  }),
});

// Export actions and hooks
export const {
  setLoading,
  setEvents,
  addEvent,
  updateEvent,
  removeEvent,
  setCurrentEvent,
  setSelectedDate,
  setView,
  setFilters,
  clearFilters,
  setMultipleAvailability,
  setError,
  clearError,
  resetCalendar,
} = calendarSlice.actions;

export const {
  useGetCalendarEventsQuery,
  useGetAvailabilityQuery,
  useGetCalendarEventQuery,
  useCreateCalendarEventMutation,
  useCreateMultipleAvailabilityMutation,
  useUpdateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useBookAvailableSlotMutation,
  useUpdateBookingStatusMutation,
} = calendarApi;

// Selectors
export const selectCalendarEvents = (state: { calendar: CalendarState }) => state.calendar.events;
export const selectCurrentEvent = (state: { calendar: CalendarState }) => state.calendar.currentEvent;
export const selectSelectedDate = (state: { calendar: CalendarState }) => state.calendar.selectedDate;
export const selectCalendarView = (state: { calendar: CalendarState }) => state.calendar.view;
export const selectCalendarFilters = (state: { calendar: CalendarState }) => state.calendar.filters;
export const selectCalendarLoading = (state: { calendar: CalendarState }) => state.calendar.isLoading;
export const selectCalendarError = (state: { calendar: CalendarState }) => state.calendar.error;

// Filtered selectors
export const selectEventsByDate = (state: { calendar: CalendarState }, date: string) =>
  state.calendar.events.filter(event => event.date === date);

export const selectAvailableSlots = (state: { calendar: CalendarState }) =>
  state.calendar.events.filter(event => event.type === 'available' && event.status !== 'cancelled');

export const selectBookedSlots = (state: { calendar: CalendarState }) =>
  state.calendar.events.filter(event => event.type === 'booked');

export const selectEventsByDateRange = (state: { calendar: CalendarState }, startDate: string, endDate: string) =>
  state.calendar.events.filter(event => event.date >= startDate && event.date <= endDate);

export default calendarSlice.reducer;




