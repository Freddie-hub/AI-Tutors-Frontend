import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { curriculumContext } from '@/lib/curriculum';
import { getOpenAI, OPENAI_CHAT_MODEL } from '@/lib/ai/openai';
import { systemTutor, plannerPrompt } from '@/lib/ai/prompts';
import { getPlan, createPlan } from '@/lib/lessonStore';
import { PlanResponsePayload } from '@/lib/ai/types';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ planId: string }> }
) {
  try {
    const user = await requireUser(req);
    const { planId } = await ctx.params;
    const body = await req.json();
    const { constraints, preferences } = body;
    
    // Get the original plan
    const originalPlan = await getPlan(planId);
    if (!originalPlan) {
      return new Response(JSON.stringify({ message: 'Plan not found' }), { status: 404 });
    }
    
    if (originalPlan.uid !== user.uid) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 403 });
    }
    
    const context = curriculumContext(
      originalPlan.grade,
      originalPlan.subject,
      originalPlan.topic
    );
    
    console.log('[replan] Starting replan generation...');
    
    // Add constraints to preferences
    const enhancedPreferences = [
      preferences || originalPlan.specification,
      constraints ? `User constraints: ${constraints}` : '',
    ]
      .filter(Boolean)
      .join(' ');
    
    const openai = getOpenAI();
  const timeoutMs = Number(process.env.PLANNER_TIMEOUT_MS || 60000);
    
    let timeoutHandle: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        console.log('[replan] TIMEOUT triggered at', timeoutMs, 'ms');
        reject(new Error('Planner timed out'));
      }, timeoutMs);
    });
    
    const completionPromise = openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemTutor },
        {
          role: 'user',
          content: plannerPrompt({
            grade: originalPlan.grade,
            subject: originalPlan.subject,
            topic: originalPlan.topic,
            specification: originalPlan.specification,
            curriculumContext: context,
            preferences: enhancedPreferences,
          }),
        },
      ],
    });
    
    const completion: any = await Promise.race([completionPromise, timeoutPromise]);
    if (timeoutHandle) clearTimeout(timeoutHandle);
    console.log('[replan] Completion received');
    
    const content = completion.choices?.[0]?.message?.content || '{}';
    let raw: any;
    try {
      raw = JSON.parse(content);
    } catch (e) {
      console.error('[replan] JSON parse error. Full content:', content);
      throw new Error('Failed to parse replan response.');
    }

    // Map both universal planner shape and legacy shape to PlanResponsePayload
    const parsed = (() => {
      if (raw && raw.public && raw.private) {
        const toc = Array.isArray(raw.public.toc) ? raw.public.toc.map((c: any) => ({
          chapterId: c.chapterId,
          title: c.title,
          subtopics: Array.isArray(c.subtopics) ? c.subtopics : [],
        })) : [];
  const recommendedChapterCount = Number(raw.public.recommendedChapterCount ?? (toc.length || 4));
        const totalTokens = Number(raw.private?.estimates?.totalTokens ?? 0);
        const perChapter = Array.isArray(raw.private?.estimates?.perChapter)
          ? raw.private.estimates.perChapter.map((pc: any) => ({
              chapterId: pc.chapterId,
              estimatedTokens: Number(pc.tokens ?? pc.estimatedTokens ?? 0),
            }))
          : [];
        return { toc, recommendedChapterCount, estimates: { totalTokens, perChapter } } as {
          toc: PlanResponsePayload['toc'];
          recommendedChapterCount: number;
          estimates: PlanResponsePayload['estimates'];
        };
      }
      if (raw && raw.toc && Array.isArray(raw.toc)) {
  const recommendedChapterCount = Number(raw.recommendedChapterCount ?? (raw.toc.length || 4));
        const totalTokens = Number(raw.estimates?.totalTokens ?? 0);
        const perChapter = Array.isArray(raw.estimates?.perChapter) ? raw.estimates.perChapter : [];
        return { toc: raw.toc, recommendedChapterCount, estimates: { totalTokens, perChapter } } as {
          toc: PlanResponsePayload['toc'];
          recommendedChapterCount: number;
          estimates: PlanResponsePayload['estimates'];
        };
      }
      return null;
    })();
    if (!parsed) {
      throw new Error('Invalid replan response structure');
    }
    
    console.log('[replan] Creating new plan...');
    // Create a new refined plan
    const newPlanId = await createPlan({
      uid: user.uid,
      grade: originalPlan.grade,
      subject: originalPlan.subject,
      topic: originalPlan.topic,
      specification: originalPlan.specification,
      toc: parsed.toc,
      recommendedChapterCount: parsed.recommendedChapterCount,
      estimates: parsed.estimates,
      status: 'refined',
    });
    
    const response: PlanResponsePayload = {
      planId: newPlanId,
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
    console.error('[replan] ERROR:', e);
    const err = e as { status?: number; message?: string };
    const isTimeout = (err?.message || '').toLowerCase().includes('timed out');
    const status = isTimeout ? 504 : err?.status ?? 500;
    const message = err?.message ?? 'Failed to replan';
    return new Response(JSON.stringify({ message }), { status });
  }
}
