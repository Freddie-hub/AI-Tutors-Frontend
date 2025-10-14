'use client';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  type UserCredential,
} from 'firebase/auth';

import { auth, googleProvider } from '@/lib/firebase';

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
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }

    await updateProfile(auth.currentUser, updates);
  },
};

// Note: profile and institution operations should go through backend endpoints in api.ts
