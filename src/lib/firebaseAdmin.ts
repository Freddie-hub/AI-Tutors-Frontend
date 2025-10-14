// Server-side Firebase Admin SDK initialization and helpers
// Uses environment variables (do NOT commit service account JSON)

import admin from 'firebase-admin';
import { randomUUID } from 'node:crypto';

// Read credentials from env vars (recommended for Vercel/Next.js)
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

const hasServiceAccountCreds = Boolean(projectId && clientEmail && privateKey);
const emulatorRequested = Boolean(
  process.env.FIRESTORE_EMULATOR_HOST || process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
);

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
if (emulatorRequested && !process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
}

if (!admin.apps.length) {
  try {
    if (hasServiceAccountCreds) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        projectId: projectId,
      } as any);
    } else if (emulatorRequested) {
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

type Primitive = string | number | boolean | bigint | symbol | null | undefined;
type JsonLike = Primitive | Date | JsonLike[] | { [key: string]: JsonLike };

const cloneValue = <T extends JsonLike>(value: T): T => {
  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item as JsonLike)) as T;
  }
  if (value && typeof value === 'object') {
    const cloned: Record<string, JsonLike> = {};
    for (const [key, val] of Object.entries(value)) {
      cloned[key] = cloneValue(val as JsonLike);
    }
    return cloned as T;
  }
  return value;
};

const mergeDocs = (target: Record<string, JsonLike>, source: Record<string, JsonLike>) => {
  const result: Record<string, JsonLike> = cloneValue(target);
  for (const [key, value] of Object.entries(source)) {
    const targetVal = result[key];
    if (isMergeableObject(targetVal) && isMergeableObject(value)) {
      result[key] = mergeDocs(targetVal as Record<string, JsonLike>, value as Record<string, JsonLike>);
    } else {
      result[key] = cloneValue(value as JsonLike);
    }
  }
  return result;
};

const isMergeableObject = (value: JsonLike): value is Record<string, JsonLike> => {
  return !!value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
};

type InMemoryDocumentData = Record<string, JsonLike>;

class InMemoryDocSnapshot {
  constructor(private readonly docId: string, private readonly dataInternal?: InMemoryDocumentData) {}

  get exists() {
    return !!this.dataInternal;
  }

  get id() {
    return this.docId;
  }

  data() {
    return this.dataInternal ? cloneValue(this.dataInternal) : undefined;
  }
}

class InMemoryDocRef {
  constructor(
    private readonly docId: string,
    private readonly store: Map<string, InMemoryDocumentData>
  ) {}

  get id() {
    return this.docId;
  }

  async get() {
    const current = this.store.get(this.docId);
    return new InMemoryDocSnapshot(this.docId, current);
  }

  async set(data: InMemoryDocumentData, options?: { merge?: boolean }) {
    const normalized = cloneValue(data);
    if (options?.merge && this.store.has(this.docId)) {
      const existing = this.store.get(this.docId)!;
      this.store.set(this.docId, mergeDocs(existing, normalized));
    } else {
      this.store.set(this.docId, normalized);
    }
  }

  async update(data: InMemoryDocumentData) {
    if (!this.store.has(this.docId)) {
      const err = new Error('Document does not exist');
      (err as any).code = 'NOT_FOUND';
      throw err;
    }
    await this.set(data, { merge: true });
  }
}

class InMemoryCollectionRef {
  private readonly docs = new Map<string, InMemoryDocumentData>();

  constructor(private readonly idGenerator: () => string) {}

  doc(id?: string) {
    const docId = id ?? this.idGenerator();
    return new InMemoryDocRef(docId, this.docs);
  }

  async add(data: InMemoryDocumentData) {
    const docRef = this.doc();
    await docRef.set(data);
    return docRef;
  }
}

class InMemoryFirestore {
  private readonly collections = new Map<string, InMemoryCollectionRef>();

  collection(name: string) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new InMemoryCollectionRef(() => randomUUID()));
    }
    return this.collections.get(name)!;
  }
}

class InMemoryFieldValue {
  static serverTimestamp() {
    return new Date();
  }
}

export const adminAuth = admin.auth();
const canUseFirestoreAdmin = hasServiceAccountCreds || emulatorRequested;

const adminDbInternal = canUseFirestoreAdmin ? admin.firestore() : new InMemoryFirestore();

if (!canUseFirestoreAdmin) {
  console.warn('[firebaseAdmin] FIREBASE_* service account env vars are missing. Using in-memory Firestore fallback for development. Data will reset on restart.');
}

export const adminDb = adminDbInternal;

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
export const FieldValue = canUseFirestoreAdmin ? admin.firestore.FieldValue : InMemoryFieldValue;


