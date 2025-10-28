import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { verifyIdToken } from '@/lib/serverAuth';
import { generateGCSECourseTOC } from '@/server/courseGenerator';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Missing authorization header' }, { status: 401 });
    }

    const idToken = authHeader.substring(7);
    await verifyIdToken(idToken);

    const body = await req.json();
    const { grade, subjects, curriculumContext } = body;

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

    const result = await generateGCSECourseTOC({
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
    console.error('[CoursesGenerateGCSE] Error:', message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
