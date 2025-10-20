import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { getOpenAI, OPENAI_CHAT_MODEL } from '@/lib/ai/openai';
import { systemTutorUpskill, upskillPlannerPrompt } from '@/lib/ai/prompts';
import type { UpskillPlanRequestPayload, PlanResponsePayload } from '@/lib/ai/types';
import { createPlan } from '@/lib/lessonStore';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = (await req.json()) as UpskillPlanRequestPayload & { persist?: boolean };
    const { goal, domain, currentLevel, timeline, hoursPerWeek, preferences, motivation, persist } = body;

    if (!goal || !goal.trim()) {
      return new Response(JSON.stringify({ message: 'Goal is required' }), { status: 400 });
    }

    const openai = getOpenAI();
    const timeoutMs = Number(process.env.PLANNER_TIMEOUT_MS || 60000);

    let timeoutHandle: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error('Planner timed out')), timeoutMs);
    });

    const completionPromise = openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemTutorUpskill },
        { role: 'user', content: upskillPlannerPrompt({ goal, domain, currentLevel, timeline, hoursPerWeek, preferences, motivation }) },
      ],
    });

    const completion: any = await Promise.race([completionPromise, timeoutPromise]);
    if (timeoutHandle) clearTimeout(timeoutHandle);

    const content = completion.choices?.[0]?.message?.content || '{}';
    let parsed: { toc: PlanResponsePayload['toc']; recommendedChapterCount: number; estimates: PlanResponsePayload['estimates'] };
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error('[upskill/plan/goal] JSON parse error:', content);
      throw new Error('Failed to parse planner response');
    }

    if (!parsed.toc || !Array.isArray(parsed.toc) || parsed.toc.length === 0) {
      throw new Error('Invalid TOC from planner');
    }

    let planId: string | undefined;
    if (persist) {
      // Persist as a lesson plan with upskill markers
      planId = await createPlan({
        uid: user.uid,
        grade: 'Upskill',
        subject: domain || 'General',
        topic: goal,
        specification: [currentLevel && `Level: ${currentLevel}`, timeline && `Timeline: ${timeline}`, typeof hoursPerWeek === 'number' && `~${hoursPerWeek} h/wk`, preferences && `Prefs: ${preferences}`, motivation && `Motivation: ${motivation}`]
          .filter(Boolean)
          .join(' | '),
        toc: parsed.toc,
        recommendedChapterCount: parsed.recommendedChapterCount,
        estimates: parsed.estimates,
        status: 'proposed',
      });
    }

    const response: Partial<PlanResponsePayload> & { toc: PlanResponsePayload['toc']; displayToc: PlanResponsePayload['toc']; recommendedChapterCount: number; estimates: PlanResponsePayload['estimates'] } = {
      ...(planId ? { planId } : {}),
      toc: parsed.toc,
      displayToc: parsed.toc,
      recommendedChapterCount: parsed.recommendedChapterCount,
      estimates: parsed.estimates,
    };

    return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    const isTimeout = (err?.message || '').toLowerCase().includes('timed out');
    const status = isTimeout ? 504 : err?.status ?? 500;
    const message = err?.message ?? 'Failed to generate upskill plan';
    return new Response(JSON.stringify({ message }), { status });
  }
}
