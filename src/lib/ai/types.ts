export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface LessonSectionImage {
  url: string;
  title?: string;
  source?: string;
  license?: string;
  width?: number;
  height?: number;
}

export interface LessonSection {
  id: string;
  title: string;
  html: string; // sanitized HTML content for rendering
  image?: LessonSectionImage;
  quizAnchorId?: string; // an anchor to trigger a quiz at this point
}

export interface LessonRequestPayload {
  uid?: string;
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
}

export interface LessonResponsePayload {
  lessonId: string;
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
  outline: string[];
  sections: LessonSection[];
  content: string; // full concatenated HTML
}

export type QuizQuestionType = 'mcq' | 'short';

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  choices?: string[];
  answerKey?: string | number; // for mcq index or short expected answer (used only server-side)
}

export interface Quiz {
  id: string;
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
}

export interface QuizRequestPayload {
  uid?: string;
  topic: string;
  lessonContent?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
}

export interface GradeRequestPayload {
  uid?: string;
  quiz: Quiz;
  responses: Array<{ questionId: string; answer: string | number }>; 
}

export interface GradeResult {
  score: number; // 0..1
  perQuestion: Array<{
    questionId: string;
    correct: boolean;
    feedback?: string;
  }>;
  masteryDelta?: number;
}

export interface ImageCandidate {
  url: string;
  title?: string;
  source?: string;
  license?: string;
  width?: number;
  height?: number;
}
