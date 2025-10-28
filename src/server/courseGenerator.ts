import { getOpenAI } from '@/lib/ai/openai';
import { systemCoursePlanner, cbcCoursePlannerPrompt, gcseCoursePlannerPrompt, customCoursePlannerPrompt, chapterLessonPlannerPrompt, courseLessonSchedulerPrompt } from '@/lib/ai/prompts';
import type { CourseChapter, CourseSubject, ChapterLessonPlan, CourseLessonSchedule } from '@/lib/types';

interface CBCCourseParams {
  grade: string;
  subjects: string[];
  curriculumContext: {
    grade: string;
    subjects: CourseSubject[];
  };
}

interface GCSECourseParams {
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
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 8000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Empty response from AI');
    }

    // Parse JSON response with robust cleaning
    let parsedResponse;
    try {
      // Remove markdown code blocks and any extra text before/after JSON
      let cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // Find the first { and last } to extract pure JSON
      const firstBrace = cleanedContent.indexOf('{');
      const lastBrace = cleanedContent.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1);
      }
      
      parsedResponse = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('[CBC Course Generator] Failed to parse AI response.');
      console.error('[CBC Course Generator] Parse error:', parseError);
      
      // Log the problematic area (500 chars around the error position)
      if (parseError instanceof SyntaxError) {
        const match = parseError.message.match(/position (\d+)/);
        if (match) {
          const errorPos = parseInt(match[1]);
          const start = Math.max(0, errorPos - 250);
          const end = Math.min(content.length, errorPos + 250);
          console.error('[CBC Course Generator] Context around error:');
          console.error(content.substring(start, end));
        }
      }
      
      // Try to salvage by fixing common issues
      try {
        console.log('[CBC Course Generator] Attempting JSON repair...');
        let repairedContent = content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        const firstBrace = repairedContent.indexOf('{');
        const lastBrace = repairedContent.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
          repairedContent = repairedContent.substring(firstBrace, lastBrace + 1);
        }
        
        // Fix common issues: trailing commas, missing commas, unescaped quotes
        repairedContent = repairedContent
          .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
          .replace(/([}\]])(\s*)([{[])/g, '$1,$2$3')  // Add missing commas between objects/arrays
          .replace(/"\s*\n\s*"/g, '",\n"');  // Add missing commas between strings
        
        parsedResponse = JSON.parse(repairedContent);
        console.log('[CBC Course Generator] JSON repair successful!');
      } catch (repairError) {
        console.error('[CBC Course Generator] Repair failed:', repairError);
        console.error('[CBC Course Generator] Full raw content length:', content.length);
        throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
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

export async function generateGCSECourseTOC(params: GCSECourseParams) {
  const { grade, subjects, curriculumContext } = params;

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

  const prompt = gcseCoursePlannerPrompt({
    grade,
    subjects,
    curriculumDetails,
  });

  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemCoursePlanner },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 8000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Empty response from AI');
    }

    let parsedResponse;
    try {
      // Remove markdown code blocks and any extra text before/after JSON
      let cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // Find the first { and last } to extract pure JSON
      const firstBrace = cleanedContent.indexOf('{');
      const lastBrace = cleanedContent.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1);
      }
      
      parsedResponse = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('[GCSE Course Generator] Failed to parse AI response.');
      console.error('[GCSE Course Generator] Raw content:', content);
      console.error('[GCSE Course Generator] Parse error:', parseError);
      throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    return {
      courseName: parsedResponse.courseName || `${grade} Complete GCSE Curriculum`,
      description: parsedResponse.description || 'GCSE-aligned comprehensive course',
      estimatedDuration: parsedResponse.estimatedDuration || '16 weeks',
      chapters: parsedResponse.chapters || [],
    };
  } catch (error) {
    console.error('Error generating GCSE course TOC:', error);
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
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 6000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Empty response from AI');
    }

    // Parse JSON response with robust cleaning
    let parsedResponse;
    try {
      // Remove markdown code blocks and any extra text before/after JSON
      let cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // Find the first { and last } to extract pure JSON
      const firstBrace = cleanedContent.indexOf('{');
      const lastBrace = cleanedContent.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1);
      }
      
      parsedResponse = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('[Custom Course Generator] Failed to parse AI response.');
      console.error('[Custom Course Generator] Raw content:', content);
      console.error('[Custom Course Generator] Parse error:', parseError);
      throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
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

// ============================
// Agent 2: Lesson Planning
// ============================

interface CourseLessonPlanParams {
  courseId: string;
  courseName: string;
  grade: string;
  chapters: CourseChapter[];
  subjects: CourseSubject[];
  estimatedDurationWeeks: number;
  lessonsPerWeek?: number;
  startDate?: string;
}

