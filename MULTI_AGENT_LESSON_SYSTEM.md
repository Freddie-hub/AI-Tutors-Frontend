# Multi-Agent Lesson Generation System

## Overview

This document describes the multi-agent architecture for generating high-quality, long-form educational content in the AI Tutors platform. The system breaks down complex lesson generation into specialized agents that work sequentially to produce immersive, textbook-quality lessons aligned to Kenya's Competency Based Curriculum (CBC).

## Problem Statement

Generating comprehensive lessons (10,000-20,000+ tokens) in a single API call faces several challenges:

1. **Token Limits**: Large language models have output token limits that make generating complete long-form content in one shot impractical
2. **Quality Degradation**: Very long single-pass generations tend to lose coherence and quality
3. **User Experience**: Users wait too long without feedback for single monolithic generations
4. **Failure Recovery**: If generation fails partway through, all progress is lost

## Solution: Multi-Agent Pipeline

The system uses a **divide-and-conquer** approach with specialized agents:

1. **Planner Agent** - Creates a table of contents (TOC)
2. **Workload Splitter Agent** - Divides the lesson into manageable subtasks
3. **Section Writer Agent** - Generates content for each subtask sequentially
4. **Assembler** - Merges all subtasks into a final lesson artifact

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                          │
│  - Topic Input                                              │
│  - TOC Preview/Edit/Accept                                  │
│  - Progress Stepper (Agent Working UI)                      │
│  - Final Lesson Display                                     │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                              │
│                                                             │
│  POST /api/tutor/plan/toc           - Generate TOC         │
│  POST /api/tutor/plan/toc/:id/replan - Refine TOC         │
│  POST /api/tutor/plan/toc/:id/accept - Accept & Create     │
│  POST /api/tutor/lesson/:id/split   - Split Workload       │
│  POST /api/tutor/lesson/:id/run     - Orchestrate Writing  │
│  GET  /api/tutor/lesson/:id/progress - Stream Progress (SSE)│
│  POST /api/tutor/lesson/:id/cancel  - Cancel Generation    │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Agent Orchestrator                        │
│  - Manages sequential subtask execution                     │
│  - Handles retries and error recovery                       │
│  - Maintains continuity context between subtasks            │
│  - Triggers assembly when all subtasks complete             │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Specialized Agents                       │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Planner Agent    │  │ Splitter Agent   │               │
│  │ - TOC creation   │  │ - Task division  │               │
│  │ - Chapter design │  │ - Token budgeting│               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Writer Agent     │  │ Assembler        │               │
│  │ - Section content│  │ - Content merge  │               │
│  │ - Continuity     │  │ - Validation     │               │
│  └──────────────────┘  └──────────────────┘               │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Firestore Storage                         │
│                                                             │
│  collections/                                               │
│  ├── lessonPlans/{planId}                                  │
│  │   ├── uid, grade, subject, topic, toc, estimates        │
│  │   └── status: proposed|refined|accepted|rejected        │
│  │                                                          │
│  └── lessons/{lessonId}                                    │
│      ├── uid, grade, subject, topic, toc, status           │
│      ├── final: { outline, sections[], content, hash }     │
│      │                                                      │
│      ├── subtasks/{subtaskId}                              │
│      │   ├── order, range, targetTokens, status            │
│      │   ├── result: { sections[], contentChunk, hash }    │
│      │   └── attempts, error                               │
│      │                                                      │
│      └── runs/{runId}                                      │
│          ├── status, currentSubtaskOrder, totalSubtasks    │
│          ├── metrics: { tokensUsed, estimatedCost }        │
│          └── events/{eventId}                              │
│              └── ts, type, data                            │
└─────────────────────────────────────────────────────────────┘
```

## Agent Details

### 1. Planner Agent

**Purpose**: Create a detailed table of contents (TOC) that structures the lesson into logical chapters and subtopics.

**Inputs**:
- Grade, subject, topic, specification
- Curriculum context (CBC strands, learning outcomes)
- User preferences

**Outputs** (JSON):
```json
{
  "toc": [
    {
      "chapterId": "chap-1",
      "title": "Introduction to Fractions",
      "subtopics": [
        "What is a fraction?",
        "Parts of a fraction",
        "Types of fractions"
      ]
    }
  ],
  "recommendedChapterCount": 4,
  "estimates": {
    "totalTokens": 12000,
    "perChapter": [
      { "chapterId": "chap-1", "estimatedTokens": 3000 }
    ]
  }
}
```

**Model Settings**:
- Model: `gpt-4o-mini`
- Temperature: `0.4` (structured output)
- Response Format: `json_object`

**Key Features**:
- Aligns with CBC curriculum structure
- Estimates realistic token budgets per chapter
- Considers student age and grade level
- Suggests 3-6 chapters for depth

### 2. Workload Splitter Agent

**Purpose**: Divide the approved TOC into sequential subtasks that respect model token limits while maintaining logical boundaries.

**Inputs**:
- Approved TOC
- Total token target
- Max tokens per subtask (default: 2000)

**Outputs** (JSON):
```json
{
  "subtasks": [
    {
      "subtaskId": "subtask-1",
      "order": 1,
      "range": {
        "startChapterId": "chap-1",
        "endChapterId": "chap-1",
        "startSubtopicIndex": 0,
        "endSubtopicIndex": 2
      },
      "targetTokens": 1800
    }
  ],
  "policy": {
    "continuityHints": "Maintain narrative flow between chapters..."
  }
}
```

**Model Settings**:
- Model: `gpt-4o-mini`
- Temperature: `0.3` (precise planning)
- Response Format: `json_object`

**Key Features**:
- Splits along chapter/subtopic boundaries
- Keeps subtasks manageable (1-2k tokens each)
- Distributes work evenly
- Provides continuity guidance

### 3. Section Writer Agent

**Purpose**: Generate detailed, textbook-quality content for an assigned subtask range.

**Inputs**:
- Grade, subject, topic, specification
- Full TOC (for context)
- Assigned subtask range
- Previous context (last ~500 tokens from previous subtask)
- Target tokens for this subtask
- Position (subtask X of Y)

**Outputs** (JSON):
```json
{
  "outlineDelta": [
    "Understanding fraction notation",
    "Identifying numerator and denominator"
  ],
  "sections": [
    {
      "id": "sec-1-1",
      "title": "What is a Fraction?",
      "html": "<h2 id='chap-1'>...</h2>...",
      "quizAnchorId": "quiz-sec-1"
    }
  ],
  "contentChunk": "Full HTML for this subtask"
}
```

**Model Settings**:
- Model: `gpt-4o-mini`
- Temperature: `0.6` (creative but controlled)
- Response Format: `json_object`

**Key Features**:
- Maintains continuity using previous context
- Follows CBC pedagogical structure:
  - Learning objectives
  - Prior knowledge
  - Concepts explained (step-by-step)
  - Worked examples with reasoning
  - Practice questions
  - Real-life Kenyan applications
  - Mini-summaries
- Embeds image suggestions as HTML comments
- Places quiz anchors at natural checkpoints
- Uses semantic HTML (no external scripts/styles)
- First subtask includes lesson title and intro
- Last subtask includes comprehensive summary

### 4. Assembler

**Purpose**: Deterministically merge completed subtasks into a single lesson artifact.

**Process**:
1. Sort subtasks by order
2. Validate all subtasks are completed
3. Merge outlines
4. Concatenate sections
5. Join content chunks
6. Compute content hash
7. Validate assembled lesson

**Validation Checks**:
- Outline not empty
- Sections present
- Content length > 100 chars
- Main heading tags present
- All section fields valid

## State Machine & Workflow

### Lesson States

```
Draft
  ↓ (Planner Agent runs)
