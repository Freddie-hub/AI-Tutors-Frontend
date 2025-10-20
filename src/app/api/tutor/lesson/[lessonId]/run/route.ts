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
  setRunProcessing,
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
      
      // Check if already processing - prevent concurrent execution
      if (run.processing) {
        console.log('[lesson/run] Run already processing, skipping:', {
          lessonId,
          runId: existingRunId,
          processingSubtaskId: run.processingSubtaskId,
        });
        return new Response(
          JSON.stringify({
            message: 'Run already in progress',
            runId: existingRunId,
            status: run.status,
            processingSubtaskId: run.processingSubtaskId,
          }),
          { status: 409 }
        );
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
      console.log('[lesson/run] Starting assembly:', { lessonId, runId, subtaskCount: subtasks.length });
      
      try {
        await setRunProcessing(lessonId, runId, true, 'assembly');
        await updateRunStatus(lessonId, runId, 'assembling');
        await addProgressEvent(lessonId, runId, { type: 'assembled', agent: 'assembler' });
        
        // Refetch subtasks with a small delay to ensure Firestore consistency
        console.log('[lesson/run] Refetching subtasks to ensure consistency...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        const freshSubtasks = await getAllSubtasks(lessonId);
        
        console.log('[lesson/run] Assembling lesson from subtasks...');
        const assembled = assembleLesson(freshSubtasks);
        
        console.log('[lesson/run] Validating assembled lesson...');
        const validation = validateAssembledLesson(assembled);
        
        if (!validation.valid) {
          console.error('[lesson/run] Assembly validation failed:', validation.issues);
          await setRunProcessing(lessonId, runId, false);
          await updateRunStatus(lessonId, runId, 'failed');
          return new Response(
            JSON.stringify({
              message: 'Assembly validation failed',
              issues: validation.issues,
            }),
            { status: 500 }
          );
        }
        
        console.log('[lesson/run] Saving final lesson...');
        await setLessonFinal(lessonId, assembled);
        await updateRunStatus(lessonId, runId, 'completed');
        await addProgressEvent(lessonId, runId, { type: 'completed', agent: 'assembler' });
        
        console.log('[lesson/run] Lesson generation completed successfully!');
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
      } catch (assemblyError: unknown) {
        const err = assemblyError as Error;
        console.error('[lesson/run] Assembly error:', {
          error: err.message,
          stack: err.stack,
        });
        await setRunProcessing(lessonId, runId, false);
        await updateRunStatus(lessonId, runId, 'failed');
        await addProgressEvent(lessonId, runId, {
          type: 'error',
          data: { error: `Assembly failed: ${err.message}` },
          agent: 'assembler',
        });
        return new Response(
          JSON.stringify({
            message: 'Assembly failed',
            error: err.message,
            details: err.stack,
          }),
          { status: 500 }
        );
      }
    }
    
    // Set processing lock before starting subtask
    await setRunProcessing(lessonId, runId, true, nextSubtask.subtaskId);

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
      await setRunProcessing(lessonId, runId, false);
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
      await setRunProcessing(lessonId, runId, false); // Release lock after successful completion
      await addProgressEvent(lessonId, runId, {
        type: 'subtask_complete',
        data: {
          subtaskId: nextSubtask.subtaskId,
          order: nextSubtask.order,
          totalSubtasks: subtasks.length,
        },
        agent: 'writer',
      });
      
      // Return success - frontend polling will trigger next subtask
      return new Response(
        JSON.stringify({
          runId,
          status: 'writing',
          currentSubtaskOrder: nextSubtask.order,
          totalSubtasks: subtasks.length,
          message: `Completed subtask ${nextSubtask.order}/${subtasks.length}`,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (subtaskError: unknown) {
      const err = subtaskError as Error;
      console.error('[lesson/run] Subtask execution failed:', {
        lessonId,
        subtaskId: nextSubtask.subtaskId,
        error: err.message,
        stack: err.stack,
      });
      
      await setRunProcessing(lessonId, runId, false); // Release lock on error
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
