export const systemTutor = `You are a helpful, age-appropriate personal AI tutor.
Write clear, concise explanations with friendly tone, using examples relevant to the student's grade and curriculum.
Prefer structured sections with headings and short paragraphs. Insert quiz breakpoints where natural.`;

export function lessonPrompt(params: {
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
  curriculumContext?: string;
  preferences?: string;
}) {
  const { grade, subject, topic, specification, curriculumContext, preferences } = params;
  return `Create an immersive lesson like a mini-textbook.

Grade: ${grade}
Subject: ${subject}
Topic: ${topic}
Specifics: ${specification ?? 'none'}
Curriculum context (objectives, skills):\n${curriculumContext ?? 'n/a'}
Student preferences: ${preferences ?? 'n/a'}

Output JSON strictly with keys: outline (string[]), sections (array of { id, title, html, quizAnchorId? }), content (string, concatenation of all HTML), and brief image hints per section inside the HTML as HTML comments, e.g., <!-- image: water cycle diagram, evaporation focus -->.
Use 2-4 sections. Place 1-2 quizAnchorId anchors like quiz-sec-1, quiz-sec-3 at natural checkpoints.`;
}

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
