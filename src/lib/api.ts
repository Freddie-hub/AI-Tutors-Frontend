import { IndividualStudentOnboardingData, InstitutionStudentOnboardingData, UpskillIndividualOnboardingData, InstitutionAdminOnboardingData, ApiResponse, UserProfile, Institution } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

async function fetchWithToken(endpoint: string, method: string, token: string, body?: any): Promise<ApiResponse> {
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    // Safely parse JSON (handle 204/empty body)
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      console.error(`[API] Request failed for ${endpoint}`, { status: response.status, data });
      throw {
        message: data.message || 'Request failed',
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

// Generic JSON GET with token returning typed payload
async function getJSONWithToken<T>(endpoint: string, token: string): Promise<T> {
  const headers: HeadersInit = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'GET', headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw {
      message: data.message || 'Request failed',
      code: data.code,
      status: res.status,
    };
  }
  return data as T;
}

// Public: fetch user profile from backend
export async function fetchProfile(uid: string, token: string): Promise<UserProfile> {
  return getJSONWithToken<UserProfile>(`/users/${uid}`, token);
}

// Public: fetch institution by id from backend
export async function fetchInstitution(institutionId: string, token: string): Promise<Institution> {
  return getJSONWithToken<Institution>(`/institutions/${institutionId}`, token);
}

export async function setRole(uid: string, data: { role: string }, token: string): Promise<ApiResponse> {
  console.log('[API] setRole called', { uid, role: data.role });
  return fetchWithToken(`/users/${uid}/set-role`, 'POST', token, data);
}

export async function onboardIndividualStudent(
  uid: string,
  data: IndividualStudentOnboardingData,
  token: string
): Promise<ApiResponse> {
  console.log('[API] onboardIndividualStudent called', { uid, data });
  return fetchWithToken(`/users/${uid}/individual-student-onboard`, 'POST', token, data);
}

export async function onboardInstitutionStudent(
  uid: string,
  data: InstitutionStudentOnboardingData,
  token: string
): Promise<ApiResponse> {
  console.log('[API] onboardInstitutionStudent called', { uid, data });
  return fetchWithToken(`/users/${uid}/institution-student-onboard`, 'POST', token, data);
}

export async function onboardUpskillIndividual(
  uid: string,
  data: UpskillIndividualOnboardingData,
  token: string
): Promise<ApiResponse> {
  console.log('[API] onboardUpskillIndividual called', { uid, data });
  return fetchWithToken(`/users/${uid}/upskill-individual-onboard`, 'POST', token, data);
}

export async function createInstitution(
  data: InstitutionAdminOnboardingData,
  token: string
): Promise<ApiResponse> {
  console.log('[API] createInstitution called', { data });
  return fetchWithToken('/institutions/create', 'POST', token, data);
}