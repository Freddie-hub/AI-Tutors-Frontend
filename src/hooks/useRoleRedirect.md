# useRoleRedirect Hook Documentation

A comprehensive role-based routing and access control system for Learning.ai built with Firebase Auth and Firestore.

## 🚀 Features

- **Automatic Role Detection** - Reads user role from Firestore
- **Smart Redirects** - Routes users based on authentication state and role
- **Onboarding Flow** - Handles incomplete onboarding states
- **Access Control** - Protects routes based on user roles
- **Loading States** - Manages loading states during auth checks
- **Higher-Order Components** - Provides HOC for route protection

## 📁 File Location

```
src/hooks/useRoleRedirect.tsx
```

## 🔧 Available Hooks

### 1. `useRoleRedirect(options)`
Main hook for role-based routing with configurable options.

```typescript
const { isLoading, isAuthorized, currentRole, redirecting } = useRoleRedirect({
  allowedRoles: ['individual-student', 'institution-admin'],
  requireOnboarded: true,
  redirectIfAuthenticated: false
});
```

### 2. `useDashboardProtection(allowedRoles)`
Specialized hook for protecting dashboard routes.

```typescript
const { isLoading } = useDashboardProtection(['individual-student']);
```

### 3. `useOnboardingProtection()`
Hook for protecting onboarding routes (allows non-onboarded users).

```typescript
const { isLoading } = useOnboardingProtection();
```

### 4. `useAuthPageRedirect()`
Hook for auth page that redirects authenticated users to their dashboard.

```typescript
const { isLoading } = useAuthPageRedirect();
```

## 🎯 Usage Examples

### Protecting Dashboard Routes

```typescript
// src/app/dashboard/student/page.tsx
'use client';

import { useDashboardProtection } from '@/hooks/useRoleRedirect';
import { useAuthUser } from '@/lib/hooks';

export default function StudentDashboard() {
  const { isLoading } = useDashboardProtection(['individual-student']);
  const { user, profile } = useAuthUser();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1>Welcome {profile?.displayName}!</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### Auth Page with Auto-Redirect

```typescript
// src/app/auth/page.tsx
'use client';

import { useAuthPageRedirect } from '@/hooks/useRoleRedirect';

export default function AuthPage() {
  const { isLoading } = useAuthPageRedirect();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Auth form - users get redirected automatically after login */}
    </div>
  );
}
```

### Onboarding Routes

```typescript
// src/app/onboarding/choose-role/page.tsx
'use client';

import { useOnboardingProtection } from '@/hooks/useRoleRedirect';

export default function ChooseRolePage() {
  const { isLoading } = useOnboardingProtection();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Role selection form */}
    </div>
  );
}
```

### Using Higher-Order Component

```typescript
// Alternative approach using HOC
import { withRoleProtection } from '@/hooks/useRoleRedirect';

function AdminPanel() {
  return <div>Admin content</div>;
}

export default withRoleProtection(AdminPanel, {
  allowedRoles: ['institution-admin'],
  requireOnboarded: true
});
```

## 🔄 Routing Logic

### Route Mappings
```typescript
const ROLE_ROUTES = {
  'individual-student': '/dashboard/student',
  'institution-admin': '/dashboard/institution',
  'corporate-user': '/dashboard/corporate'
};
```

### Public Routes (No Auth Required)
- `/auth`
- `/onboarding/*`
- `/`
- `/about`
- `/contact`
- `/privacy`
- `/terms`

### Redirect Flow

1. **Unauthenticated User** → `/auth`
2. **Authenticated, No Profile** → `/onboarding/choose-role`
3. **Authenticated, Not Onboarded** → `/onboarding/choose-role`
4. **Authenticated, Onboarded** → Role-specific dashboard
5. **Wrong Role for Route** → Correct dashboard for their role

## 🛡️ Access Control Options

### `allowedRoles`
Array of roles that can access the route.
```typescript
allowedRoles: ['individual-student', 'institution-admin']
```

### `requireOnboarded`
Whether the user must have completed onboarding.
```typescript
requireOnboarded: true  // Default
requireOnboarded: false // For onboarding routes
```

### `redirectIfAuthenticated`
Whether to redirect authenticated users (useful for auth pages).
```typescript
redirectIfAuthenticated: true  // For auth page
redirectIfAuthenticated: false // Default
```

## 📊 Return Values

### `useRoleRedirect` Returns:
```typescript
{
  isLoading: boolean;      // Auth state loading
  isAuthorized: boolean;   // User authorized for current route
  currentRole: string | null; // User's role from Firestore
  redirecting: boolean;    // Currently redirecting
}
```

## 🔧 Helper Functions

### `getDashboardRoute(role)`
Get the dashboard route for a specific role.
```typescript
const dashboardRoute = getDashboardRoute('individual-student');
// Returns: '/dashboard/student'
```

### `isPublicRoute(path)`
Check if a route is public.
```typescript
const isPublic = isPublicRoute('/auth'); // true
```

### `isOnboardingRoute(path)`
Check if a route is an onboarding route.
```typescript
const isOnboarding = isOnboardingRoute('/onboarding/student'); // true
```

## 🚨 Error Handling

The hook provides automatic error handling:
- **Loading States** - Shows loading spinner during auth checks
- **Unauthorized Access** - Shows access denied page
- **Automatic Redirects** - Seamlessly redirects users to correct routes
- **Console Logging** - Logs redirect reasons for debugging

## 🔍 Debugging

The hook logs all redirects with reasons:
```
Redirecting to /dashboard/student - User role: individual-student
Redirecting to /auth - User not authenticated
Redirecting to /onboarding/choose-role - User not onboarded
```

## 🎛️ Configuration

### Adding New Roles
Update the `ROLE_ROUTES` constant:
```typescript
const ROLE_ROUTES = {
  'individual-student': '/dashboard/student',
  'institution-admin': '/dashboard/institution',
  'corporate-user': '/dashboard/corporate',
  'new-role': '/dashboard/new-role'  // Add new role
};
```

### Adding New Public Routes
Update the `PUBLIC_ROUTES` array:
```typescript
const PUBLIC_ROUTES = [
  '/auth',
  '/onboarding/choose-role',
  // ... existing routes
  '/new-public-route'  // Add new public route
];
```

This system provides comprehensive, secure, and user-friendly role-based routing for the Learning.ai platform!