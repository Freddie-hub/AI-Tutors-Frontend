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

// ============================
// Multi-Agent Lesson Planning
// ============================

export interface TOCChapter {
  chapterId: string;
  title: string;
  subtopics: string[];
}

export interface TOCEstimate {
  chapterId: string;
  estimatedTokens: number;
}

export interface LessonPlan {
  planId: string;
  lessonId?: string;
  uid: string;
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
  toc: TOCChapter[];
  recommendedChapterCount: number;
  estimates: {
    totalTokens: number;
    perChapter: TOCEstimate[];
  };
  status: 'proposed' | 'refined' | 'rejected' | 'accepted';
  createdAt: number;
  updatedAt: number;
}

export interface PlanRequestPayload {
  uid?: string;
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
  preferences?: string;
}

// Upskill goal-based planning (no formal curriculum)
export interface UpskillPlanRequestPayload {
  uid?: string;
  goal: string; // e.g., "Learn Machine Learning in 3 months"
  domain?: string; // e.g., "Machine Learning"
  currentLevel?: string; // free-form assessment like "knows Python basics"
  timeline?: string; // e.g., "3 months", "1 night"
  hoursPerWeek?: number; // optional pacing signal
  preferences?: string; // learning style or constraints
  motivation?: string; // optional context
}

export interface PlanResponsePayload {
  planId?: string;
  toc: TOCChapter[];
  displayToc: TOCChapter[]; // same as toc, but for clarity
  recommendedChapterCount: number;
  estimates: {
    totalTokens: number;
    perChapter: TOCEstimate[];
  };
}

export interface SubtaskRange {
  startChapterId: string;
  endChapterId: string;
  startSubtopicIndex?: number;
  endSubtopicIndex?: number;
}

export interface Subtask {
  subtaskId: string;
  lessonId: string;
  order: number;
  range: SubtaskRange;
  targetTokens: number;
  status: 'queued' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
  result?: {
    outlineDelta: string[];
    sections: LessonSection[];
    contentChunk: string;
    hash: string;
  };
  attempts: number;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WorkloadSplit {
  subtasks: Array<{
    subtaskId: string;
    order: number;
    range: SubtaskRange;
    targetTokens: number;
  }>;
  policy: {
    continuityHints: string;
  };
}

export interface LessonRun {
  runId: string;
  lessonId: string;
  uid: string;
  status: 'planned' | 'splitting' | 'writing' | 'assembling' | 'qa' | 'completed' | 'failed' | 'cancelled';
  currentSubtaskOrder: number;
  totalSubtasks: number;
  startedAt: number;
  completedAt?: number;
  cancelled?: boolean;
  processing?: boolean; // Lock to prevent concurrent execution
  processingSubtaskId?: string; // Currently processing subtask
  metrics?: {
    tokensUsed: number;
    estimatedCost: number;
  };
}

export type AgentType = 'planner' | 'splitter' | 'writer' | 'assembler' | 'qa';

export interface ProgressEvent {
  ts: number;
  type: 'planned' | 'split' | 'subtask_started' | 'subtask_complete' | 'assembled' | 'qa_passed' | 'completed' | 'error' | 'cancelled';
  data?: {
    subtaskId?: string;
    order?: number;
    totalSubtasks?: number;
    chapterTitle?: string;
    message?: string;
    error?: string;
  };
  agent?: AgentType; // which agent produced this event
}

export type LessonStatus = 
  | 'draft' 
  | 'toc_proposed' 
  | 'toc_approved' 
  | 'split_planned' 
  | 'writing_in_progress' 
  | 'writing_completed' 
  | 'assembled' 
  | 'qa_passed' 
  | 'done' 
  | 'failed' 
  | 'cancelled';

export interface Lesson {
  lessonId: string;
  uid: string;
  grade: string; // For Upskill, set to 'Upskill' (or similar)
  subject: string; // For Upskill, map from domain
  topic: string; // For Upskill, map from goal or milestone topic
  specification?: string;
  status: LessonStatus;
  toc: TOCChapter[];
  tocVersion: number;
  estimates?: {
    totalTokens: number;
    perChapter: TOCEstimate[];
  };
  // Optional Upskill metadata (ignored by CBC/GCSE flows)
  domain?: string;
  targetAudience?: 'beginner' | 'intermediate' | 'advanced';
  timeConstraint?: string; // e.g., "3 months"
  final?: {
    outline: string[];
    sections: LessonSection[];
    content: string;
    hash: string;
  };
  createdAt: number;
  updatedAt: number;
}