TOC Proposed
  ↓ (User accepts) or ← (User requests replan/edit)
TOC Approved
  ↓ (Workload splitter runs)
Split Planned
  ↓ (Orchestrator starts)
Writing In Progress
  ↓ (All subtasks complete)
Writing Completed
  ↓ (Assembler runs)
Assembled
  ↓ (Validation passes)
Done
```

**Error States**: `Failed`, `Cancelled`

### Subtask States

- `queued` - Ready to execute
- `in-progress` - Currently generating
- `completed` - Successfully generated
- `failed` - Generation failed
- `cancelled` - User cancelled run

### Run States

- `planned` - Run created, ready to start
- `splitting` - Dividing workload
- `writing` - Executing subtasks
- `assembling` - Merging content
- `completed` - All done
- `failed` - Unrecoverable error
- `cancelled` - User stopped generation

## Data Model

### TypeScript Interfaces

See `src/lib/ai/types.ts` for complete type definitions:

- `LessonPlan` - TOC proposal with estimates
- `Lesson` - Main lesson entity with TOC and final content
- `Subtask` - Individual writing task with range and result
- `LessonRun` - Orchestration session with status and metrics
- `ProgressEvent` - Real-time event for UI updates

### Firestore Schema

#### Collection: `lessonPlans`
```
lessonPlans/{planId}
  - planId: string
  - uid: string
  - grade, subject, topic, specification
  - toc: TOCChapter[]
  - recommendedChapterCount: number
  - estimates: { totalTokens, perChapter[] }
  - status: 'proposed' | 'refined' | 'accepted' | 'rejected'
  - createdAt, updatedAt: number
