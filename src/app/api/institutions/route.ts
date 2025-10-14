import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';

// POST /api/institutions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, region, numberOfStudents, admin_uid } = body || {};

    if (!name || !type || !region || !admin_uid) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Create institution document directly with admin privileges
    const ref = await adminDb.collection('institutions').add({
      name,
      type,
      region,
      numberOfStudents: numberOfStudents ?? null,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      adminUids: [admin_uid],
    });

    // Optionally link admin user profile
    await adminDb.collection('profiles').doc(admin_uid).set(
      {
        role: 'institution-admin',
        institutionId: ref.id,
        onboarded: true,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const redirectUrl = '/dashboard/institution';
    return NextResponse.json({ success: true, redirectUrl, institutionId: ref.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
