import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { verifyIdToken } from '@/lib/serverAuth';
import { getOpenAI, OPENAI_CHAT_MODEL } from '@/lib/ai/openai';
import { plannerPrompt } from '@/lib/ai/prompts';
import type { PlannerDraft } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Missing authorization header' }, { status: 401 });
    }
    const idToken = authHeader.substring(7);
    const decoded = await verifyIdToken(idToken);

    const body = await req.json();
    const { grade, subject, topic, specification, curriculumContext, preferences, curriculumType } = body || {};
    if (!grade || !subject || !topic) {
      return NextResponse.json({ message: 'Missing required fields: grade, subject, topic' }, { status: 400 });
    }

    const system = curriculumType === 'gcse'
      ? 'You are an expert GCSE/IGCSE curriculum planner.'
      : curriculumType === 'upskill'
        ? 'You are an expert professional curriculum planner.'
        : 'You are an expert CBC curriculum planner.';

    const prompt = plannerPrompt({ grade, subject, topic, specification, curriculumContext, preferences, curriculumType });

    const openai = getOpenAI();
    const chat = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });

    const content = chat.choices?.[0]?.message?.content || '';
    let parsed: PlannerDraft;
    try {
      parsed = JSON.parse(content) as PlannerDraft;
    } catch (e) {
      return NextResponse.json({ message: 'Planner output parse error', raw: content }, { status: 502 });
    }

    // Do not filter out private fields here; UI must choose what to display.
    return NextResponse.json({
      uid: decoded.uid,
      curriculumType: curriculumType || 'cbc',
      planDraft: parsed,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[PlanRoute] POST error:', message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
