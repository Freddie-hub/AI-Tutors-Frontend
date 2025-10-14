// React hooks for Firebase authentication and profile/institution data

'use client';

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { fetchProfile, fetchInstitution } from './api';
import type { UserProfile, Institution } from './types';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(!auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading } as const;
}

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
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    setError,
    clearError,
    withErrorHandling,
  };
}

export function useFormState<T>(initialState: T) {
  const [values, setValues] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T | 'api', string>>>({});
  const [isSubmitting, setSubmitting] = useState(false);

  const setValue = (field: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const setError = (field: keyof T | 'api', message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearErrors = () => setErrors({});

  const reset = () => {
    setValues(initialState);
    setErrors({});
  };

  const hasErrors = Object.values(errors).some(Boolean);

  return {
    values,
    errors,
    setValue,
    setError,
    clearErrors,
    reset,
    hasErrors,
    isSubmitting,
    setSubmitting,
  };
}

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(!!auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  const loadProfile = useCallback(
    async (currentUser: User) => {
      const token = await currentUser.getIdToken();
      const fetchedProfile = await fetchProfile(currentUser.uid, token);
      setProfile(fetchedProfile ?? null);

      if (fetchedProfile?.institutionId) {
        try {
          const fetchedInstitution = await fetchInstitution(fetchedProfile.institutionId, token);
          setInstitution(fetchedInstitution ?? null);
        } catch (institutionError) {
          console.error('[useAuthUser] Failed to load institution data', institutionError);
          setInstitution(null);
        }
      } else {
        setInstitution(null);
      }
    },
    [],
  );

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setInstitution(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await loadProfile(user);
    } catch (err) {
      console.error('[useAuthUser] Failed to refresh profile', err);
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      setError(message);
      setProfile(null);
      setInstitution(null);
    } finally {
      setLoading(false);
    }
  }, [user, loadProfile]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!authReady) {
        return;
      }

      if (!user) {
        if (!cancelled) {
          setProfile(null);
          setInstitution(null);
          setError(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await loadProfile(user);
      } catch (err) {
        if (!cancelled) {
          console.error('[useAuthUser] Failed to load profile', err);
          const message = err instanceof Error ? err.message : 'Failed to load profile';
          setError(message);
          setProfile(null);
          setInstitution(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [user, authReady, loadProfile]);

  return {
    user,
    profile,
    institution,
    loading,
    error,
    refreshProfile,
    isAuthenticated: !!user,
    isIndependent: profile?.isIndependent ?? false,
    isInstitutionLinked: Boolean(profile?.institutionId && institution),
  } as const;
}