// Frontend uses backend session cookies; all data comes from API calls.

'use client';

import { useState, useEffect } from 'react';
import { UserProfile, Institution } from './types';
import { fetchProfile, fetchInstitution } from './api';

// Hook for authentication state
export function useAuth() {
  // Deprecated local auth state. We rely entirely on session profile.
  // Kept for compatibility; returns loading=false and user=null.
  const [loading] = useState(false);
  return { user: null, loading } as const;
}

// Hook for user profile data
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProfile();
        if (!cancelled) setProfile(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  return { profile, loading, error };
}

// Hook for institution data
export function useInstitution(institutionId?: string) {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!institutionId) { setInstitution(null); setLoading(false); return; }
      try {
        setLoading(true);
        setError(null);
        const data = await fetchInstitution(institutionId);
        if (!cancelled) setInstitution(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load institution');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [institutionId]);

  return { institution, loading, error };
}

// Combined hook for authenticated user with profile
export function useAuthUser() {
  const { profile, loading: profileLoading, error } = useUserProfile();
  const { institution, loading: institutionLoading } = useInstitution(profile?.institutionId);

  const loading = profileLoading || institutionLoading;

  // Profile creation now handled by backend upon first auth; no direct Firestore writes here

  return {
    user: profile, // treat profile as the authenticated user object for the UI
    profile,
    institution,
    loading,
    error,
    isAuthenticated: !!profile,
    isIndependent: profile?.isIndependent ?? false,
    isInstitutionLinked: !!(profile?.institutionId && institution)
  };
}

// Hook for managing authentication actions
export function useAuthActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const withErrorHandling = async <T,>(action: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await action();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    // expose setter so callers can set a top-level API error message
    setError,
    clearError,
    withErrorHandling
  };
}

// Hook for form state management
export function useFormState<T>(initialState: T) {
  const [values, setValues] = useState<T>(initialState);
  // Allow a generic 'api' error slot in addition to field errors
  const [errors, setErrors] = useState<Partial<Record<keyof T | 'api', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = (field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const setError = (field: keyof T | 'api', error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const clearErrors = () => setErrors({});

  const reset = () => {
    setValues(initialState);
    clearErrors();
  };

  const hasErrors = Object.values(errors).some(error => !!error);

  return {
    values,
    errors,
    setValue,
    setError,
    clearErrors,
    reset,
    hasErrors,
    isSubmitting,
    setSubmitting: setIsSubmitting
  };
}