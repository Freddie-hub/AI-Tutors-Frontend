# Migration Guide: Integrating Multi-Agent Lesson System

This guide helps you integrate the new multi-agent lesson generation system into your existing AI Tutors application.

## Overview

The new system **replaces** the single-pass lesson generation (`/api/tutor/lesson/route.ts`) with a multi-step process that handles long-form content better.

## What Changed

### Before (Single-Pass)
```
User Request → Single OpenAI Call → Complete Lesson
```

**Limitations:**
- Could only generate ~3-5k tokens reliably
- No progress feedback
- All-or-nothing approach
- Poor quality for long lessons

### After (Multi-Agent)
```
User Request → Planner Agent → User Reviews TOC → 
Workload Splitter → Sequential Writers → Assembler → Complete Lesson
```

**Benefits:**
- Handles 10k-20k+ token lessons
- Real-time progress tracking
- Better quality and coherence
- User can review/edit structure
- Resume from failures

## Migration Steps

### 1. Update Existing Lesson Route (Optional Backwards Compatibility)

You can keep the old route for simple lessons and add a flag to route to the new system for complex ones.

**Option A: Deprecate old route**
- Comment out or remove `src/app/api/tutor/lesson/route.ts`
- Update all calls to use new multi-agent endpoints

**Option B: Add routing logic**
```typescript
// In src/app/api/tutor/lesson/route.ts
export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // Route to multi-agent system for long lessons
  if (body.useMultiAgent || (body.specification && body.specification.length > 200)) {
    return new Response(JSON.stringify({
      message: 'Use multi-agent endpoints for this request',
      endpoints: {
        plan: '/api/tutor/plan/toc',
        accept: '/api/tutor/plan/toc/:id/accept',
        split: '/api/tutor/lesson/:id/split',
        run: '/api/tutor/lesson/:id/run',
      }
    }), { status: 400 });
  }
  
  // Keep old implementation for simple lessons
  // ... existing code
}
```

### 2. Update UI Components

#### A. Classroom Layout

Add TOC review step before lesson starts:

```typescript
// In src/components/CBCStudent/Classroom/layout/ClassroomLayout.tsx

const [lessonState, setLessonState] = useState<'input' | 'toc_review' | 'generating' | 'complete'>('input');
const [toc, setToc] = useState(null);

// After user submits topic
const handleTopicSubmit = async (data) => {
  const response = await fetch('/api/tutor/plan/toc', { /* ... */ });
  const { planId, toc } = await response.json();
  setToc(toc);
  setLessonState('toc_review');
};

// Render TOC review UI
if (lessonState === 'toc_review') {
  return <TOCReviewComponent toc={toc} onAccept={handleAcceptTOC} />;
}
```

#### B. Progress Indicator

Replace simple "Agent Working" with progress stepper:

```typescript
// In src/components/CBCStudent/Classroom/main/AgentWorking.tsx
// OR create new ProgressStepper.tsx

import { useLessonGenerator } from '@/hooks/useLessonGenerator';

export function LessonProgressStepper({ lessonId, runId }: Props) {
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  
  useEffect(() => {
    const eventSource = new EventSource(
      `/api/tutor/lesson/${lessonId}/progress?runId=${runId}`
    );
    
    eventSource.onmessage = (e) => {
      const event = JSON.parse(e.data);
      setEvents(prev => [...prev, event]);
    };
    
    return () => eventSource.close();
  }, [lessonId, runId]);
  
  return (
    <div className="space-y-2">
      {events.map((event, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span>{event.type === 'subtask_complete' ? '✓' : '→'}</span>
          <span>{event.data?.message || event.type}</span>
        </div>
      ))}
    </div>
  );
}
```

### 3. Update Dashboard Components

#### A. Continue Learning Card

Update to show lesson generation status:

