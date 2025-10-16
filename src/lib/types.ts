export type UserRole = 'individual-student' | 'institution-student' | 'institution-admin' | 'upskill-individual' | 'teacher';

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

export interface TeacherOnboardingData {
  name: string;
  subject: string;
  curriculum: string;
  school: string;
  yearsExperience: string;
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

// Shared data contracts for frontend <-> backend
export interface UserProfile {
  uid?: string;
  email?: string;
  displayName?: string | null;
  photoURL?: string | null;
  role?: UserRole;
  onboarded?: boolean;
  institutionId?: string;
  isIndependent?: boolean;
  preferences?: {
    age?: number;
    curriculum?: CurriculumType;
    grade?: string;
    goal?: string; // alias of learningGoal from UI
    learningGoal?: string;
    preferredMode?: 'AI Autopilot';
  };
}

export interface Institution {
  id: string;
  name?: string;
  type?: 'university' | 'school' | 'college' | 'training_center' | 'ngo';
  domain?: string;
  adminEmails?: string[];
  isActive?: boolean;
}