import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { verifyIdToken } from '@/lib/serverAuth';
import type { Course } from '@/lib/types';

// GET /api/courses - Get user's courses
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

    // Query user's courses from Firestore
    const coursesRef = adminDb.collection('courses');
    const snapshot = await coursesRef
      .where('userId', '==', uid)
      .orderBy('lastAccessedAt', 'desc')
      .get();

    const courses = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        lastAccessedAt: data.lastAccessedAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[CoursesRoute] GET Error:', message);
    
    // Fallback: if index doesn't exist, return unordered
    if (message.includes('index')) {
      try {
        const authHeader = req.headers.get('Authorization');
        const idToken = authHeader!.substring(7);
        const decodedToken = await verifyIdToken(idToken);
        const uid = decodedToken.uid;
        
        const coursesRef = adminDb.collection('courses');
        const snapshot = await coursesRef.where('userId', '==', uid).get();
        
        const courses = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
            lastAccessedAt: data.lastAccessedAt?.toDate?.()?.toISOString() || null,
          };
        });
        
        return NextResponse.json({ 
          courses,
          hint: 'Create Firestore composite index on (userId asc, lastAccessedAt desc)'
        }, { status: 200 });
      } catch (fallbackError) {
        return NextResponse.json({ message: 'Failed to fetch courses' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/courses - Create a new course
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
    const {
      name,
      grade,
      subjects,
      description,
      courseType,
      chapters,
      estimatedDuration,
      difficulty,
      thumbnail,
    } = body;

    // Validate required fields
    if (!name || !grade || !subjects || !courseType || !chapters) {
      return NextResponse.json(
        { message: 'Missing required fields: name, grade, subjects, courseType, chapters' },
        { status: 400 }
      );
    }

    // Create course document
    const courseData = {
      userId: uid,
      name,
      grade,
      subjects: subjects || [],
      description: description || '',
      courseType,
      chapters: chapters || [],
      totalChapters: chapters?.length || 0,
      completedChapters: 0,
      progress: 0,
      thumbnail: thumbnail || null,
      estimatedDuration: estimatedDuration || null,
      difficulty: difficulty || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastAccessedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('courses').add(courseData);

    // Create courseLessons placeholders for each chapter
    const batch = adminDb.batch();
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
        grade,
        subject: chapter.subject,
        topic: chapter.title,
        strandId: chapter.strandId || null,
        strandName: chapter.strandName || null,
      });
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      courseId: docRef.id,
      course: {
        id: docRef.id,
        ...courseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
      },
    }, { status: 201 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[CoursesRoute] POST Error:', message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
