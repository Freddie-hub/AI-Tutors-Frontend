// Server-side Firebase Admin SDK initialization and helpers
// Uses environment variables (do NOT commit service account JSON)

import admin from 'firebase-admin';

// Read credentials from env vars (recommended for Vercel/Next.js)
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

// Normalize private key from env:
// - Trim whitespace
// - Strip optional wrapping quotes ("..." or '...') commonly added in .env files
// - Replace escaped newlines for private keys stored as single-line env values
if (privateKey) {
  privateKey = privateKey.trim();
  const hasDoubleQuotes = privateKey.startsWith('"') && privateKey.endsWith('"');
  const hasSingleQuotes = privateKey.startsWith("'") && privateKey.endsWith("'");
  if (hasDoubleQuotes || hasSingleQuotes) {
    privateKey = privateKey.slice(1, -1);
  }
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
}

// Initialize Admin app once per server process, with graceful fallbacks
if (!admin.apps.length) {
  const useEnvCreds = !!(projectId && clientEmail && privateKey);
  const usingEmulator = !!(process.env.FIRESTORE_EMULATOR_HOST || process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true');
  // If requested, set emulator host default
  if (usingEmulator && !process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  }
  try {
    if (useEnvCreds) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        projectId: projectId,
      } as any);
    } else if (usingEmulator) {
      // Provide a projectId for emulator even without credentials
      const emulatorProjectId = projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-learning-ai';
      admin.initializeApp({ projectId: emulatorProjectId } as any);
    } else {
      // Fallback: Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS or local ADC)
      admin.initializeApp();
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[firebaseAdmin] Failed to initialize Firebase Admin SDK. Ensure either FIREBASE_* env vars are set or ADC/Emulator is configured.', err);
    throw err;
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();

// Common helper to verify a Bearer token from the Authorization header
export async function verifyBearerToken(authorizationHeader?: string) {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authorizationHeader.split(' ')[1];
  const decoded = await adminAuth.verifyIdToken(token, true);
  return decoded; // contains uid, email, etc.
}

// Re-export FieldValue for server timestamps, etc.
export const FieldValue = admin.firestore.FieldValue;
