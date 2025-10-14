import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, verifyBearerToken, FieldValue } from '@/lib/firebaseAdmin';
import type { DocumentData } from 'firebase-admin/firestore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  let requestedUid: string | null = null;

  try {
    const { uid } = await params; // ✅ await params
    requestedUid = uid;

    if (!uid) {
      return NextResponse.json({ message: 'uid is required' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization') ?? undefined;
    const decoded = await verifyBearerToken(authHeader);

    if (decoded.uid !== uid) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const ref = adminDb.collection('profiles').doc(uid);

    let doc = null;
    try {
      doc = await ref.get();
    } catch (err: unknown) {
      const errorCode = typeof err === 'object' && err !== null && 'code' in err ? (err as { code?: unknown }).code : undefined;
      if (errorCode === 5 || errorCode === 'not-found' || errorCode === 'NOT_FOUND') {
        doc = null;
      } else {
        throw err;
      }
    }

    if (!doc?.exists) {
      const defaultProfile = {
        uid,
        role: null,
        onboarded: false,
        isIndependent: null,
        email: decoded.email ?? null,
        displayName: decoded.name ?? null,
        photoURL: decoded.picture ?? null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

  await ref.set(defaultProfile as DocumentData);

      return NextResponse.json({
        uid,
        role: null,
        onboarded: false,
        isIndependent: null,
        email: defaultProfile.email,
        displayName: defaultProfile.displayName,
        photoURL: defaultProfile.photoURL,
      }, { status: 200 });
    }

    return NextResponse.json({ uid, ...doc.data() }, { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';

    console.error('[ProfileRoute] Failed to load or create profile', {
      uid: requestedUid,
      message,
      error,
    });

    return NextResponse.json({ message }, { status: 500 });
  }
}
