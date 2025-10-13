// Lightweight client wrapper for Next.js app routes under /api
// All functions include Firebase ID token in Authorization header when provided

import {
  ApiResponse,
  UserProfile,
  Institution,
  UserRole,
  InstitutionAdminOnboardingData,
  IndividualStudentOnboardingData,
  InstitutionStudentOnboardingData,
  UpskillIndividualOnboardingData
} from './types';

const jsonHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `Request failed with ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

// Set or update the user's role
export async function setRole(
  uid: string,
  body: { role: UserRole },
  token?: string
): Promise<ApiResponse> {
  return apiFetch<ApiResponse>(`/api/profile/role`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify({ uid, ...body })
  });
}

// Create an institution (admin onboarding)
export async function createInstitution(
  payload: InstitutionAdminOnboardingData,
  token?: string
): Promise<ApiResponse> {
  return apiFetch<ApiResponse>(`/api/institutions`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(payload)
  });
}

// Fetch profile by uid
export async function fetchProfile(uid: string, token?: string): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/api/profile/${encodeURIComponent(uid)}`, {
    headers: jsonHeaders(token)
  });
}

// Fetch institution by id
export async function fetchInstitution(id: string, token?: string): Promise<Institution> {
  return apiFetch<Institution>(`/api/institution/${encodeURIComponent(id)}`, {
    headers: jsonHeaders(token)
  });
}

// Onboard: individual student
export async function onboardIndividualStudent(
  uid: string,
  data: IndividualStudentOnboardingData,
  token?: string
): Promise<ApiResponse> {
  return apiFetch<ApiResponse>(`/api/onboarding/student/individual`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify({ uid, ...data })
  });
}

// Onboard: institution student
export async function onboardInstitutionStudent(
  uid: string,
  data: InstitutionStudentOnboardingData,
  token?: string
): Promise<ApiResponse> {
  return apiFetch<ApiResponse>(`/api/onboarding/student/institution`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify({ uid, ...data })
  });
}

// Onboard: upskill individual
export async function onboardUpskillIndividual(
  uid: string,
  data: UpskillIndividualOnboardingData,
  token?: string
): Promise<ApiResponse> {
  return apiFetch<ApiResponse>(`/api/onboarding/upskill`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify({ uid, ...data })
  });
}
