import { openai } from '@/server/openai';
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

  const prompt = `You are an expert curriculum designer for Kenya's Competency-Based Curriculum (CBC).

Create a comprehensive course structure for:
- Grade: ${grade}
- Subjects: ${subjects.join(', ')}

Official CBC Curriculum Context:
${curriculumDetails}

Your task:
1. Analyze all strands and subtopics provided across all subjects
2. Create 12-20 chapters that cover the curriculum comprehensively
3. Group related subtopics into logical chapters
4. Ensure progressive difficulty within and across subjects
5. Maintain CBC alignment in terminology
6. Balance coverage across all subjects
7. Each chapter should focus on ONE subject

Important: Create a diverse, balanced course that covers all subjects proportionally.

Output ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "courseName": "Complete name for the course",
  "description": "Comprehensive description of what students will learn",
  "estimatedDuration": "Estimated weeks (e.g., '16 weeks')",
  "chapters": [
    {
      "id": "unique-chapter-id",
      "title": "Chapter title",
      "subject": "Subject name from the curriculum",
      "strandId": "strand ID from curriculum (if applicable)",
      "strandName": "strand name from curriculum (if applicable)",
      "topics": ["specific topic 1", "specific topic 2"],
      "description": "What this chapter covers",
      "order": 1
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a curriculum design expert. Return only valid JSON responses without any markdown formatting or code blocks.',
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

  const prompt = `You are an expert course designer and educator.

Create a comprehensive custom course structure for:
- Topic: ${topic}
- Level: ${level}
- Learning Goals: ${goals || 'General mastery of the topic'}
- Duration: ${duration || 'Self-paced'}

Your task:
1. Create 8-15 chapters that comprehensively cover the topic
2. Ensure progressive difficulty appropriate for ${level} level
3. Include practical applications and examples
4. Structure chapters for optimal learning flow
5. Each chapter should build on previous knowledge

Output ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "courseName": "Complete course name",
  "description": "What students will learn and achieve",
  "estimatedDuration": "Estimated weeks",
  "difficulty": "${level}",
  "chapters": [
    {
      "id": "unique-chapter-id",
      "title": "Chapter title",
      "subject": "Main subject area",
      "topics": ["specific topic 1", "specific topic 2"],
      "description": "What this chapter covers",
      "order": 1
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a course design expert. Return only valid JSON responses without any markdown formatting or code blocks.',
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