export async function generateCourseLessonPlan(params: CourseLessonPlanParams) {
  const { courseId, courseName, grade, chapters, subjects, estimatedDurationWeeks, lessonsPerWeek = 4, startDate } = params;

  try {
    const openai = getOpenAI();

    // Build curriculum details map for quick lookup
    const subjectMap = new Map<string, CourseSubject>();
    subjects.forEach(s => subjectMap.set(s.subject, s));

    // Step 1: Generate lesson plans for each chapter
    console.log(`[LessonPlanner] Planning lessons for ${chapters.length} chapters...`);
    const chapterLessonPlans: ChapterLessonPlan[] = [];

    // Process chapters in batches of 3 to avoid overwhelming API
    for (let i = 0; i < chapters.length; i += 3) {
      const batch = chapters.slice(i, i + 3);
      const batchPromises = batch.map(async (chapter) => {
        const subjectData = subjectMap.get(chapter.subject);
        const curriculumDetails = subjectData
          ? subjectData.strands
              .filter(strand => !chapter.strandId || strand.id === chapter.strandId)
              .map(strand => {
                const subtopicsText = strand.subtopics.map((st, idx) => `      ${idx + 1}. ${st}`).join('\n');
                return `    ${strand.name} (${strand.id}):\n      Description: ${strand.description}\n      Subtopics:\n${subtopicsText}`;
              })
              .join('\n\n')
          : 'No specific curriculum details available';

        const prompt = chapterLessonPlannerPrompt({
          grade,
          chapterTitle: chapter.title,
          subject: chapter.subject,
          strandId: chapter.strandId,
          strandName: chapter.strandName,
          topics: chapter.topics,
          chapterDescription: chapter.description,
          curriculumDetails,
          targetChapterWeeks: Math.ceil(estimatedDurationWeeks / chapters.length),
        });

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemCoursePlanner },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        });

        const content = response.choices[0]?.message?.content?.trim();
        if (!content) {
          throw new Error(`Empty response for chapter ${chapter.id}`);
        }

        // Robust JSON extraction
        let cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const firstBrace = cleanedContent.indexOf('{');
        const lastBrace = cleanedContent.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1);
        }
        
        let parsed;
        try {
          parsed = JSON.parse(cleanedContent) as ChapterLessonPlan;
        } catch (parseError) {
          console.error(`[LessonPlanner] Failed to parse chapter "${chapter.title}"`);
          console.error('[LessonPlanner] Raw content:', content);
          console.error('[LessonPlanner] Parse error:', parseError);
          throw new Error(`Invalid JSON for chapter ${chapter.id}: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
        
        console.log(`[LessonPlanner] Chapter "${chapter.title}": ${parsed.lessons.length} lessons, ${parsed.totalEstimatedMinutes} min`);
        
        return parsed;
      });

      const batchResults = await Promise.all(batchPromises);
      chapterLessonPlans.push(...batchResults);
    }

    // Step 2: Create course-wide schedule
    console.log(`[LessonPlanner] Creating schedule for ${chapterLessonPlans.reduce((sum, ch) => sum + ch.lessons.length, 0)} total lessons...`);
    
    const schedulePrompt = courseLessonSchedulerPrompt({
      courseName,
      grade,
      totalWeeks: estimatedDurationWeeks,
      lessonsPerWeek,
      chapterLessonPlans: chapterLessonPlans.map(ch => ({
        chapterId: ch.chapterId,
        chapterTitle: ch.chapterTitle,
        lessons: ch.lessons.map(l => ({
          id: l.id,
          title: l.title,
          targetDurationMin: l.targetDurationMin,
          order: l.order,
        })),
      })),
      startDate,
    });

    const scheduleResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemCoursePlanner },
        { role: 'user', content: schedulePrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 8000,
    });

    const scheduleContent = scheduleResponse.choices[0]?.message?.content?.trim();
    if (!scheduleContent) {
      throw new Error('Empty response from scheduler');
    }

    // Robust JSON extraction
    let cleanedScheduleContent = scheduleContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const firstBrace = cleanedScheduleContent.indexOf('{');
    const lastBrace = cleanedScheduleContent.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedScheduleContent = cleanedScheduleContent.substring(firstBrace, lastBrace + 1);
    }
    
    let schedule;
    try {
      schedule = JSON.parse(cleanedScheduleContent) as Omit<CourseLessonSchedule, 'courseId' | 'createdAt'>;
    } catch (parseError) {
      console.error('[LessonPlanner] Failed to parse schedule');
      console.error('[LessonPlanner] Raw content:', scheduleContent);
      console.error('[LessonPlanner] Parse error:', parseError);

      // Attempt repair for common JSON issues
      try {
        console.log('[LessonPlanner] Attempting schedule JSON repair...');
        let repaired = scheduleContent
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        const fb = repaired.indexOf('{');
        const lb = repaired.lastIndexOf('}');
        if (fb !== -1 && lb !== -1 && lb > fb) {
          repaired = repaired.substring(fb, lb + 1);
        }

        // Heuristics: remove trailing commas, add missing commas between objects/arrays, fix string comma lines
        repaired = repaired
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/([}\]])(\s*)([{[])/g, '$1,$2$3')
          .replace(/"\s*\n\s*"/g, '",\n"');

        schedule = JSON.parse(repaired) as Omit<CourseLessonSchedule, 'courseId' | 'createdAt'>;
        console.log('[LessonPlanner] Schedule JSON repair successful');
      } catch (repairError) {
        console.error('[LessonPlanner] Schedule repair failed:', repairError);
        // Provide context around the reported position if available
        if (parseError instanceof SyntaxError) {
          const match = String(parseError.message).match(/position (\d+)/);
          if (match) {
            const pos = parseInt(match[1]);
            const start = Math.max(0, pos - 250);
            const end = Math.min(scheduleContent.length, pos + 250);
            console.error('[LessonPlanner] Context around error:', scheduleContent.substring(start, end));
          }
        }
        throw new Error(`Invalid JSON from scheduler: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }

    console.log(`[LessonPlanner] Schedule created: ${schedule.actualLessonsScheduled} lessons over ${schedule.totalWeeks} weeks`);
    if (schedule.overflow > 0) {
      console.warn(`[LessonPlanner] Warning: ${schedule.overflow} lessons don't fit in the current schedule`);
    }

    return {
      chapterLessonPlans,
      schedule: {
        ...schedule,
        courseId,
        createdAt: new Date().toISOString(),
      } as CourseLessonSchedule,
    };
  } catch (error) {
    console.error('[LessonPlanner] Error generating lesson plan:', error);
    throw error;
  }
}
