"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectUserRole, selectIsAuthenticated, selectAuthLoading } from '@/store/slices/authSlice';
import { useGetCurrentUserQuery } from '@/store/slices/authSlice';

/**
 * Role-based redirect configuration
 */
const ROLE_ROUTES = {
  speaker: '/speakerUser',
  organizer: '/newuser',
  participant: '/participant',
} as const;

type UserRole = keyof typeof ROLE_ROUTES;

/**
 * ProfileRedirect Component
 * 
 * A reusable component for handling role-based profile redirection.
 * Can be used in any route that needs to redirect users based on their role.
 */
interface ProfileRedirectProps {
  /**
   * Custom redirect routes (optional)
   * If not provided, uses default role routes
   */
  customRoutes?: Partial<typeof ROLE_ROUTES>;
  
  /**
   * Fallback route when role is unknown or user is not authenticated
   */
  fallbackRoute?: string;
  
  /**
   * Login route for unauthenticated users
   */
  loginRoute?: string;
  
  /**
   * Whether to show loading state
   */
  showLoading?: boolean;
  
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;
  
  /**
   * Custom error component
   */
  errorComponent?: React.ReactNode;
  
  /**
   * Callback function called before redirect
   */
  onBeforeRedirect?: (role: UserRole, route: string) => void;
  
  /**
   * Callback function called on redirect error
   */
  onRedirectError?: (error: Error) => void;
}

export default function ProfileRedirect({
  customRoutes = {},
  fallbackRoute = '/newuser',
  loginRoute = '/login',
  showLoading = true,
  loadingComponent,
  errorComponent,
  onBeforeRedirect,
  onRedirectError,
}: ProfileRedirectProps) {
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const authLoading = useSelector(selectAuthLoading);
  const [redirectError, setRedirectError] = useState<Error | null>(null);

  // Fetch current user data to ensure we have the latest role information
  const {
    data: currentUserData,
    isLoading: isUserLoading,
    error: userError,
  } = useGetCurrentUserQuery();

  // Determine if we're still loading
  const isLoading = authLoading || isUserLoading;

  // Merge custom routes with default routes
  const routes = { ...ROLE_ROUTES, ...customRoutes };

  /**
   * Get the appropriate route for a given role
   */
  const getRouteForRole = (role: UserRole): string => {
    return routes[role] || fallbackRoute;
  };

  /**
   * Handle the redirect logic
   */
  const handleRedirect = (role: UserRole) => {
    try {
      const route = getRouteForRole(role);
      
      console.log(`🔄 Redirecting user with role '${role}' to '${route}'`);
      
      // Call before redirect callback
      onBeforeRedirect?.(role, route);
      
      // Perform the redirect
      router.push(route);
    } catch (error) {
      const redirectError = error instanceof Error ? error : new Error('Unknown redirect error');
      console.error('❌ Redirect error:', redirectError);
      setRedirectError(redirectError);
      onRedirectError?.(redirectError);
    }
  };

  useEffect(() => {
    // Don't redirect if we're still loading user data
    if (isLoading) {
      return;
    }

    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log('🔒 User not authenticated, redirecting to login');
      router.push(loginRoute);
      return;
    }

    // If we have a user role, redirect based on role
    if (userRole && userRole in routes) {
      handleRedirect(userRole as UserRole);
      return;
    }

    // If no role is available, try to get it from current user data
    if (currentUserData?.user?.role && currentUserData.user.role in routes) {
      handleRedirect(currentUserData.user.role as UserRole);
      return;
    }

    // If we still don't have a valid role, redirect to fallback
    console.warn('⚠️ No valid role found, redirecting to fallback route');
    router.push(fallbackRoute);
  }, [
    isAuthenticated,
    userRole,
    isLoading,
    currentUserData,
    router,
    loginRoute,
    fallbackRoute,
    routes,
  ]);

  // Show loading state while determining redirect
  if (isLoading && showLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Profile</h2>
          <p className="text-gray-500">Determining your profile access...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an issue
  if (userError || redirectError) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    const error = userError || redirectError;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-semibold">Profile Access Error</h3>
            <p className="text-sm mt-1">
              {error?.message || 'There was an error loading your profile information.'}
            </p>
          </div>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg hover:bg-[#E55A2B] transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push(fallbackRoute)}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go to Default
            </button>
          </div>
        </div>
      </div>
    );
  }

  // This should rarely be seen as redirects happen quickly
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-8 w-8 bg-[#FF6B35] rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Redirecting...</h2>
          <p className="text-gray-500">Taking you to your profile</p>
        </div>
      </div>
    </div>
  );
}





