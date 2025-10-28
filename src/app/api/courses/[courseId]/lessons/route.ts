import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';

import { verifyIdToken } from '@/lib/serverAuth';
import { adminDb } from '@/lib/firebaseAdmin';
import type { PlannedLesson } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { courseId } = await params;
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Missing authorization header' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // planned|generating|generated|published|completed
    const chapterId = searchParams.get('chapterId');

    // Verify course access
    const courseRef = adminDb.collection('courses').doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const courseData = courseDoc.data();
    if (courseData?.userId !== uid) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Query lessons
    let query = courseRef.collection('lessons') as FirebaseFirestore.Query;

    if (status) {
      query = query.where('status', '==', status);
    }
    if (chapterId) {
      query = query.where('chapterId', '==', chapterId);
    }

    // Order by global sequence
    query = query.orderBy('globalOrder', 'asc');

    const lessonsSnapshot = await query.get();
    const lessons: PlannedLesson[] = [];

    lessonsSnapshot.forEach(doc => {
      lessons.push(doc.data() as PlannedLesson);
    });

    // Also fetch schedule if available
    const scheduleDoc = await courseRef.collection('metadata').doc('schedule').get();
    const schedule = scheduleDoc.exists ? scheduleDoc.data() : null;

    return NextResponse.json({
      success: true,
      courseId,
      totalLessons: lessons.length,
      lessons,
      schedule,
    }, { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[GetLessons] Error:', message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
