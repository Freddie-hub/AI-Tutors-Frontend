import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { curriculumContext } from '@/lib/curriculum';
import { getOpenAI, OPENAI_CHAT_MODEL } from '@/lib/ai/openai';
import { systemTutor, systemTutorGCSE, plannerPrompt } from '@/lib/ai/prompts';
import { PlanRequestPayload, PlanResponsePayload } from '@/lib/ai/types';
import { createPlan } from '@/lib/lessonStore';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
  const body = (await req.json()) as PlanRequestPayload & { persist?: boolean; curriculumContext?: string; curriculumType?: 'cbc' | 'gcse' };
  const { grade, subject, topic, specification, preferences, persist, curriculumContext: passedContext, curriculumType } = body;
    
    // Detect curriculum type from grade if not explicitly provided
    const detectedCurriculumType = curriculumType || (grade.toLowerCase().includes('cambridge') || grade.toLowerCase().includes('gcse') || grade.toLowerCase().includes('igcse') || grade.toLowerCase().includes('british') || grade.toLowerCase().includes('year') ? 'gcse' : 'cbc');
    
    // Use appropriate system prompt based on curriculum type
    const systemPrompt = detectedCurriculumType === 'gcse' ? systemTutorGCSE : systemTutor;
    
    // Use passed curriculum context if available, otherwise fall back to default
    const context = passedContext || curriculumContext(grade, subject, topic);
    
    console.log('[planner] Starting plan generation...', { grade, subject, topic, curriculumType: detectedCurriculumType });
    
    const openai = getOpenAI();
    const timeoutMs = Number(process.env.PLANNER_TIMEOUT_MS || 60000); // Increased to 60s
    
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
      max_tokens: 1000, // Increased to allow complete JSON response
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: plannerPrompt({
            grade,
            subject,
            topic,
            specification,
            curriculumContext: context,
            preferences,
            curriculumType: detectedCurriculumType,
          }),
        },
      ],
    });
    
    const completion: any = await Promise.race([completionPromise, timeoutPromise]);
    if (timeoutHandle) clearTimeout(timeoutHandle);
    console.log('[planner] Completion received');
    
    const content = completion.choices?.[0]?.message?.content || '{}';
    
    // Log content for debugging
    console.log('[planner] Response content length:', content.length);
    console.log('[planner] Response preview:', content.substring(0, 200));
    
    let parsed;
    try {
      parsed = JSON.parse(content) as {
        toc: PlanResponsePayload['toc'];
        recommendedChapterCount: number;
        estimates: PlanResponsePayload['estimates'];
      };
    } catch (parseError) {
      console.error('[planner] JSON parse error. Full content:', content);
      throw new Error('Failed to parse planner response. The response may have been truncated. Try reducing the topic complexity or increasing max_tokens.');
    }
    
    // Validate required fields
    if (!parsed.toc || !Array.isArray(parsed.toc) || parsed.toc.length === 0) {
      console.error('[planner] Invalid TOC structure:', parsed);
      throw new Error('Invalid table of contents structure received from planner');
    }
    
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

