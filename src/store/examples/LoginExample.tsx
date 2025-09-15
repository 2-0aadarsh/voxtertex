// ============================================================================
// LOGIN EXAMPLE - How to use the Redux store with authentication
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

// Import our custom hooks and API
import { useAuth } from '../hooks';
import { useLoginMutation } from '../slices/authSlice';

export default function LoginExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  
  // Use our custom auth hook
  const { user, isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  
  // Use RTK Query mutation for login
  const [loginUser, { 
    isLoading: loginLoading, 
    isSuccess: loginSuccess, 
    isError: loginError, 
    error: loginErrorData 
  }] = useLoginMutation();

  const isFormValid = email.trim() !== '' && password.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Handle login
  const handleLogin = async () => {
    if (!isFormValid) return;

    try {
      const result = await loginUser({
        email: email.trim(),
        password: password.trim(),
      }).unwrap();

      console.log('Login successful:', result);
      
      // The auth slice will automatically update the state
      // Redirect to dashboard after successful login
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      console.error('Login failed:', error);
      // Error is automatically handled by RTK Query and stored in state
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid && !loginLoading) {
      handleLogin();
    }
  };

  // Show success state
  if (loginSuccess) {
    return (
      <div className="h-screen flex overflow-hidden">
        <div className="w-full bg-white flex flex-col justify-center items-center px-12">
          <div className="w-full max-w-lg text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            </motion.div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-500 text-sm mb-6">Login successful!</p>
            <p className="text-gray-400 text-xs">Redirecting to your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="w-full bg-white flex flex-col justify-center items-center px-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-500 text-sm">Login to your account</p>
            {user && (
              <p className="text-green-600 text-sm mt-2">
                Logged in as: {user.firstName} {user.lastName}
              </p>
            )}
          </div>

          {/* Error Message */}
          {(loginError || authError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800">
                  {loginErrorData ? 
                    ('data' in loginErrorData ? 
                      (loginErrorData.data as any)?.message || 'Login failed' 
                      : 'Network error') 
                    : authError || 'Login failed'}
                </p>
              </div>
            </motion.div>
          )}

          <div className="space-y-4" onKeyPress={handleKeyPress}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-sm transition-colors ${
                  email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                required
                disabled={loginLoading}
              />
              {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                <p className="text-xs text-red-600 mt-1">Please enter a valid email address</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-sm"
                  required
                  disabled={loginLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={loginLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={!isFormValid || loginLoading || authLoading}
              className={`w-full py-3 px-4 rounded-md font-medium text-white transition-all duration-200 text-sm ${
                isFormValid && !loginLoading && !authLoading
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loginLoading || authLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </div>
              ) : (
                'Log in'
              )}
            </button>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/signup')}
                  className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors"
                  disabled={loginLoading}
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>

          {/* Debug Information (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-gray-100 rounded-md text-xs">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              <pre className="text-xs">
                {JSON.stringify({
                  isAuthenticated,
                  userRole: user?.role,
                  loginLoading,
                  authLoading,
                  hasError: loginError || authError,
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




