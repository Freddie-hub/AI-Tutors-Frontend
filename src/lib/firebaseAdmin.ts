import * as admin from "firebase-admin";

// Initialize once per server process
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
// Ignore undefined fields in writes to avoid Firestore validation errors
// This must be set before any Firestore operations are performed.
try {
  // settings() is available in the Firestore Admin SDK via @google-cloud/firestore
  const dbWithSettings = adminDb as unknown as {
    settings?: (settings: { ignoreUndefinedProperties: boolean }) => void;
  };
  dbWithSettings.settings?.({ ignoreUndefinedProperties: true });
} catch {
  // No-op: if settings isn't available, we'll rely on callers to avoid undefineds
}
export const FieldValue = admin.firestore.FieldValue;