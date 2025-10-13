## AI Tutors Frontend

Frontend for Learning.ai built with Next.js App Router. All authentication and data access happens on the backend API. The frontend only:

- Obtains Firebase ID tokens on the client (Google or email/password)
- Exchanges the ID token with the backend via POST /api/auth/login to create an HttpOnly session cookie
- Uses that cookie to call backend endpoints with fetch (credentials: include). When RoleGuard is required, the API helper also attaches a Bearer ID token automatically from the Firebase client.

No client-side database reads/writes are performed.

## Prerequisites

- Node 18.17+ (Next.js 15 / React 19)
- A running backend for the same project at http://localhost:3000 (or set NEXT_PUBLIC_API_BASE_URL)
- Firebase project (Web app) credentials for client auth

## Environment

Create .env.local with your Firebase client config and the API base URL:

```
NEXT_PUBLIC_FIREBASE_API_KEY=... 
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=... 
NEXT_PUBLIC_FIREBASE_PROJECT_ID=... 
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=... 
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=... 
NEXT_PUBLIC_FIREBASE_APP_ID=... 
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

## Run locally

```powershell
npm install
npm run dev
```

Open http://localhost:3000.

## How auth works (frontend)

1) User signs in with Google or email/password using Firebase client SDK
2) Frontend obtains a Firebase ID token and calls POST /api/auth/login with { idToken }
3) Backend verifies the token, issues a __session HttpOnly cookie
4) Frontend fetches GET /api/auth/session to get the profile (role, onboarded, etc.)
5) All subsequent actions (set role, onboarding, institution create) are POSTs to /api/* and handled server-side

## Notes

- If an endpoint uses RoleGuard on the backend, the API helper attaches Authorization: Bearer <idToken> in addition to cookies. If you prefer cookie-only, extend the backend RoleGuard to accept session cookies.
- No Firestore or Firebase Admin calls exist in this frontend; any future features must use backend APIs.
