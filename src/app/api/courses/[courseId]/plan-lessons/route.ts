import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for planning

import { verifyIdToken } from '@/lib/serverAuth';
import { generateCourseLessonPlan } from '@/server/courseGenerator';
import { adminDb } from '@/lib/firebaseAdmin';
import type { PlannedLesson } from '@/lib/types';

export async function POST(
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

    // Parse request body
    const body = await req.json();
    const { lessonsPerWeek = 4, startDate } = body;

    // Fetch course from Firestore
    const courseRef = adminDb.collection('courses').doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const courseData = courseDoc.data();
    
    // Verify ownership
    if (courseData?.userId !== uid) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Extract duration in weeks
    const durationMatch = courseData.estimatedDuration?.match(/(\d+)\s*weeks?/i);
    const estimatedDurationWeeks = durationMatch ? parseInt(durationMatch[1]) : 16;

    console.log(`[PlanLessons] Starting lesson planning for course ${courseId}...`);

    // Generate lesson plan using Agent 2
    const { chapterLessonPlans, schedule } = await generateCourseLessonPlan({
      courseId,
      courseName: courseData.name,
      grade: courseData.grade,
      chapters: courseData.chapters || [],
      subjects: courseData.subjects || [],
      estimatedDurationWeeks,
      lessonsPerWeek,
      startDate,
    });

    // Save planned lessons to Firestore
    const batch = adminDb.batch();
    const lessonsCollectionRef = courseRef.collection('lessons');
    const allPlannedLessons: PlannedLesson[] = [];

    chapterLessonPlans.forEach((chapterPlan, chapterIndex) => {
      chapterPlan.lessons.forEach((lesson, lessonIndex) => {
        const lessonId = `${chapterPlan.chapterId}-lesson-${lessonIndex + 1}`;
        const scheduleEntry = schedule.schedule.find(s => s.lessonId === lesson.id);
        
        const plannedLesson: PlannedLesson = {
          id: lessonId,
          courseId,
          chapterId: chapterPlan.chapterId,
          order: lesson.order,
          globalOrder: scheduleEntry?.sequenceNumber || 0,
          title: lesson.title,
          subject: lesson.subject,
          strandId: lesson.strandId,
          strandName: lesson.strandName,
          topics: lesson.topics,
          learningObjectives: lesson.learningObjectives,
          depth: lesson.depth,
          targetDurationMin: lesson.targetDurationMin,
          suggestedHomeworkMin: lesson.suggestedHomeworkMin,
          prerequisites: lesson.prerequisites,
          assessmentAnchors: lesson.assessmentAnchors,
          keyActivities: lesson.keyActivities,
          realWorldContext: lesson.realWorldContext,
          plannedWeek: scheduleEntry?.week,
          plannedDate: scheduleEntry?.date,
          status: 'planned',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        allPlannedLessons.push(plannedLesson);
        const lessonRef = lessonsCollectionRef.doc(lessonId);
        batch.set(lessonRef, plannedLesson);
      });
    });

    // Save schedule metadata
    const scheduleRef = courseRef.collection('metadata').doc('schedule');
    batch.set(scheduleRef, schedule);

    // Update course with lesson plan metadata
    batch.update(courseRef, {
      lessonPlanGenerated: true,
      totalLessons: allPlannedLessons.length,
      lessonsPerWeek,
      startDate: startDate || null,
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();

    console.log(`[PlanLessons] Successfully saved ${allPlannedLessons.length} lessons for course ${courseId}`);

    return NextResponse.json({
      success: true,
      totalLessons: allPlannedLessons.length,
      totalWeeks: schedule.totalWeeks,
      overflow: schedule.overflow,
      recommendations: schedule.recommendations,
      lessons: allPlannedLessons,
      schedule,
    }, { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[PlanLessons] Error:', message, error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
