import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { getLesson, getSubtask, getAllSubtasks, updateSubtaskStatus, setSubtaskResult, incrementSubtaskAttempts } from '@/lib/lessonStore';
import { getOpenAI, OPENAI_CHAT_MODEL } from '@/lib/ai/openai';
import { systemTutorUpskill, upskillSectionWriterPrompt } from '@/lib/ai/prompts';
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
    if (subtask.status === 'completed') {
      return new Response(JSON.stringify({ message: 'Subtask already completed', result: subtask.result }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (subtask.attempts >= MAX_RETRIES) {
      await updateSubtaskStatus(lessonId, subtaskId, 'failed', 'Max retries exceeded');
      return new Response(JSON.stringify({ message: 'Max retries exceeded' }), { status: 429 });
    }

    await incrementSubtaskAttempts(lessonId, subtaskId);
    await updateSubtaskStatus(lessonId, subtaskId, 'in-progress');

    const allSubtasks = await getAllSubtasks(lessonId);
    const totalSubtasks = allSubtasks.length;

    let previousContext = '';
    if (subtask.order > 1) {
      const previousSubtask = allSubtasks.find((st) => st.order === subtask.order - 1);
      if (previousSubtask?.result?.contentChunk) {
        previousContext = extractContinuityContext(previousSubtask.result.contentChunk);
      }
    }

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemTutorUpskill },
        {
          role: 'user',
          content: upskillSectionWriterPrompt({
            topic: lesson.topic,
            domain: lesson.subject,
            userLevel: lesson.specification,
            toc: lesson.toc,
            subtaskRange: subtask.range,
            previousContext,
            targetTokens: subtask.targetTokens,
            subtaskOrder: subtask.order,
            totalSubtasks,
          }),
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content) as {
      outlineDelta: string[];
      sections: Array<{ id: string; title: string; html: string; quizAnchorId?: string }>;
      contentChunk: string;
    };

    const hash = crypto.createHash('sha256').update(parsed.contentChunk).digest('hex');

    await setSubtaskResult(lessonId, subtaskId, {
      outlineDelta: parsed.outlineDelta,
      sections: parsed.sections,
      contentChunk: parsed.contentChunk,
      hash,
    });

    return new Response(
      JSON.stringify({ subtaskId, status: 'completed', result: { outlineDelta: parsed.outlineDelta, sections: parsed.sections, contentChunk: parsed.contentChunk, hash } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: unknown) {
    const { lessonId, subtaskId } = await ctx.params;
    const err = e as { status?: number; message?: string; stack?: string };
    const message = err?.message ?? 'Failed to execute upskill subtask';
    console.error('[upskill/subtask/run] Error:', { lessonId, subtaskId, error: message, stack: err?.stack });
    try { await updateSubtaskStatus(lessonId, subtaskId, 'failed', message); } catch {}
    const status = err?.status ?? 500;
    return new Response(JSON.stringify({ message, error: err?.stack || message }), { status });
  }
}
