import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import type { DocumentData } from 'firebase-admin/firestore';

// GET /api/profile/[uid]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    if (!uid) {
      return NextResponse.json({ message: 'uid is required' }, { status: 400 });
    }

    const ref = adminDb.collection('profiles').doc(uid);
    const doc = await ref.get();

    if (!doc.exists) {
      // Create a default profile if none exists
      const defaultProfile = {
        uid,
        role: null,
        onboarded: false,
        isIndependent: null,
        email: null,
        displayName: null,
        photoURL: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await ref.set(defaultProfile as DocumentData);

      return NextResponse.json(defaultProfile, { status: 200 });
    }

    return NextResponse.json({ uid, ...doc.data() }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[ProfileRoute] Failed to load or create profile', { message, error });
    return NextResponse.json({ message }, { status: 500 });
  }
}