```

#### Collection: `lessons`
```
lessons/{lessonId}
  - lessonId: string
  - uid: string
  - grade, subject, topic, specification
  - status: LessonStatus
  - toc: TOCChapter[]
  - tocVersion: number
  - estimates: { totalTokens, perChapter[] }
  - final?: { outline, sections[], content, hash }
  - createdAt, updatedAt: number
  
  subtasks/{subtaskId}
    - subtaskId: string
    - lessonId: string
    - order: number
    - range: SubtaskRange
    - targetTokens: number
    - status: SubtaskStatus
    - result?: { outlineDelta, sections[], contentChunk, hash }
    - attempts: number
    - error?: string
    - createdAt, updatedAt: number
  
  runs/{runId}
    - runId: string
    - lessonId: string
    - uid: string
    - status: RunStatus
    - currentSubtaskOrder: number
    - totalSubtasks: number
    - startedAt, completedAt?: number
    - cancelled?: boolean
    - metrics?: { tokensUsed, estimatedCost }
    
    events/{eventId}
      - ts: number
      - type: ProgressEventType
      - data?: { subtaskId, order, message, error, ... }
```

## API Reference

### 1. Generate TOC Plan

**Endpoint**: `POST /api/tutor/plan/toc`

**Headers**: `Authorization: Bearer <idToken>`

**Request Body**:
```json
{
  "grade": "Grade 5",
  "subject": "Mathematics",
  "topic": "Fractions",
  "specification": "Focus on proper and improper fractions",
  "preferences": "Include real-life Kenyan examples"
}
```

**Response**:
```json
{
  "planId": "plan-abc123",
  "toc": [...],
  "displayToc": [...],
  "recommendedChapterCount": 4,
  "estimates": {
    "totalTokens": 12000,
    "perChapter": [...]
  }
}
```

### 2. Replan TOC

**Endpoint**: `POST /api/tutor/plan/toc/:planId/replan`

**Headers**: `Authorization: Bearer <idToken>`

**Request Body**:
```json
{
  "constraints": "Make it shorter, 3 chapters max",
  "preferences": "More focus on practice problems"
}
```

**Response**: Same as Generate TOC Plan (new planId)

### 3. Accept TOC Plan

**Endpoint**: `POST /api/tutor/plan/toc/:planId/accept`

**Headers**: `Authorization: Bearer <idToken>`

**Request Body**: `{}`

**Response**:
```json
{
  "lessonId": "lesson-xyz789",
  "tocVersion": 1,
  "message": "Plan accepted, lesson created"
}
```

### 4. Split Workload

**Endpoint**: `POST /api/tutor/lesson/:lessonId/split`

**Headers**: `Authorization: Bearer <idToken>`

**Request Body**:
```json
{
  "totalTokens": 15000,
  "maxTokensPerSubtask": 2000
}
```

**Response**:
```json
{
  "subtasks": [...],
  "totalSubtasks": 8,
  "policy": {
    "continuityHints": "..."
  }
}
```

### 5. Run Lesson Generation

**Endpoint**: `POST /api/tutor/lesson/:lessonId/run`

**Headers**: `Authorization: Bearer <idToken>`

**Request Body**:
```json
{
  "resume": false
}
```

**Response** (in-progress):
```json
{
  "runId": "run-def456",
  "status": "writing",
  "currentSubtaskOrder": 3,
  "totalSubtasks": 8,
  "message": "Completed subtask 3/8. Call /run again to continue."
}
```

**Response** (completed):
```json
{
  "runId": "run-def456",
  "status": "completed",
  "message": "Lesson generation complete",
  "final": {
    "outline": [...],
    "sections": [...],
    "content": "...",
    "hash": "sha256..."
  }
}
```

**Note**: This endpoint is **self-orchestrating** - call it repeatedly until status is `completed`. Each call processes one subtask.

### 6. Stream Progress (SSE)

**Endpoint**: `GET /api/tutor/lesson/:lessonId/progress?runId=run-def456`

**Headers**: `Authorization: Bearer <idToken>`

**Response** (Server-Sent Events):
```
data: {"ts":1234567890,"type":"planned","data":{"totalSubtasks":8}}

