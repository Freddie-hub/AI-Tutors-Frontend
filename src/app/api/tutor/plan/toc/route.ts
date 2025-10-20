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
  const body = (await req.json()) as PlanRequestPayload & { persist?: boolean; curriculumContext?: string };
  const { grade, subject, topic, specification, preferences, persist, curriculumContext: passedContext } = body;
    
    // Use passed curriculum context if available, otherwise fall back to default
    const context = passedContext || curriculumContext(grade, subject, topic);
    
    console.log('[planner] Starting plan generation...', { grade, subject, topic });
    
    const openai = getOpenAI();
    const timeoutMs = Number(process.env.PLANNER_TIMEOUT_MS || 20000); // Default 20s
    
    let timeoutHandle: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        console.log('[planner] TIMEOUT triggered at', timeoutMs, 'ms');
        reject(new Error('Planner timed out'));
      }, timeoutMs);
    });
    
    const completionPromise = openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      max_tokens: 500, // Reduced further
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
    });
    
    const completion: any = await Promise.race([completionPromise, timeoutPromise]);
    if (timeoutHandle) clearTimeout(timeoutHandle);
    console.log('[planner] Completion received');
    
    const content = completion.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content) as {
      toc: PlanResponsePayload['toc'];
      recommendedChapterCount: number;
      estimates: PlanResponsePayload['estimates'];
    };
    
    let planId: string | undefined = undefined;
    if (persist) {
      console.log('[planner] Storing plan in Firestore...');
      // Store the plan in Firestore only if requested
      planId = await createPlan({
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
      console.log('[planner] Plan stored, returning response');
    }
    
    const response: Partial<PlanResponsePayload> & { toc: PlanResponsePayload['toc']; displayToc: PlanResponsePayload['toc']; recommendedChapterCount: number; estimates: PlanResponsePayload['estimates'] } = {
      ...(planId ? { planId } : {}),
      toc: parsed.toc,
      displayToc: parsed.toc,
      recommendedChapterCount: parsed.recommendedChapterCount,
      estimates: parsed.estimates,
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: unknown) {
    console.error('[planner] ERROR:', e);
    const err = e as { status?: number; message?: string };
    const isTimeout = (err?.message || '').toLowerCase().includes('timed out');
    const status = isTimeout ? 504 : err?.status ?? 500;
    const message = err?.message ?? 'Failed to generate lesson plan';
    return new Response(JSON.stringify({ message }), { status });
  }
}
