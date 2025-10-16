import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';

// POST /api/onboarding/teacher
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, name, subject, curriculum, school, yearsExperience } = body || {};

    // Basic validation
    if (!uid || !name || !subject || !curriculum || !school || yearsExperience === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Normalize yearsExperience to a non-negative integer
    let years: number;
    if (typeof yearsExperience === 'number') {
      years = yearsExperience;
    } else if (typeof yearsExperience === 'string') {
      const parsed = parseInt(yearsExperience, 10);
      years = Number.isFinite(parsed) ? parsed : NaN;
    } else {
      years = NaN;
    }

    if (!Number.isFinite(years) || years < 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid yearsExperience' },
        { status: 400 }
      );
    }

    await adminDb.collection('profiles').doc(uid).set(
      {
        name,
        role: 'teacher',
        onboarded: true,
        teacher: {
          subject,
          curriculum, // free-text or enum string from UI
          school,
          yearsExperience: years,
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Default redirect; the client may override based on selected curriculum
    return NextResponse.json({ success: true, redirectUrl: '/dashboard/teacher/cbc' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[OnboardingTeacherRoute] Error:', message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
