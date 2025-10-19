import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { getLesson, getRun, cancelRun, updateLessonStatus, addProgressEvent } from '@/lib/lessonStore';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ lessonId: string }> }
) {
  try {
    const user = await requireUser(req);
    const { lessonId } = await ctx.params;
    const body = await req.json();
    const { runId } = body;
    
    if (!runId) {
      return new Response(JSON.stringify({ message: 'runId required' }), { status: 400 });
    }
    
    // Get the lesson
    const lesson = await getLesson(lessonId);
    if (!lesson) {
      return new Response(JSON.stringify({ message: 'Lesson not found' }), { status: 404 });
    }
    
    if (lesson.uid !== user.uid) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 403 });
    }
    
    // Get the run
    const run = await getRun(lessonId, runId);
    if (!run) {
      return new Response(JSON.stringify({ message: 'Run not found' }), { status: 404 });
    }
    
    // Cancel the run
    await cancelRun(lessonId, runId);
    await updateLessonStatus(lessonId, 'cancelled');
    await addProgressEvent(lessonId, runId, {
      type: 'cancelled',
      data: { message: 'Run cancelled by user' },
      agent: 'writer',
    });
    
    return new Response(
      JSON.stringify({
        message: 'Run cancelled successfully',
        runId,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    const status = err?.status ?? 500;
    const message = err?.message ?? 'Failed to cancel run';
    return new Response(JSON.stringify({ message }), { status });
  }
}
