import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, verifyBearerToken, FieldValue } from '@/lib/firebaseAdmin';

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
    } catch (err: any) {
      if (err.code === 5 || err.code === 'not-found' || err.code === 'NOT_FOUND') {
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
      } as const;

      await ref.set(defaultProfile);

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
    const message =
      typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message: string }).message
        : 'Internal server error';

    console.error('[ProfileRoute] Failed to load or create profile', {
      uid: requestedUid,
      message,
      error,
    });

    return NextResponse.json({ message }, { status: 500 });
  }
}
