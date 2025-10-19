import { adminDb, FieldValue } from './firebaseAdmin';
import {
  Lesson,
  LessonPlan,
  Subtask,
  LessonRun,
  ProgressEvent,
  TOCChapter,
  LessonSection,
} from './ai/types';

// Helper to remove any top-level undefined fields from objects before Firestore writes
function pruneUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

// ============================
// Lesson Plans
// ============================

export async function createPlan(plan: Omit<LessonPlan, 'planId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const planRef = adminDb.collection('lessonPlans').doc();
  const now = Date.now();
  const planData: LessonPlan = pruneUndefined({
    ...plan,
    planId: planRef.id,
    createdAt: now,
    updatedAt: now,
    // Ensure estimates is never undefined to satisfy Firestore validation
    estimates: plan.estimates ?? { totalTokens: 0, perChapter: [] },
  });
  
  // Add timeout to Firestore write
  const writePromise = planRef.set(planData);
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Firestore write timed out')), 10000)
  );
  
  await Promise.race([writePromise, timeoutPromise]);
  return planRef.id;
}

export async function getPlan(planId: string): Promise<LessonPlan | null> {
  const doc = await adminDb.collection('lessonPlans').doc(planId).get();
  return doc.exists ? (doc.data() as LessonPlan) : null;
}

export async function updatePlanStatus(
  planId: string,
  status: LessonPlan['status']
): Promise<void> {
  await adminDb.collection('lessonPlans').doc(planId).update({
    status,
    updatedAt: Date.now(),
  });
}

// ============================
// Lessons
// ============================

export async function createLesson(
  lesson: Omit<Lesson, 'lessonId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const lessonRef = adminDb.collection('lessons').doc();
  const now = Date.now();
  const lessonData: Lesson = pruneUndefined({
    ...lesson,
    lessonId: lessonRef.id,
    createdAt: now,
    updatedAt: now,
  });
  await lessonRef.set(lessonData);
  return lessonRef.id;
}

export async function getLesson(lessonId: string): Promise<Lesson | null> {
  const doc = await adminDb.collection('lessons').doc(lessonId).get();
  return doc.exists ? (doc.data() as Lesson) : null;
}

export async function updateLessonStatus(
  lessonId: string,
  status: Lesson['status']
): Promise<void> {
  await adminDb.collection('lessons').doc(lessonId).update({
    status,
    updatedAt: Date.now(),
  });
}

export async function updateLessonTOC(
  lessonId: string,
  toc: TOCChapter[],
  tocVersion: number
): Promise<void> {
  await adminDb.collection('lessons').doc(lessonId).update({
    toc,
    tocVersion,
    updatedAt: Date.now(),
  });
}

export async function setLessonFinal(
  lessonId: string,
  final: {
    outline: string[];
    sections: LessonSection[];
    content: string;
    hash: string;
  }
): Promise<void> {
  await adminDb.collection('lessons').doc(lessonId).update({
    final,
    status: 'done',
    updatedAt: Date.now(),
  });
}

// ============================
// Subtasks
// ============================

export async function createSubtasks(lessonId: string, subtasks: Omit<Subtask, 'createdAt' | 'updatedAt'>[]): Promise<void> {
  const batch = adminDb.batch();
  const now = Date.now();
  
  subtasks.forEach((subtask) => {
    const ref = adminDb.collection('lessons').doc(lessonId).collection('subtasks').doc(subtask.subtaskId);
    batch.set(ref, {
      ...subtask,
      createdAt: now,
      updatedAt: now,
    });
  });
  
  await batch.commit();
}

export async function getSubtask(lessonId: string, subtaskId: string): Promise<Subtask | null> {
  const doc = await adminDb
    .collection('lessons')
    .doc(lessonId)
    .collection('subtasks')
    .doc(subtaskId)
    .get();
  return doc.exists ? (doc.data() as Subtask) : null;
}

export async function getAllSubtasks(lessonId: string): Promise<Subtask[]> {
  const snapshot = await adminDb
    .collection('lessons')
    .doc(lessonId)
    .collection('subtasks')
    .orderBy('order', 'asc')
    .get();
  return snapshot.docs.map((doc) => doc.data() as Subtask);
}

