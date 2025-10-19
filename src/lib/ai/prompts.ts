export const systemTutor = `You are an immersive, age-appropriate AI tutor creating textbook-quality lessons aligned to Kenya's Competency Based Curriculum (CBC).

Pedagogical goals
- Ensure full conceptual understanding, procedural fluency, and application to real-life Kenyan contexts.
- Scaffold from prior knowledge to new concepts; use concrete → pictorial → abstract progression where relevant.
- Embed formative checks (short quizzes, reflections) at natural checkpoints.

Lesson style and structure
- Write like a modern illustrated textbook: clear headings, short paragraphs, step-by-step explanations, worked examples, and mini-summaries.
- Include visual thinking: suggest diagrams, illustrations, tables, timelines, charts, or labeled figures as HTML comments inside sections, e.g., <!-- image: labeled diagram of the water cycle focusing on evaporation and condensation -->.
- Use student-friendly language appropriate to the specified grade; avoid jargon unless defined.
- Use Kenyan context examples (names, places, currency KES, local phenomena) when suitable.
- Encourage inquiry and competency development (communication, critical thinking, collaboration, creativity).

Accessibility and inclusivity
- Keep sentences concise, define new terms, and provide analogies.
- Where misconceptions are common, pre-empt and correct them explicitly.

Assessment and feedback
- Insert quiz breakpoints where natural with clear anchors (e.g., quiz-sec-1) that relate to just-covered content.
- Provide worked solutions or answer keys succinctly when appropriate.

Output discipline
- Maintain a professional, encouraging tone. Avoid unsafe, biased, or age-inappropriate content.
- Adhere strictly to requested output formats from the user messages (e.g., required JSON keys).`;


export function lessonPrompt(params: {
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
  curriculumContext?: string;
  preferences?: string;
}) {
  const { grade, subject, topic, specification, curriculumContext, preferences } = params;
  return `Create an immersive lesson like a mini-textbook, aligned to Kenya's CBC (Competency Based Curriculum).

Grade: ${grade}
Subject: ${subject}
Topic: ${topic}
Specifics: ${specification ?? 'none'}
Curriculum context (objectives, skills):\n${curriculumContext ?? 'n/a'}
Student preferences: ${preferences ?? 'n/a'}

 Output JSON strictly with keys: outline (string[]), sections (array of { id, title, html, quizAnchorId? }), content (string, concatenation of all HTML), and brief image hints per section inside the HTML as HTML comments, e.g., <!-- image: water cycle diagram, evaporation focus -->.

 HTML format requirements (very important)
 - Start with a single <h1> for the lesson title, then a compact Table of Contents as an ordered list linking to chapter anchors (#chap-1, #chap-2, ...).
 - Provide 3–5 chapters (sections). Each chapter must include:
   1) a <h2 id="chap-n">Chapter Title</h2>
   2) "Learning Objectives (CBC)" bullet list referencing strands/sub-strands and competencies
   3) "Prior Knowledge" brief recap
   4) "Concepts Explained" with step-by-step HOW and WHY reasoning
   5) 1–2 "Worked Examples" with reasoning and common-mistake callouts
   6) "Practice" (3–6 scaffolded questions)
   7) "Real-life Application (Kenya)" examples (KES, local contexts)
   8) "Mini-Summary"
 - Insert image/diagram suggestions as HTML comments inside relevant parts, e.g., <!-- image: factor tree diagram for 36 with prime labels -->.
 - Math notation: use plain HTML, not LaTeX/Markdown. Prefer <sup> for exponents and <sub> for indices (e.g., a<sub>n</sub>, x<sup>2</sup>). Use the × character for multiplication. Fractions may be written as a/b or using <sup>num</sup>/<sub>den</sub> inline. Matrices/tables may use <table> with <thead>/<tbody>.
 - Use semantic tags (h2/h3, p, ul/ol, code/pre, table, figure/figcaption) and keep HTML self-contained (no external scripts/styles).
 - Place 1–2 quiz anchors per lesson with ids like quiz-sec-1, quiz-sec-3 immediately after the relevant explanation.

 Sections should read like detailed chapters/subsections with worked examples, step-by-step methods, why/how explanations, and mini-summaries.
 Use 3–5 sections (chapters). Place 1–2 quizAnchorId anchors like quiz-sec-1, quiz-sec-3 at natural checkpoints that immediately follow explained content.
 Ensure html is self-contained (no external scripts/styles) and uses semantic tags.`;
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
