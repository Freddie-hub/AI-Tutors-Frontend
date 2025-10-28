import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { verifyIdToken } from '@/lib/serverAuth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Missing authorization header' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const { courseId, chapterId } = await params;

    // Verify course ownership
    const courseDoc = await adminDb.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const courseData = courseDoc.data();
    if (courseData?.userId !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find courseLesson document
    const courseLessonQuery = await adminDb
      .collection('courseLessons')
      .where('courseId', '==', courseId)
      .where('chapterId', '==', chapterId)
      .limit(1)
      .get();

    if (courseLessonQuery.empty) {
      return NextResponse.json({ error: 'Chapter not started' }, { status: 404 });
    }

    // Mark as complete
    await courseLessonQuery.docs[0].ref.update({
      status: 'completed',
      completed: true,
      completedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking chapter complete:', error);
    return NextResponse.json(
      { error: 'Failed to mark chapter as complete' },
      { status: 500 }
    );
  }
}
