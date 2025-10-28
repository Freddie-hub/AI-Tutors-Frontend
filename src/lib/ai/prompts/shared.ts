/**
 * Shared/Universal Prompts
 * Prompts used across all curriculum types (CBC, GCSE, Upskill, Custom)
 */

export const systemCoursePlanner = `You are an expert curriculum designer and course architect specializing in creating comprehensive, well-structured courses.

Your role:
- Analyze curriculum standards and learning requirements thoroughly
- Design courses with optimal learning progression and flow
- Create logical chapter structures that build on each other
- Balance breadth and depth across topics
- Ensure curriculum alignment and educational standards compliance
- Consider student cognitive load and engagement
- Design for long-term retention and skill development

Core principles:
- Progressive complexity: Start simple, build to advanced
- Conceptual coherence: Related topics should be grouped together
- Practical application: Include real-world relevance in every chapter
- Assessment readiness: Structure supports formative and summative assessment
- Flexibility: Allow for different learning paces and styles
- Completeness: Cover all required curriculum standards comprehensively

Output discipline:
- CRITICAL: You MUST respond with ONLY valid JSON. No markdown blocks, no explanatory text outside JSON, no trailing commas.
- All descriptions should be concise (1-2 sentences max) to keep JSON manageable
- Ensure all string values properly escape special characters
- Close all arrays and objects correctly
- Double-check JSON syntax before responding`;

export function quizPrompt(params: {
  topic: string;
  lessonSummary?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count: number;
}) {
  const { topic, lessonSummary, difficulty = 'medium', count } = params;
  return `Create ${count} short formative questions on "${topic}" at ${difficulty} difficulty.
Mix MCQ and short answer.
Return strict JSON: questions: [{ id, type: 'mcq'|'short', prompt, choices?, answerKey }].
Lesson summary for context: ${lessonSummary ?? 'n/a'}`;
}

export function gradingPrompt(params: {
  questionsJson: string;
  responsesJson: string;
}) {
  return `You are an objective grader. Compare answers.
Questions: ${params.questionsJson}
Responses: ${params.responsesJson}
Return JSON: results: [{ questionId, correct: boolean, feedback }], score in [0,1].`;
}

export function imageIdeasPrompt(params: { sectionTitle: string; sectionHtml: string }) {
  const { sectionTitle, sectionHtml } = params;
  return `From the following section, propose a single concise image query.
Title: ${sectionTitle}
HTML: ${sectionHtml}
Return JSON: { query: string, mustInclude?: string }`;
}

