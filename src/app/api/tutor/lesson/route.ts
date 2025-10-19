import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { curriculumContext } from '@/lib/curriculum';
import { getOpenAI, OPENAI_CHAT_MODEL } from '@/lib/ai/openai';
import { systemTutor, lessonPrompt } from '@/lib/ai/prompts';
import { LessonRequestPayload, LessonResponsePayload } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    await requireUser(req);
    const body = (await req.json()) as LessonRequestPayload;
    const { grade, subject, topic, specification } = body;
    const context = curriculumContext(grade, subject, topic);

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemTutor },
        { role: 'user', content: lessonPrompt({ grade, subject, topic, specification, curriculumContext: context }) },
      ],
    });

    const content = completion.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content) as Partial<LessonResponsePayload>;
    const lessonId = `${Date.now()}`;
    const payload: LessonResponsePayload = {
      lessonId,
      grade,
      subject,
      topic,
      specification,
      outline: parsed.outline ?? [],
      sections: parsed.sections ?? [],
      content: parsed.content ?? '',
    };

    return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    const status = err?.status ?? 500;
    const message = err?.message ?? 'Failed to generate lesson';
    return new Response(JSON.stringify({ message }), { status });
  }
}
