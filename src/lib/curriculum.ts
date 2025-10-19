import fs from 'node:fs';
import path from 'node:path';

let cached: Record<string, unknown> | null = null;

export function loadCurriculum(): Record<string, unknown> {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), 'src', 'Curriculum.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  cached = JSON.parse(raw) as Record<string, unknown>;
  return cached!;
}

export function curriculumContext(grade: string, subject: string, topic: string): string {
  try {
    const data = loadCurriculum();
    const g = data[grade] as Record<string, unknown> | undefined;
    if (!g) {
      console.warn(`[curriculum] Grade not found: ${grade}`);
      return '';
    }
    const s = g[subject] as Record<string, unknown> | undefined;
    if (!s) {
      console.warn(`[curriculum] Subject not found: ${subject} in grade ${grade}`);
      return '';
    }
    // find exact topic or nearest topic key
    if (Object.prototype.hasOwnProperty.call(s, topic)) {
      return JSON.stringify({ [topic]: s[topic as keyof typeof s] });
    }
    const topics = Object.keys(s as object);
    const nearest = topics.find((t) => t.toLowerCase() === topic.toLowerCase()) ||
      topics.find((t) => t.toLowerCase().includes(topic.toLowerCase()));
    if (nearest) {
      return JSON.stringify({ [nearest]: s[nearest as keyof typeof s] });
    }
    console.warn(`[curriculum] Topic not found: ${topic} in ${subject}, ${grade}`);
    return '';
  } catch (error) {
    console.error('[curriculum] Error loading curriculum context:', error);
    return '';
  }
}
