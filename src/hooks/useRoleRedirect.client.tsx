'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
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

const ROLE_ROUTES = {
  'individual-student': '/dashboard/student',
  'institution-student': '/dashboard/student',
  'institution-admin': '/dashboard/institution',
  'upskill-individual': '/dashboard/upskilling',
  'teacher': '/dashboard/teacher/cbc',
  // 'corporate-user': '/dashboard/corporate', // not currently a supported role in UserRole
} as const;

const PUBLIC_ROUTES = ['/', '/auth', '/about', '/contact', '/privacy', '/terms'];

const ONBOARDING_ROUTES = [
  '/onboarding/choose-role',
  '/onboarding/student',
  '/onboarding/institution',
  '/onboarding/upskill',
  '/onboarding/teacher',
];

const ROLE_ONBOARDING_ROUTE: Record<string, string> = {
  'individual-student': '/onboarding/student',
  'institution-student': '/onboarding/student',
  'institution-admin': '/onboarding/institution',
  'upskill-individual': '/onboarding/upskill',
  'teacher': '/onboarding/teacher',
};

export function useRoleRedirect(options: RoleRedirectOptions = {}): RoleRedirectResult {
  const {
    allowedRoles = [],
    requireOnboarded = true,
    redirectIfAuthenticated = false,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading: authLoading, error: profileError } = useAuthUser();
  const [redirecting, setRedirecting] = useState(false);
  const redirectAttemptRef = useRef<string | null>(null);

  const hasProfileError = !!profileError;
  const isLoading = authLoading || redirecting;
  const currentRole = profile?.role || null;
  const isAuthenticated = !!user;
  const isOnboarded = profile?.onboarded || false;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isOnboardingRoute = ONBOARDING_ROUTES.includes(pathname);

  const isAuthorized = useMemo(() => {
    // During auth loading, consider authorized to prevent premature redirects
    if (authLoading) return true;
    if (isPublicRoute) return true;
    if (!isAuthenticated) return false;
    if (requireOnboarded && !isOnboarded) return isOnboardingRoute;
    if (allowedRoles.length > 0 && currentRole && !allowedRoles.includes(currentRole)) return false;
    return true;
  }, [
    authLoading,
    isPublicRoute,
    isAuthenticated,
    isOnboarded,
    isOnboardingRoute,
    allowedRoles,
    currentRole,
    requireOnboarded,
  ]);

  // Reset redirect attempt when pathname or user changes
  useEffect(() => {
    redirectAttemptRef.current = null;
    setRedirecting(false);
  }, [pathname, user?.uid]);

  useEffect(() => {
    // Don't run redirect logic during initial auth check or if already redirecting
    if (authLoading || redirecting) return;

    const performRedirect = (path: string, reason?: string) => {
      if (pathname === path) return; // Already on target page
      
      // Prevent duplicate redirects to the same destination
      const redirectKey = `${pathname}->${path}`;
      if (redirectAttemptRef.current === redirectKey) {
        return;
      }
      
      redirectAttemptRef.current = redirectKey;
      setRedirecting(true);
      console.log(`Redirecting to ${path}${reason ? ` - ${reason}` : ''}`);
      
      // Use a slight delay to ensure state updates properly
      setTimeout(() => {
        router.replace(path);
      }, 50);
      
      // Reset redirecting state after navigation should be complete
      setTimeout(() => {
        setRedirecting(false);
      }, 1000);
    };

    // Unauthenticated users must go to /auth (except public routes)
    if (!isAuthenticated) {
      if (!isPublicRoute && pathname !== '/auth') {
        performRedirect('/auth', 'User not authenticated');
      }
      return;
    }

    // If user has a role and navigates to choose-role, redirect them appropriately
    if (isAuthenticated && pathname === '/onboarding/choose-role') {
      if (currentRole) {
        if (!isOnboarded) {
          const onboardingRoute = ROLE_ONBOARDING_ROUTE[currentRole] || '/onboarding/choose-role';
          performRedirect(onboardingRoute, 'Role exists, onboarding incomplete');
          return;
        }
        const dashboardRoute = ROLE_ROUTES[currentRole as keyof typeof ROLE_ROUTES];
        if (dashboardRoute) {
          performRedirect(dashboardRoute, 'Role exists, already onboarded');
          return;
        }
      }
    }

    // Authenticated users on /auth should be redirected away
    if (redirectIfAuthenticated && pathname === '/auth' && isAuthenticated) {
      if (!profile || !currentRole) {
        performRedirect('/onboarding/choose-role', 'No user profile or role');
        return;
      }

      if (!isOnboarded) {
        const onboardingRoute = ROLE_ONBOARDING_ROUTE[currentRole];
        performRedirect(onboardingRoute || '/onboarding/choose-role', 'User not onboarded');
        return;
      }

      const dashboardRoute = ROLE_ROUTES[currentRole as keyof typeof ROLE_ROUTES];
      if (dashboardRoute) {
        performRedirect(dashboardRoute, `Redirecting ${currentRole} to dashboard`);
      } else {
        performRedirect('/onboarding/choose-role', 'Unknown user role');
      }
      return;
    }

    // Authenticated users without profile/role must choose role
    if (isAuthenticated && (!profile || !currentRole)) {
      if (pathname !== '/onboarding/choose-role') {
        performRedirect('/onboarding/choose-role', 'Role not selected yet');
      }
      return;
    }

    // Users with role but not onboarded must complete onboarding
    if (isAuthenticated && profile && currentRole && !isOnboarded) {
      const expectedOnboarding = ROLE_ONBOARDING_ROUTE[currentRole];
      
      // Allow them to be on /onboarding/choose-role to change their role
      if (pathname === '/onboarding/choose-role') {
        return;
      }
      
      // Redirect to correct onboarding if on wrong onboarding route
      if (isOnboardingRoute && pathname !== expectedOnboarding) {
        performRedirect(expectedOnboarding, 'Redirecting to role-specific onboarding');
        return;
      }
      
      // Block access to dashboard/other protected routes
      if (!isOnboardingRoute && !isPublicRoute) {
        performRedirect(expectedOnboarding || '/onboarding/choose-role', 'User onboarding incomplete');
        return;
      }
    }

    // Role-based access control for protected routes
    if (isAuthenticated && profile && isOnboarded && allowedRoles.length > 0) {
      if (currentRole && !allowedRoles.includes(currentRole)) {
        const dashboardRoute = ROLE_ROUTES[currentRole as keyof typeof ROLE_ROUTES];
        if (dashboardRoute) {
          performRedirect(dashboardRoute, `Role ${currentRole} not authorized for this route`);
        } else {
          performRedirect('/onboarding/choose-role', 'Unknown user role');
        }
        return;
      }
    }

    // Onboarded users accessing onboarding routes
    // Redirect away from onboarding routes once onboarded
    if (isAuthenticated && profile && isOnboarded && isOnboardingRoute) {
      // Redirect away from all onboarding routes (including choose-role)
      const dashboardRoute = ROLE_ROUTES[currentRole as keyof typeof ROLE_ROUTES];
      if (dashboardRoute) {
        performRedirect(dashboardRoute, 'User already onboarded');
      }
      return;
    }
  }, [
    authLoading,
    redirecting,
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
    router,
    hasProfileError,
  ]);

  return {
    isLoading,
    isAuthorized,
    currentRole,
    redirecting,
  };
}

export function useDashboardProtection(allowedRoles: string[]) {
  return useRoleRedirect({
    allowedRoles,
    requireOnboarded: true,
  });
}

export function useOnboardingProtection() {
  return useRoleRedirect({
    requireOnboarded: false,
  });
}

export function useAuthPageRedirect() {
  return useRoleRedirect({
    redirectIfAuthenticated: true,
  });
}

export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: RoleRedirectOptions = {},
) {
  return function ProtectedComponent(props: P) {
    const { isLoading, isAuthorized } = useRoleRedirect(options);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-border" />
            <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
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
            <p className="text-slate-300">You don’t have permission to view this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

export function getDashboardRoute(role: string): string {
  return ROLE_ROUTES[role as keyof typeof ROLE_ROUTES] || '/onboarding/choose-role';
}

export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.includes(path);
}

export function isOnboardingRoute(path: string): boolean {
  return ONBOARDING_ROUTES.includes(path);
}
