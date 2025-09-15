import { cookies } from 'next/headers';
import { User } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Get current user (server-side only)
 * This function can only be used in Server Components
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        'Cookie': `accessToken=${accessToken.value}`,
      },
      // Disable caching for auth requests
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Check if user is authenticated (server-side only)
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};

/**
 * Get user with cookie header (for API routes)
 */
export const getUserFromCookies = async (cookieHeader: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Get user from cookies error:', error);
    return null;
  }
};


















