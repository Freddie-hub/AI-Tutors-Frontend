import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { getOpenAI, OPENAI_CHAT_MODEL } from '@/lib/ai/openai';
import { gradingPrompt } from '@/lib/ai/prompts';
import { GradeRequestPayload, GradeResult } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    await requireUser(req);
    const body = (await req.json()) as GradeRequestPayload;
    const { quiz, responses } = body;
    const openai = getOpenAI();
    const questionsJson = JSON.stringify(quiz.questions);
    const responsesJson = JSON.stringify(responses);
    const completion = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Grade objectively and return only JSON.' },
        { role: 'user', content: gradingPrompt({ questionsJson, responsesJson }) },
      ],
    });
    const content = completion.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content) as Partial<{ results: Array<{ questionId: string; correct: boolean; feedback?: string }>; score: number }>;
    const result: GradeResult = {
      score: typeof parsed.score === 'number' ? parsed.score : 0,
      perQuestion: Array.isArray(parsed.results)
        ? parsed.results.map((r) => ({ questionId: r.questionId, correct: !!r.correct, feedback: r.feedback }))
        : [],
    };
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    return new Response(JSON.stringify({ message: err?.message ?? 'Grading failed' }), { status: err?.status ?? 500 });
  }
}
