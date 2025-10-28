import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { verifyIdToken } from '@/lib/serverAuth';
import { generateCustomCourseTOC } from '@/server/courseGenerator';

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
    const { topic, level, goals, duration } = body;

    // Validate required fields
    if (!topic || !level) {
      return NextResponse.json(
        { message: 'Missing required fields: topic, level' },
        { status: 400 }
      );
    }

    // Generate custom course structure using AI
    const result = await generateCustomCourseTOC({
      topic,
      level,
      goals,
      duration,
    });

    return NextResponse.json({
      success: true,
      ...result,
    }, { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[CoursesGenerateCustom] Error:', message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
