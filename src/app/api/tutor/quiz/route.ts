import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { getOpenAI, OPENAI_CHAT_MODEL } from '@/lib/ai/openai';
import { quizPrompt } from '@/lib/ai/prompts';
import { Quiz, QuizRequestPayload } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    await requireUser(req);
    const body = (await req.json()) as QuizRequestPayload;
    const { topic, lessonContent, difficulty = 'medium', count = 5 } = body;
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You generate compact quizzes in strict JSON.' },
        { role: 'user', content: quizPrompt({ topic, lessonSummary: lessonContent, difficulty, count }) },
      ],
    });
    const content = completion.choices?.[0]?.message?.content || '{}';
  const parsed = JSON.parse(content) as Partial<{ questions: Array<{ id: string; type: 'mcq' | 'short' | string; prompt: string; choices?: string[] }> }>;
    const quiz: Quiz = {
      id: `${Date.now()}`,
      topic,
      difficulty,
      questions: Array.isArray(parsed.questions)
        ? parsed.questions
            .map((q) => {
              const t = q.type === 'mcq' || q.type === 'short' ? q.type : undefined;
              if (!t) return null;
              return { id: q.id, type: t, prompt: q.prompt, choices: q.choices } as Quiz['questions'][number];
            })
            .filter(Boolean) as Quiz['questions']
        : [],
    };
    return new Response(JSON.stringify(quiz), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return new Response(JSON.stringify({ message: err?.message ?? 'Failed to create quiz' }), { status: err?.status ?? 500 });
  }
}
