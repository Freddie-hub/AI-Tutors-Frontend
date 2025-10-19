# Firestore Security Rules for Lessons

To enable the saved lessons feature, you need to add security rules to your Firestore database.

## Rules to Add

Add the following rules to your `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Lessons collection
    match /lessons/{lessonId} {
      // Allow users to read their own lessons
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      
      // Allow users to create lessons with their own userId
      allow create: if request.auth != null && 
                      request.auth.uid == request.resource.data.userId &&
                      request.resource.data.keys().hasAll(['grade', 'subject', 'topic', 'userId', 'createdAt']);
      
      // Allow users to update their own lessons
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
      
      // Allow users to delete their own lessons
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Your other existing rules...
  }
}
```

## Deploying Rules

1. **Using Firebase Console:**
   - Go to Firebase Console → Firestore Database → Rules
   - Add the rules above to your existing rules
   - Click "Publish"

2. **Using Firebase CLI:**
   ```bash
   firebase deploy --only firestore:rules
   ```

## Testing Rules

You can test the rules in the Firebase Console:
1. Go to Firestore Database → Rules
2. Click on "Rules Playground"
3. Test read/write operations with different user authentication states
