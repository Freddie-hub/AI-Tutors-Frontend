import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyIdToken } from '@/lib/serverAuth';

// GET /api/courses/catalog - Get public/template courses for browsing
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Missing authorization header' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    await verifyIdToken(idToken); // Just verify, don't need uid for catalog

    // Query template courses (courses marked as public/template)
    const catalogRef = adminDb.collection('courseCatalog');
    const snapshot = await catalogRef
      .where('isPublic', '==', true)
      .orderBy('enrollmentCount', 'desc')
      .get();

    const courses = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[CourseCatalogRoute] GET Error:', message);
    
    // Fallback: if index doesn't exist, return unordered
    if (message.includes('index')) {
      try {
        const catalogRef = adminDb.collection('courseCatalog');
        const snapshot = await catalogRef.where('isPublic', '==', true).get();
        
        const courses = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
          };
        });
        
        return NextResponse.json({ 
          courses,
          hint: 'Create Firestore composite index on (isPublic asc, enrollmentCount desc)'
        }, { status: 200 });
      } catch (fallbackError) {
        return NextResponse.json({ message: 'Failed to fetch catalog' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ message }, { status: 500 });
  }
}
