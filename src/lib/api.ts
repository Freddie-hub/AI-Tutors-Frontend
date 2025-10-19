'use client';

import { authService } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import type {
  ApiResponse,
  // New types used by tutor endpoints
  // Using inline types here to avoid importing server-only modules
  IndividualStudentOnboardingData,
  Institution,
  InstitutionAdminOnboardingData,
  InstitutionStudentOnboardingData,
  TeacherOnboardingData,
  UpskillIndividualOnboardingData,
  UserProfile,
  UserRole,
} from './types';

// Light client-side contracts for tutor endpoints
export type ClientLessonRequest = {
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
};

export type ClientLessonResponse = {
  lessonId: string;
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
  outline: string[];
  sections: Array<{ id: string; title: string; html: string; quizAnchorId?: string }>;
  content: string;
};

export type ClientQuizQuestion = {
  id: string;
  type: 'mcq' | 'short';
  prompt: string;
  choices?: string[];
};

export type ClientQuiz = {
  id: string;
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  questions: ClientQuizQuestion[];
};

export type ClientGradeResult = {
  score: number;
  perQuestion: Array<{ questionId: string; correct: boolean; feedback?: string }>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ApiError = {
  message: string;
  field?: string;
  code?: string;
  status?: number;
};

const buildUrl = (endpoint: string) => {
  if (/^https?:/i.test(endpoint)) {
    return endpoint;
  }
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};

const parseJson = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return {} as Record<string, unknown>;
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch (error) {
    console.error('[api] Failed to parse JSON response', error);
    throw Object.assign(new Error('Failed to parse server response'), {
      status: response.status,
    });
  }
};

const request = async <T>(endpoint: string, method: HttpMethod, body?: unknown, headers: HeadersInit = {}): Promise<T> => {
  const response = await fetch(buildUrl(endpoint), {
    method,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
    cache: 'no-store',
  });

  const data = await parseJson(response);

  if (!response.ok) {
    const error: ApiError = {
      message: typeof data.message === 'string' ? data.message : 'Request failed',
      field: typeof data.field === 'string' ? data.field : undefined,
      code: typeof data.code === 'string' ? data.code : undefined,
      status: response.status,
    };
    throw Object.assign(new Error(error.message), error);
  }

  return (data as T) ?? ({} as T);
};

const ensureToken = async (token?: string) => {
  if (token) {
    return token;
  }
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User is not authenticated');
  }
  return currentUser.getIdToken();
};

const requestWithToken = async <T>(endpoint: string, method: HttpMethod, token?: string, body?: unknown): Promise<T> => {
  const resolvedToken = await ensureToken(token);
  return request<T>(endpoint, method, body, {
    Authorization: `Bearer ${resolvedToken}`,
  });
};

const normalizeResponse = (data: Partial<ApiResponse> | Record<string, unknown>): ApiResponse => {
  const typed = data as Partial<ApiResponse> & Record<string, unknown>;
  return {
    success: typeof typed.success === 'boolean' ? typed.success : true,
    redirectUrl: typeof typed.redirectUrl === 'string' ? typed.redirectUrl : undefined,
    message: typeof typed.message === 'string' ? typed.message : undefined,
    field: typeof typed.field === 'string' ? typed.field : undefined,
    code: typeof typed.code === 'string' ? typed.code : undefined,
  };
};

export const logout = async (): Promise<ApiResponse> => {
  await authService.signOut();
  return { success: true };
};

export const setRole = async (
  uid: string,
  payload: { role: UserRole },
  token?: string,
): Promise<ApiResponse> => {
  const data = await requestWithToken<Partial<ApiResponse>>('/profile/role', 'POST', token, {
    uid,
    ...payload,
  });
  return normalizeResponse(data);
};

export const onboardIndividualStudent = async (
  uid: string,
  data: IndividualStudentOnboardingData,
  token?: string,
): Promise<ApiResponse> => {
  const response = await requestWithToken<Partial<ApiResponse>>(
    '/onboarding/student/individual',
    'POST',
    token,
    { uid, ...data },
  );
  return normalizeResponse(response);
};

