import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { verifyIdToken } from '@/lib/serverAuth';

// GET /api/lessons - Get user's saved lessons
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Missing authorization header' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await verifyIdToken(idToken);
    const uid = decodedToken.uid;

  // Query user's lessons from Firestore
  const lessonsRef = adminDb.collection('lessons');
  let lessons: any[] = [];
    try {
      // Preferred query (requires composite index on userId + createdAt desc)
      // Support both legacy 'userId' and new 'uid' field names
      const snapshot = await lessonsRef
        .where('uid', '==', uid)
        .orderBy('createdAt', 'desc')
        .get();
      lessons = snapshot.docs.map(doc => {
        const data = doc.data() as any;
        const createdAt = data.createdAt;
        const createdIso = createdAt?.toDate?.()?.toISOString?.() || (typeof createdAt === 'number' ? new Date(createdAt).toISOString() : null);
        return {
          id: doc.id,
          ...data,
          createdAt: createdIso,
        };
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // If index is missing, fall back to un-ordered query and sort in memory
      if (msg.includes('FAILED_PRECONDITION') || msg.toLowerCase().includes('requires an index')) {
        // Try 'uid' then fallback to 'userId'
        let fallbackSnap = await lessonsRef.where('uid', '==', uid).get();
        if (fallbackSnap.empty) {
          fallbackSnap = await lessonsRef.where('userId', '==', uid).get();
        }
        lessons = fallbackSnap.docs
          .map(doc => {
            const data = doc.data() as any;
            const createdAt = data.createdAt;
            const createdIso = createdAt?.toDate?.()?.toISOString?.() || (typeof createdAt === 'number' ? new Date(createdAt).toISOString() : null);
            return {
              id: doc.id,
              ...data,
              createdAt: createdIso,
            };
          })
          .sort((a, b) => {
            const at = a.createdAt ? Date.parse(a.createdAt) : 0;
            const bt = b.createdAt ? Date.parse(b.createdAt) : 0;
            return bt - at; // desc
          });
        // Include hint header for observability
        return NextResponse.json({ lessons, hint: 'Create Firestore composite index on (userId asc, createdAt desc) to enable server-side ordering.' }, { status: 200 });
      }
      throw err;
    }

    return NextResponse.json({ lessons }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[LessonsRoute] GET Error:', message);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/lessons - Save a new lesson
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Missing authorization header' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const body = await req.json();
  let { grade, subject, topic, specification, content } = body || {};

    // Validate required fields
    if (!grade || !subject || !topic) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: grade, subject, topic' },
        { status: 400 }
      );
    }

    // Normalize: strip common markdown emphasis markers from content to avoid stray asterisks
    if (typeof content === 'string') {
      content = content
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1');
    }

    // Create lesson document
    const lessonData = {
      grade,
      subject,
      topic,
      specification: specification || '',
      content: content || '',
      userId: uid,
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('lessons').add(lessonData);

    return NextResponse.json({
      success: true,
      lesson: {
        id: docRef.id,
        ...lessonData,
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[LessonsRoute] POST Error:', message);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}