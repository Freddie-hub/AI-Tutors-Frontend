import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const maxDuration = 300;

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

    // Check if lesson already exists
    const existingCourseLessonQuery = await adminDb
      .collection('courseLessons')
      .where('courseId', '==', courseId)
      .where('chapterId', '==', chapterId)
      .limit(1)
      .get();

    if (!existingCourseLessonQuery.empty) {
      const existingLessonData = existingCourseLessonQuery.docs[0].data();
      if (existingLessonData.lessonId) {
        // Lesson already exists, return it
        const lessonDoc = await adminDb.collection('lessons').doc(existingLessonData.lessonId).get();
        if (lessonDoc.exists) {
          return NextResponse.json({
            lesson: {
              id: lessonDoc.id,
              ...lessonDoc.data(),
            },
          });
        }
      }
    }

    // Generate lesson using existing lesson generation system
    // Return the chapter info so client can generate lesson through multi-agent system
    const lessonSpecification = {
      grade: courseData.grade,
      subject: chapter.subject,
      topic: chapter.title,
      topics: chapter.topics,
      description: chapter.description || `Learn about ${chapter.topics.join(', ')}`,
      courseId,
      chapterId,
      courseName: courseData.name,
    };

    return NextResponse.json({
      specification: lessonSpecification,
      message: 'Use client-side lesson generation with this specification',
    });
  } catch (error) {
    console.error('Error generating chapter lesson:', error);
    return NextResponse.json(
      { error: 'Failed to generate lesson' },
      { status: 500 }
    );
  }
}