```typescript
// In src/components/CBCStudent/dashboard/ContinueLearningCard.tsx

interface LessonCardProps {
  lesson: {
    lessonId: string;
    status: LessonStatus;
    topic: string;
    progress?: { current: number; total: number };
  };
}

export function ContinueLearningCard({ lesson }: LessonCardProps) {
  if (lesson.status === 'writing_in_progress') {
    return (
      <div className="card">
        <h3>{lesson.topic}</h3>
        <div className="progress-bar">
          <div style={{ width: `${(lesson.progress?.current / lesson.progress?.total) * 100}%` }} />
        </div>
        <p>Generating: {lesson.progress?.current}/{lesson.progress?.total} sections</p>
        <button onClick={() => resumeLesson(lesson.lessonId)}>Resume</button>
      </div>
    );
  }
  
  // ... rest of component
}
```

### 4. Database Migration (Firestore)

No migration needed! The new system uses separate collections:
- `lessonPlans/` - New
- `lessons/` - Enhanced (additional fields)
- `lessons/{id}/subtasks/` - New subcollection
- `lessons/{id}/runs/` - New subcollection

Existing lessons in Firestore are unaffected.

**Optional: Add indexes for performance**
```
// In Firebase Console → Firestore → Indexes

// Index 1: Subtasks by order
Collection: lessons/{lessonId}/subtasks
Fields: order (Ascending)

// Index 2: Events by timestamp
Collection: lessons/{lessonId}/runs/{runId}/events
Fields: ts (Ascending)
```

### 5. Environment Variables

No new environment variables required! Uses existing:
- `OPENAI_API_KEY`
- `OPENAI_CHAT_MODEL` (defaults to gpt-4o-mini)
- `NEXT_PUBLIC_API_URL` (for internal API calls)

### 6. Update API Client Wrapper (if you have one)

```typescript
// In src/lib/api.ts (if it exists)

export class LessonAPI {
  // Old method (keep for backwards compatibility)
  static async generateLesson(params: LessonRequestPayload) {
    // ... old implementation
  }
  
  // New methods
  static async generateTOC(params: PlanRequestPayload) {
    return fetch('/api/tutor/plan/toc', { /* ... */ });
  }
  
  static async acceptTOC(planId: string) {
    return fetch(`/api/tutor/plan/toc/${planId}/accept`, { /* ... */ });
  }
  
  static async splitLesson(lessonId: string, totalTokens?: number) {
    return fetch(`/api/tutor/lesson/${lessonId}/split`, { /* ... */ });
  }
  
  static async runLesson(lessonId: string, runId?: string) {
    return fetch(`/api/tutor/lesson/${lessonId}/run`, { /* ... */ });
  }
  
  static streamProgress(lessonId: string, runId: string, onEvent: (e: ProgressEvent) => void) {
    const eventSource = new EventSource(`/api/tutor/lesson/${lessonId}/progress?runId=${runId}`);
    eventSource.onmessage = (e) => onEvent(JSON.parse(e.data));
    return () => eventSource.close();
  }
}
```

### 7. Update Tests

Add tests for new endpoints:

```typescript
// tests/api/lesson-generation.test.ts

describe('Multi-Agent Lesson Generation', () => {
  it('should generate TOC', async () => {
    const response = await POST('/api/tutor/plan/toc', {
      grade: 'Grade 5',
      subject: 'Math',
      topic: 'Fractions',
    });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('planId');
    expect(response.body).toHaveProperty('toc');
  });
  
  it('should accept TOC and create lesson', async () => {
    // ... test implementation
  });
  
  it('should handle cancellation', async () => {
    // ... test implementation
  });
  
  it('should resume from failure', async () => {
    // ... test implementation
  });
});
```

## Rollout Strategy

### Phase 1: Parallel Operation (Recommended)
1. Deploy new multi-agent endpoints
2. Keep old `/api/tutor/lesson` route active
3. Add feature flag to toggle between old and new
4. Test with small group of users
5. Monitor metrics (success rate, quality, user satisfaction)

```typescript
// Feature flag example
const USE_MULTI_AGENT = process.env.NEXT_PUBLIC_USE_MULTI_AGENT === 'true';

if (USE_MULTI_AGENT) {
  // Use new system
} else {
  // Use old system
}
```

