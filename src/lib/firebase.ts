// Firebase configuration for Learning.ai platform
// Supports authentication (Google & email) and Firestore for user profiles and institutions

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore';

// Firebase configuration object
// Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration early to avoid cryptic runtime errors
const missingKeys: string[] = [];
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_api_key_here') missingKeys.push('NEXT_PUBLIC_FIREBASE_API_KEY');
if (!firebaseConfig.authDomain) missingKeys.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
if (!firebaseConfig.projectId) missingKeys.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');

if (missingKeys.length > 0) {
  const msg = `Firebase is not configured. Missing env vars: ${missingKeys.join(', ')}.\n` +
    'Create .env.local at the project root and set your Firebase Web App config. Then restart the dev server.';
  if (typeof window !== 'undefined') {
    // Browser: throw to surface in UI
    throw new Error(msg);
  } else {
    // Server/dev console: log and throw
    // eslint-disable-next-line no-console
    console.error(msg);
    throw new Error(msg);
  }
}

// Initialize Firebase app (prevent multiple initialization in development)
let firebaseApp;
if (!getApps().length) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
  } catch (e) {
    // Provide more context in case of invalid config
    // eslint-disable-next-line no-console
    console.error('Failed to initialize Firebase app. Check your .env.local Firebase config values.');
    throw e;
  }
} else {
  firebaseApp = getApps()[0];
}

// Initialize Firebase Authentication
export const auth = getAuth(firebaseApp);

// Initialize Firestore Database
// Force long polling to improve connectivity on restrictive networks (VPNs, proxies, some extensions)
export const db = initializeFirestore(firebaseApp, {
  experimentalForceLongPolling: true
});

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider for better UX
googleProvider.setCustomParameters({
  prompt: 'select_account' // Forces account selection for better UX
});

// Development environment setup
// Use explicit env flag to determine emulator usage (Cloud Firestore by default)
const SHOULD_USE_FIRESTORE_EMULATOR =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

// Module-scoped flags to avoid reconnect attempts
let __firestoreEmulatorConnected = false;

if (typeof window !== 'undefined' && SHOULD_USE_FIRESTORE_EMULATOR) {
  // Connect to Firestore emulator (once)
  if (!__firestoreEmulatorConnected) {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      __firestoreEmulatorConnected = true;
    } catch (error) {
      // Emulator connection might fail if not running, which is fine for development
      console.log('Firestore emulator not available, using live Firestore');
    }
  }
}

// Export the initialized app for any additional Firebase services
export default firebaseApp;

// Utility function to check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
};

// Types for better TypeScript support
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  institutionId?: string; // For institution-linked students
  role: 'individual-student' | 'institution-admin' | 'corporate-user' | 'student' | 'instructor' | 'admin';
  isIndependent: boolean; // true for independent students
  onboarded: boolean; // true when user has completed onboarding process
  createdAt: Date;
  updatedAt: Date;
  preferences?: {
    learningStyle?: string;
    subjects?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    // Student onboarding specific fields
    age?: number;
    curriculum?: 'CBC' | 'British' | 'Adaptive';
    grade?: string;
    learningGoal?: string;
    preferredMode?: 'AI Autopilot';
  };
}

export interface Institution {
  id: string;
  name: string;
  domain: string; // email domain for automatic student linking
  type: 'university' | 'school' | 'college' | 'training_center';
  address?: string;
  website?: string;
  adminEmails: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Institution onboarding specific fields
  region?: string;
  numberOfStudents?: number;
  settings?: {
    allowSelfRegistration: boolean;
    requireEmailVerification: boolean;
    customBranding?: {
      logo?: string;
      primaryColor?: string;
      secondaryColor?: string;
    };
  };
}