/**
 * Upskill Prompts
 * All prompts for job-ready, professional learning (no formal curriculum)
 */

export const systemTutorUpskill = `You are a world-class expert instructor and mentor crafting rigorous, job-ready learning materials for self-directed learners.

Teaching principles
- Engineer professional-grade, industry-relevant explanations with clarity and depth.
- Blend conceptual mastery with hands-on practice, projects, and troubleshooting.
- Optimize for employability: real-world workflows, best practices, common pitfalls.
- Respect time constraints: offer quick wins, progressive complexity, and checkpoints.

Style and structure
- Write like a senior staff engineer or PhD professor who teaches practitioners.
- Use a clear outline, precise terminology (define when introduced), and evidence-based pedagogy.
- Provide runnable examples (where applicable), step-by-step guides, and decision frameworks.
- Include resource recommendations (official docs, tools, communities) when appropriate.

Assessment and reflection
- Include short knowledge checks at natural points (with anchors like quiz-sec-1).
- Encourage reflection and metacognitive strategies ("what to watch out for", "how to debug").

Output discipline
- Maintain a professional, inclusive tone.
- Return exactly the requested formats from the user messages (strict JSON when requested).`;

export function upskillPlannerPrompt(params: {
  goal: string;
  domain?: string;
  currentLevel?: string;
  timeline?: string; // e.g., "3 months", "1 night"
  hoursPerWeek?: number;
  preferences?: string;
  motivation?: string;
}) {
  const { goal, domain, currentLevel, timeline, hoursPerWeek, preferences, motivation } = params;
  return `Design a realistic, job-ready learning plan (no formal curriculum) from the user's goal.

Goal: ${goal}
Domain: ${domain ?? 'general'}
Current level: ${currentLevel ?? 'unspecified'}
Timeline: ${timeline ?? 'unspecified'}
Available time: ${hoursPerWeek ?? 'unspecified'} hours/week
Preferences: ${preferences ?? 'none'}
Motivation/Context: ${motivation ?? 'none'}

Universal Structure Logic (always follow):
1) Define Learning Outcome: one-sentence transformation the learner should achieve.
2) Determine Depth: infer level from the request (intro/intermediate/proficient) and justify briefly.
3) Decompose Topic → Break the main topic into its essential conceptual pillars or subdomains, ensuring that all foundational and applied dimensions are covered.
4) Sequence for Cognition → Arrange these concepts in a logical learning flow — starting from introductory ideas, progressing through development and application, and culminating in synthesis or reflection.
5) Add Immersive Layers: per chapter/subtopic suggest exercises, mini-projects, case studies, reflections, cross-domain links.
6) Automatically determine the amount of detail, explanation, and illustrative content each section requires to deliver full conceptual mastery and learner engagement.(Estimate Content Load: for EACH subtopic estimate words AND tokens (hidden from UI); also sum per chapter and total.)
7) Output Structured Plan with public and private fields.

Return STRICT JSON ONLY (no extra commentary):
{
  "public": {
    "learningOutcome": "...",
    "depthProfile": { "level": "intro|intermediate|proficient", "rationale": "..." },
    "toc": [ { "chapterId": "chap-1", "title": "...", "subtopics": ["...", "..."], "description": "...", "learningGoals": ["...", "..."] } ],
    "immersiveLayers": { "byChapter": [ { "chapterId": "chap-1", "exercises": ["..."], "projects": ["..."], "cases": ["..."], "reflections": ["..."], "crossLinks": ["..."] } ] },
    "recommendedChapterCount": <number>
  },
  "private": {
    "estimates": {
      "totalWords": <number>,
      "totalTokens": <number>,
      "perChapter": [ { "chapterId": "chap-1", "words": <number>, "tokens": <number> } ],
      "perSubtopic": [ { "chapterId": "chap-1", "subtopicIndex": 0, "words": <number>, "tokens": <number> } ]
    },
    "chunking": {
      "cohesionBlocks": [ { "blockId": "block-1", "items": [ { "chapterId": "chap-1", "subtopicIndex": 0 } ], "targetTokens": <number>, "rationale": "..." } ]
    },
    "lengthPolicy": "beast_mode|balanced",
    "sequencingRationale": "..."
  }
}`;
}

export function upskillSectionWriterPrompt(params: {
  topic: string; // derived from goal or milestone
  domain?: string;
  userLevel?: string;
  timeConstraint?: string;
  learningStyle?: string;
  toc: Array<{ chapterId: string; title: string; subtopics: string[] }>;
  subtaskRange: {
    startChapterId: string;
    endChapterId: string;
    startSubtopicIndex?: number;
    endSubtopicIndex?: number;
  };
  previousContext?: string;
  targetTokens: number;
  subtaskOrder: number;
  totalSubtasks: number;
}) {
  const {
    topic,
    domain,
    userLevel,
    timeConstraint,
    learningStyle,
    toc,
    subtaskRange,
    previousContext,
    targetTokens,
    subtaskOrder,
    totalSubtasks,
  } = params;

  const tocStr = JSON.stringify(toc, null, 2);
  const rangeStr = JSON.stringify(subtaskRange, null, 2);
  const isFirst = subtaskOrder === 1;
  const isLast = subtaskOrder === totalSubtasks;

  return `You are writing part ${subtaskOrder} of ${totalSubtasks} of a professional, job-ready lesson.

Topic: ${topic}
Domain: ${domain ?? 'general'}
Learner Level: ${userLevel ?? 'unspecified'}
Learning Style: ${learningStyle ?? 'unspecified'}
${timeConstraint ? `Time Constraint: ${timeConstraint}` : ''}

Full TOC:
${tocStr}

Assigned range (part ${subtaskOrder}/${totalSubtasks}):
${rangeStr}

${previousContext ? `Previous content summary:\n${previousContext}\n` : ''}

Target: ~${targetTokens} tokens for this subtask.

Your task:
1. Write rigorous, practitioner-focused content for the assigned range only.
2. ${isFirst ? 'Start with <h1> title and a concise, motivating intro.' : 'Continue seamlessly from the previous section.'}
3. Include: clear objectives, conceptual depth, hands-on steps, runnable/code examples (if applicable), best practices, troubleshooting, decision frameworks.
4. Use semantic HTML (h2/h3, p, ul/ol, table, code/pre, figure/figcaption) and include image suggestions as HTML comments: <!-- image: description -->.
5. Insert quiz anchors at natural checkpoints: <div id="quiz-sec-X"></div>.
6. ${isLast ? 'Conclude with a comprehensive summary and next steps (projects or further reading).' : 'End at a natural break point for continuity.'}

Return STRICT JSON:
{
  "outlineDelta": ["..."],
  "sections": [ { "id": "sec-X-Y", "title": "...", "html": "<h2 id='chap-X'>...</h2>...", "quizAnchorId": "quiz-sec-X" } ],
  "contentChunk": "<h2>...</h2>..."
}`;
}
