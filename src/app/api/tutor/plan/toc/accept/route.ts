import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/serverAuth';
import { createPlan, updatePlanStatus, createLesson } from '@/lib/lessonStore';
import type { TOCChapter } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const { grade, subject, topic, specification, toc, autoStart } = body as {
      grade: string;
      subject: string;
      topic: string;
      specification?: string;
      toc: TOCChapter[];
      autoStart?: boolean;
    };

    if (!grade || !subject || !topic || !Array.isArray(toc) || toc.length === 0) {
      return new Response(JSON.stringify({ message: 'Missing or invalid fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Create the accepted plan now (only after user approval / editing)
    const planId = await createPlan({
      uid: user.uid,
      grade,
      subject,
      topic,
      specification,
      toc,
      recommendedChapterCount: toc.length,
      estimates: { totalTokens: 0, perChapter: toc.map(c => ({ chapterId: c.chapterId, estimatedTokens: 0 })) },
      status: 'accepted',
    });

    // Immediately create the lesson based on this accepted TOC
    const lessonId = await createLesson({
      uid: user.uid,
      grade,
      subject,
      topic,
      specification,
      status: 'toc_approved',
      toc,
      tocVersion: 1,
    });

    // Ensure plan status reflects acceptance
    await updatePlanStatus(planId, 'accepted');

    // Optionally auto-start splitting and first run
    if (autoStart) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
      try {
        // Split
        const splitRes = await fetch(`${baseUrl}/api/tutor/lesson/${lessonId}/split`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: authHeader },
          body: JSON.stringify({}),
        });
        const splitOk = splitRes.ok;
        const splitJson = await (async () => { try { return await splitRes.json(); } catch { return {}; } })();

        // Trigger initial run regardless (it will validate presence of subtasks)
        const runRes = await fetch(`${baseUrl}/api/tutor/lesson/${lessonId}/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: authHeader },
          body: JSON.stringify({}),
        });
        const runOk = runRes.ok;
        const runJson = await (async () => { try { return await runRes.json(); } catch { return {}; } })();

        return new Response(
          JSON.stringify({
            lessonId,
            tocVersion: 1,
            message: 'Plan accepted, lesson created, auto-start initiated',
            autoStart: { split: { ok: splitOk, data: splitJson }, run: { ok: runOk, data: runJson } },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({
            lessonId,
            tocVersion: 1,
            message: 'Plan accepted, lesson created, auto-start failed to initiate',
            error: (err as Error).message,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        lessonId,
        tocVersion: 1,
        message: 'Plan accepted, lesson created',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: unknown) {
    // If auth threw a Response, forward it as-is
    if (e instanceof Response) {
      return e;
    }
    console.error('[api/tutor/plan/toc/accept] Error:', e);
    const anyErr = e as any;
    const status = typeof anyErr?.status === 'number' ? anyErr.status : 500;
    const message = typeof anyErr?.message === 'string' ? anyErr.message : 'Failed to accept plan';
    return new Response(JSON.stringify({ message }), { status, headers: { 'Content-Type': 'application/json' } });
  }
}
