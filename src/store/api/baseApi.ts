// ============================================================================
// BASE API - RTK Query Configuration
// ============================================================================

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../types';

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  credentials: 'include', // Include cookies for authentication
  prepareHeaders: (headers, { getState }) => {
    // Get token from state if available
    const token = (getState() as RootState).auth.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // Don't set Content-Type here - let RTK Query handle it based on body type
    // For FormData, RTK Query will automatically set multipart/form-data
    // For JSON, it will set application/json
    
    return headers;
  },
});

// Base query with re-authentication logic
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  console.log('=== BASE API DEBUG ===');
  console.log('Making request to:', args.url);
  console.log('Request args:', args);
  console.log('Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');
  console.log('Full URL:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}${args.url}`);
  console.log('=====================');
  
  let result = await baseQuery(args, api, extraOptions);
  
  console.log('=== BASE API RESPONSE ===');
  console.log('Response status:', result.meta?.response?.status);
  console.log('Response data:', result.data);
  console.log('Response error:', result.error);
  console.log('========================');

  // If we get a 401, try to refresh the token
  if (result?.error && result.error.status === 401) {
    console.log('Token expired, attempting to refresh...');
    
    // Try to refresh token
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh-token',
        method: 'POST',
      },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      // Store the new token
      api.dispatch({ type: 'auth/setToken', payload: refreshResult.data });
      
      // Retry the original query with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, logout user
      api.dispatch({ type: 'auth/logout' });
    }
  }

  return result;
};

// Create the base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Profile', 
    'Post',
    'FeedPost',
    'WorkExperience',
    'Education',
    'Award',
    'Video',
    'CalendarEvent',
    'Availability'
  ],
  endpoints: () => ({}),
});

// Export hooks for usage in functional components
export const {
  // Will be populated by individual API slices
} = baseApi;


