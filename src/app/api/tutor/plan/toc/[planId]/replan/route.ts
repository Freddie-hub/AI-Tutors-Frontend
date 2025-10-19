import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { curriculumContext } from '@/lib/curriculum';
import { getOpenAI, OPENAI_CHAT_MODEL } from '@/lib/ai/openai';
import { systemTutor, plannerPrompt } from '@/lib/ai/prompts';
import { getPlan, createPlan } from '@/lib/lessonStore';
import { PlanResponsePayload } from '@/lib/ai/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const user = await requireUser(req);
    const { planId } = params;
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
    const timeoutMs = Number(process.env.PLANNER_TIMEOUT_MS || 20000);
    
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
      max_tokens: 500,
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
    const parsed = JSON.parse(content) as {
      toc: PlanResponsePayload['toc'];
      recommendedChapterCount: number;
      estimates: PlanResponsePayload['estimates'];
    };
    
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