export const onboardInstitutionStudent = async (
  uid: string,
  data: InstitutionStudentOnboardingData,
  token?: string,
): Promise<ApiResponse> => {
  const response = await requestWithToken<Partial<ApiResponse>>(
    '/onboarding/student/institution',
    'POST',
    token,
    { uid, ...data },
  );
  return normalizeResponse(response);
};

export const onboardUpskillIndividual = async (
  uid: string,
  data: UpskillIndividualOnboardingData,
  token?: string,
): Promise<ApiResponse> => {
  const response = await requestWithToken<Partial<ApiResponse>>(
    '/onboarding/upskill',
    'POST',
    token,
    { uid, ...data },
  );
  return normalizeResponse(response);
};

export const setTeacherProfile = async (
  uid: string,
  data: TeacherOnboardingData,
  token?: string,
): Promise<ApiResponse> => {
  const response = await requestWithToken<Partial<ApiResponse>>(
    '/onboarding/teacher',
    'POST',
    token,
    { uid, ...data },
  );
  return normalizeResponse(response);
};

export const createInstitution = async (
  payload: Omit<InstitutionAdminOnboardingData, 'admin_uid'>,
  token?: string,
): Promise<ApiResponse> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User is not authenticated');
  }

  const response = await requestWithToken<Partial<ApiResponse>>(
    '/institutions',
    'POST',
    token,
    {
      ...payload,
      admin_uid: currentUser.uid,
    },
  );
  return normalizeResponse(response);
};

export const fetchProfile = async (uid: string, token?: string): Promise<UserProfile> => {
  return requestWithToken<UserProfile>(`/profile/${encodeURIComponent(uid)}`, 'GET', token);
};

export const fetchInstitution = async (id: string, token?: string): Promise<Institution> => {
  return requestWithToken<Institution>(`/institution/${encodeURIComponent(id)}`, 'GET', token);
};

// =============================
// Tutor endpoints (AI Agent)
// =============================

export const generateLesson = async (
  payload: ClientLessonRequest,
  token?: string,
): Promise<ClientLessonResponse> => {
  return requestWithToken<ClientLessonResponse>('/tutor/lesson', 'POST', token, payload);
};

export const tutorChat = async (
  message: string,
  lessonContext?: Partial<ClientLessonResponse>,
  token?: string,
): Promise<{ reply: string }> => {
  return requestWithToken<{ reply: string }>('/tutor/chat', 'POST', token, { message, lessonContext });
};

export const createQuiz = async (
  topic: string,
  lessonContent?: string,
  options?: { difficulty?: 'easy' | 'medium' | 'hard'; count?: number },
  token?: string,
): Promise<ClientQuiz> => {
  return requestWithToken<ClientQuiz>('/tutor/quiz', 'POST', token, {
    topic,
    lessonContent,
    difficulty: options?.difficulty ?? 'medium',
    count: options?.count ?? 5,
  });
};

export const gradeQuiz = async (
  quiz: ClientQuiz,
  responses: Array<{ questionId: string; answer: string | number }>,
  token?: string,
): Promise<ClientGradeResult> => {
  return requestWithToken<ClientGradeResult>('/tutor/grade', 'POST', token, { quiz, responses });
};

export const searchImages = async (
  query: string,
  count = 3,
  token?: string,
): Promise<{ candidates: Array<{ url: string; title?: string; source?: string }> }> => {
  return requestWithToken('/tutor/images/search', 'POST', token, { query, count });
};

export const generateImage = async (
  prompt: string,
  token?: string,
): Promise<{ image: { url: string } | null }> => {
  return requestWithToken('/tutor/images/generate', 'POST', token, { prompt });
};

// =============================
// Lessons endpoints
// =============================

export const fetchLessons = async (token?: string): Promise<{ lessons: Array<any> }> => {
  return requestWithToken<{ lessons: Array<any> }>('/lessons', 'GET', token);
};

export const saveLessonToServer = async (
  lesson: { grade: string; subject: string; topic: string; specification?: string; content?: string },
  token?: string,
): Promise<{ success: boolean; lesson: any }> => {
  return requestWithToken<{ success: boolean; lesson: any }>('/lessons', 'POST', token, lesson);
};
