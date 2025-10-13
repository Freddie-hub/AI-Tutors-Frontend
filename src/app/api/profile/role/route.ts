import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, verifyBearerToken, FieldValue } from '@/lib/firebaseAdmin';

// POST /api/profile/role
// Body: { uid: string, role: 'individual-student' | 'institution-student' | 'institution-admin' | 'upskill-individual' }
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') ?? undefined;
    const decoded = await verifyBearerToken(authHeader);

    const body = await req.json();
    const { uid, role } = body || {};
    if (!uid || !role) {
      return NextResponse.json({ success: false, message: 'uid and role are required' }, { status: 400 });
    }

    if (decoded.uid !== uid) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await adminDb.collection('profiles').doc(uid).set(
      { role, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    // Simple redirect mapping
    const roleRedirectMap: Record<string, string> = {
      'individual-student': '/onboarding/student',
      'institution-student': '/onboarding/student',
      'institution-admin': '/onboarding/institution',
      'upskill-individual': '/onboarding/upskill'
    };

    const redirectUrl = roleRedirectMap[role] || '/dashboard';

    return NextResponse.json({ success: true, redirectUrl });
  } catch (error: any) {
    const message = error?.message || 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
