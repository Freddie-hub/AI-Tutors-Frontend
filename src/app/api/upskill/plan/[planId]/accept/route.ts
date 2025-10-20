import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { getPlan, updatePlanStatus, createLesson } from '@/lib/lessonStore';

export async function POST(
  req: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const user = await requireUser(req);
    const { planId } = params;

    const plan = await getPlan(planId);
    if (!plan) {
      return new Response(JSON.stringify({ message: 'Plan not found' }), { status: 404 });
    }

    if (plan.uid !== user.uid) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 403 });
    }

    // Create an Upskill lesson (reusing lessons collection)
    const lessonId = await createLesson({
      uid: user.uid,
      grade: 'Upskill',
      subject: plan.subject || 'General',
      topic: plan.topic,
      specification: plan.specification,
      status: 'toc_approved',
      toc: plan.toc,
      tocVersion: 1,
      estimates: plan.estimates,
      // metadata (optional)
      domain: plan.subject,
      timeConstraint: plan.specification,
    } as any);

    await updatePlanStatus(planId, 'accepted');

    return new Response(
      JSON.stringify({ lessonId, tocVersion: 1, message: 'Upskill plan accepted, lesson created' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    const status = err?.status ?? 500;
    const message = err?.message ?? 'Failed to accept upskill plan';
    return new Response(JSON.stringify({ message }), { status });
  }
}
