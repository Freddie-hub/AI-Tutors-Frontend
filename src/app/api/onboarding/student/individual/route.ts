import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, verifyBearerToken, FieldValue } from '@/lib/firebaseAdmin';

// POST /api/onboarding/student/individual
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') ?? undefined;
    const decoded = await verifyBearerToken(authHeader);

    const body = await req.json();
    const { uid, name, age, curriculum, grade, goal, preferredMode } = body || {};
    if (!uid || !name || typeof age !== 'number' || !curriculum || !grade || !goal || !preferredMode) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    if (decoded.uid !== uid) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await adminDb.collection('profiles').doc(uid).set(
      {
        role: 'individual-student',
        isIndependent: true,
        onboarded: true,
        preferences: { age, curriculum, grade, learningGoal: goal, preferredMode },
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, redirectUrl: '/dashboard/student' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
