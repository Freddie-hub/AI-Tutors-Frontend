import { getOpenAI } from '@/lib/ai/openai';
import { systemCoursePlanner, cbcCoursePlannerPrompt, customCoursePlannerPrompt } from '@/lib/ai/prompts';
import type { CourseChapter, CourseSubject } from '@/lib/types';

interface CBCCourseParams {
  grade: string;
  subjects: string[];
  curriculumContext: {
    grade: string;
    subjects: CourseSubject[];
  };
}

interface CustomCourseParams {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  goals?: string;
  duration?: string;
}

export async function generateCBCCourseTOC(params: CBCCourseParams) {
  const { grade, subjects, curriculumContext } = params;

  // Build comprehensive curriculum context
  const curriculumDetails = curriculumContext.subjects
    .map((subj) => {
      const strandsText = subj.strands
        .map((strand) => {
          const subtopicsText = strand.subtopics
            .map((st, i) => `      ${i + 1}. ${st}`)
            .join('\n');
          return `    - ${strand.name} (${strand.id}):\n      Description: ${strand.description}\n      Subtopics:\n${subtopicsText}`;
        })
        .join('\n\n');
      return `  ${subj.subject}:\n${strandsText}`;
    })
    .join('\n\n');

  const prompt = cbcCoursePlannerPrompt({
    grade,
    subjects,
    curriculumDetails,
  });

  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemCoursePlanner,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Empty response from AI');
    }

    // Parse JSON response
    let parsedResponse;
    try {
      // Remove any markdown code blocks if present
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsedResponse = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid JSON response from AI');
    }

    return {
      courseName: parsedResponse.courseName || `${grade} Complete Curriculum`,
      description: parsedResponse.description || 'CBC-aligned comprehensive course',
      estimatedDuration: parsedResponse.estimatedDuration || '16 weeks',
      chapters: parsedResponse.chapters || [],
    };
  } catch (error) {
    console.error('Error generating CBC course TOC:', error);
    throw error;
  }
}

export async function generateCustomCourseTOC(params: CustomCourseParams) {
  const { topic, level, goals, duration } = params;

  const prompt = customCoursePlannerPrompt({
    topic,
    level,
    goals,
    duration,
  });

  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemCoursePlanner,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Empty response from AI');
    }

    // Parse JSON response
    let parsedResponse;
    try {
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsedResponse = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid JSON response from AI');
    }

    return {
      courseName: parsedResponse.courseName || topic,
      description: parsedResponse.description || `Custom course on ${topic}`,
      estimatedDuration: parsedResponse.estimatedDuration || duration || '8 weeks',
      difficulty: parsedResponse.difficulty || level,
      chapters: parsedResponse.chapters || [],
    };
  } catch (error) {
    console.error('Error generating custom course TOC:', error);
    throw error;
  }
}
