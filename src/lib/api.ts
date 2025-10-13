import {
  IndividualStudentOnboardingData,
  InstitutionStudentOnboardingData,
  UpskillIndividualOnboardingData,
  InstitutionAdminOnboardingData,
  ApiResponse,
  UserProfile,
  Institution,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

async function parseJSONSafe(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

function buildHeaders(): HeadersInit {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

async function requestApi<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: buildHeaders(),
    credentials: 'include', // send cookies for session
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await parseJSONSafe(response);

  if (!response.ok) {
    throw {
      message: data.message || data.error || 'Request failed',
      field: data.field,
      code: data.code,
      status: response.status,
    };
  }

  return data as T;
}

async function fetchWithCreds(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: any
): Promise<ApiResponse> {
  const data = await requestApi<any>(endpoint, method, body);
  return {
    success: data.success ?? true,
    redirectUrl: data.redirectUrl,
    message: data.message,
    field: data.field,
  };
}

async function getWithCreds<T>(endpoint: string): Promise<T> {
  return requestApi<T>(endpoint, 'GET');
}

// =========================
// Auth
// =========================

export async function signupWithEmail(email: string, password: string, displayName: string): Promise<ApiResponse> {
  return fetchWithCreds('/auth/signup', 'POST', { email, password, displayName });
}

export async function loginWithEmail(email: string, password: string): Promise<ApiResponse> {
  return fetchWithCreds('/auth/login', 'POST', { email, password });
}

export async function logout(): Promise<ApiResponse> {
  return fetchWithCreds('/auth/logout', 'POST');
}

export async function fetchProfile(): Promise<UserProfile | null> {
  try {
    return await getWithCreds<UserProfile>('/auth/session');
  } catch (e: any) {
    if (e?.status === 401) return null;
    throw e;
  }
}

// =========================
// Institutions
// =========================

export async function fetchInstitution(institutionId: string): Promise<Institution> {
  return getWithCreds<Institution>(`/institutions/${institutionId}`);
}

export async function createInstitution(data: Omit<InstitutionAdminOnboardingData, 'admin_uid'>): Promise<ApiResponse> {
  return fetchWithCreds('/institutions/create', 'POST', data);
}

// =========================
// Roles & Onboarding
// =========================

export async function setRole(data: { role: string; uid?: string }): Promise<ApiResponse> {
  const path = data.uid ? `/users/${data.uid}/set-role` : `/users/set-role`;
  const { uid, ...body } = data as any;
  return fetchWithCreds(path, 'POST', body);
}

export async function onboardIndividualStudent(
  data: IndividualStudentOnboardingData,
  uid?: string
): Promise<ApiResponse> {
  const path = uid ? `/users/${uid}/individual-student-onboard` : `/users/individual-student-onboard`;
  return fetchWithCreds(path, 'POST', data);
}

export async function onboardInstitutionStudent(
  data: InstitutionStudentOnboardingData,
  uid?: string
): Promise<ApiResponse> {
  const path = uid ? `/users/${uid}/institution-student-onboard` : `/users/institution-student-onboard`;
  return fetchWithCreds(path, 'POST', data);
}

export async function onboardUpskillIndividual(
  data: UpskillIndividualOnboardingData,
  uid?: string
): Promise<ApiResponse> {
  const path = uid ? `/users/${uid}/upskill-individual-onboard` : `/users/upskill-individual-onboard`;
  return fetchWithCreds(path, 'POST', data);
}
