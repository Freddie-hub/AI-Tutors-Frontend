import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';

// POST /api/onboarding/student/individual
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, name, age, curriculum, grade, goal, preferredMode } = body || {};

    if (
      !uid ||
      !name ||
      typeof age !== 'number' ||
      !curriculum ||
      !grade ||
      !goal ||
      !preferredMode
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await adminDb.collection('profiles').doc(uid).set(
      {
        name,
        role: 'individual-student',
        isIndependent: true,
        onboarded: true,
        preferences: {
          age,
          curriculum,
          grade,
          learningGoal: goal,
          preferredMode,
        },
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
    console.error('[OnboardingIndividualStudentRoute] Error:', message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
