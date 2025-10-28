import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyIdToken } from '@/lib/serverAuth';

export async function GET(
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

    // Fetch course to get chapter details
    const courseDoc = await adminDb.collection('courses').doc(courseId).get();

    if (!courseDoc.exists) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const courseData = courseDoc.data();

    // Verify ownership
    if (courseData?.userId !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find the chapter
    const chapter = courseData.chapters.find((ch: any) => ch.id === chapterId);

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Check if lesson already exists for this chapter
    const courseLessonDoc = await adminDb
      .collection('courseLessons')
      .where('courseId', '==', courseId)
      .where('chapterId', '==', chapterId)
      .limit(1)
      .get();

    let lesson = null;
    if (!courseLessonDoc.empty) {
      const courseLessonData = courseLessonDoc.docs[0].data();
      
      if (courseLessonData.lessonId) {
        // Fetch the actual lesson
        const lessonDoc = await adminDb.collection('lessons').doc(courseLessonData.lessonId).get();
        if (lessonDoc.exists) {
          lesson = {
            id: lessonDoc.id,
            ...lessonDoc.data(),
          };
        }
      }
    }

    return NextResponse.json({
      chapter: {
        ...chapter,
        completed: courseLessonDoc.empty ? false : courseLessonDoc.docs[0].data().completed,
      },
      lesson,
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    );
  }
}
