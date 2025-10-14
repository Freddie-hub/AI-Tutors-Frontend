import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { adminDb } from '@/lib/firebaseAdmin';

// GET /api/institution/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'id is required' }, { status: 400 });
    }
    const doc = await adminDb.collection('institutions').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ id, ...doc.data() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
