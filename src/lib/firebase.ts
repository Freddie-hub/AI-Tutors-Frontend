// Firebase configuration for Learning.ai platform
// Supports authentication (Google & email) and Firestore for user profiles and institutions

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

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

// Initialize Firebase app (prevent multiple initialization in development)
let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

// Initialize Firebase Authentication
export const auth = getAuth(firebaseApp);

// Initialize Firestore Database
export const db = getFirestore(firebaseApp);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider for better UX
googleProvider.setCustomParameters({
  prompt: 'select_account' // Forces account selection for better UX
});

// Development environment setup
if (process.env.NODE_ENV === 'development') {
  // Connect to Auth emulator if not already connected
  if (!auth.config.emulator) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    } catch (error) {
      // Emulator connection might fail if not running, which is fine for development
      console.log('Auth emulator not available, using live Firebase Auth');
    }
  }

  // Connect to Firestore emulator if not already connected
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Emulator connection might fail if not running, which is fine for development
    console.log('Firestore emulator not available, using live Firestore');
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