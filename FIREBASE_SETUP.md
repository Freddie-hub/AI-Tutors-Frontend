# Firebase Setup Guide for Learning.ai Platform

This guide will help you complete the Firebase setup for your Learning.ai platform with authentication and Firestore.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `learning-ai-platform` (or your preferred name)
4. Enable Google Analytics (recommended)
5. Choose or create a Google Analytics account

## 2. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Click enable, then save
   - **Google**: Click enable, enter your app name, select support email, then save

## 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location close to your users
5. Click "Done"

## 4. Configure Web App

1. In Project Overview, click the **Web** icon (`</>`)
2. Enter app nickname: `learning-ai-web`
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

## 5. Set Up Environment Variables

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Replace the placeholder values in `.env.local` with your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id
   ```

## 6. Set Up Firestore Security Rules

In Firebase Console > Firestore Database > Rules, replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Institutions can be read by authenticated users
    match /institutions/{institutionId} {
      allow read: if request.auth != null;
      // Only institution admins can write
      allow write: if request.auth != null && 
        request.auth.token.email in resource.data.adminEmails;
    }
    
    // Additional collections for learning content, courses, etc.
    match /courses/{courseId} {
      allow read: if request.auth != null;
      // Add specific write rules based on your requirements
    }
    
    match /learning_sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 7. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. The Firebase configuration should now be available throughout your app via:
   ```typescript
   import { auth, db, googleProvider } from '@/lib/firebase';
   import { useAuthUser } from '@/lib/hooks';
   ```

## 8. Usage Examples

### Authentication Component Example:
```typescript
'use client';

import { useAuthUser, useAuthActions } from '@/lib/hooks';
import { authService } from '@/lib/auth';

export default function LoginForm() {
  const { user, loading } = useAuthUser();
  const { withErrorHandling, loading: actionLoading, error } = useAuthActions();

  const handleGoogleLogin = () => {
    withErrorHandling(() => authService.signInWithGoogle());
  };

  if (loading) return <div>Loading...</div>;
  if (user) return <div>Welcome, {user.displayName}!</div>;

  return (
    <div>
      <button onClick={handleGoogleLogin} disabled={actionLoading}>
        Sign in with Google
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### User Profile Component Example:
```typescript
'use client';

import { useAuthUser } from '@/lib/hooks';

export default function UserProfile() {
  const { profile, institution, isIndependent, loading } = useAuthUser();

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div>
      <h2>{profile.displayName}</h2>
      <p>Email: {profile.email}</p>
      <p>Type: {isIndependent ? 'Independent Student' : 'Institution Student'}</p>
      {institution && (
        <p>Institution: {institution.name}</p>
      )}
    </div>
  );
}
```

## 9. Development vs Production

- **Development**: The config includes emulator setup for local testing
- **Production**: Make sure to update Firestore rules for production security
- **Environment**: Always use `.env.local` for local development and proper environment variables in production

## 10. Next Steps

1. Create authentication components (login, signup, profile)
2. Set up protected routes using the auth hooks
3. Create institution onboarding flow
4. Implement user preference management
5. Add course and learning session collections
6. Set up AI integration for personalized content

## Security Best Practices

1. **Never commit** `.env.local` to version control
2. Use **Firebase Security Rules** to protect data
3. Validate user permissions on both client and server
4. Regular audit of Firebase usage and billing
5. Use **Firebase App Check** in production for additional security

Your Firebase setup is now complete and ready for Learning.ai platform development!