data: {"ts":1234567891,"type":"subtask_complete","data":{"order":1,"subtaskId":"subtask-1"}}

data: {"ts":1234567892,"type":"subtask_complete","data":{"order":2,"subtaskId":"subtask-2"}}

data: {"ts":1234567893,"type":"assembled"}

data: {"ts":1234567894,"type":"completed"}
```

**Event Types**:
- `planned` - Run created
- `split` - Workload split complete
- `subtask_started` - Subtask began
- `subtask_complete` - Subtask finished
- `assembled` - Content merged
- `qa_passed` - Quality checks passed
- `completed` - All done
- `error` - Error occurred
- `cancelled` - User cancelled

### 7. Cancel Run

**Endpoint**: `POST /api/tutor/lesson/:lessonId/cancel`

**Headers**: `Authorization: Bearer <idToken>`

**Request Body**:
```json
{
  "runId": "run-def456"
}
```

**Response**:
```json
{
  "message": "Run cancelled successfully",
  "runId": "run-def456"
}
```

## Usage Examples

### Example 1: Generate a Simple Lesson

```typescript
import { auth } from '@/lib/firebase';

// 1. Get user token
const user = auth.currentUser;
const token = await user.getIdToken();

// 2. Generate TOC
const tocRes = await fetch('/api/tutor/plan/toc', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    grade: 'Grade 5',
    subject: 'Mathematics',
    topic: 'Fractions',
    specification: 'Basic fraction concepts',
  }),
});
const { planId } = await tocRes.json();

// 3. Accept TOC
const acceptRes = await fetch(`/api/tutor/plan/toc/${planId}/accept`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({}),
});
const { lessonId } = await acceptRes.json();

// 4. Split workload
const splitRes = await fetch(`/api/tutor/lesson/${lessonId}/split`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ totalTokens: 10000 }),
});
await splitRes.json();

// 5. Run generation (loop until complete)
let status = 'writing';
let runId = null;

while (status === 'writing') {
  const runRes = await fetch(`/api/tutor/lesson/${lessonId}/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resume: !!runId, runId }),
  });
  
  const runData = await runRes.json();
  status = runData.status;
  runId = runData.runId;
  
  if (status === 'completed') {
    console.log('Lesson complete!', runData.final);
    break;
  }
  
  // Optional: add delay to avoid hammering API
  await new Promise(resolve => setTimeout(resolve, 2000));
}
```

### Example 2: Stream Progress with SSE

```typescript
const eventSource = new EventSource(
  `/api/tutor/lesson/${lessonId}/progress?runId=${runId}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

eventSource.onmessage = (event) => {
  const progressEvent = JSON.parse(event.data);
  
  switch (progressEvent.type) {
    case 'subtask_complete':
      console.log(`Completed ${progressEvent.data.order}/${progressEvent.data.totalSubtasks}`);
      break;
    case 'completed':
      console.log('Generation complete!');
      eventSource.close();
      break;
    case 'error':
      console.error('Error:', progressEvent.data.error);
      eventSource.close();
      break;
  }
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  eventSource.close();
};
```

### Example 3: Replan After Seeing TOC

```typescript
// User sees TOC and wants changes
const replanRes = await fetch(`/api/tutor/plan/toc/${planId}/replan`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    constraints: 'Make it 5 chapters instead of 4',
    preferences: 'Add more worked examples',
  }),
});

