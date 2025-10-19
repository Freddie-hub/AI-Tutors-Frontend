import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { getOpenAI, OPENAI_CHAT_MODEL } from '@/lib/ai/openai';
import { systemTutor } from '@/lib/ai/prompts';

export async function POST(req: NextRequest) {
  try {
    await requireUser(req);
  const body = (await req.json()) as { message: string; lessonContext?: Record<string, unknown> };
  const { message, lessonContext } = body;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      messages: (
        [
        { role: 'system', content: systemTutor },
        lessonContext ? { role: 'system', content: `Lesson context: ${JSON.stringify(lessonContext).slice(0, 4000)}` } : undefined,
        { role: 'user', content: message },
      ] as Array<{ role: 'system' | 'user'; content: string }>
      ).filter(Boolean),
    });

    const content = completion.choices?.[0]?.message?.content || '';
    return new Response(JSON.stringify({ reply: content }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    const status = err?.status ?? 500;
    const message = err?.message ?? 'Chat failed';
    return new Response(JSON.stringify({ message }), { status });
  }
}
