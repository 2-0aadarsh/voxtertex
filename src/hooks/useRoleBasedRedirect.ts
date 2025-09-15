"use client";

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectUserRole, selectIsAuthenticated, selectAuthLoading } from '@/store/slices/authSlice';
import { useGetCurrentUserQuery } from '@/store/slices/authSlice';

/**
 * Role-based redirect configuration
 */
export const ROLE_ROUTES = {
  speaker: '/speakerUser',
  organizer: '/newuser',
  participant: '/participant',
} as const;

export type UserRole = keyof typeof ROLE_ROUTES;

/**
 * Hook for role-based redirection
 * 
 * @param options Configuration options for the redirect behavior
 * @returns Object containing redirect state and methods
 */
interface UseRoleBasedRedirectOptions {
  /**
   * Custom redirect routes (optional)
   */
  customRoutes?: Partial<typeof ROLE_ROUTES>;
  
  /**
   * Fallback route when role is unknown
   */
  fallbackRoute?: string;
  
  /**
   * Login route for unauthenticated users
   */
  loginRoute?: string;
  
  /**
   * Whether to automatically redirect on mount
   */
  autoRedirect?: boolean;
  
  /**
   * Callback function called before redirect
   */
  onBeforeRedirect?: (role: UserRole, route: string) => void;
  
  /**
   * Callback function called on redirect error
   */
  onRedirectError?: (error: Error) => void;
}

interface UseRoleBasedRedirectReturn {
  /**
   * Current user role
   */
  userRole: UserRole | null;
  
  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;
  
  /**
   * Whether the redirect is loading
   */
  isLoading: boolean;
  
  /**
   * Any error that occurred during redirect
   */
  error: Error | null;
  
  /**
   * Manually trigger a redirect based on current role
   */
  redirect: () => void;
  
  /**
   * Get the appropriate route for a given role
   */
  getRouteForRole: (role: UserRole) => string;
  
  /**
   * Check if a role has a valid route
   */
  hasValidRoute: (role: UserRole) => boolean;
}

export function useRoleBasedRedirect(
  options: UseRoleBasedRedirectOptions = {}
): UseRoleBasedRedirectReturn {
  const {
    customRoutes = {},
    fallbackRoute = '/newuser',
    loginRoute = '/login',
    autoRedirect = true,
    onBeforeRedirect,
    onRedirectError,
  } = options;

  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const authLoading = useSelector(selectAuthLoading);

  // Fetch current user data
  const {
    data: currentUserData,
    isLoading: isUserLoading,
    error: userError,
  } = useGetCurrentUserQuery();

  // Merge custom routes with default routes
  const routes = { ...ROLE_ROUTES, ...customRoutes };

  /**
   * Get the appropriate route for a given role
   */
  const getRouteForRole = useCallback((role: UserRole): string => {
    return routes[role] || fallbackRoute;
  }, [routes, fallbackRoute]);

  /**
   * Check if a role has a valid route
   */
  const hasValidRoute = useCallback((role: UserRole): boolean => {
    return role in routes;
  }, [routes]);

  /**
   * Perform the redirect
   */
  const redirect = useCallback(() => {
    try {
      // If user is not authenticated, redirect to login
      if (!isAuthenticated) {
        console.log('🔒 User not authenticated, redirecting to login');
        router.push(loginRoute);
        return;
      }

      // Determine the role to use
      let roleToUse: UserRole | null = null;

      if (userRole && hasValidRoute(userRole as UserRole)) {
        roleToUse = userRole as UserRole;
      } else if (currentUserData?.user?.role && hasValidRoute(currentUserData.user.role as UserRole)) {
        roleToUse = currentUserData.user.role as UserRole;
      }

      if (roleToUse) {
        const route = getRouteForRole(roleToUse);
        console.log(`🔄 Redirecting user with role '${roleToUse}' to '${route}'`);
        
        // Call before redirect callback
        onBeforeRedirect?.(roleToUse, route);
        
        // Perform the redirect
        router.push(route);
      } else {
        console.warn('⚠️ No valid role found, redirecting to fallback route');
        router.push(fallbackRoute);
      }
    } catch (error) {
      const redirectError = error instanceof Error ? error : new Error('Unknown redirect error');
      console.error('❌ Redirect error:', redirectError);
      onRedirectError?.(redirectError);
    }
  }, [
    isAuthenticated,
    userRole,
    currentUserData,
    hasValidRoute,
    getRouteForRole,
    router,
    loginRoute,
    fallbackRoute,
    onBeforeRedirect,
    onRedirectError,
  ]);

  // Auto-redirect on mount if enabled
  useEffect(() => {
    if (autoRedirect && !authLoading && !isUserLoading) {
      redirect();
    }
  }, [autoRedirect, authLoading, isUserLoading, redirect]);

  return {
    userRole: userRole as UserRole | null,
    isAuthenticated,
    isLoading: authLoading || isUserLoading,
    error: userError || null,
    redirect,
    getRouteForRole,
    hasValidRoute,
  };
}

/**
 * Simplified hook for basic role-based redirect
 * 
 * @param customRoutes Optional custom routes
 * @returns Redirect function
 */
export function useSimpleRoleRedirect(customRoutes?: Partial<typeof ROLE_ROUTES>) {
  const { redirect, userRole, isLoading } = useRoleBasedRedirect({
    customRoutes,
    autoRedirect: false,
  });

  return {
    redirect,
    userRole,
    isLoading,
  };
}





