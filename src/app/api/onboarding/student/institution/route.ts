import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';

// POST /api/onboarding/student/institution
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, name, curriculum, grade, goal } = body || {};

    if (!uid || !name || !curriculum || !grade || !goal) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await adminDb.collection('profiles').doc(uid).set(
      {
        name,
        role: 'institution-student',
        isIndependent: false,
        onboarded: true,
        preferences: { curriculum, grade, learningGoal: goal },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      redirectUrl: '/dashboard/student',
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    console.error('[OnboardingInstitutionStudentRoute] Error:', message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
