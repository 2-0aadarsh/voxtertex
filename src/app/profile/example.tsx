"use client";

import { useState } from 'react';
import ProfileRedirect from '@/components/ProfileRedirect';
import { useRoleBasedRedirect, useSimpleRoleRedirect } from '@/hooks/useRoleBasedRedirect';

/**
 * Example Usage of Role-Based Profile Redirects
 * 
 * This file demonstrates various ways to implement role-based redirects
 * in your application. Choose the approach that best fits your needs.
 */

// Example 1: Using the ProfileRedirect component
export function ExampleWithComponent() {
  return (
    <ProfileRedirect
      customRoutes={{
        speaker: '/speakerUser',
        organizer: '/newuser',
        participant: '/participant',
      }}
      fallbackRoute="/newuser"
      loginRoute="/login"
      onBeforeRedirect={(role, route) => {
        console.log(`Redirecting ${role} to ${route}`);
      }}
      onRedirectError={(error) => {
        console.error('Redirect failed:', error);
      }}
    />
  );
}

// Example 2: Using the useRoleBasedRedirect hook
export function ExampleWithHook() {
  const { userRole, isLoading, redirect, getRouteForRole } = useRoleBasedRedirect({
    customRoutes: {
      speaker: '/speakerUser',
      organizer: '/newuser',
      participant: '/participant',
    },
    autoRedirect: false, // Manual redirect
    onBeforeRedirect: (role, route) => {
      console.log(`About to redirect ${role} to ${route}`);
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Role-Based Redirect Example</h2>
      <p className="mb-4">Current role: {userRole || 'None'}</p>
      <button
        onClick={redirect}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Redirect to Profile
      </button>
    </div>
  );
}

// Example 3: Using the simple hook for manual redirects
export function ExampleWithSimpleHook() {
  const { redirect, userRole, isLoading } = useSimpleRoleRedirect({
    speaker: '/speakerUser',
    organizer: '/newuser',
    participant: '/participant',
  });

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Simple Redirect Example</h2>
      <p className="mb-4">Role: {userRole || 'Loading...'}</p>
      <button
        onClick={redirect}
        disabled={isLoading}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Go to Profile'}
      </button>
    </div>
  );
}

// Example 4: Custom redirect logic with role checking
export function ExampleWithCustomLogic() {
  const { userRole, isLoading, getRouteForRole, hasValidRoute } = useRoleBasedRedirect({
    autoRedirect: false,
  });

  const [redirectStatus, setRedirectStatus] = useState<string>('');

  const handleCustomRedirect = () => {
    if (!userRole) {
      setRedirectStatus('No role available');
      return;
    }

    if (!hasValidRoute(userRole)) {
      setRedirectStatus(`No route configured for role: ${userRole}`);
      return;
    }

    const route = getRouteForRole(userRole);
    setRedirectStatus(`Would redirect to: ${route}`);
    
    // You could add additional logic here before redirecting
    // For example, analytics tracking, confirmation dialogs, etc.
  };

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Custom Redirect Logic</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Current Role:</p>
          <p className="font-medium">{userRole || 'None'}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Has Valid Route:</p>
          <p className="font-medium">{hasValidRoute(userRole!) ? 'Yes' : 'No'}</p>
        </div>
        
        {userRole && hasValidRoute(userRole) && (
          <div>
            <p className="text-sm text-gray-600">Target Route:</p>
            <p className="font-medium">{getRouteForRole(userRole)}</p>
          </div>
        )}
        
        <button
          onClick={handleCustomRedirect}
          className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Check Redirect
        </button>
        
        {redirectStatus && (
          <div className="p-3 bg-gray-100 rounded text-sm">
            {redirectStatus}
          </div>
        )}
      </div>
    </div>
  );
}

// Example 5: Role-based conditional rendering
export function ExampleWithConditionalRendering() {
  const { userRole, isLoading } = useRoleBasedRedirect({ autoRedirect: false });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Role-Based Content</h2>
      
      {userRole === 'speaker' && (
        <div className="bg-orange-100 border border-orange-300 rounded p-4">
          <h3 className="font-semibold text-orange-800">Speaker Dashboard</h3>
          <p className="text-orange-700">Welcome to your speaker profile!</p>
        </div>
      )}
      
      {userRole === 'organizer' && (
        <div className="bg-blue-100 border border-blue-300 rounded p-4">
          <h3 className="font-semibold text-blue-800">Organizer Dashboard</h3>
          <p className="text-blue-700">Welcome to your organizer profile!</p>
        </div>
      )}
      
      {userRole === 'participant' && (
        <div className="bg-green-100 border border-green-300 rounded p-4">
          <h3 className="font-semibold text-green-800">Participant Dashboard</h3>
          <p className="text-green-700">Welcome to your participant profile!</p>
        </div>
      )}
      
      {!userRole && (
        <div className="bg-gray-100 border border-gray-300 rounded p-4">
          <h3 className="font-semibold text-gray-800">No Role Assigned</h3>
          <p className="text-gray-700">Please contact support to assign a role.</p>
        </div>
      )}
    </div>
  );
}





