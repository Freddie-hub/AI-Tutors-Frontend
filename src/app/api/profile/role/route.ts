import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import type { DocumentData } from 'firebase-admin/firestore';

// POST /api/profile/role
// Body: { uid: string, role: 'individual-student' | 'institution-student' | 'institution-admin' | 'upskill-individual' }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, role } = body || {};

    if (!uid || !role) {
      return NextResponse.json(
        { success: false, message: 'uid and role are required' },
        { status: 400 }
      );
    }

    // Update or create the user profile with the given role
    await adminDb
      .collection('profiles')
      .doc(uid)
      .set(
        {
          role,
          updatedAt: FieldValue.serverTimestamp(),
        } as DocumentData,
        { merge: true }
      );

    // Map each role to its redirect path
    const roleRedirectMap: Record<string, string> = {
      'individual-student': '/onboarding/student',
      'institution-student': '/onboarding/student',
      'institution-admin': '/onboarding/institution',
      'upskill-individual': '/onboarding/upskill',
    };

    const redirectUrl = roleRedirectMap[role] || '/dashboard';

    return NextResponse.json({ success: true, redirectUrl });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    console.error('[ProfileRoleRoute] Failed to update role:', message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
