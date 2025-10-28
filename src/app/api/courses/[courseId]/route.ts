import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyIdToken } from '@/lib/serverAuth';
import type { Course, CourseChapter } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
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

    const { courseId } = await params;

    // Fetch course
    const courseDoc = await adminDb.collection('courses').doc(courseId).get();

    if (!courseDoc.exists) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const courseData = courseDoc.data();

    // Verify ownership
    if (courseData?.userId !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all courseLessons for this course to get completion status
    const courseLessonsSnapshot = await adminDb
      .collection('courseLessons')
      .where('courseId', '==', courseId)
      .get();

    const lessonsMap = new Map<string, any>();
    courseLessonsSnapshot.docs.forEach(doc => {
      lessonsMap.set(doc.data().chapterId, doc.data());
    });

    // Add completion status to chapters
    const chaptersWithProgress = courseData.chapters.map((chapter: CourseChapter) => {
      const lessonData = lessonsMap.get(chapter.id);
      return {
        ...chapter,
        completed: lessonData?.completed || false,
        lessonId: lessonData?.lessonId || null,
      };
    });

    // Calculate progress
    const totalChapters = chaptersWithProgress.length;
    const completedChapters = chaptersWithProgress.filter((ch: any) => ch.completed).length;
    const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    const course: Course = {
      id: courseDoc.id,
      name: courseData.name,
      grade: courseData.grade,
      subjects: courseData.subjects,
      description: courseData.description,
      courseType: courseData.courseType,
      chapters: chaptersWithProgress as CourseChapter[],
      userId: courseData.userId,
      createdAt: courseData.createdAt,
      updatedAt: courseData.updatedAt,
      estimatedDuration: courseData.estimatedDuration,
      difficulty: courseData.difficulty,
      totalChapters,
      completedChapters,
      progress,
    };

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}
