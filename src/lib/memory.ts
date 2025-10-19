import { adminDb, FieldValue } from './firebaseAdmin';

export async function writeSessionEvent(uid: string, sessionId: string, event: Record<string, unknown>) {
  const ref = adminDb.collection('users').doc(uid).collection('memory').doc('sessions')
    .collection(sessionId).doc();
  await ref.set({ ...event, createdAt: FieldValue.serverTimestamp() });
}

export async function upsertMastery(uid: string, subject: string, topic: string, delta: number) {
  const ref = adminDb.collection('users').doc(uid).collection('memory').doc('mastery')
    .collection(subject).doc(topic);
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const prev = snap.exists ? snap.data() : { score: 0, seen: 0 };
    const score = Math.max(0, Math.min(1, (prev?.score ?? 0) + delta));
    const seen = (prev?.seen ?? 0) + 1;
    tx.set(ref, { score, seen, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  });
}

export async function readPreferences(uid: string): Promise<string> {
  const ref = adminDb.collection('users').doc(uid);
  const snap = await ref.get();
  const prefs = snap.get('preferences') || {};
  return JSON.stringify(prefs);
}
