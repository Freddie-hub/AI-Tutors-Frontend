import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { imageSearch } from '@/lib/images';

export async function POST(req: NextRequest) {
  try {
    await requireUser(req);
    const { query, count } = await req.json();
    const candidates = await imageSearch(query, count ?? 3);
    return new Response(JSON.stringify({ candidates }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return new Response(JSON.stringify({ message: err?.message ?? 'Search failed' }), { status: err?.status ?? 500 });
  }
}
