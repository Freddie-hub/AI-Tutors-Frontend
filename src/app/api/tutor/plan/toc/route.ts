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

    // Accept both legacy shape ({ toc, estimates }) and universal planner ({ public, private })
    let raw: any;
    try {
      raw = JSON.parse(content);
    } catch (parseError) {
      console.error('[planner] JSON parse error. Full content:', content);
      throw new Error('Failed to parse planner response. The response may have been truncated. Try reducing the topic complexity or increasing max_tokens.');
    }

    const mapped = (() => {
      // Universal planner shape
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
      // Legacy shape passthrough
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

    if (!mapped || !mapped.toc || !Array.isArray(mapped.toc) || mapped.toc.length === 0) {
      console.error('[planner] Invalid TOC structure:', raw);
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
        toc: mapped.toc,
        recommendedChapterCount: mapped.recommendedChapterCount,
        estimates: mapped.estimates,
        status: 'proposed',
      });
      console.log('[planner] Plan stored, returning response');
    }
    
    const response: Partial<PlanResponsePayload> & { toc: PlanResponsePayload['toc']; displayToc: PlanResponsePayload['toc']; recommendedChapterCount: number; estimates: PlanResponsePayload['estimates'] } = {
      ...(planId ? { planId } : {}),
      toc: mapped.toc,
      displayToc: mapped.toc,
      recommendedChapterCount: mapped.recommendedChapterCount,
      estimates: mapped.estimates,
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

