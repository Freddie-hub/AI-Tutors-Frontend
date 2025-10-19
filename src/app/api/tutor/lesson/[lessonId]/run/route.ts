import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import {
  getLesson,
  getAllSubtasks,
  updateLessonStatus,
  createRun,
  getRun,
  updateRunStatus,
  addProgressEvent,
  setLessonFinal,
} from '@/lib/lessonStore';
import { assembleLesson, validateAssembledLesson } from '@/lib/ai/assembler';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ lessonId: string }> }
) {
  try {
    const user = await requireUser(req);
    const { lessonId } = await ctx.params;
    const body = await req.json();
    const { resume = false, runId: existingRunId } = body;
    
    // Get the lesson
    const lesson = await getLesson(lessonId);
    if (!lesson) {
      return new Response(JSON.stringify({ message: 'Lesson not found' }), { status: 404 });
    }
    
    if (lesson.uid !== user.uid) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 403 });
    }
    
    // Get subtasks
    const subtasks = await getAllSubtasks(lessonId);
    if (subtasks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No subtasks found. Run split first.' }),
        { status: 400 }
      );
    }
    
    let runId: string;
    let run;
    
    if (resume && existingRunId) {
      // Resume existing run
      run = await getRun(lessonId, existingRunId);
      if (!run) {
        return new Response(JSON.stringify({ message: 'Run not found' }), { status: 404 });
      }
      runId = existingRunId;
    } else {
      // Create new run
      runId = await createRun({
        lessonId,
        uid: user.uid,
        status: 'writing',
        currentSubtaskOrder: 0,
        totalSubtasks: subtasks.length,
      });
      await updateLessonStatus(lessonId, 'writing_in_progress');
      await addProgressEvent(lessonId, runId, {
        type: 'planned',
        data: { totalSubtasks: subtasks.length },
        agent: 'writer',
      });
    }
    
    // Find first incomplete subtask
    const nextSubtask = subtasks.find(
      (st) => st.status === 'queued' || st.status === 'failed'
    );
    
    if (!nextSubtask) {
      // All subtasks completed, assemble
  await updateRunStatus(lessonId, runId, 'assembling');
  await addProgressEvent(lessonId, runId, { type: 'assembled', agent: 'assembler' });
      
      const assembled = assembleLesson(subtasks);
      const validation = validateAssembledLesson(assembled);
      
      if (!validation.valid) {
        await updateRunStatus(lessonId, runId, 'failed');
        return new Response(
          JSON.stringify({
            message: 'Assembly validation failed',
            issues: validation.issues,
          }),
          { status: 500 }
        );
      }
      
  await setLessonFinal(lessonId, assembled);
  await updateRunStatus(lessonId, runId, 'completed');
  await addProgressEvent(lessonId, runId, { type: 'completed', agent: 'assembler' });
      
      return new Response(
        JSON.stringify({
          runId,
          status: 'completed',
          message: 'Lesson generation complete',
          final: assembled,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Announce next subtask start (writer agent)
    await addProgressEvent(lessonId, runId, {
      type: 'subtask_started',
      data: {
        subtaskId: nextSubtask.subtaskId,
        order: nextSubtask.order,
        totalSubtasks: subtasks.length,
      },
      agent: 'writer',
    });

    // Execute next subtask by making internal API call
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const subtaskUrl = `${baseUrl}/api/tutor/lesson/${lessonId}/subtasks/${nextSubtask.subtaskId}/run`;
    
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    
    if (!authHeader) {
      console.error('[lesson/run] Missing authorization header');
      throw new Error('Missing authorization header for internal API call');
    }
    
    console.log('[lesson/run] Executing subtask:', {
      lessonId,
      subtaskId: nextSubtask.subtaskId,
      order: nextSubtask.order,
      totalSubtasks: subtasks.length,
      url: subtaskUrl,
    });
    
    try {
      const subtaskResponse = await fetch(subtaskUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({}),
      });
      
      if (!subtaskResponse.ok) {
        const errorText = await subtaskResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        console.error('[lesson/run] Subtask response error:', {
          status: subtaskResponse.status,
          statusText: subtaskResponse.statusText,
          error: errorData,
        });
        throw new Error(errorData.message || `Subtask execution failed with status ${subtaskResponse.status}`);
      }
      
      await updateRunStatus(lessonId, runId, 'writing', nextSubtask.order);
      await addProgressEvent(lessonId, runId, {
        type: 'subtask_complete',
        data: {
          subtaskId: nextSubtask.subtaskId,
          order: nextSubtask.order,
          totalSubtasks: subtasks.length,
        },
        agent: 'writer',
      });
      
      // Check if there are more subtasks
      const remainingSubtasks = subtasks.filter(
        (st) => st.order > nextSubtask.order && (st.status === 'queued' || st.status === 'failed')
      );
      
      if (remainingSubtasks.length > 0) {
        // More subtasks to process - return progress
        return new Response(
          JSON.stringify({
            runId,
            status: 'writing',
            currentSubtaskOrder: nextSubtask.order,
            totalSubtasks: subtasks.length,
            message: `Completed subtask ${nextSubtask.order}/${subtasks.length}. Call /run again to continue.`,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } else {
        // Last subtask completed - trigger assembly by calling self recursively
        const continueResponse = await fetch(req.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader || '',
          },
          body: JSON.stringify({ resume: true, runId }),
        });
        
        return continueResponse;
      }
    } catch (subtaskError: unknown) {
      const err = subtaskError as Error;
      console.error('[lesson/run] Subtask execution failed:', {
        lessonId,
        subtaskId: nextSubtask.subtaskId,
        error: err.message,
        stack: err.stack,
      });
      
      await updateRunStatus(lessonId, runId, 'failed');
      await addProgressEvent(lessonId, runId, {
        type: 'error',
        data: { error: `${err.message} - ${err.stack || ''}`.substring(0, 500) },
        agent: 'writer',
      });
      
      return new Response(
        JSON.stringify({
          message: 'Subtask execution failed',
          error: err.message,
          details: err.stack,
        }),
        { status: 500 }
      );
    }
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    const status = err?.status ?? 500;
    const message = err?.message ?? 'Failed to run lesson generation';
    return new Response(JSON.stringify({ message }), { status });
  }
}
