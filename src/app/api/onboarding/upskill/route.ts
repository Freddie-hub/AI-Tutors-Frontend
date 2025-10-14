import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';

// POST /api/onboarding/upskill
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, name, goal, preferredSkills, experienceLevel } = body || {};

    if (
      !uid ||
      !name ||
      !goal ||
      !Array.isArray(preferredSkills) ||
      !experienceLevel
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await adminDb.collection('profiles').doc(uid).set(
      {
        name,
        role: 'upskill-individual',
        isIndependent: true,
        onboarded: true,
        upskill: { preferredSkills, experienceLevel },
        preferences: { learningGoal: goal },
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
    console.error('[OnboardingUpskillRoute] Error:', message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
