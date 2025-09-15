// Removed cookies import - will be handled in server components separately

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'speaker' | 'organizer' | 'participant';
  isEmailVerified: boolean;
  isProfileComplete: boolean;
  signupComplete: boolean;
  profileImage?: {
    data: Buffer;
    contentType: string;
  };
  bio?: string;
  professionalTitle?: string;
  location?: string;
  profile?: {
    id: string;
    isComplete: boolean;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  redirectUrl: string;
  tokens: {
    accessToken: string;
  };
}

export interface AuthValidationResponse {
  success: boolean;
  message: string;
  user: User;
  redirectUrl: string;
  tokenRefreshed: boolean;
}

/**
 * Login with email and password
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login-jwt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for cookies
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/logout-jwt`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    console.error('Logout failed');
  }
};

/**
 * Validate current token and get user info
 */
export const validateToken = async (): Promise<AuthValidationResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/validate`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Token validation failed');
  }

  return data;
};

/**
 * Refresh access token
 */
export const refreshToken = async (): Promise<{ success: boolean; tokens: { accessToken: string } }> => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Token refresh failed');
  }

  return data;
};

// Server-side functions moved to separate file

/**
 * Get redirect URL based on user role (skip profile completion check)
 */
export const getRedirectUrl = (user: User): string => {
  switch (user.role) {
    case 'speaker':
      return '/speakerUser';
    case 'organizer':
      return '/newuser';
    case 'participant':
      return '/participant';
    default:
      return '/dashboard';
  }
};
