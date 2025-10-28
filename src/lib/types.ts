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
  courseType: 'cbc' | 'gcse' | 'custom';
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

// Course types
export interface CourseStrand {
  id: string;
  name: string;
  description: string;
  subtopics: string[];
}

export interface CourseSubject {
  subject: string;
  strands: CourseStrand[];
}

export interface CourseChapter {
  id: string;
  order: number;
  title: string;
  subject: string;
  strandId?: string;
  strandName?: string;
  topics: string[];
  description?: string;
  // Progress metadata injected by API layer
  completed?: boolean;
  lessonId?: string | null;
}

export interface Course {
  id: string;
  userId: string;
  name: string;
  grade: string;
  subjects: CourseSubject[]; // Multiple subjects per course
  description: string;
  courseType: 'cbc' | 'gcse' | 'custom';
  
  // Course structure (AI-generated TOC)
  chapters: CourseChapter[];
  
  // Progress tracking
  totalChapters: number;
  completedChapters: number;
  progress: number; // 0-100
  
  // Metadata
  thumbnail?: string;
  estimatedDuration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string | Date;
  updatedAt: string | Date;
  lastAccessedAt?: string | Date;
}

export interface CourseLessonLink {
  id: string;
  courseId: string;
  userId: string;
  chapterId: string;
  chapterOrder: number;
  chapterTitle: string;
  
  // Lesson content reference
  lessonId: string | null;
  
  // Completion tracking
  status: 'not_started' | 'in_progress' | 'completed';
  completed: boolean;
  startedAt: string | Date | null;
  completedAt: string | Date | null;
  
  // Context
  grade: string;
  subject: string;
  topic: string;
  strandId?: string;
  strandName?: string;
}

export interface SavedLessonDTO {
  id: string;
  userId: string;
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
  content?: string;
  createdAt: string | Date;
}

// Shared AI output types
export interface GeneratedCourseTOC {
  courseName: string;
  description: string;
  estimatedDuration: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  chapters: CourseChapter[];
}