'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthUser } from '@/lib/hooks';

interface RoleRedirectOptions {
  allowedRoles?: string[];
  requireOnboarded?: boolean;
  redirectIfAuthenticated?: boolean;
}

interface RoleRedirectResult {
  isLoading: boolean;
  isAuthorized: boolean;
  currentRole: string | null;
  redirecting: boolean;
}

// Define route mappings for each role
const ROLE_ROUTES = {
  'individual-student': '/dashboard/student',
  'institution-admin': '/dashboard/institution',
  'corporate-user': '/dashboard/corporate'
} as const;

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth',
  '/onboarding/choose-role',
  '/onboarding/student',
  '/onboarding/institution',
  '/onboarding/corporate',
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms'
];

// Define onboarding routes
const ONBOARDING_ROUTES = [
  '/onboarding/choose-role',
  '/onboarding/student',
  '/onboarding/institution',
  '/onboarding/corporate'
];

/**
 * Custom hook for role-based routing and access control
 * 
 * @param options Configuration options for the redirect behavior
 * @returns Object containing loading state, authorization status, and current role
 */
export function useRoleRedirect(options: RoleRedirectOptions = {}): RoleRedirectResult {
  const {
    allowedRoles = [],
    requireOnboarded = true,
    redirectIfAuthenticated = false
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading: authLoading } = useAuthUser();
  const [redirecting, setRedirecting] = useState(false);

  const isLoading = authLoading || redirecting;
  const currentRole = profile?.role || null;
  const isAuthenticated = !!user;
  const isOnboarded = profile?.onboarded || false;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isOnboardingRoute = ONBOARDING_ROUTES.includes(pathname);

  // Determine if user is authorized for current route
  const isAuthorized = useMemo(() => {
    if (isPublicRoute) return true;
    if (!isAuthenticated) return false;
    if (requireOnboarded && !isOnboarded) return isOnboardingRoute;
    if (allowedRoles.length > 0 && currentRole && !allowedRoles.includes(currentRole)) return false;
    return true;
  }, [isPublicRoute, isAuthenticated, isOnboarded, isOnboardingRoute, allowedRoles, currentRole, requireOnboarded]);

  useEffect(() => {
    // Don't redirect while still loading auth state
    if (authLoading) return;

    const performRedirect = (path: string, reason?: string) => {
      if (pathname !== path) {
        setRedirecting(true);
        console.log(`Redirecting to ${path}${reason ? ` - ${reason}` : ''}`);
        router.push(path);
        // Reset redirecting state after a delay to prevent flicker
        setTimeout(() => setRedirecting(false), 1000);
      }
    };

    // Handle unauthenticated users
    if (!isAuthenticated) {
      if (!isPublicRoute) {
        performRedirect('/auth', 'User not authenticated');
      }
      return;
    }

    // Handle authenticated users on auth page
    if (redirectIfAuthenticated && pathname === '/auth' && isAuthenticated) {
      if (!profile) {
        performRedirect('/onboarding/choose-role', 'No user profile found');
        return;
      }
      
      if (!isOnboarded) {
        performRedirect('/onboarding/choose-role', 'User not onboarded');
        return;
      }

      // Redirect to appropriate dashboard based on role
      const dashboardRoute = ROLE_ROUTES[currentRole as keyof typeof ROLE_ROUTES];
      if (dashboardRoute) {
        performRedirect(dashboardRoute, `Redirecting ${currentRole} to dashboard`);
      } else {
        performRedirect('/onboarding/choose-role', 'Unknown user role');
      }
      return;
    }

    // Handle users without profile
    if (isAuthenticated && !profile && !isOnboardingRoute && !isPublicRoute) {
      performRedirect('/onboarding/choose-role', 'No user profile found');
      return;
    }

    // Handle users who haven't completed onboarding
    if (isAuthenticated && profile && !isOnboarded && !isOnboardingRoute && !isPublicRoute) {
      performRedirect('/onboarding/choose-role', 'User onboarding incomplete');
      return;
    }

    // Handle role-based access control
    if (isAuthenticated && profile && isOnboarded && allowedRoles.length > 0) {
      if (currentRole && !allowedRoles.includes(currentRole)) {
        // Redirect to user's appropriate dashboard
        const dashboardRoute = ROLE_ROUTES[currentRole as keyof typeof ROLE_ROUTES];
        if (dashboardRoute) {
          performRedirect(dashboardRoute, `Role ${currentRole} not authorized for this route`);
        } else {
          performRedirect('/onboarding/choose-role', 'Unknown user role');
        }
        return;
      }
    }

    // Handle completed onboarding users on onboarding routes
    if (isAuthenticated && profile && isOnboarded && isOnboardingRoute) {
      const dashboardRoute = ROLE_ROUTES[currentRole as keyof typeof ROLE_ROUTES];
      if (dashboardRoute) {
        performRedirect(dashboardRoute, 'User already onboarded');
      }
      return;
    }

  }, [
    authLoading,
    isAuthenticated,
    profile,
    isOnboarded,
    pathname,
    currentRole,
    allowedRoles,
    requireOnboarded,
    redirectIfAuthenticated,
    isPublicRoute,
    isOnboardingRoute,
    router
  ]);

  return {
    isLoading,
    isAuthorized,
    currentRole,
    redirecting
  };
}

/**
 * Hook specifically for protecting dashboard routes
 * Automatically redirects unauthorized users
 */
export function useDashboardProtection(allowedRoles: string[]) {
  return useRoleRedirect({
    allowedRoles,
    requireOnboarded: true
  });
}

/**
 * Hook for protecting onboarding routes
 * Allows authenticated users who haven't completed onboarding
 */
export function useOnboardingProtection() {
  return useRoleRedirect({
    requireOnboarded: false
  });
}

/**
 * Hook for auth page behavior
 * Redirects authenticated users to appropriate dashboard
 */
export function useAuthPageRedirect() {
  return useRoleRedirect({
    redirectIfAuthenticated: true
  });
}

/**
 * Higher-order component for route protection
 */
export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: RoleRedirectOptions = {}
) {
  return function ProtectedComponent(props: P) {
    const { isLoading, isAuthorized } = useRoleRedirect(options);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-border"></div>
            <div className="absolute inset-0 rounded-full border-2 border-slate-700"></div>
          </div>
        </div>
      );
    }

    if (!isAuthorized) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-slate-300">You don't have permission to view this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Helper function to get dashboard route for a role
export function getDashboardRoute(role: string): string {
  return ROLE_ROUTES[role as keyof typeof ROLE_ROUTES] || '/onboarding/choose-role';
}

// Helper function to check if a route is public
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.includes(path);
}

// Helper function to check if a route is an onboarding route
export function isOnboardingRoute(path: string): boolean {
  return ONBOARDING_ROUTES.includes(path);
}