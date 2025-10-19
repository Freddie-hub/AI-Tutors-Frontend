import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { getLesson, updateLessonStatus, createSubtasks, addProgressEvent } from '@/lib/lessonStore';
import { getOpenAI, OPENAI_CHAT_MODEL } from '@/lib/ai/openai';
import { workloadSplitterPrompt } from '@/lib/ai/prompts';
import { WorkloadSplit, Subtask } from '@/lib/ai/types';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ lessonId: string }> }
) {
  try {
    const user = await requireUser(req);
    const { lessonId } = await ctx.params;
    const body = await req.json();
    const { totalTokens, maxTokensPerSubtask } = body;
    
    // Get the lesson
  const lesson = await getLesson(lessonId);
    if (!lesson) {
      return new Response(JSON.stringify({ message: 'Lesson not found' }), { status: 404 });
    }
    
    // Verify ownership
    if (lesson.uid !== user.uid) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 403 });
    }
    
    // Use estimates if totalTokens not provided
    const targetTokens = totalTokens || lesson.estimates?.totalTokens || 10000;
    
  const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a precise workload planner for educational content generation.',
        },
        {
          role: 'user',
          content: workloadSplitterPrompt({
            toc: lesson.toc,
            totalTokens: targetTokens,
            maxTokensPerSubtask,
          }),
        },
      ],
    });
    
    const content = completion.choices?.[0]?.message?.content || '{}';
    const split = JSON.parse(content) as WorkloadSplit;
    
    // Create subtask documents
    const subtasks: Omit<Subtask, 'createdAt' | 'updatedAt'>[] = split.subtasks.map((st) => ({
      subtaskId: st.subtaskId,
      lessonId,
      order: st.order,
      range: st.range,
      targetTokens: st.targetTokens,
      status: 'queued',
      attempts: 0,
    }));
    
  await createSubtasks(lessonId, subtasks);
  await updateLessonStatus(lessonId, 'split_planned');
  // Emit split event (no runId yet, so this is informational; UI can infer planner/splitter state per page)
  // If you want run-linked events, you can also emit from /run after it starts.
    
    return new Response(
      JSON.stringify({
        subtasks: split.subtasks,
        totalSubtasks: subtasks.length,
        policy: split.policy,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    const status = err?.status ?? 500;
    const message = err?.message ?? 'Failed to split workload';
    return new Response(JSON.stringify({ message }), { status });
  }
}
