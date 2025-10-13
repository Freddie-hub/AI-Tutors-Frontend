import {
  IndividualStudentOnboardingData,
  InstitutionStudentOnboardingData,
  UpskillIndividualOnboardingData,
  InstitutionAdminOnboardingData,
  ApiResponse,
  UserProfile,
  Institution,
} from './types';
import {
  getFirebaseAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from './firebaseClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

async function parseJSONSafe(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

function buildHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function requestApi<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: any,
): Promise<T> {
  // Attempt to attach ID token for endpoints protected by RoleGuard.
  let idToken: string | undefined;
  try {
    const auth = getFirebaseAuth();
    if (auth?.currentUser) {
      idToken = await auth.currentUser.getIdToken();
    }
  } catch {
    // ignore if auth not initialized on server or user not signed in
  }
  const options: RequestInit = {
    method,
    headers: buildHeaders(idToken),
    credentials: 'include',
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
  body?: any,
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

// Session & profile
export async function fetchProfile(): Promise<UserProfile | null> {
  // Returns current session profile or null if not authenticated
  try {
    return await getWithCreds<UserProfile>(`/auth/session`);
  } catch (e: any) {
    if (e?.status === 401) return null;
    throw e;
  }
}

export async function fetchInstitution(institutionId: string): Promise<Institution> {
  return getWithCreds<Institution>(`/institutions/${institutionId}`);
}

// Auth endpoints
export async function loginWithGoogle(): Promise<ApiResponse> {
  // Client obtains Firebase ID token, exchanges with backend to set session cookie
  const provider = new GoogleAuthProvider();
  const auth = getFirebaseAuth();
  const cred = await signInWithPopup(auth, provider);
  const idToken = await cred.user.getIdToken();
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: buildHeaders(),
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });
  const data = await parseJSONSafe(res);
  if (!res.ok) throw new Error(data?.message || 'Login failed');
  return { success: true, message: 'Session Established' };
}

export async function loginWithEmail(email: string, password: string): Promise<ApiResponse> {
  // Use Firebase client for email/password, then exchange ID token with backend
  const auth = getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: buildHeaders(),
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });
  const data = await parseJSONSafe(res);
  if (!res.ok) throw new Error(data?.message || 'Login failed');
  return { success: true, message: 'Session Established' };
}

export async function signupWithEmail(email: string, password: string, displayName: string): Promise<ApiResponse> {
  // Create user in Firebase, set displayName, then exchange ID token for session
  const auth = getFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  const idToken = await cred.user.getIdToken();
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: buildHeaders(),
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });
  const data = await parseJSONSafe(res);
  if (!res.ok) throw new Error(data?.message || 'Signup failed');
  return { success: true, message: 'Account created' };
}

export async function logout(): Promise<ApiResponse> {
  try {
    const auth = getFirebaseAuth();
    await signOut(auth);
  } catch {}
  return fetchWithCreds(`/auth/logout`, 'POST');
}

// Role & onboarding
export async function setRole(data: { role: string; uid?: string }): Promise<ApiResponse> {
  const path = data.uid ? `/users/${data.uid}/set-role` : `/users/set-role`;
  const { uid, ...body } = data as any;
  return fetchWithCreds(path, 'POST', body);
}

export async function onboardIndividualStudent(
  data: IndividualStudentOnboardingData,
  uid?: string,
): Promise<ApiResponse> {
  const path = uid ? `/users/${uid}/individual-student-onboard` : `/users/individual-student-onboard`;
  return fetchWithCreds(path, 'POST', data);
}

export async function onboardInstitutionStudent(
  data: InstitutionStudentOnboardingData,
  uid?: string,
): Promise<ApiResponse> {
  const path = uid ? `/users/${uid}/institution-student-onboard` : `/users/institution-student-onboard`;
  return fetchWithCreds(path, 'POST', data);
}

export async function onboardUpskillIndividual(
  data: UpskillIndividualOnboardingData,
  uid?: string,
): Promise<ApiResponse> {
  const path = uid ? `/users/${uid}/upskill-individual-onboard` : `/users/upskill-individual-onboard`;
  return fetchWithCreds(path, 'POST', data);
}

export async function createInstitution(
  data: Omit<InstitutionAdminOnboardingData, 'admin_uid'>
): Promise<ApiResponse> {
  return fetchWithCreds('/institutions/create', 'POST', data);
}
