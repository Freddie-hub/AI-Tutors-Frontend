// Frontend authentication helpers (Firebase Auth only)
// All Firestore/profile/institution data is handled by the backend API.

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export const authService = {
  async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  },

  async createAccountWithEmail(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  async signInWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(auth, googleProvider);
  },

  async signOut(): Promise<void> {
    return firebaseSignOut(auth);
  },

  async resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email);
  },

  async updateUserProfile(updates: { displayName?: string; photoURL?: string }): Promise<void> {
    if (auth.currentUser) {
      return updateProfile(auth.currentUser, updates);
    }
    throw new Error('No authenticated user');
  }
};

// Note: any profile or institution operations should be done via backend endpoints in api.ts