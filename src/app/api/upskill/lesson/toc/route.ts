import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  return new Response(
    JSON.stringify({ message: 'This endpoint is not implemented. Use /api/upskill/plan/goal instead.' }),
    { 
      status: 501,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}