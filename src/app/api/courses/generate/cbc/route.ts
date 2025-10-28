import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { verifyIdToken } from '@/lib/serverAuth';
import { generateCBCCourseTOC } from '@/server/courseGenerator';

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Missing authorization header' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const body = await req.json();
    const { grade, subjects, curriculumContext } = body;

    // Validate required fields
    if (!grade || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { message: 'Missing required fields: grade, subjects (array)' },
        { status: 400 }
      );
    }

    if (!curriculumContext) {
      return NextResponse.json(
        { message: 'Missing curriculumContext' },
        { status: 400 }
      );
    }

    // Generate course structure using AI
    const result = await generateCBCCourseTOC({
      grade,
      subjects,
      curriculumContext,
    });

    return NextResponse.json({
      success: true,
      ...result,
    }, { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[CoursesGenerateCBC] Error:', message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