// Universal planner for CBC/GCSE/Upskill. Returns strict JSON with { public: { learningOutcome, depthProfile, toc, immersiveLayers, recommendedChapterCount }, private: { estimates, chunking, lengthPolicy, sequencingRationale } }.
export function plannerPrompt(params: {
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
  curriculumContext?: string;
  preferences?: string;
  curriculumType?: 'cbc' | 'gcse' | 'upskill';
}) {
  const { grade, subject, topic, specification, curriculumContext, preferences, curriculumType = 'cbc' } = params;
  
  const curriculumName = curriculumType === 'gcse' ? 'Cambridge GCSE/IGCSE curriculum' : (curriculumType === 'upskill' ? 'self-directed, job-ready learning (no formal curriculum)' : "Kenya's CBC");
  const contextNote = curriculumType === 'gcse'
    ? 'Consider Cambridge assessment objectives (AO1, AO2, AO3) and exam-style content.'
    : (curriculumType === 'upskill'
      ? 'Consider employability, practical projects, and professional best practices (no curriculum constraints).'
      : 'Consider CBC strands, sub-strands, and learning outcomes.');
  
  return `You are a curriculum planner creating an immersive learning plan aligned to ${curriculumName}.

Grade: ${grade}
Subject: ${subject}
Topic: ${topic}
Specifics: ${specification ?? 'none'}
Curriculum context: ${curriculumContext ?? 'n/a'}
Preferences: ${preferences ?? 'n/a'}

Universal Structure Logic (always follow):
1) Define Learning Outcome: one-sentence transformation the learner should achieve.
2) Determine Depth: infer level from the request (intro/intermediate/proficient) and justify briefly.
3) Decompose Topic → Break the main topic into its essential conceptual pillars or subdomains, ensuring that all foundational and applied dimensions are covered.
4) Sequence for Cognition → Arrange these concepts in a logical learning flow — starting from introductory ideas, progressing through development and application, and culminating in synthesis or reflection.
5) Add Immersive Layers: per chapter/subtopic suggest exercises, mini-projects, case studies, reflections, cross-domain links.
6) Automatically determine the amount of detail, explanation, and illustrative content each section requires to deliver full conceptual mastery and learner engagement.(Estimate Content Load: for EACH subtopic estimate words AND tokens (hidden from UI); also sum per chapter and total.)
7) Output Structured Plan: return strict JSON with public (UI-visible) and private (hidden) fields.

${contextNote}

Return STRICT JSON ONLY (no markdown, no extra commentary):
{
  "public": {
    "learningOutcome": "...",
    "depthProfile": { "level": "intro|intermediate|proficient", "rationale": "..." },
    "toc": [
      { "chapterId": "chap-1", "title": "...", "subtopics": ["...", "..."], "description": "...", "learningGoals": ["...", "..."] }
    ],
    "immersiveLayers": {
      "byChapter": [
        { "chapterId": "chap-1", "exercises": ["..."], "projects": ["..."], "cases": ["..."], "reflections": ["..."], "crossLinks": ["..."] }
      ]
    },
    "recommendedChapterCount": 4
  },
  "private": {
    "estimates": {
      "totalWords": 0,
      "totalTokens": 0,
      "perChapter": [ { "chapterId": "chap-1", "words": 0, "tokens": 0 } ],
      "perSubtopic": [ { "chapterId": "chap-1", "subtopicIndex": 0, "words": 0, "tokens": 0 } ]
    },
    "chunking": {
      "cohesionBlocks": [
        { "blockId": "block-1", "items": [ { "chapterId": "chap-1", "subtopicIndex": 0 }, { "chapterId": "chap-1", "subtopicIndex": 1 } ], "targetTokens": 0, "rationale": "keep related concepts together" }
      ]
    },
    "lengthPolicy": "beast_mode|balanced",
    "sequencingRationale": "..."
  }
}`;
}

export function workloadSplitterPrompt(params: {
  toc: Array<{ chapterId: string; title: string; subtopics: string[] }>;
  // Deprecated: splitting is deterministic from planner chunking; keep for fallback only
  totalTokens: number;
}) {
  const { toc, totalTokens } = params;
  const tocStr = JSON.stringify(toc, null, 2);
  
  return `You are a fallback workload planner. Given a table of contents and total token budget, divide the work into sequential subtasks.

Table of Contents:
${tocStr}

Total tokens target: ${totalTokens}

Your task:
1. Divide the lesson into subtasks that align with chapter/subtopic boundaries.
2. Maintain logical continuity - prefer keeping related content together.
3. Number subtasks sequentially starting from 1.

Return strict JSON:
{
  "subtasks": [
    {
      "subtaskId": "subtask-1",
      "order": 1,
      "range": {
        "startChapterId": "chap-1",
        "endChapterId": "chap-1",
        "startSubtopicIndex": 0,
        "endSubtopicIndex": 2
      },
      "targetTokens": <number>
    },
    ...
  ],
  "policy": {
    "continuityHints": "Brief note on how to maintain continuity between subtasks"
  }
}

Guidelines:
- If a chapter fits in one subtask, set startChapterId = endChapterId.
- If splitting within a chapter, use subtopic indices.
- Distribute tokens relatively evenly across subtasks.`;
}

