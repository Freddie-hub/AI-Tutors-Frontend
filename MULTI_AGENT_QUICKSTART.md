# Multi-Agent Lesson System - Quick Start

## Overview

The multi-agent lesson generation system breaks down long-form lesson creation into specialized agents that work sequentially to produce high-quality, textbook-style content.

## Quick Flow

```
1. Generate TOC → 2. Accept TOC → 3. Split Work → 4. Run Generation → 5. Get Final Lesson
```

## Usage

### Step 1: Generate Table of Contents

```typescript
const tocResponse = await fetch('/api/tutor/plan/toc', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    grade: 'Grade 5',
    subject: 'Mathematics',
    topic: 'Fractions',
    specification: 'Basic concepts',
  }),
});

const { planId, toc } = await tocResponse.json();
// Show TOC to user for review
```

### Step 2: Accept TOC

```typescript
const acceptResponse = await fetch(`/api/tutor/plan/toc/${planId}/accept`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({}),
});

const { lessonId } = await acceptResponse.json();
```

### Step 3: Split Workload

```typescript
await fetch(`/api/tutor/lesson/${lessonId}/split`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    totalTokens: 15000, // optional, uses estimates if not provided
    maxTokensPerSubtask: 2000, // optional
  }),
});
```

### Step 4: Run Generation (Loop)

```typescript
let status = 'writing';
let runId = null;

while (status === 'writing') {
  const runResponse = await fetch(`/api/tutor/lesson/${lessonId}/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resume: !!runId, runId }),
  });
  
  const runData = await runResponse.json();
  status = runData.status;
  runId = runData.runId;
  
  if (status === 'completed') {
    console.log('Done!', runData.final);
    break;
  }
  
  console.log(`Progress: ${runData.currentSubtaskOrder}/${runData.totalSubtasks}`);
  
  // Wait before next call
  await new Promise(resolve => setTimeout(resolve, 2000));
}
```

### Alternative: Stream Progress with SSE

```typescript
const eventSource = new EventSource(
  `/api/tutor/lesson/${lessonId}/progress?runId=${runId}`
);

eventSource.onmessage = (event) => {
  const progressEvent = JSON.parse(event.data);
  
  if (progressEvent.type === 'subtask_complete') {
    console.log(`Progress: ${progressEvent.data.order}/${progressEvent.data.totalSubtasks}`);
  } else if (progressEvent.type === 'completed') {
    console.log('Generation complete!');
    eventSource.close();
  }
};
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tutor/plan/toc` | POST | Generate TOC |
| `/api/tutor/plan/toc/:id/replan` | POST | Refine TOC |
| `/api/tutor/plan/toc/:id/accept` | POST | Accept & create lesson |
| `/api/tutor/lesson/:id/split` | POST | Split into subtasks |
| `/api/tutor/lesson/:id/run` | POST | Execute generation |
| `/api/tutor/lesson/:id/progress` | GET | Stream progress (SSE) |
| `/api/tutor/lesson/:id/cancel` | POST | Cancel generation |

## Key Features

✅ **Handles long lessons** - Breaks down 10k-20k token lessons into manageable chunks  
✅ **Maintains continuity** - Passes context between subtasks  
✅ **Real-time progress** - SSE streaming for live updates  
✅ **Error recovery** - Automatic retries with exponential backoff  
✅ **User control** - Cancel anytime, resume from failures  
✅ **CBC aligned** - Follows Kenya curriculum structure  

## Files

- **Types**: `src/lib/ai/types.ts`
- **Prompts**: `src/lib/ai/prompts.ts`
- **Storage**: `src/lib/lessonStore.ts`
- **Assembler**: `src/lib/ai/assembler.ts`
- **API Routes**: `src/app/api/tutor/plan/` and `src/app/api/tutor/lesson/`

## Full Documentation

See [MULTI_AGENT_LESSON_SYSTEM.md](./MULTI_AGENT_LESSON_SYSTEM.md) for complete architecture, data models, testing strategies, and troubleshooting.

## Cost Estimate

~$0.02 per 15,000-token lesson using `gpt-4o-mini`

## Next Steps

1. Integrate TOC preview UI in your dashboard
2. Add progress stepper component
3. Connect SSE stream to UI
4. Add cancel button during generation
5. Display final lesson with sections

---

**Questions?** Check the full documentation or reach out to the team.
