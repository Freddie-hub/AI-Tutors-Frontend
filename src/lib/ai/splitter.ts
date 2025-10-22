import { CohesionBlock, PlannerDraft, SubtaskRange, WorkloadSplit } from './types';

function toRangeFromItems(items: { chapterId: string; subtopicIndex: number }[]): SubtaskRange[] {
  if (!items.length) return [];
  // Sort by chapter then subtopicIndex to ensure order
  const sorted = [...items].sort((a, b) => {
    if (a.chapterId === b.chapterId) return a.subtopicIndex - b.subtopicIndex;
    return a.chapterId.localeCompare(b.chapterId);
  });

  const ranges: SubtaskRange[] = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    const contiguous = curr.chapterId === prev.chapterId && curr.subtopicIndex === prev.subtopicIndex + 1;
    if (!contiguous) {
      ranges.push({
        startChapterId: start.chapterId,
        endChapterId: prev.chapterId,
        startSubtopicIndex: start.subtopicIndex,
        endSubtopicIndex: prev.subtopicIndex,
      });
      start = curr;
    }
    prev = curr;
  }

  // Push final range
  ranges.push({
    startChapterId: start.chapterId,
    endChapterId: prev.chapterId,
    startSubtopicIndex: start.subtopicIndex,
    endSubtopicIndex: prev.subtopicIndex,
  });

  return ranges;
}

export function deterministicSplitFromPlanner(draft: PlannerDraft): WorkloadSplit {
  const cohesion = draft.private?.chunking?.cohesionBlocks || [];
  const policyHints = draft.private?.sequencingRationale || 'Maintain natural progression and avoid splitting tightly coupled subtopics.';

  if (!cohesion.length) {
    // Fallback: one subtask per chapter
    const subtasks = draft.public.toc.map((chap, idx) => ({
      subtaskId: `subtask-${idx + 1}`,
      order: idx + 1,
      range: {
        startChapterId: chap.chapterId,
        endChapterId: chap.chapterId,
        startSubtopicIndex: 0,
        endSubtopicIndex: Math.max(0, (chap.subtopics?.length || 1) - 1),
      },
      targetTokens: Math.round((draft.private.estimates.totalTokens || 0) / Math.max(1, draft.public.toc.length)),
      lengthHintsBySubtopic: (chap.subtopics || []).map((_, sidx) => {
        const match = draft.private.estimates.perSubtopic.find(p => p.chapterId === chap.chapterId && p.subtopicIndex === sidx);
        return { chapterId: chap.chapterId, subtopicIndex: sidx, targetTokens: match?.tokens || 0, targetWords: match?.words };
      }),
    }));

    return {
      subtasks,
      policy: { continuityHints: policyHints },
    };
  }

  // Use blocks to form subtasks; if a block spans non-contiguous items, split it into multiple ranges
  const subtasks: WorkloadSplit['subtasks'] = [];
  let order = 1;

  cohesion.forEach((block: CohesionBlock, bidx: number) => {
    const ranges = toRangeFromItems(block.items);
    ranges.forEach((range, ridx) => {
      const lengthHints: NonNullable<WorkloadSplit['subtasks'][number]['lengthHintsBySubtopic']> = [];
      // Gather hints for subtopics within this range
      const { startChapterId, endChapterId, startSubtopicIndex = 0, endSubtopicIndex = 0 } = range;
      if (startChapterId === endChapterId) {
        for (let i = startSubtopicIndex; i <= endSubtopicIndex; i++) {
          const match = draft.private.estimates.perSubtopic.find(p => p.chapterId === startChapterId && p.subtopicIndex === i);
          lengthHints.push({ chapterId: startChapterId, subtopicIndex: i, targetTokens: match?.tokens || 0, targetWords: match?.words });
        }
      } else {
        // Cross-chapter block: collect from both chapters
        [startChapterId, endChapterId].forEach((cid) => {
          const chapter = draft.public.toc.find(c => c.chapterId === cid);
          const maxIndex = Math.max(0, (chapter?.subtopics?.length || 1) - 1);
          const s = cid === startChapterId ? startSubtopicIndex : 0;
          const e = cid === endChapterId ? endSubtopicIndex : maxIndex;
          for (let i = s; i <= e; i++) {
            const match = draft.private.estimates.perSubtopic.find(p => p.chapterId === cid && p.subtopicIndex === i);
            lengthHints.push({ chapterId: cid, subtopicIndex: i, targetTokens: match?.tokens || 0, targetWords: match?.words });
          }
        });
      }

      subtasks.push({
        subtaskId: `subtask-${order}`,
        order: order++,
        range,
        targetTokens: Math.max(0, block.targetTokens || lengthHints.reduce((acc, h) => acc + (h.targetTokens || 0), 0)),
        lengthHintsBySubtopic: lengthHints,
      });
    });
  });

  return {
    subtasks,
    policy: { continuityHints: policyHints },
  };
}
