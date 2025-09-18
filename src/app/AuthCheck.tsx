'use client';

import { useEffect, useState } from 'react';
import { useValidateTokenQuery, useGetCurrentUserQuery } from '@/store/slices/authSlice';
import { useAuth } from '@/store/hooks';
import { setAuthSuccess } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';

/**
 * AuthCheck component that automatically validates the user's token
 * and updates the auth state when the app loads
 */
export default function AuthCheck() {
  const dispatch = useAppDispatch();
  const [directApiCalled, setDirectApiCalled] = useState(false);
  
  // Use RTK Query to validate token and get current user
  const { data: tokenData, isLoading: tokenLoading, isError: tokenError, error: tokenErrorData } = useValidateTokenQuery();
  const { data: userData, isLoading: userLoading } = useGetCurrentUserQuery(undefined, {
    // Only fetch user data if token validation was successful
    skip: !tokenData?.success
  });
  
  // Get auth state from Redux
  const auth = useAuth();

  // Make a direct API call if needed
  useEffect(() => {
    const makeDirectApiCall = async () => {
      if (!auth.user && !directApiCalled && !tokenLoading && !userLoading) {
        try {
          console.log('🔍 Making direct API call to /api/auth/validate...');
          setDirectApiCalled(true);
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/validate`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          const data = await response.json();
          console.log('📡 Direct API validate response:', data);
          
          if (data.success && data.user) {
            console.log('👑 Direct API user role:', data.user.role);
            dispatch(setAuthSuccess({ 
              user: data.user,
              token: data.tokens?.accessToken 
            }));
            
            // Note: userRole cookie is set by backend, not frontend to avoid hydration issues
            // The role is stored in Redux state for client-side access
            
            console.log('✅ Auth state manually updated with user from direct API call');
          }
        } catch (error) {
          console.error('❌ Direct API call failed:', error);
        }
      }
    };
    
    makeDirectApiCall();
  }, [auth.user, directApiCalled, tokenLoading, userLoading, dispatch]);

  // Debug token validation and user data
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 AuthCheck running...');
      
      if (tokenData) {
        console.log('🔐 Token validation response:', tokenData);
        if (tokenData.user) {
          console.log('👤 User from token:', tokenData.user);
          console.log('👑 User role from token:', tokenData.user.role);
        }
      }
      
      if (userData) {
        console.log('👤 Current user data:', userData);
        if (userData.user) {
          console.log('👑 User role from API:', userData.user.role);
        }
      }
      
      if (tokenError) {
        console.error('❌ Token validation failed:', tokenErrorData);
      }
      
      // Log current auth state
      console.log('🔒 Current auth state:', {
        isAuthenticated: auth.isAuthenticated,
        user: auth.user,
        role: auth.user?.role
      });
    }
  }, [tokenData, userData, tokenError, tokenErrorData, auth]);

  // This component doesn't render anything
  return null;
}
