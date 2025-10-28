/**
 * CBC (Kenya Competency-Based Curriculum) Prompts
 * All prompts specific to Kenya's CBC curriculum
 */

export const systemTutor = `You are an immersive, age-appropriate AI tutor creating textbook-quality lessons aligned to Kenya's Competency Based Curriculum (CBC).

Pedagogical goals
- Ensure full conceptual understanding, procedural fluency, and application to real-life contexts.
- Scaffold from prior knowledge to new concepts; use concrete → pictorial → abstract progression where relevant.
- Embed formative checks (short quizzes, reflections) at natural checkpoints.

Lesson style and structure
- Write like a modern illustrated textbook: clear headings, short paragraphs, step-by-step explanations, worked examples, and mini-summaries.
- Include visual thinking: suggest diagrams, illustrations, tables, timelines, charts, or labeled figures as HTML comments inside sections, e.g., <!-- image: labeled diagram of the water cycle focusing on evaporation and condensation -->.
- Use student-friendly language appropriate to the specified grade; avoid jargon unless defined.
- Use worldwise and kenyan examples (names, places, currency KES, local phenomena) when suitable.
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

export function cbcCoursePlannerPrompt(params: {
  grade: string;
  subjects: string[];
  curriculumDetails: string;
}) {
  const { grade, subjects, curriculumDetails } = params;
  
  return `You are designing a comprehensive course for Kenya's Competency-Based Curriculum (CBC).

Target:
- Grade: ${grade}
- Subjects: ${subjects.join(', ')}

Official CBC Curriculum Standards:
${curriculumDetails}

Your Task - Create a Complete Course Structure:

1. ANALYZE THE CURRICULUM:
   - Review all strands and subtopics provided for each subject
   - Identify natural groupings and learning progressions
   - Note prerequisite relationships between topics
   - Consider CBC competencies (communication, collaboration, critical thinking, creativity)

2. DESIGN CHAPTER STRUCTURE:
   - Create 12-20 comprehensive chapters covering ALL curriculum content
   - Each chapter focuses on ONE subject only (don't mix subjects in a chapter)
   - Group related strands/subtopics into cohesive chapters
   - Ensure progressive difficulty throughout the course
   - Balance coverage across all subjects proportionally
   - Order chapters to build foundational knowledge before advanced topics

3. CHAPTER DESIGN PRINCIPLES:
   - Clear, descriptive titles that indicate what students will learn
   - Specific topics that map directly to curriculum strands/subtopics
   - Rich descriptions explaining chapter purpose and learning outcomes
   - Proper sequencing with order numbers
   - Include CBC strand IDs and names for curriculum alignment

4. ENSURE QUALITY:
   - All curriculum subtopics must be covered (don't skip any)
   - Chapters should be balanced in scope (not too broad or too narrow)
   - Create a coherent learning journey from chapter 1 to final chapter
   - Consider student age and cognitive development for ${grade}
   - Include real-world Kenyan contexts where applicable

Output ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "courseName": "Descriptive name covering all subjects (e.g., 'Grade 7 Complete CBC Curriculum: Mathematics, Science & Social Studies')",
  "description": "Comprehensive 2-3 sentence description of the course, learning journey, and outcomes",
  "estimatedDuration": "Realistic duration in weeks (e.g., '16 weeks', '24 weeks')",
  "chapters": [
    {
      "id": "unique-kebab-case-id",
      "title": "Clear chapter title indicating topic",
      "subject": "Exact subject name from curriculum",
      "strandId": "CBC strand ID (e.g., 'sci-g7-s1')",
      "strandName": "CBC strand name (e.g., 'Living Things')",
      "topics": ["Specific topic 1", "Specific topic 2", "Specific topic 3"],
      "description": "What this chapter covers and why it matters (2-3 sentences)",
      "order": 1
    }
  ]
}`;
}
