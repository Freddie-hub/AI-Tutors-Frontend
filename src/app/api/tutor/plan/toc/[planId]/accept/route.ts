import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { getPlan, updatePlanStatus, createLesson } from '@/lib/lessonStore';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const user = await requireUser(req);
    const { planId } = await params;
    
    // Get the plan
    const plan = await getPlan(planId);
    if (!plan) {
      return new Response(JSON.stringify({ message: 'Plan not found' }), { status: 404 });
    }
    
    // Verify ownership
    if (plan.uid !== user.uid) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 403 });
    }
    
    // Create the lesson
    const lessonId = await createLesson({
      uid: user.uid,
      grade: plan.grade,
      subject: plan.subject,
      topic: plan.topic,
      specification: plan.specification,
      status: 'toc_approved',
      toc: plan.toc,
      tocVersion: 1,
      estimates: plan.estimates,
    });
    
    // Update plan status
    await updatePlanStatus(planId, 'accepted');
    
    return new Response(
      JSON.stringify({
        lessonId,
        tocVersion: 1,
        message: 'Plan accepted, lesson created',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    const status = err?.status ?? 500;
    const message = err?.message ?? 'Failed to accept plan';
    return new Response(JSON.stringify({ message }), { status });
  }
}
