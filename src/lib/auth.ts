// Authentication utilities for Learning.ai platform
// Provides reusable functions for user authentication and profile management

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  collection,
  getDocs
} from 'firebase/firestore';
import { auth, db, googleProvider, UserProfile, Institution } from './firebase';

// Authentication functions
export const authService = {
  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  },

  // Create account with email and password
  async createAccountWithEmail(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  // Sign in with Google
  async signInWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(auth, googleProvider);
  },

  // Sign out
  async signOut(): Promise<void> {
    return signOut(auth);
  },

  // Send password reset email
  async resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email);
  },

  // Update user profile
  async updateUserProfile(updates: { displayName?: string; photoURL?: string }): Promise<void> {
    if (auth.currentUser) {
      return updateProfile(auth.currentUser, updates);
    }
    throw new Error('No authenticated user');
  }
};

// User profile management
export const userService = {
  // Create user profile in Firestore
  async createUserProfile(
    user: User,
    additionalData: Partial<UserProfile> = {}
  ): Promise<void> {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Check if user belongs to an institution based on email domain
      const institutionId = await this.getInstitutionByEmailDomain(user.email || '');
      
      const userData: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'individual-student', // Default role, will be updated during onboarding
        isIndependent: !institutionId, // Independent if no institution found
        institutionId: institutionId || undefined,
        onboarded: false, // User needs to complete onboarding
        createdAt: new Date(),
        updatedAt: new Date(),
        ...additionalData
      };

      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  },

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  },

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  // Check if user belongs to an institution based on email domain
  async getInstitutionByEmailDomain(email: string): Promise<string | null> {
    if (!email) return null;
    
    const domain = email.split('@')[1];
    if (!domain) return null;

    const institutionsRef = collection(db, 'institutions');
    const q = query(institutionsRef, where('domain', '==', domain), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    return null;
  },

  // Link user to institution
  async linkUserToInstitution(uid: string, institutionId: string): Promise<void> {
    await this.updateUserProfile(uid, {
      institutionId,
      isIndependent: false
    });
  }
};

// Institution management
export const institutionService = {
  // Create institution
  async createInstitution(institutionData: Omit<Institution, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const institutionRef = doc(collection(db, 'institutions'));
    const institution: Institution = {
      ...institutionData,
      id: institutionRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(institutionRef, {
      ...institution,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return institutionRef.id;
  },

  // Get institution by ID
  async getInstitution(institutionId: string): Promise<Institution | null> {
    const institutionRef = doc(db, 'institutions', institutionId);
    const institutionSnap = await getDoc(institutionRef);
    
    if (institutionSnap.exists()) {
      return institutionSnap.data() as Institution;
    }
    return null;
  },

  // Update institution
  async updateInstitution(institutionId: string, updates: Partial<Institution>): Promise<void> {
    const institutionRef = doc(db, 'institutions', institutionId);
    await updateDoc(institutionRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }
};

// Utility functions
export const utils = {
  // Check if user is institution admin
  isInstitutionAdmin: (userProfile: UserProfile, institution: Institution): boolean => {
    return institution.adminEmails.includes(userProfile.email);
  },

  // Validate email domain against institution
  validateInstitutionEmail: (email: string, institution: Institution): boolean => {
    const domain = email.split('@')[1];
    return domain === institution.domain;
  }
};