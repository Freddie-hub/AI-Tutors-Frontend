/**
 * Prompts Index
 * Central export point for all prompt functions and system messages
 * Organized by curriculum type: CBC, GCSE, Upskill, Custom, and Shared utilities
 */

// CBC (Kenya Competency-Based Curriculum)
export {
  systemTutor,
  lessonPrompt,
  cbcCoursePlannerPrompt,
} from './cbc';

// GCSE (Cambridge GCSE/IGCSE)
export {
  systemTutorGCSE,
  gcseCoursePlannerPrompt,
} from './gcse';

// Upskill (Professional/Job-ready learning)
export {
  systemTutorUpskill,
  upskillPlannerPrompt,
  upskillSectionWriterPrompt,
} from './upskill';

// Custom courses
export {
  customCoursePlannerPrompt,
} from './custom';

// Shared/Universal prompts
export {
  systemCoursePlanner,
  quizPrompt,
  gradingPrompt,
  imageIdeasPrompt,
  plannerPrompt,
  workloadSplitterPrompt,
  sectionWriterPrompt,
} from './shared';
