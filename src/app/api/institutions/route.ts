import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, verifyBearerToken, FieldValue } from '@/lib/firebaseAdmin';

// POST /api/institutions
export async function POST(req: NextRequest) {
  try {
    // Verify caller
    const authHeader = req.headers.get('authorization') ?? undefined;
    const decoded = await verifyBearerToken(authHeader);

    const body = await req.json();
    const { name, type, region, numberOfStudents, admin_uid } = body || {};

    if (!name || !type || !region || !admin_uid) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Ensure the provided admin_uid matches the token's uid for basic authz
    if (decoded.uid !== admin_uid) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Create institution document
    const ref = await adminDb.collection('institutions').add({
      name,
      type,
      region,
      numberOfStudents: numberOfStudents ?? null,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      adminUids: [admin_uid]
    });

    // Optionally link admin user profile
    await adminDb.collection('profiles').doc(admin_uid).set(
      {
        role: 'institution-admin',
        institutionId: ref.id,
        onboarded: true,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    const redirectUrl = '/dashboard/institution';
    return NextResponse.json({ success: true, redirectUrl, institutionId: ref.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
