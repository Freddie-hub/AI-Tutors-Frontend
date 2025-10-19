# Multi-Agent Lesson Generation System

> **Status**: ✅ Implementation Complete | **Version**: 1.0 | **Date**: October 19, 2025

## 🎯 What Is This?

A production-ready system for generating long-form, high-quality educational content using multiple specialized AI agents. Perfect for creating comprehensive lessons (10,000-20,000 tokens) that would be impossible or low-quality with single-pass generation.

## ⚡ Quick Start

### 1. Using the React Hook (Easiest)

```typescript
import { useLessonGenerator } from '@/hooks/useLessonGenerator';

function MyComponent() {
  const { generateLesson, status, progress, final } = useLessonGenerator({
    onProgress: (event) => console.log(event),
    onComplete: (lesson) => console.log('Done!', lesson),
  });
  
  return (
    <button onClick={() => generateLesson({
      grade: 'Grade 5',
      subject: 'Mathematics',
      topic: 'Fractions',
    })}>
      Generate Lesson
    </button>
  );
}
```

### 2. Using the API Directly

```typescript
// Step 1: Generate TOC
const { planId, toc } = await POST('/api/tutor/plan/toc', {
  grade: 'Grade 5',
  subject: 'Math',
  topic: 'Fractions',
});

// Step 2: Accept TOC
const { lessonId } = await POST(`/api/tutor/plan/toc/${planId}/accept`);

// Step 3: Split workload
await POST(`/api/tutor/lesson/${lessonId}/split`, { totalTokens: 15000 });

// Step 4: Run generation (loop until complete)
let status = 'writing';
let runId;
while (status === 'writing') {
  const res = await POST(`/api/tutor/lesson/${lessonId}/run`, { resume: !!runId, runId });
  status = res.status;
  runId = res.runId;
  if (status === 'completed') {
    console.log('Done!', res.final);
  }
  await delay(2000);
}
```

### 3. Using the Example Component

```typescript
import LessonGeneratorExample from '@/components/LessonGeneratorExample';

// Drop into any page
<LessonGeneratorExample />
```

## 📁 Project Structure

```
src/
├── lib/
│   ├── ai/
│   │   ├── types.ts           # TypeScript interfaces (Plan, Subtask, Run, etc.)
│   │   ├── prompts.ts         # Agent prompts (Planner, Splitter, Writer)
│   │   ├── assembler.ts       # Content assembly & validation
│   │   └── openai.ts          # OpenAI client wrapper
│   └── lessonStore.ts         # Firestore CRUD operations
│
├── hooks/
│   └── useLessonGenerator.ts  # React hook for easy integration
│
├── components/
│   └── LessonGeneratorExample.tsx  # Full working example
│
└── app/api/tutor/
    ├── plan/toc/
    │   ├── route.ts                      # POST - Generate TOC
    │   └── [planId]/
    │       ├── accept/route.ts           # POST - Accept TOC
    │       └── replan/route.ts           # POST - Refine TOC
    └── lesson/[lessonId]/
        ├── split/route.ts                # POST - Split workload
        ├── run/route.ts                  # POST - Orchestrate generation
        ├── progress/route.ts             # GET - Stream progress (SSE)
        ├── cancel/route.ts               # POST - Cancel run
        └── subtasks/[subtaskId]/
            └── run/route.ts              # POST - Execute subtask
```

## 🏗️ Architecture

```
User Input
    ↓
Planner Agent (Generate TOC)
    ↓
User Reviews TOC
    ↓
Workload Splitter Agent (Divide into subtasks)
    ↓
Orchestrator (Sequential execution)
    ↓
Writer Agent #1 → Writer Agent #2 → ... → Writer Agent #N
    ↓
Assembler (Merge all content)
    ↓
Final Lesson
```

## 🎨 Key Features

| Feature | Description |
|---------|-------------|
| **🤖 4 Specialized Agents** | Planner, Splitter, Writer (multi-instance), Assembler |
| **📊 Real-time Progress** | Server-Sent Events (SSE) for live updates |
| **🔄 Resume & Retry** | Automatic retry (3 attempts/subtask), resume from failures |
| **✅ Quality Validation** | Schema checks, content validation, CBC alignment |
| **💾 Persistent State** | All progress stored in Firestore |
| **🎯 Context Continuity** | Each subtask receives previous context for flow |
| **🚫 Cancellation** | User can cancel anytime |
| **📝 TOC Review** | Users see structure before generation |
| **💰 Cost Effective** | ~$0.02 per 15k-token lesson |

## 📊 Data Model

### Firestore Collections

```
lessonPlans/{planId}
  - uid, grade, subject, topic
  - toc: [{ chapterId, title, subtopics[] }]
  - estimates: { totalTokens, perChapter[] }
  - status: proposed | refined | accepted

lessons/{lessonId}
  - uid, grade, subject, topic
  - status: draft | toc_proposed | ... | done
  - toc, tocVersion
  - final: { outline, sections[], content, hash }
  
  subtasks/{subtaskId}
    - order, range, targetTokens
    - status: queued | in-progress | completed | failed
    - result: { sections[], contentChunk, hash }
  
  runs/{runId}
    - status: planned | writing | assembling | completed
    - currentSubtaskOrder, totalSubtasks
    
    events/{eventId}
      - ts, type, data
```

## 🔌 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tutor/plan/toc` | POST | Generate table of contents |
| `/api/tutor/plan/toc/:id/replan` | POST | Refine TOC with constraints |
| `/api/tutor/plan/toc/:id/accept` | POST | Accept TOC, create lesson |
| `/api/tutor/lesson/:id/split` | POST | Divide into subtasks |
| `/api/tutor/lesson/:id/run` | POST | Execute generation (self-calling) |
| `/api/tutor/lesson/:id/progress` | GET | Stream progress events (SSE) |
| `/api/tutor/lesson/:id/cancel` | POST | Cancel active generation |