export async function updateSubtaskStatus(
  lessonId: string,
  subtaskId: string,
  status: Subtask['status'],
  error?: string
): Promise<void> {
  const updates: Partial<Subtask> = {
    status,
    updatedAt: Date.now(),
  };
  if (error) {
    updates.error = error;
  }
  await adminDb
    .collection('lessons')
    .doc(lessonId)
    .collection('subtasks')
    .doc(subtaskId)
    .update(updates);
}

export async function setSubtaskResult(
  lessonId: string,
  subtaskId: string,
  result: Subtask['result']
): Promise<void> {
  await adminDb
    .collection('lessons')
    .doc(lessonId)
    .collection('subtasks')
    .doc(subtaskId)
    .update({
      result,
      status: 'completed',
      updatedAt: Date.now(),
    });
}

export async function incrementSubtaskAttempts(
  lessonId: string,
  subtaskId: string
): Promise<number> {
  const ref = adminDb
    .collection('lessons')
    .doc(lessonId)
    .collection('subtasks')
    .doc(subtaskId);
  
  await ref.update({
    attempts: FieldValue.increment(1),
    updatedAt: Date.now(),
  });
  
  const doc = await ref.get();
  return (doc.data() as Subtask).attempts;
}

// ============================
// Runs
// ============================

export async function createRun(run: Omit<LessonRun, 'runId' | 'startedAt'>): Promise<string> {
  const runRef = adminDb.collection('lessons').doc(run.lessonId).collection('runs').doc();
  const runData: LessonRun = {
    ...run,
    runId: runRef.id,
    startedAt: Date.now(),
  };
  await runRef.set(runData);
  return runRef.id;
}

export async function getRun(lessonId: string, runId: string): Promise<LessonRun | null> {
  const doc = await adminDb
    .collection('lessons')
    .doc(lessonId)
    .collection('runs')
    .doc(runId)
    .get();
  return doc.exists ? (doc.data() as LessonRun) : null;
}

export async function updateRunStatus(
  lessonId: string,
  runId: string,
  status: LessonRun['status'],
  currentSubtaskOrder?: number
): Promise<void> {
  const updates: Partial<LessonRun> = { status };
  if (currentSubtaskOrder !== undefined) {
    updates.currentSubtaskOrder = currentSubtaskOrder;
  }
  if (status === 'completed' || status === 'failed' || status === 'cancelled') {
    updates.completedAt = Date.now();
    updates.processing = false; // Release lock
    updates.processingSubtaskId = undefined;
  }
  await adminDb
    .collection('lessons')
    .doc(lessonId)
    .collection('runs')
    .doc(runId)
    .update(updates);
}

export async function setRunProcessing(
  lessonId: string,
  runId: string,
  processing: boolean,
  subtaskId?: string
): Promise<void> {
  const updates: Partial<LessonRun> = {
    processing,
    processingSubtaskId: subtaskId,
  };
  await adminDb
    .collection('lessons')
    .doc(lessonId)
    .collection('runs')
    .doc(runId)
    .update(updates);
}

export async function cancelRun(lessonId: string, runId: string): Promise<void> {
  await adminDb
    .collection('lessons')
    .doc(lessonId)
    .collection('runs')
    .doc(runId)
    .update({
      status: 'cancelled',
      cancelled: true,
      completedAt: Date.now(),
    });
}

// ============================
// Progress Events
// ============================

export async function addProgressEvent(
  lessonId: string,
  runId: string,
  event: Omit<ProgressEvent, 'ts'>
): Promise<void> {
  const eventRef = adminDb
    .collection('lessons')
    .doc(lessonId)
    .collection('runs')
    .doc(runId)
    .collection('events')
    .doc();
  
  await eventRef.set({
    ...event,
    ts: Date.now(),
  });
}

export async function getProgressEvents(
  lessonId: string,
  runId: string
): Promise<ProgressEvent[]> {
  const snapshot = await adminDb
    .collection('lessons')
    .doc(lessonId)
    .collection('runs')
    .doc(runId)
    .collection('events')
    .orderBy('ts', 'asc')
    .get();
  
  return snapshot.docs.map((doc) => doc.data() as ProgressEvent);
}
