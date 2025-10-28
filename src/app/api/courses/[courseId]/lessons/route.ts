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

    // Build lessons query
    let baseQuery = courseRef.collection('lessons') as FirebaseFirestore.Query;

    if (status) {
      baseQuery = baseQuery.where('status', '==', status);
    }
    if (chapterId) {
      console.log(`[GetLessons] Filtering by chapterId: "${chapterId}"`);
      baseQuery = baseQuery.where('chapterId', '==', chapterId);
    }

    // Try to order by globalOrder; if Firestore requires a composite index, fall back to client-side sort
    let lessons: PlannedLesson[] = [];
    try {
      const orderedSnapshot = await baseQuery.orderBy('globalOrder', 'asc').get();
      orderedSnapshot.forEach(doc => {
        lessons.push(doc.data() as PlannedLesson);
      });
    } catch (e: unknown) {
      const err = e as { code?: number | string; message?: string };
      const msg = typeof err?.message === 'string' ? err.message : '';
      const needsIndex = msg.includes('FAILED_PRECONDITION') && msg.includes('requires an index');
      if (!needsIndex) {
        throw e;
      }
      // Fallback: fetch without orderBy and sort in memory to avoid composite index requirement
      const snapshot = await baseQuery.get();
      snapshot.forEach(doc => {
        lessons.push(doc.data() as PlannedLesson);
      });
      lessons.sort((a: any, b: any) => {
        const ag = typeof a?.globalOrder === 'number' ? a.globalOrder : Number.MAX_SAFE_INTEGER;
        const bg = typeof b?.globalOrder === 'number' ? b.globalOrder : Number.MAX_SAFE_INTEGER;
        return ag - bg;
      });
    }

    console.log(`[GetLessons] Found ${lessons.length} lessons for chapterId="${chapterId || 'all'}"`);
    if (lessons.length > 0 && chapterId) {
      console.log(`[GetLessons] Sample lesson chapterId: "${lessons[0].chapterId}"`);
    }

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
