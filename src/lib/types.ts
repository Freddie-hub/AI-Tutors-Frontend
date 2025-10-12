export type UserRole = 'individual-student' | 'institution-student' | 'institution-admin' | 'upskill-individual';

export type CurriculumType = 'CBC' | 'British' | 'Adaptive';

export interface IndividualStudentOnboardingData {
  name: string;
  age: number;
  curriculum: CurriculumType;
  grade: string;
  goal: string;
  preferredMode: 'AI Autopilot';
}

export interface InstitutionStudentOnboardingData {
  name: string;
  curriculum: CurriculumType;
  grade: string;
  goal: string;
}

export interface UpskillIndividualOnboardingData {
  name: string;
  goal: string;
  preferredSkills: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface InstitutionAdminOnboardingData {
  name: string;
  type: 'university' | 'school' | 'college' | 'training_center' | 'ngo';
  region: string;
  numberOfStudents?: number;
  admin_uid: string;
}

export interface ApiResponse {
  success: boolean;
  redirectUrl?: string;
  message?: string;
  field?: string;
  code?: string;
}