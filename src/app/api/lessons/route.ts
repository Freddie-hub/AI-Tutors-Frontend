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
    const query = lessonsRef.where('userId', '==', uid).orderBy('createdAt', 'desc');
    const snapshot = await query.get();

    const lessons = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));

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
    const { grade, subject, topic, specification, content } = body || {};

    // Validate required fields
    if (!grade || !subject || !topic) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: grade, subject, topic' },
        { status: 400 }
      );
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