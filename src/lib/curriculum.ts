import fs from 'node:fs';
import path from 'node:path';

let cached: Record<string, unknown> | null = null;

function fileExists(p: string) {
  try { return fs.existsSync(p); } catch { return false; }
}

function loadJSON<T = unknown>(p: string): T | null {
  try {
    if (!fileExists(p)) return null;
    const raw = fs.readFileSync(p, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// Normalize CBC/GCSE array format into nested mapping: programme -> subject -> topic(strand) -> details
function normalizeCurriculumArray(arr: any[]): Record<string, Record<string, Record<string, unknown>>> {
  const byProgramme: Record<string, Record<string, Record<string, unknown>>> = {};
  for (const year of arr || []) {
    const programme = year?.programme || year?.name || 'Unknown Programme';
    if (!byProgramme[programme]) byProgramme[programme] = {};
    const subjects = year?.subjects || [];
    for (const subject of subjects) {
      const subjectName = subject?.name || 'General';
      if (!byProgramme[programme][subjectName]) byProgramme[programme][subjectName] = {};
      const strands = subject?.strands || [];
      for (const strand of strands) {
        const topicName = strand?.name || strand?.id || 'Topic';
        const details: Record<string, unknown> = {};
        if (Array.isArray(strand?.subtopics)) details.subtopics = strand.subtopics;
        if (Array.isArray(strand?.objectives)) details.objectives = strand.objectives;
        if (strand?.description) details.description = strand.description;
        byProgramme[programme][subjectName][topicName] = details;
      }
    }
  }
  return byProgramme;
}

export function loadCurriculum(): Record<string, unknown> {
  if (cached) return cached;

  // Primary expected path (if present)
  const primary = path.join(process.cwd(), 'src', 'Curriculum.json');
  const primaryData = loadJSON<Record<string, unknown>>(primary);
  if (primaryData) {
    cached = primaryData;
    return cached;
  }

  // Fallbacks: CBC and GCSE JSON assets in components
  const cbcPaths = [
    path.join(process.cwd(), 'src', 'components', 'CBCStudent', 'cbc_curriculum_with_ids.json'),
    path.join(process.cwd(), 'src', 'components', 'CBCStudent', 'cbc_curriculum_simple.json'),
    path.join(process.cwd(), 'src', 'components', 'CBCStudent', 'cbc_curriculum.json'),
  ];
  const gcsePaths = [
    path.join(process.cwd(), 'src', 'components', 'GCSEStudent', 'gcse_curriculum_with_ids.json'),
    path.join(process.cwd(), 'src', 'components', 'GCSEStudent', 'gcse_curriculum_simple.json'),
    path.join(process.cwd(), 'src', 'components', 'GCSEStudent', 'gcse_curriculum.json'),
  ];

  let merged: Record<string, Record<string, Record<string, unknown>>> = {};

  for (const p of cbcPaths) {
    const arr = loadJSON<any[]>(p);
    if (arr && Array.isArray(arr) && arr.length > 0) {
      const norm = normalizeCurriculumArray(arr);
      merged = { ...merged, ...norm };
      break; // prefer the first successful variant
    }
  }
  for (const p of gcsePaths) {
    const arr = loadJSON<any[]>(p);
    if (arr && Array.isArray(arr) && arr.length > 0) {
      const norm = normalizeCurriculumArray(arr);
      merged = { ...merged, ...norm };
      break;
    }
  }

  cached = merged;
  return cached!;
}

export function curriculumContext(grade: string, subject: string, topic: string): string {
  try {
    const data = loadCurriculum();
    const grades = Object.keys(data as object);
    let g = (data as any)[grade] as Record<string, unknown> | undefined;
    if (!g) {
      const fuzzyGrade = grades.find((k) => k.toLowerCase() === grade.toLowerCase())
        || grades.find((k) => k.toLowerCase().includes(grade.toLowerCase()))
        || grades.find((k) => grade.toLowerCase().includes(k.toLowerCase()));
      if (fuzzyGrade) g = (data as any)[fuzzyGrade];
    }
    if (!g) {
      console.warn(`[curriculum] Grade not found: ${grade}`);
      return '';
    }
    const subjects = Object.keys(g as object);
    let s = (g as any)[subject] as Record<string, unknown> | undefined;
    if (!s) {
      const fuzzySubject = subjects.find((k) => k.toLowerCase() === subject.toLowerCase())
        || subjects.find((k) => k.toLowerCase().includes(subject.toLowerCase()))
        || subjects.find((k) => subject.toLowerCase().includes(k.toLowerCase()));
      if (fuzzySubject) s = (g as any)[fuzzySubject];
    }
    if (!s) {
      console.warn(`[curriculum] Subject not found: ${subject} in grade ${grade}`);
      return '';
    }
    // find exact topic or nearest topic key
    if (Object.prototype.hasOwnProperty.call(s, topic)) {
      return JSON.stringify({ [topic]: (s as any)[topic] });
    }
    const topics = Object.keys(s as object);
    const nearest = topics.find((t) => t.toLowerCase() === topic.toLowerCase()) ||
      topics.find((t) => t.toLowerCase().includes(topic.toLowerCase())) ||
      topics.find((t) => topic.toLowerCase().includes(t.toLowerCase()));
    if (nearest) {
      return JSON.stringify({ [nearest]: (s as any)[nearest] });
    }
    console.warn(`[curriculum] Topic not found: ${topic} in ${subject}, ${grade}`);
    return '';
  } catch (error) {
    console.error('[curriculum] Error loading curriculum context:', error);
    return '';
  }
}
