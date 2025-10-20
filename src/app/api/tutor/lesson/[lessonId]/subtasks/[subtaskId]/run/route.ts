import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { curriculumContext } from '@/lib/curriculum';
import { getLesson, getSubtask, getAllSubtasks, updateSubtaskStatus, setSubtaskResult, incrementSubtaskAttempts, addProgressEvent } from '@/lib/lessonStore';
import { getOpenAI, OPENAI_CHAT_MODEL } from '@/lib/ai/openai';
import { systemTutor, systemTutorGCSE, sectionWriterPrompt } from '@/lib/ai/prompts';
import { extractContinuityContext } from '@/lib/ai/assembler';
import crypto from 'crypto';

const MAX_RETRIES = 3;

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ lessonId: string; subtaskId: string }> }
) {
  try {
    const user = await requireUser(req);
    const { lessonId, subtaskId } = await ctx.params;
    
    console.log('[subtask/run] Starting subtask execution:', { lessonId, subtaskId, uid: user.uid });
    
    // Get lesson and subtask
    const lesson = await getLesson(lessonId);
    if (!lesson) {
      return new Response(JSON.stringify({ message: 'Lesson not found' }), { status: 404 });
    }
    
    if (lesson.uid !== user.uid) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 403 });
    }
    
    const subtask = await getSubtask(lessonId, subtaskId);
    if (!subtask) {
      return new Response(JSON.stringify({ message: 'Subtask not found' }), { status: 404 });
    }
    
    // Check if already completed
    if (subtask.status === 'completed') {
      return new Response(
        JSON.stringify({ message: 'Subtask already completed', result: subtask.result }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check retry limit
    if (subtask.attempts >= MAX_RETRIES) {
      await updateSubtaskStatus(lessonId, subtaskId, 'failed', 'Max retries exceeded');
      return new Response(
        JSON.stringify({ message: 'Max retries exceeded' }),
        { status: 429 }
      );
    }
    
  // Increment attempts
    await incrementSubtaskAttempts(lessonId, subtaskId);
    await updateSubtaskStatus(lessonId, subtaskId, 'in-progress');
  // Emit subtask_started event if we can infer run (optional: not available here, so skip runId)
    
    // Get all subtasks to determine total count and get previous context
    const allSubtasks = await getAllSubtasks(lessonId);
    const totalSubtasks = allSubtasks.length;
    
    // Get previous context if not first subtask
    let previousContext = '';
    if (subtask.order > 1) {
      const previousSubtask = allSubtasks.find((st) => st.order === subtask.order - 1);
      if (previousSubtask?.result?.contentChunk) {
        previousContext = extractContinuityContext(previousSubtask.result.contentChunk);
      }
    }
    
    // Detect curriculum type from grade
    const curriculumType = lesson.grade.toLowerCase().includes('cambridge') || 
                           lesson.grade.toLowerCase().includes('gcse') || 
                           lesson.grade.toLowerCase().includes('igcse') || 
                           lesson.grade.toLowerCase().includes('british') || 
                           lesson.grade.toLowerCase().includes('year') ? 'gcse' : 'cbc';
    
    // Use appropriate system prompt
    const systemPrompt = curriculumType === 'gcse' ? systemTutorGCSE : systemTutor;
    
    const context = curriculumContext(lesson.grade, lesson.subject, lesson.topic);
    
    console.log('[subtask/run] Calling OpenAI:', {
      lessonId,
      subtaskId,
      model: OPENAI_CHAT_MODEL,
      subtaskOrder: subtask.order,
      totalSubtasks,
      curriculumType,
    });
    
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: sectionWriterPrompt({
            grade: lesson.grade,
            subject: lesson.subject,
            topic: lesson.topic,
            specification: lesson.specification,
            curriculumContext: context,
            toc: lesson.toc,
            subtaskRange: subtask.range,
            previousContext,
            targetTokens: subtask.targetTokens,
            subtaskOrder: subtask.order,
            totalSubtasks,
            curriculumType,
          }),
        },
      ],
    });
    
    console.log('[subtask/run] OpenAI response received:', {
      lessonId,
      subtaskId,
      hasContent: !!completion.choices?.[0]?.message?.content,
    });
    
    const content = completion.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content) as {
      outlineDelta: string[];
      sections: Array<{ id: string; title: string; html: string; quizAnchorId?: string }>;
      contentChunk: string;
    };
    
    // Compute hash
    const hash = crypto.createHash('sha256').update(parsed.contentChunk).digest('hex');
    
    // Save result
    await setSubtaskResult(lessonId, subtaskId, {
      outlineDelta: parsed.outlineDelta,
      sections: parsed.sections,
      contentChunk: parsed.contentChunk,
      hash,
    });
    
    return new Response(
      JSON.stringify({
        subtaskId,
        status: 'completed',
        result: {
          outlineDelta: parsed.outlineDelta,
          sections: parsed.sections,
          contentChunk: parsed.contentChunk,
          hash,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e: unknown) {
    const { lessonId, subtaskId } = await ctx.params;
    const err = e as { status?: number; message?: string; stack?: string };
    const message = err?.message ?? 'Failed to execute subtask';
    
    // Log detailed error for debugging
    console.error('[subtask/run] Error executing subtask:', {
      lessonId,
      subtaskId,
      error: message,
      stack: err?.stack,
      fullError: err,
    });
    
    try {
      await updateSubtaskStatus(lessonId, subtaskId, 'failed', message);
    } catch (updateError) {
      console.error('[subtask/run] Failed to update subtask status:', updateError);
    }
    
    const status = err?.status ?? 500;
    return new Response(JSON.stringify({ message, error: err?.stack || message }), { status });
  }
}

