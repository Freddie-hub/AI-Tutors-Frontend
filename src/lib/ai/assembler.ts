import crypto from 'crypto';
import { Subtask, LessonSection } from './types';

/**
 * Assembles completed subtasks into a single lesson artifact.
 */
export function assembleLesson(subtasks: Subtask[]): {
  outline: string[];
  sections: LessonSection[];
  content: string;
  hash: string;
} {
  // Sort by order to ensure correct sequence
  const sorted = [...subtasks].sort((a, b) => a.order - b.order);
  
  // Validate all subtasks are completed
  const incomplete = sorted.find((st) => st.status !== 'completed' || !st.result);
  if (incomplete) {
    throw new Error(`Cannot assemble: subtask ${incomplete.subtaskId} is not completed`);
  }
  
  // Merge outlines
  const outline: string[] = [];
  sorted.forEach((st) => {
    if (st.result?.outlineDelta) {
      outline.push(...st.result.outlineDelta);
    }
  });
  
  // Merge sections
  const sections: LessonSection[] = [];
  sorted.forEach((st) => {
    if (st.result?.sections) {
      sections.push(...st.result.sections);
    }
  });
  
  // Concatenate content chunks
  const content = sorted
    .map((st) => st.result?.contentChunk || '')
    .join('\n\n');
  
  // Compute hash for versioning/integrity
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  
  return {
    outline,
    sections,
    content,
    hash,
  };
}

/**
 * Extracts a brief summary and the last N tokens from content for continuity context.
 */
export function extractContinuityContext(
  content: string,
  maxTokens: number = 500
): string {
  if (!content) return '';
  
  // Simple heuristic: take last ~maxTokens worth of text
  // Rough estimate: 1 token ≈ 4 characters
  const charLimit = maxTokens * 4;
  const trimmed = content.slice(-charLimit);
  
  // Find a clean break (paragraph or sentence)
  const lastParagraph = trimmed.lastIndexOf('\n\n');
  if (lastParagraph > charLimit / 2) {
    return trimmed.slice(lastParagraph).trim();
  }
  
  const lastSentence = trimmed.lastIndexOf('. ');
  if (lastSentence > charLimit / 2) {
    return trimmed.slice(lastSentence + 2).trim();
  }
  
  return trimmed.trim();
}

/**
 * Validates the assembled content for basic quality checks.
 */
export function validateAssembledLesson(assembled: {
  outline: string[];
  sections: LessonSection[];
  content: string;
}): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!assembled.outline || assembled.outline.length === 0) {
    issues.push('Outline is empty');
  }
  
  if (!assembled.sections || assembled.sections.length === 0) {
    issues.push('No sections found');
  }
  
  if (!assembled.content || assembled.content.trim().length < 100) {
    issues.push('Content is too short or empty');
  }
  
  // Check for basic HTML structure - look for any heading tags (h1-h6)
  const hasHeadings = /<h[1-6][^>]*>/i.test(assembled.content);
  if (!hasHeadings) {
    // Only warn, don't fail - subtasks might use different formatting
    console.warn('[assembler] Warning: No heading tags found in assembled content');
  }
  
  // Check sections have required fields
  assembled.sections.forEach((sec, idx) => {
    if (!sec.id) issues.push(`Section ${idx} missing id`);
    if (!sec.title) issues.push(`Section ${idx} missing title`);
    if (!sec.html) issues.push(`Section ${idx} missing html`);
  });
  
  return {
    valid: issues.length === 0,
    issues,
  };
}
