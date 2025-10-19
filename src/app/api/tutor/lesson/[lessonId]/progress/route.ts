import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { getLesson, getProgressEvents } from '@/lib/lessonStore';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const user = await requireUser(req);
    const { lessonId } = params;
    const { searchParams } = new URL(req.url);
    const runId = searchParams.get('runId');
    
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
    
    // Set up SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send existing events first
        const events = await getProgressEvents(lessonId, runId);
        events.forEach((event) => {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        });
        
        // Set up Firestore listener for new events
        const eventsRef = adminDb
          .collection('lessons')
          .doc(lessonId)
          .collection('runs')
          .doc(runId)
          .collection('events')
          .orderBy('ts', 'asc');
        
        const unsubscribe = eventsRef.onSnapshot((snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const event = change.doc.data();
              const data = `data: ${JSON.stringify(event)}\n\n`;
              controller.enqueue(encoder.encode(data));
              
              // Close stream if completed or failed
              if (
                event.type === 'completed' ||
                event.type === 'error' ||
                event.type === 'cancelled'
              ) {
                setTimeout(() => {
                  controller.close();
                  unsubscribe();
                }, 1000);
              }
            }
          });
        });
        
        // Keep connection alive with heartbeat
        const heartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        }, 15000);
        
        // Cleanup on close
        req.signal.addEventListener('abort', () => {
          clearInterval(heartbeat);
          unsubscribe();
          controller.close();
        });
      },
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    const status = err?.status ?? 500;
    const message = err?.message ?? 'Failed to stream progress';
    return new Response(JSON.stringify({ message }), { status });
  }
}
