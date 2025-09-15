// ============================================================================
// AUTH SLICE - Authentication State Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import type { 
  AuthState, 
  User, 
  LoginRequest, 
  ApiResponse 
} from '../types';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
  role: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.isError = false;
      state.error = null;
    },
    
    // Set authentication success
    setAuthSuccess: (state, action: PayloadAction<{ user: User; token?: string }>) => {
      console.log('🔵 Setting auth success with user:', action.payload.user);
      state.user = action.payload.user;
      state.role = action.payload.user.role; // Extract and store role separately
      state.isAuthenticated = true;
      if (action.payload.token) {
        state.token = action.payload.token;
      }
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.error = null;
      
      // Set role in cookie for middleware access
      if (typeof document !== 'undefined') {
        document.cookie = `userRole=${action.payload.user.role}; path=/; max-age=86400`; // 24 hours
        if (action.payload.token) {
          document.cookie = `token=${action.payload.token}; path=/; max-age=86400`; // 24 hours
        }
      }
      
      console.log('🟢 Auth state after update:', { 
        user: state.user, 
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        token: state.token ? '✓ Present' : '✗ Missing'
      });
    },
    
    // Set authentication error
    setAuthError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = true;
      state.error = action.payload;
    },
    
    // Set token
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    
    // Update user profile
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update role if it's being updated
        if (action.payload.role) {
          state.role = action.payload.role;
        }
      }
    },
    
    // Logout
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.token = null;
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.error = null;
      
      // Clear cookies on logout
      if (typeof document !== 'undefined') {
        document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    },
    
    // Clear error
    clearError: (state) => {
      state.isError = false;
      state.error = null;
    },
    
    // Reset auth state
    resetAuth: () => initialState,
  },
});

// Auth API endpoints
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<
      { success: boolean; message: string; user: User; redirectUrl: string; tokens: { accessToken: string } },
      LoginRequest
    >({
      query: (credentials) => ({
        url: '/auth/login-jwt',
        method: 'POST',
        body: credentials,
      }),
      // Handle the response and update the auth state
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('🔐 Login response:', data);
          console.log('👤 User from login:', data.user);
          console.log('👑 User role from login:', data.user?.role);
          console.log('🔑 Response structure:', Object.keys(data));
          
          // Update auth state with user and token
          if (data.success && data.user) {
            dispatch(setAuthSuccess({ 
              user: data.user, // Direct user object in response
              token: data.tokens?.accessToken
            }));
            console.log('✅ Auth state updated with user:', data.user);
            console.log('✅ User role:', data.user.role);
          }
        } catch (error) {
          console.error('❌ Login error in onQueryStarted:', error);
          dispatch(setAuthError(error instanceof Error ? error.message : 'Login failed'));
        }
      },
      invalidatesTags: ['User'],
    }),
    
    // Logout
    logout: builder.mutation<ApiResponse, void>({
      query: () => ({
        url: '/auth/logout-jwt',
        method: 'POST',
      }),
      // Handle the response and clear the auth state
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          console.log('🚪 Logout mutation started...');
          const { data } = await queryFulfilled;
          console.log('✅ Logout API response:', data);
          
          // Clear auth state
          dispatch(logout());
          console.log('✅ User logged out, auth state cleared');
        } catch (error) {
          console.error('❌ Logout error:', error);
          // Even if API call fails, still clear the local state
          dispatch(logout());
        }
      },
      invalidatesTags: ['User'],
    }),
    
    // Validate token and get user info
    validateToken: builder.query<
      { success: boolean; message: string; user: User; redirectUrl: string; tokenRefreshed: boolean; tokens?: { accessToken: string } },
      void
    >({
      query: () => '/auth/validate',
      // Handle the response and update the auth state
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('🔑 Token validation response:', data);
          console.log('👤 User from token validation:', data.user);
          console.log('👑 User role from token:', data.user?.role);
          
          // Update auth state with user from token
          if (data.success && data.user) {
            dispatch(setAuthSuccess({ 
              user: data.user,
              // If token was refreshed, update the token
              token: data.tokenRefreshed && data.tokens ? data.tokens.accessToken : undefined
            }));
            console.log('✅ Auth state updated from token validation with role:', data.user.role);
          }
        } catch (error) {
          console.error('❌ Token validation error:', error);
          // If token validation fails, clear auth state
          dispatch(logout());
        }
      },
      providesTags: ['User'],
    }),
    
    // Refresh token
    refreshToken: builder.mutation<
      ApiResponse<{ tokens: { accessToken: string } }>,
      void
    >({
      query: () => ({
        url: '/auth/refresh-token',
        method: 'POST',
      }),
    }),
    
    // Get current user
    getCurrentUser: builder.query<{ success: boolean; message: string; user: User }, void>({
      query: () => '/auth/me',
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('👤 getCurrentUser response:', data);
          
          // Update auth state with user
          if (data.success && data.user) {
            dispatch(setAuthSuccess({ user: data.user }));
            console.log('✅ Auth state updated from getCurrentUser with role:', data.user.role);
          }
        } catch (error) {
          console.error('❌ getCurrentUser error:', error);
        }
      },
      providesTags: ['User'],
    }),
    
    // Update user profile
    updateCurrentUser: builder.mutation<
      ApiResponse<User>,
      Partial<User>
    >({
      query: (userData) => ({
        url: '/auth/me',
        method: 'PATCH',
        body: userData,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),
  }),
});

// Export actions
export const {
  setLoading,
  setAuthSuccess,
  setAuthError,
  setToken,
  updateUser,
  logout,
  clearError,
  resetAuth,
} = authSlice.actions;

// Export API hooks
export const {
  useLoginMutation,
  useLogoutMutation,
  useValidateTokenQuery,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
} = authApi;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.role;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

// Export reducer
export default authSlice.reducer;