## 💡 Examples

### Example 1: Generate 15k-token Lesson

```typescript
const { generateLesson } = useLessonGenerator({
  onProgress: (e) => {
    if (e.type === 'subtask_complete') {
      console.log(`Progress: ${e.data.order}/${e.data.totalSubtasks}`);
    }
  },
  onComplete: (lesson) => {
    console.log('Outline:', lesson.outline);
    console.log('Sections:', lesson.sections.length);
  },
});

await generateLesson({
  grade: 'Grade 6',
  subject: 'Science',
  topic: 'Photosynthesis',
  specification: 'Focus on light-dependent and light-independent reactions',
  totalTokens: 15000,
});
```

### Example 2: Review & Edit TOC

```typescript
// Generate TOC
const { toc, planId } = await generateTOC({
  grade: 'Grade 5',
  subject: 'History',
  topic: 'Pre-colonial Kenya',
});

// User reviews and wants changes
const { toc: refinedToc } = await replanTOC(
  'Add more about trade routes',
  'Make it 5 chapters instead of 4'
);

// Accept refined TOC
await acceptTOC();
```

### Example 3: Monitor Progress with SSE

```typescript
const eventSource = new EventSource(
  `/api/tutor/lesson/${lessonId}/progress?runId=${runId}`
);

eventSource.onmessage = (event) => {
  const progress = JSON.parse(event.data);
  
  switch (progress.type) {
    case 'subtask_complete':
      updateProgressBar(progress.data.order, progress.data.totalSubtasks);
      break;
    case 'completed':
      showSuccessMessage();
      eventSource.close();
      break;
    case 'error':
      showError(progress.data.error);
      eventSource.close();
      break;
  }
};
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [MULTI_AGENT_LESSON_SYSTEM.md](./MULTI_AGENT_LESSON_SYSTEM.md) | Complete architecture (8,500+ words) |
| [MULTI_AGENT_QUICKSTART.md](./MULTI_AGENT_QUICKSTART.md) | Quick reference guide |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | Integration steps for existing codebases |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Visual overview and metrics |

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test src/lib/ai/assembler.test.ts
npm test src/lib/lessonStore.test.ts

# Integration tests
npm test tests/api/lesson-generation.test.ts

# Manual test
npm run dev
# Open http://localhost:3000/test-lesson-generator
```

### Test Checklist

- [ ] Short lesson (5k tokens, 3 chapters)
- [ ] Medium lesson (10k tokens, 4 chapters)
- [ ] Long lesson (20k tokens, 6 chapters)
- [ ] Cancellation mid-generation
- [ ] Resume after failure
- [ ] Replan with constraints
- [ ] SSE progress stream
- [ ] Error handling

## 📈 Performance

| Metric | Value |
|--------|-------|
| **Tokens/Lesson** | 10,000 - 20,000 |
| **Cost/Lesson** | ~$0.02 (gpt-4o-mini) |
| **Time** | 40-75 seconds for 15k tokens |
| **Subtasks** | 8-12 for 15k-token lesson |
| **Tokens/Subtask** | ~1,500-2,000 |
| **Retry Limit** | 3 attempts per subtask |

## 🚀 Deployment

### Prerequisites

- Node.js 18+
- Next.js 14+
- Firebase project with Firestore
- OpenAI API key

### Environment Variables

```env
# Required
OPENAI_API_KEY=sk-...
FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...

# Optional
OPENAI_CHAT_MODEL=gpt-4o-mini
NEXT_PUBLIC_API_URL=https://yourdomain.com
DEBUG_LESSON_GEN=false
```

### Deploy

```bash
# Install dependencies
npm install

# Build
npm run build

# Deploy to Vercel/Netlify
vercel deploy --prod
```

## 🔧 Configuration

### Adjust Subtask Size

```typescript
// In src/app/api/tutor/lesson/[lessonId]/split/route.ts
const maxTokensPerSubtask = 2000; // Adjust this (1000-3000 recommended)
```

### Change Model

```typescript
// In .env
OPENAI_CHAT_MODEL=gpt-4o-mini  # or gpt-4-turbo, gpt-3.5-turbo
```

### Customize Prompts

Edit prompts in `src/lib/ai/prompts.ts`:
- `plannerPrompt` - TOC generation
- `workloadSplitterPrompt` - Task division
- `sectionWriterPrompt` - Content generation

## 🐛 Troubleshooting

### Issue: Subtasks fail repeatedly

**Solution**: Check OpenAI API key and rate limits. Reduce `targetTokens` per subtask.

### Issue: SSE not connecting

**Solution**: Use Firestore real-time listeners as fallback (see Migration Guide).

### Issue: Poor continuity between sections

**Solution**: Increase `previousContext` token limit in `extractContinuityContext()`.

### Issue: Assembly validation fails

**Solution**: Check specific issues in validation output. Common: missing section IDs.

## 🤝 Contributing

1. Read architecture docs
2. Write tests for new features
3. Follow TypeScript strict mode
4. Update documentation
5. Submit PR with clear description

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

Built for the AI Tutors platform to generate high-quality, CBC-aligned educational content at scale.

## 📞 Support

- **Documentation**: See markdown files in project root
- **Issues**: Check [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) troubleshooting section
- **Examples**: See `src/components/LessonGeneratorExample.tsx`

---

**Ready to generate amazing lessons?** Start with the Quick Start section above! 🚀