const { planId: newPlanId, toc: refinedToc } = await replanRes.json();

// User can now accept the refined plan
// (repeat accept → split → run flow with newPlanId)
```

## Orchestration Strategy

### Sequential Execution

Subtasks execute **sequentially**, not in parallel, to:
- Maintain narrative continuity
- Pass context from one subtask to the next
- Avoid race conditions in Firestore
- Simplify error handling

### Continuity Context

Each subtask (except the first) receives:
- **Previous context**: Last ~500 tokens from the previous subtask
- **Full TOC**: For understanding overall structure
- **Position info**: "Part X of Y" for appropriate pacing

This ensures smooth transitions between subtasks.

### Retry Logic

- Each subtask tracks `attempts` counter
- Max retries: **3**
- On failure:
  - Increment attempts
  - Update status to `failed`
  - Log error message
  - Allow resume from that subtask

### Rate Limiting

- Built-in via sequential execution
- Optional: Add delays between subtasks
- OpenAI API handles rate limits with exponential backoff

### Cancellation

- User can cancel at any time via `/cancel` endpoint
- Sets `cancelled: true` on run document
- Subtask runner checks before starting each subtask
- In-flight subtask completes but next is skipped

## UI/UX Flow

### 1. Topic Input Page

User enters:
- Grade
- Subject
- Topic
- Specification (optional)
- Preferences (optional)

### 2. TOC Preview Page

Display:
- Chapter titles
- Subtopics per chapter
- (Hidden: token estimates)

Actions:
- **Accept** → Proceed to generation
- **Edit** → Inline editing (future enhancement)
- **Replan** → Show modal with constraint inputs

### 3. Generation Progress Page

Show stepper UI:
```
[✓] Planning TOC
[✓] Splitting workload
[→] Writing chapter 3 of 5
[ ] Assembling lesson
[ ] Quality check
[ ] Complete
```

Components:
- Use existing `<AgentWorking />` component
- Add progress bar (current subtask / total)
- Add chapter title for current subtask
- Show elapsed time
- **Cancel** button

### 4. Lesson Display Page

Show final lesson:
- Table of contents (clickable links)
- Full HTML content
- Sections with images (when available)
- Quiz anchors for interactive quizzes

Actions:
- **Regenerate Section** (future)
- **Download PDF** (future)

## Error Handling

### Planner Errors
- Invalid JSON from model → Retry with fallback prompt
- Empty TOC → Return error, ask user to be more specific

### Splitter Errors
- Token budget too small → Suggest increasing or reducing scope
- Invalid range → Fallback to simple chapter-based split

### Writer Errors
- Invalid JSON → Retry subtask (up to 3 times)
- Empty content → Mark subtask as failed, allow manual retry
- Token limit exceeded → Adjust targetTokens and retry

### Assembly Errors
- Missing subtasks → Show which subtasks failed, allow retry
- Validation failure → Log issues, show to user, offer regeneration

## Testing & Evaluation

### Manual Tests

1. **Short lesson** (~5k tokens, 3 chapters)
   - Should complete in 3-4 subtasks
   - Verify continuity between sections
   
2. **Long lesson** (~15k tokens, 5 chapters)
   - Should split into 8-12 subtasks
   - Check narrative flow
   - Verify CBC alignment
   
3. **Cancellation**
   - Start generation
   - Cancel mid-run
   - Verify status updates correctly
   
4. **Replan**
   - Generate TOC
   - Request changes
   - Verify refined TOC differs appropriately

### Automated Checks

```typescript
// Schema validation
import { z } from 'zod';

const SubtaskResultSchema = z.object({
  outlineDelta: z.array(z.string()),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    html: z.string(),
    quizAnchorId: z.string().optional(),
  })),
  contentChunk: z.string().min(100),
});

