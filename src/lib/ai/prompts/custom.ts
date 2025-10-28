/**
 * Custom Course Prompts
 * Prompts for creating custom, personalized learning courses
 */

export function customCoursePlannerPrompt(params: {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  goals?: string;
  duration?: string;
}) {
  const { topic, level, goals, duration } = params;
  
  const levelGuidance = {
    beginner: 'Focus on fundamentals, clear explanations, lots of examples, gentle progression',
    intermediate: 'Assume basic knowledge, focus on deeper understanding, practical applications, moderate pace',
    advanced: 'Assume strong foundation, focus on mastery, complex applications, efficient progression'
  }[level];
  
  return `You are designing a custom learning course tailored to specific student goals.

Course Request:
- Topic: ${topic}
- Level: ${level}
- Learning Goals: ${goals || 'General mastery and comprehensive understanding'}
- Target Duration: ${duration || 'Self-paced, flexible timeline'}

Level Guidance (${level}):
${levelGuidance}

Your Task - Create a Personalized Course Structure:

1. UNDERSTAND THE LEARNING GOAL:
   - What does the learner want to achieve with "${topic}"?
   - What are the essential concepts, skills, and applications?
   - What prerequisite knowledge is needed?
   - What are the practical outcomes or projects?

2. DESIGN OPTIMAL LEARNING PATH:
   - Create 8-15 chapters that comprehensively cover the topic
   - Structure for ${level} level learners
   - Start with foundations (even for advanced, establish context)
   - Progress logically through concepts
   - Include practical applications and projects
   - Build toward mastery and independence

3. CHAPTER DESIGN PRINCIPLES:
   - Each chapter should be completable in 1-2 learning sessions
   - Clear learning objectives for each chapter
   - Mix theory with practice
   - Include real-world applications and examples
   - Ensure chapters build on previous knowledge
   - End with capstone or synthesis chapter

4. ENSURE ENGAGEMENT:
   - Make content relevant to learner goals
   - Include diverse learning activities
   - Provide clear value in each chapter
   - Create natural progression that maintains motivation
   - Consider practical projects or portfolios

Output ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "courseName": "Engaging, descriptive course name (e.g., 'Master Web Development: From Basics to Full-Stack')",
  "description": "Compelling 2-3 sentence description of what learner will achieve and how",
  "estimatedDuration": "Realistic duration (e.g., '8 weeks', '12 weeks', 'Self-paced')",
  "difficulty": "${level}",
  "chapters": [
    {
      "id": "unique-kebab-case-id",
      "title": "Clear, engaging chapter title",
      "subject": "Main subject/domain area",
      "topics": ["Specific topic/skill 1", "Specific topic/skill 2", "Specific topic/skill 3"],
      "description": "What this chapter covers and why it matters for the overall goal (2-3 sentences)",
      "order": 1
    }
  ]
}`;
}
