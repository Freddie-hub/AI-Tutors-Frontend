import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { verifyIdToken } from '@/lib/serverAuth';
import { deterministicSplitFromPlanner } from '@/lib/ai/splitter';
import type { PlannerDraft, WorkloadSplit } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Missing authorization header' }, { status: 401 });
    }
    const idToken = authHeader.substring(7);
    const decoded = await verifyIdToken(idToken);

    const body = await req.json();
    const { planId } = body as { planId: string };
    if (!planId) return NextResponse.json({ message: 'Missing planId' }, { status: 400 });

    const snap = await adminDb.collection('lessonPlans').doc(planId).get();
    if (!snap.exists) return NextResponse.json({ message: 'Plan not found' }, { status: 404 });

    const data = snap.data() as any;
    if (data.uid !== decoded.uid) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const draft: PlannerDraft = {
      public: data.public,
      private: data.meta,
    };

    const split: WorkloadSplit = deterministicSplitFromPlanner(draft);

    await adminDb.collection('lessonPlans').doc(planId).update({
      'meta.split': split,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ planId, split });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[SplitRoute] POST error:', message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