// Validate each subtask result
SubtaskResultSchema.parse(result);
```

### Quality Criteria

- ✅ Learning objectives present
- ✅ CBC references included
- ✅ Worked examples with reasoning
- ✅ Practice questions (3-6 per chapter)
- ✅ Kenyan context (KES, local names, scenarios)
- ✅ Image suggestions as HTML comments
- ✅ Quiz anchors at natural checkpoints
- ✅ Mini-summaries after each chapter
- ✅ Age-appropriate language

## Cost Estimation

### Token Usage Per Lesson

For a 15,000-token lesson:
- **Planner**: ~500 input, ~800 output = 1,300 tokens
- **Splitter**: ~1,000 input, ~500 output = 1,500 tokens
- **Writers** (10 subtasks):
  - Per subtask: ~1,200 input (context + TOC), ~2,000 output
  - Total: 10 × 3,200 = 32,000 tokens
- **Total**: ~35,000 tokens

### Cost (gpt-4o-mini pricing)

- Input: ~$0.15 per 1M tokens
- Output: ~$0.60 per 1M tokens

For 15k-token lesson:
- Input cost: (10,000 / 1,000,000) × $0.15 = $0.0015
- Output cost: (25,000 / 1,000,000) × $0.60 = $0.015
- **Total: ~$0.02 per lesson**

## Future Enhancements

### Short-term
- [ ] QA agent for quality validation
- [ ] Inline TOC editing UI
- [ ] Section-level regeneration
- [ ] Progress persistence (recover after browser close)

### Medium-term
- [ ] Parallel subtask execution (with careful continuity handling)
- [ ] Image generation integration (use image hints)
- [ ] Quiz generation for each quiz anchor
- [ ] Lesson versioning (user edits → new version)

### Long-term
- [ ] Multi-lesson curriculum planning
- [ ] Adaptive content based on student performance
- [ ] Collaborative editing (teachers + AI)
- [ ] Export to PDF, EPUB, SCORM

## Troubleshooting

### Issue: Subtasks fail repeatedly

**Solution**: Check OpenAI API key, rate limits, and error messages. Reduce `targetTokens` per subtask.

### Issue: Poor continuity between sections

**Solution**: Increase `previousContext` token limit in `extractContinuityContext()`. Currently 500, try 800-1000.

### Issue: Assembly validation fails

**Solution**: Check `validateAssembledLesson()` output for specific issues. Common: missing section IDs, empty HTML.

### Issue: SSE connection drops

**Solution**: Implement client-side reconnection logic. Use Firestore client-side listeners as fallback.

### Issue: Lesson generation too slow

**Solution**: 
- Use parallel subtask execution (advanced)
- Reduce subtask count by increasing `maxTokensPerSubtask`
- Cache TOC plans for similar topics

## Files Reference

### Core Implementation
- `src/lib/ai/types.ts` - TypeScript interfaces
- `src/lib/ai/prompts.ts` - Agent prompts
- `src/lib/ai/assembler.ts` - Content assembly logic
- `src/lib/lessonStore.ts` - Firestore operations

### API Routes
- `src/app/api/tutor/plan/toc/route.ts` - Generate TOC
- `src/app/api/tutor/plan/toc/[planId]/accept/route.ts` - Accept TOC
- `src/app/api/tutor/plan/toc/[planId]/replan/route.ts` - Replan TOC
- `src/app/api/tutor/lesson/[lessonId]/split/route.ts` - Split workload
- `src/app/api/tutor/lesson/[lessonId]/run/route.ts` - Orchestrate generation
- `src/app/api/tutor/lesson/[lessonId]/subtasks/[subtaskId]/run/route.ts` - Execute subtask
- `src/app/api/tutor/lesson/[lessonId]/progress/route.ts` - Stream progress (SSE)
- `src/app/api/tutor/lesson/[lessonId]/cancel/route.ts` - Cancel generation

### UI Components
- `src/components/CBCStudent/Classroom/main/AgentWorking.tsx` - Progress indicator

## Conclusion

This multi-agent system provides a robust, scalable solution for generating long-form educational content. By breaking the problem into specialized agents and manageable subtasks, we achieve:

✅ **High quality** - Each agent focuses on its specialty  
✅ **Reliability** - Retry logic and error recovery  
✅ **Scalability** - Handle lessons of any length  
✅ **User experience** - Real-time progress feedback  
✅ **Maintainability** - Clear separation of concerns  

The system is production-ready and can be extended with additional agents (QA, image generation, quiz generation) as needed.

---

**Version**: 1.0  
**Last Updated**: October 19, 2025  
**Author**: AI Tutors Engineering Team
