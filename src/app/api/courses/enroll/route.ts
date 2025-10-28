import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { verifyIdToken } from '@/lib/serverAuth';

// POST /api/courses/enroll - Enroll in a catalog course (clone it to user's courses)
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
    const { catalogCourseId } = body;

    if (!catalogCourseId) {
      return NextResponse.json({ message: 'Missing catalogCourseId' }, { status: 400 });
    }

    // Fetch the catalog course
    const catalogDoc = await adminDb.collection('courseCatalog').doc(catalogCourseId).get();
    
    if (!catalogDoc.exists) {
      return NextResponse.json({ message: 'Catalog course not found' }, { status: 404 });
    }

    const catalogData = catalogDoc.data()!;

    // Check if user already enrolled
    const existingEnrollment = await adminDb.collection('courses')
      .where('userId', '==', uid)
      .where('catalogCourseId', '==', catalogCourseId)
      .get();

    if (!existingEnrollment.empty) {
      return NextResponse.json({ 
        message: 'Already enrolled in this course',
        courseId: existingEnrollment.docs[0].id
      }, { status: 400 });
    }

    // Clone course to user's courses
    const courseData = {
      userId: uid,
      catalogCourseId: catalogCourseId, // Track original catalog course
      name: catalogData.name,
      grade: catalogData.grade,
      subjects: catalogData.subjects || [],
      description: catalogData.description || '',
      courseType: catalogData.courseType,
      chapters: catalogData.chapters || [],
      totalChapters: catalogData.chapters?.length || 0,
      completedChapters: 0,
      progress: 0,
      thumbnail: catalogData.thumbnail || null,
      estimatedDuration: catalogData.estimatedDuration || null,
      difficulty: catalogData.difficulty || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastAccessedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('courses').add(courseData);

    // Create courseLessons placeholders for each chapter
    const batch = adminDb.batch();
    const chapters = catalogData.chapters || [];
    chapters.forEach((chapter: any, index: number) => {
      const lessonLinkRef = adminDb.collection('courseLessons').doc();
      batch.set(lessonLinkRef, {
        courseId: docRef.id,
        userId: uid,
        chapterId: chapter.id,
        chapterOrder: chapter.order || index + 1,
        chapterTitle: chapter.title,
        lessonId: null,
        status: 'not_started',
        completed: false,
        startedAt: null,
        completedAt: null,
        grade: catalogData.grade,
        subject: chapter.subject,
        topic: chapter.title,
        strandId: chapter.strandId || null,
        strandName: chapter.strandName || null,
      });
    });

    // Increment enrollment count in catalog
    const catalogRef = adminDb.collection('courseCatalog').doc(catalogCourseId);
    batch.update(catalogRef, {
      enrollmentCount: FieldValue.increment(1),
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      courseId: docRef.id,
      message: 'Successfully enrolled in course',
    }, { status: 201 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[CourseEnrollRoute] POST Error:', message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