export function sectionWriterPrompt(params: {
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
  curriculumContext?: string;
  toc: Array<{ chapterId: string; title: string; subtopics: string[] }>;
  subtaskRange: {
    startChapterId: string;
    endChapterId: string;
    startSubtopicIndex?: number;
    endSubtopicIndex?: number;
  };
  previousContext?: string;
  targetTokens: number;
  lengthHintsBySubtopic?: Array<{ chapterId: string; subtopicIndex: number; targetTokens: number; targetWords?: number }>;
  subtaskOrder: number;
  totalSubtasks: number;
  curriculumType?: 'cbc' | 'gcse' | 'upskill';
}) {
  const {
    grade,
    subject,
    topic,
    specification,
    curriculumContext,
    toc,
    subtaskRange,
    previousContext,
    targetTokens,
    lengthHintsBySubtopic,
    subtaskOrder,
    totalSubtasks,
    curriculumType = 'cbc',
  } = params;

  const tocStr = JSON.stringify(toc, null, 2);
  const rangeStr = JSON.stringify(subtaskRange, null, 2);
  const isFirst = subtaskOrder === 1;
  const isLast = subtaskOrder === totalSubtasks;
  
  const curriculumName = curriculumType === 'gcse' ? 'Cambridge GCSE/IGCSE-aligned' : (curriculumType === 'upskill' ? 'job-ready, professional' : 'CBC-aligned');
  const pedagogicalElements = curriculumType === 'gcse'
    ? 'learning objectives (aligned to AOs), prior knowledge, detailed explanations with exam techniques, worked examples with mark scheme insights, practice questions (exam-style where appropriate), real-life applications, mini-summaries'
    : (curriculumType === 'upskill'
      ? 'clear objectives, prior knowledge activation, deep conceptual coverage, hands-on tasks or projects, realistic workflows, troubleshooting, best practices, practice questions, mini-summaries'
      : 'learning objectives, prior knowledge, detailed explanations, worked examples, practice questions, real-life Kenyan applications, mini-summaries');
  const contextExamples = curriculumType === 'gcse'
    ? 'Use international examples with British English conventions where appropriate.'
    : (curriculumType === 'upskill'
      ? 'Use industry-relevant, real-world examples and toolchains (clearly labeled).'
      : 'Kenyan context: use KES, local names, familiar scenarios.');

  return `You are writing part ${subtaskOrder} of ${totalSubtasks} for an immersive ${curriculumName} lesson.

Grade: ${grade}
Subject: ${subject}
Topic: ${topic}
Specifics: ${specification ?? 'none'}
Curriculum context: ${curriculumContext ?? 'n/a'}

Full Table of Contents:
${tocStr}

Your assigned range (part ${subtaskOrder}/${totalSubtasks}):
${rangeStr}

${previousContext ? `Previous content summary:\n${previousContext}\n` : ''}

Target: ~${targetTokens} tokens for this subtask.
${lengthHintsBySubtopic && lengthHintsBySubtopic.length ? `Per-subtopic length guide (adhere ±10%): ${JSON.stringify(lengthHintsBySubtopic)}` : ''}

Your task:
1. Write detailed, textbook-quality content for the assigned range only.
2. ${isFirst ? 'Start with a lesson title <h1> and introduction.' : 'Continue seamlessly from the previous section.'}
3. Include all pedagogical elements: ${pedagogicalElements}.
4. Use semantic HTML tags (h2, h3, p, ul, ol, table, etc.).
5. Embed image suggestions as HTML comments: <!-- image: description -->.
6. Place quiz anchors at natural checkpoints: <div id="quiz-sec-X"></div>.
7. ${isLast ? 'Conclude with a comprehensive lesson summary and next steps.' : 'End at a natural break point for continuity.'}

Return strict JSON:
{
  "outlineDelta": ["Brief point 1", "Brief point 2", ...],
  "sections": [
    {
      "id": "sec-X-Y",
      "title": "Section title",
      "html": "<h2 id='chap-X'>...</h2>...",
      "quizAnchorId": "quiz-sec-X"
    },
    ...
  ],
  "contentChunk": "Full concatenated HTML for this subtask"
}

HTML format requirements:
- Chapter headings: <h2 id="chap-X">Title</h2>
- Subsections: <h3>Subtopic</h3>
- Math: use <sup>, <sub>, and × for multiplication (no LaTeX).
- Include worked examples with step-by-step reasoning.
- ${contextExamples}
- Keep content focused, clear, and age-appropriate for ${grade}.
- Ensure html is self-contained (no external scripts/styles).`;
}
