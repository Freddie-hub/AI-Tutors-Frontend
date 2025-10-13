import {
  IndividualStudentOnboardingData,
  InstitutionStudentOnboardingData,
  UpskillIndividualOnboardingData,
  InstitutionAdminOnboardingData,
  ApiResponse,
  UserProfile,
  Institution,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Safely parse JSON response
 */
async function parseJSONSafe(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (err) {
    console.warn('[API] Failed to parse JSON, returning raw text', text);
    return { raw: text };
  }
}

/**
 * Generic fetch wrapper with token, safe JSON parsing and structured error handling
 */
async function fetchWithToken(
  endpoint: string,
  method: string,
  token: string,
  body?: any
): Promise<ApiResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const options: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    console.log('[API] Fetching:', `${API_BASE_URL}${endpoint}`, options);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await parseJSONSafe(response);

    if (!response.ok) {
      console.error(`[API] Request failed for ${endpoint}`, { status: response.status, data });
      throw {
        message: data.message || data.error || 'Request failed',
        field: data.field,
        code: data.code,
        status: response.status,
      };
    }

    return {
      success: data.success ?? true,
      redirectUrl: data.redirectUrl,
      message: data.message,
      field: data.field,
    };
  } catch (error: any) {
    console.error(`[API] Error calling ${endpoint}`, error);
    throw {
      message: error.message || 'An unexpected error occurred',
      field: error.field,
      code: error.code,
    };
  }
}

/**
 * Generic GET request with token returning typed payload
 */
async function getJSONWithToken<T>(endpoint: string, token: string): Promise<T> {
  const headers: HeadersInit = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'GET', headers });
  const data = await parseJSONSafe(res);

  if (!res.ok) {
    console.error(`[API] GET request failed for ${endpoint}`, { status: res.status, data });
    throw {
      message: data.message || data.error || 'Request failed',
      code: data.code,
      status: res.status,
    };
  }

  return data as T;
}

/**
 * Public API methods
 */

// Fetch user profile
export async function fetchProfile(uid: string, token: string): Promise<UserProfile> {
  return getJSONWithToken<UserProfile>(`/users/${uid}`, token);
}

// Fetch institution by ID
export async function fetchInstitution(institutionId: string, token: string): Promise<Institution> {
  return getJSONWithToken<Institution>(`/institutions/${institutionId}`, token);
}

// Set user role
export async function setRole(uid: string, data: { role: string }, token: string): Promise<ApiResponse> {
  console.log('[API] setRole called', { uid, role: data.role });
  return fetchWithToken(`/users/${uid}/set-role`, 'POST', token, data);
}

// Individual student onboarding
export async function onboardIndividualStudent(
  uid: string,
  data: IndividualStudentOnboardingData,
  token: string
): Promise<ApiResponse> {
  console.log('[API] onboardIndividualStudent called', { uid, data });
  return fetchWithToken(`/users/${uid}/individual-student-onboard`, 'POST', token, data);
}

// Institution student onboarding
export async function onboardInstitutionStudent(
  uid: string,
  data: InstitutionStudentOnboardingData,
  token: string
): Promise<ApiResponse> {
  console.log('[API] onboardInstitutionStudent called', { uid, data });
  return fetchWithToken(`/users/${uid}/institution-student-onboard`, 'POST', token, data);
}

// Upskill individual onboarding
export async function onboardUpskillIndividual(
  uid: string,
  data: UpskillIndividualOnboardingData,
  token: string
): Promise<ApiResponse> {
  console.log('[API] onboardUpskillIndividual called', { uid, data });
  return fetchWithToken(`/users/${uid}/upskill-individual-onboard`, 'POST', token, data);
}

// Create institution
export async function createInstitution(
  data: InstitutionAdminOnboardingData,
  token: string
): Promise<ApiResponse> {
  console.log('[API] createInstitution called', { data });
  return fetchWithToken('/institutions/create', 'POST', token, data);
}