### Phase 2: Gradual Migration
1. Route long lessons (>5k tokens) to new system
2. Route complex topics to new system
3. Keep simple lessons on old system
4. Collect feedback

### Phase 3: Full Cutover
1. Default all new lessons to multi-agent system
2. Deprecate old endpoint
3. Update all UI references
4. Remove old code after monitoring period

## Quick Integration Checklist

- [ ] Deploy new API routes
- [ ] Update Firestore security rules (if needed)
- [ ] Add TOC review UI component
- [ ] Add progress tracking UI
- [ ] Update dashboard to show generation status
- [ ] Test end-to-end flow
- [ ] Add error handling and retry logic
- [ ] Monitor logs and metrics
- [ ] Update user documentation
- [ ] Train support team on new flow

## Common Integration Issues

### Issue 1: SSE not working in production

**Cause**: Some hosting platforms don't support SSE.

**Solution**: Use Firestore real-time listeners as fallback:
```typescript
const unsubscribe = db
  .collection('lessons')
  .doc(lessonId)
  .collection('runs')
  .doc(runId)
  .collection('events')
  .orderBy('ts', 'asc')
  .onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const event = change.doc.data();
        handleProgressEvent(event);
      }
    });
  });
```

### Issue 2: Long-running generations timeout

**Cause**: Vercel/Netlify have function timeout limits.

**Solution**: Already handled! The `/run` endpoint is self-calling and re-entrant. Each call processes one subtask and returns, avoiding timeouts.

### Issue 3: Firestore write limits

**Cause**: Many subtask updates might hit write limits.

**Solution**: Batch writes and use transactions:
```typescript
const batch = adminDb.batch();
// Add multiple updates to batch
await batch.commit();
```

### Issue 4: Cost concerns

**Current**: ~$0.02 per 15k-token lesson with gpt-4o-mini

**Optimization options**:
- Cache common TOC structures
- Reuse subtask results for similar topics
- Adjust token targets per subtask
- Use gpt-3.5-turbo for less critical subtasks

## Rollback Plan

If issues arise, rollback is simple:

1. **Remove route handlers** (comment out new routes)
2. **Revert UI changes** (restore old lesson request flow)
3. **Feature flag off** (`NEXT_PUBLIC_USE_MULTI_AGENT=false`)

Data is safe because:
- Old lessons use different schema
- New collections don't interfere with old data
- No destructive migrations

## Support and Troubleshooting

### Check System Health
```typescript
// Add health check endpoint
// GET /api/tutor/health

export async function GET() {
  const checks = {
    openai: await testOpenAI(),
    firestore: await testFirestore(),
    multiAgent: await testMultiAgentEndpoint(),
  };
  
  return Response.json(checks);
}
```

### Monitor Key Metrics
- Lesson generation success rate
- Average generation time
- Token usage per lesson
- Error rates per endpoint
- User cancellation rate

### Debug Tools
```typescript
// Add debug mode
const DEBUG = process.env.DEBUG_LESSON_GEN === 'true';

if (DEBUG) {
  console.log('[DEBUG] Subtask input:', input);
  console.log('[DEBUG] Subtask output:', output);
}
```

## Timeline Estimate

- **Week 1**: Deploy backend (API routes + Firestore helpers)
- **Week 2**: Build UI components (TOC review + progress tracking)
- **Week 3**: Integration testing + bug fixes
- **Week 4**: Gradual rollout with feature flag
- **Week 5**: Full cutover + monitoring
- **Week 6**: Optimization + cleanup old code

## Questions?

- Technical: Check [MULTI_AGENT_LESSON_SYSTEM.md](./MULTI_AGENT_LESSON_SYSTEM.md)
- Quick reference: Check [MULTI_AGENT_QUICKSTART.md](./MULTI_AGENT_QUICKSTART.md)
- API usage: See examples in `src/components/LessonGeneratorExample.tsx`
- Hook usage: See `src/hooks/useLessonGenerator.ts`

---

**Ready to integrate?** Start with Phase 1 and test with a small group of users first.
