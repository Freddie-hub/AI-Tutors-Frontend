import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { imageGenerate } from '@/lib/images';

export async function POST(req: NextRequest) {
  try {
    await requireUser(req);
    const { prompt } = await req.json();
    const img = await imageGenerate(prompt);
    return new Response(JSON.stringify({ image: img }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return new Response(JSON.stringify({ message: err?.message ?? 'Generation failed' }), { status: err?.status ?? 500 });
  }
}
