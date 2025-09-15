# Role-Based Profile Routing Implementation

This document provides a comprehensive guide for implementing role-based profile routing in your web application. The system automatically redirects users to the appropriate profile page based on their role stored in the Redux store.

## Overview

The role-based routing system supports three user roles:
- **speaker** → redirects to `/speakerUser`
- **organizer** → redirects to `/newuser`
- **participant** → redirects to `/participant`

## Implementation Options

### 1. Simple Page Component (Recommended for most cases)

Use the `/profile` page component for automatic redirects:

```typescript
// src/app/profile/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectUserRole, selectIsAuthenticated } from '@/store/slices/authSlice';

export default function ProfilePage() {
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    switch (userRole) {
      case 'speaker':
        router.push('/speakerUser');
        break;
      case 'organizer':
        router.push('/newuser');
        break;
      case 'participant':
        router.push('/participant');
        break;
      default:
        router.push('/newuser'); // fallback
    }
  }, [isAuthenticated, userRole, router]);

  return <div>Redirecting...</div>;
}
```

### 2. Reusable Component

Use the `ProfileRedirect` component for more control:

```typescript
import ProfileRedirect from '@/components/ProfileRedirect';

function MyPage() {
  return (
    <ProfileRedirect
      customRoutes={{
        speaker: '/speakerUser',
        organizer: '/newuser',
        participant: '/participant',
      }}
      fallbackRoute="/newuser"
      onBeforeRedirect={(role, route) => {
        console.log(`Redirecting ${role} to ${route}`);
      }}
    />
  );
}
```

### 3. Custom Hook

Use the `useRoleBasedRedirect` hook for manual control:

```typescript
import { useRoleBasedRedirect } from '@/hooks/useRoleBasedRedirect';

function MyComponent() {
  const { userRole, redirect, isLoading } = useRoleBasedRedirect({
    autoRedirect: false,
  });

  const handleRedirect = () => {
    redirect();
  };

  return (
    <div>
      <p>Current role: {userRole}</p>
      <button onClick={handleRedirect}>Go to Profile</button>
    </div>
  );
}
```

### 4. Server-Side Middleware

For server-side redirects, use the Next.js middleware:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROLE_ROUTES = {
  speaker: '/speakerUser',
  organizer: '/newuser',
  participant: '/participant',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname !== '/profile') {
    return NextResponse.next();
  }

  const userRole = request.cookies.get('userRole')?.value;
  
  if (userRole && userRole in ROLE_ROUTES) {
    return NextResponse.redirect(
      new URL(ROLE_ROUTES[userRole], request.url)
    );
  }

  return NextResponse.redirect(new URL('/newuser', request.url));
}
```

## Configuration Options

### Custom Routes

You can customize the redirect routes for different roles:

```typescript
const customRoutes = {
  speaker: '/speaker/dashboard',
  organizer: '/organizer/panel',
  participant: '/participant/profile',
};
```

### Fallback Routes

Set custom fallback routes for unknown roles:

```typescript
<ProfileRedirect fallbackRoute="/dashboard" />
```

### Login Routes

Customize the login redirect:

```typescript
<ProfileRedirect loginRoute="/auth/login" />
```

## Error Handling

The system includes comprehensive error handling:

```typescript
<ProfileRedirect
  onRedirectError={(error) => {
    console.error('Redirect failed:', error);
    // Handle error (e.g., show notification, log to analytics)
  }}
  errorComponent={<CustomErrorComponent />}
/>
```

## Loading States

Customize loading states:

```typescript
<ProfileRedirect
  showLoading={true}
  loadingComponent={<CustomLoadingSpinner />}
/>
```

## Integration with Redux

The system integrates seamlessly with your Redux store:

```typescript
import { useSelector } from 'react-redux';
import { selectUserRole, selectIsAuthenticated } from '@/store/slices/authSlice';

function MyComponent() {
  const userRole = useSelector(selectUserRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // Use role for conditional rendering
  if (userRole === 'speaker') {
    return <SpeakerContent />;
  }
  
  return <DefaultContent />;
}
```

## Best Practices

### 1. Consistent Route Structure

Maintain consistent route patterns:
- `/speakerUser` for speakers
- `/newuser` for organizers  
- `/participant` for participants

### 2. Error Boundaries

Wrap redirect components in error boundaries:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<ErrorFallback />}>
  <ProfileRedirect />
</ErrorBoundary>
```

### 3. Analytics Integration

Track redirect events:

```typescript
<ProfileRedirect
  onBeforeRedirect={(role, route) => {
    analytics.track('profile_redirect', {
      role,
      route,
      timestamp: new Date().toISOString(),
    });
  }}
/>
```

### 4. Testing

Test different role scenarios:

```typescript
// Test with different roles
const testRoles = ['speaker', 'organizer', 'participant'];

testRoles.forEach(role => {
  test(`redirects ${role} to correct route`, () => {
    // Mock Redux store with role
    // Verify redirect behavior
  });
});
```

## Troubleshooting

### Common Issues

1. **Infinite Redirect Loop**
   - Ensure the target routes don't redirect back to `/profile`
   - Check for circular dependencies in route definitions

2. **Role Not Found**
   - Verify the role is properly stored in Redux
   - Check that the role matches the expected values exactly

3. **Authentication Issues**
   - Ensure the user is properly authenticated before redirect
   - Verify JWT token is valid and not expired

### Debug Mode

Enable debug logging:

```typescript
<ProfileRedirect
  onBeforeRedirect={(role, route) => {
    console.log(`[DEBUG] Redirecting ${role} to ${route}`);
  }}
/>
```

## Performance Considerations

- The redirect happens client-side for better UX
- Use server-side middleware for SEO-critical redirects
- Implement proper loading states to prevent flash of content
- Cache role information to avoid repeated API calls

## Security Considerations

- Always validate roles on the server side
- Use HTTPS for all redirects
- Implement proper authentication checks
- Sanitize route parameters to prevent injection attacks

## Migration Guide

If migrating from an existing system:

1. Update route definitions to match new structure
2. Test all role combinations
3. Update any hardcoded route references
4. Implement proper error handling
5. Add analytics tracking for redirect events

This implementation provides a robust, maintainable solution for role-based profile routing that integrates seamlessly with your existing Redux store and Next.js application.





