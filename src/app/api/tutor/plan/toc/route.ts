import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { curriculumContext } from '@/lib/curriculum';
import { getOpenAI, OPENAI_CHAT_MODEL } from '@/lib/ai/openai';
import { systemTutor, plannerPrompt } from '@/lib/ai/prompts';
import { PlanRequestPayload, PlanResponsePayload } from '@/lib/ai/types';
import { createPlan } from '@/lib/lessonStore';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = (await req.json()) as PlanRequestPayload;
    const { grade, subject, topic, specification, preferences } = body;
    
    const context = curriculumContext(grade, subject, topic);
    
    const openai = getOpenAI();
    const timeoutMs = Number(process.env.PLANNER_TIMEOUT_MS || 60000);
  const completion: any = await Promise.race([
      openai.chat.completions.create({
        model: OPENAI_CHAT_MODEL,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        // Cap response size to avoid long generations
        max_tokens: 800,
        messages: [
          { role: 'system', content: systemTutor },
          {
            role: 'user',
            content: plannerPrompt({
              grade,
              subject,
              topic,
              specification,
              curriculumContext: context,
              preferences,
            }),
          },
        ],
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Planner timed out')), timeoutMs)
      )
  ]);
    
    const content = completion.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content) as {
      toc: PlanResponsePayload['toc'];
      recommendedChapterCount: number;
      estimates: PlanResponsePayload['estimates'];
    };
    
    // Store the plan in Firestore
    const planId = await createPlan({
      uid: user.uid,
      grade,
      subject,
      topic,
      specification,
      toc: parsed.toc,
      recommendedChapterCount: parsed.recommendedChapterCount,
      estimates: parsed.estimates,
      status: 'proposed',
    });
    
    const response: PlanResponsePayload = {
      planId,
      toc: parsed.toc,
      displayToc: parsed.toc, // Same for now; hide lengths in UI if needed
      recommendedChapterCount: parsed.recommendedChapterCount,
      estimates: parsed.estimates,
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    const isTimeout = (err?.message || '').toLowerCase().includes('timed out');
    const status = isTimeout ? 504 : err?.status ?? 500;
    const message = err?.message ?? 'Failed to generate lesson plan';
    return new Response(JSON.stringify({ message }), { status });
  }
}
