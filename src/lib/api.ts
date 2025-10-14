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

export async function loginWithEmail(email: string, password: string): Promise<ApiResponse> {
  return requestApi<ApiResponse>('/auth/login', 'POST', { email, password });
}

export async function loginWithGoogle(idToken: string): Promise<ApiResponse> {
  return requestApi<ApiResponse>('/auth/google', 'POST', { idToken });
}

export async function logout(): Promise<ApiResponse> {
  return fetchWithCreds('/auth/logout', 'POST');
}

export async function setRole(data: { role: string; uid?: string }): Promise<ApiResponse> {
  const path = data.uid ? `/users/${data.uid}/set-role` : '/users/set-role';
  const { uid, ...body } = data as any;
  return fetchWithCreds(path, 'POST', body);
}

export async function onboardIndividualStudent(
  data: IndividualStudentOnboardingData,
  uid?: string,
): Promise<ApiResponse> {
  const path = uid
    ? `/users/${uid}/individual-student-onboard`
    : '/users/individual-student-onboard';
  return fetchWithCreds(path, 'POST', data);
}

export async function onboardInstitutionStudent(
  data: InstitutionStudentOnboardingData,
  uid?: string,
): Promise<ApiResponse> {
  const path = uid
    ? `/users/${uid}/institution-student-onboard`
    : '/users/institution-student-onboard';
  return fetchWithCreds(path, 'POST', data);
}

export async function onboardUpskillIndividual(
  data: UpskillIndividualOnboardingData,
  uid?: string,
): Promise<ApiResponse> {
  const path = uid
    ? `/users/${uid}/upskill-individual-onboard`
    : '/users/upskill-individual-onboard';
  return fetchWithCreds(path, 'POST', data);
}

export async function createInstitution(
  data: Omit<InstitutionAdminOnboardingData, 'admin_uid'>,
): Promise<ApiResponse> {
  return fetchWithCreds('/institutions/create', 'POST', data);
}
