import { ImageCandidate } from './ai/types';
import { getOpenAI, OPENAI_IMAGE_MODEL } from './ai/openai';

// Placeholder search via Bing or Google CSE. Implementors should replace with real HTTP calls.
export async function imageSearch(query: string, count = 3): Promise<ImageCandidate[]> {
  // For MVP, return empty array to force generation or require env provider
  const provider = process.env.IMAGE_SEARCH_PROVIDER; // 'bing' | 'google'
  if (!provider) {
    return [];
  }
  // TODO: implement provider calls here later
  return [];
}

export async function imageGenerate(prompt: string): Promise<ImageCandidate | null> {
  try {
    const openai = getOpenAI();
    const res = await openai.images.generate({
      model: OPENAI_IMAGE_MODEL,
      prompt,
      size: '1024x1024',
    });
    const data = res.data?.[0] as { url?: string } | undefined;
    const url = data?.url;
    if (!url) return null;
    return { url, title: 'Generated Image', source: 'openai' };
  } catch (e: unknown) {
    console.error('[imageGenerate] error', e);
    return null;
  }
}

export function pickBestImage(candidates: ImageCandidate[], required?: string): ImageCandidate | null {
  if (!candidates.length) return null;
  const normalized = (s?: string) => (s || '').toLowerCase();
  const req = normalized(required);
  const scored = candidates.map((c) => {
    let score = 0;
    if (c.width && c.height) score += Math.min(c.width, c.height) / 512; // prefer larger
    if (c.title && req && normalized(c.title).includes(req)) score += 1;
    if (c.source && /wikipedia|britannica|khan|nasa|noaa|who|unesco/i.test(c.source)) score += 0.5;
    return { c, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].c;
}
