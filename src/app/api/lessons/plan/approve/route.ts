import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { verifyIdToken } from '@/lib/serverAuth';
import type { ApprovedPlanDoc, PlannerDraft } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Missing authorization header' }, { status: 401 });
    }
    const idToken = authHeader.substring(7);
    const decoded = await verifyIdToken(idToken);

    const body = await req.json();
    const { grade, subject, topic, specification, curriculumType, planDraft } = body as {
      grade: string; subject: string; topic: string; specification?: string; curriculumType?: 'cbc' | 'gcse' | 'upskill'; planDraft: PlannerDraft;
    };

    if (!grade || !subject || !topic || !planDraft?.public || !planDraft?.private) {
      return NextResponse.json({ message: 'Missing required plan fields' }, { status: 400 });
    }

    const doc: Omit<ApprovedPlanDoc, 'id'> & { createdAt: any; updatedAt: any } = {
      uid: decoded.uid,
      grade,
      subject,
      topic,
      specification,
      curriculumType: curriculumType || 'cbc',
      public: planDraft.public,
      meta: planDraft.private,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      status: 'approved',
    };

    const ref = await adminDb.collection('lessonPlans').add(doc);

    return NextResponse.json({ planId: ref.id, status: 'approved' }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[PlanApproveRoute] POST error:', message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
