# Two-Agent Course System Implementation

## Overview
This implementation creates a comprehensive two-agent system for CBC course generation with automatic lesson planning, timelines, and classroom integration.

## Architecture

### Agent 1: Course Architect (Existing + Enhanced)
**File:** `src/server/courseGenerator.ts` → `generateCBCCourseTOC`

**Purpose:** Designs complete course structure with chapters

**Changes:**
- ✅ Removed arbitrary 12-20 chapter limit
- ✅ AI now decides optimal chapter count for state-of-the-art mastery
- ✅ Prompts emphasize depth and comprehensive coverage

**Output:**
- Course name, description, duration (weeks)
- Chapters array with: id, title, subject, strand, topics, description, order

---

### Agent 2: Lesson Planner (NEW)
**File:** `src/server/courseGenerator.ts` → `generateCourseLessonPlan`

**Purpose:** Breaks down each chapter into detailed lessons with durations and schedule

**Process:**
1. **Per-Chapter Planning:** Calls `chapterLessonPlannerPrompt` for each chapter
   - Returns 3-10 lessons per chapter (no limit)
   - Each lesson includes: title, topics, objectives, depth, duration, prerequisites, assessments
   
2. **Course-Wide Scheduling:** Calls `courseLessonSchedulerPrompt`
   - Distributes lessons across available weeks
   - Balances cognitive load
   - Produces weekly schedule with dates (if start date provided)

**Output:**
- `PlannedLesson[]` - Full lesson details with scheduling
- `CourseLessonSchedule` - Weekly breakdown and recommendations

---

## New Data Types

### PlannedLesson
```typescript
{
  id: string;
  courseId: string;
  chapterId: string;
  order: number;
  globalOrder: number;
  title: string;
  subject: string;
  topics: string[];
  learningObjectives: string[];
  depth: 'intro' | 'intermediate' | 'proficient';
  targetDurationMin: number;
  suggestedHomeworkMin?: number;
  prerequisites?: string[];
  assessmentAnchors?: string[];
  keyActivities?: string[];
  realWorldContext?: string;
  plannedWeek?: number;
  plannedDate?: string;
  status: 'planned' | 'generating' | 'generated' | 'published' | 'completed';
  contentId?: string;
}
```

### CourseLessonSchedule
```typescript
{
  courseId: string;
  totalWeeks: number;
  lessonsPerWeek: number;
  actualLessonsScheduled: number;
  overflow: number;
  schedule: LessonScheduleEntry[];
  weekSummary: WeekSummary[];
  recommendations?: string[];
}
```

---

## API Endpoints

### 1. POST `/api/courses/[courseId]/plan-lessons`
**Purpose:** Triggers Agent 2 lesson planning

**Request:**
```json
{
  "lessonsPerWeek": 4,
  "startDate": "2025-01-15" // optional
}
```

**Response:**
```json
{
  "success": true,
  "totalLessons": 45,
  "totalWeeks": 24,
  "overflow": 0,
  "recommendations": ["Consider review week after week 8"],
  "lessons": [...],
  "schedule": {...}
}
```

**Storage:**
- Lessons → Firestore: `courses/{courseId}/lessons/{lessonId}`
- Schedule → Firestore: `courses/{courseId}/metadata/schedule`

### 2. GET `/api/courses/[courseId]/lessons`
**Purpose:** Retrieve planned lessons

**Query Params:**
- `status` - Filter by status (planned|generated|etc)
- `chapterId` - Filter by chapter

**Response:**
```json
{
  "success": true,
  "courseId": "...",
  "totalLessons": 45,
  "lessons": [...],
  "schedule": {...}
}
```

---

## Client Integration

### Hook: `useLessonPlanner`
**File:** `src/hooks/useLessonPlanner.ts`

**Methods:**
- `planLessons({ courseId, lessonsPerWeek, startDate })` - Trigger planning
- `fetchLessons({ courseId, status?, chapterId? })` - Get lessons
- `reset()` - Clear state

**State:**
- `isPlanning` - Planning in progress
- `isFetching` - Fetching lessons
- `plannedLessons` - Array of lessons
- `schedule` - Schedule object
- `error` - Error message

### Component: `LessonPlanView`
**File:** `src/components/CBCStudent/courses/LessonPlanView.tsx`

**Features:**
- ✅ Overview stats (total lessons, time, weeks, lessons/week)
- ✅ Schedule recommendations display
- ✅ Weekly breakdown grid
- ✅ Detailed lesson plan grouped by chapter
- ✅ Per-lesson: duration, depth, week, topics, objectives

---

## User Flow

### 1. Course Creation Flow
```
Student → Select Grade & Subjects
       → Generate Course (Agent 1)
       → Review TOC
       → Click "Save & Plan Lessons"
       → Course saved + Agent 2 auto-triggered
       → Lesson planning runs (10-20s)
       → Success → View course with lesson plan
```

### 2. Viewing Lesson Plan
```
Course Detail Page
  → Overview tab (existing)
  → **Lesson Plan tab (NEW)**
     → Shows LessonPlanView component
     → Stats, schedule, weekly breakdown, detailed lessons
```

### 3. Classroom Integration (Next Phase)
```
Classroom
  → "Import from Course" button
  → Select course
  → View chapters with planned lessons
  → Import lessons to classroom queue
  → Lesson cards show:
     - Duration (e.g., "45 min")
     - Planned week/date
     - Status badge
     - Subject/topic
```

---

## Automatic Workflow

### After TOC Approval:
1. **Save Course** → Firestore `courses/{id}`
2. **Auto-trigger Agent 2** → `planLessons({ courseId })`
3. **Agent 2 Process:**
   - Batch chapter planning (3 at a time)
   - Generate lesson plans per chapter
   - Create course-wide schedule
   - Save all to Firestore
4. **Update UI** → Show lesson plan immediately

---

## Key Features

### ✅ State-of-the-Art Depth
- No arbitrary chapter/lesson limits
- AI decides optimal granularity
- Each lesson designed for mastery
- Comprehensive curriculum coverage

### ✅ Realistic Timing
- Per-lesson duration estimates (minutes)
- Total course hours calculated
- Weekly schedule with load balancing
- Optional homework/practice time

### ✅ Progressive Learning
- Lessons ordered by prerequisites
- Depth progression (intro → intermediate → proficient)
- Assessment anchors at natural checkpoints
- Real-world Kenyan contexts

### ✅ Flexible Scheduling
- Configurable lessons per week (default: 4)
- Optional start date for absolute dates
- Overflow detection and warnings
- AI-generated pacing recommendations

---

## Files Modified/Created

### New Prompts
- `src/lib/ai/prompts/cbc.ts` - Added:
  - `chapterLessonPlannerPrompt` - Per-chapter lesson breakdown
  - `courseLessonSchedulerPrompt` - Course-wide scheduling
  - Updated `cbcCoursePlannerPrompt` - Removed chapter limit

### New Types
- `src/lib/types.ts` - Added:
  - `PlannedLesson`
  - `ChapterLessonPlan`
  - `LessonScheduleEntry`
  - `WeekSummary`
  - `CourseLessonSchedule`
  - `LessonPlanningJob`

### Server Logic
- `src/server/courseGenerator.ts` - Added:
  - `generateCourseLessonPlan` - Agent 2 implementation

### API Routes
- `src/app/api/courses/[courseId]/plan-lessons/route.ts` - NEW
- `src/app/api/courses/[courseId]/lessons/route.ts` - NEW

### Client Hooks
- `src/hooks/useLessonPlanner.ts` - NEW

### UI Components
- `src/components/CBCStudent/courses/LessonPlanView.tsx` - NEW
- `src/components/CBCStudent/courses/CourseTOCReview.tsx` - Updated (lesson planning UI)
- `src/components/CBCStudent/courses/CBCCourseForm.tsx` - Updated (auto-trigger planning)

---

## Next Steps (Phase 2)

### Classroom Import
1. Add "Import from Course" button to classroom
2. Allow selecting course/chapters/lessons
3. Show lesson cards with duration, week, status
4. Link planned lessons to existing lesson generator

### On-Demand Generation
1. When student opens a planned lesson:
   - If status = 'planned' → trigger content generation
   - Use existing `lessonPrompt` with CBC context
   - Update status: planned → generating → generated
2. Cache generated content for instant replay

### Timeline View
1. Add calendar/weekly lane visualization
2. Show lessons mapped to dates
3. Allow drag-drop reschedule
4. Mark lessons as completed

### Pre-Generation
1. Auto-generate first 2-3 lessons after planning
2. Background worker for remaining lessons
3. Priority queue for upcoming lessons

---

## Performance Considerations

### API Costs
- Agent 1 (Course TOC): 1 call per course (~$0.10)
- Agent 2 (Lesson Planning): N calls (batches of 3) (~$0.50 for 20 chapters)
- Total: ~$0.60 per course creation

### Timing
- Agent 1: 5-10 seconds
- Agent 2: 10-30 seconds (depending on chapter count)
- Total: 15-40 seconds from "Generate" to "Lesson Plan Ready"

### Storage
- Course: ~5-10 KB
- Planned Lessons: ~2 KB each × 40-80 = 80-160 KB
- Schedule metadata: ~5 KB
- Total per course: ~100-200 KB

---

## Success Metrics

### Technical
- ✅ Agent 2 completes within 30 seconds
- ✅ Zero lesson plan failures
- ✅ All lessons have valid durations
- ✅ Schedule fits within course duration ±10%

### Educational
- ✅ Students can see realistic time commitment
- ✅ Lessons progress logically (prerequisites respected)
- ✅ Depth appropriate for grade level
- ✅ Covers all curriculum strands/subtopics

### User Experience
- ✅ Seamless flow from course creation to lesson plan
- ✅ Clear visibility of timeline and workload
- ✅ Easy navigation between chapters/lessons
- ✅ Status tracking (planned/generated/completed)

---

## Example: Grade 7 Integrated Science Course

### Agent 1 Output
- **Course:** "Grade 7 Complete CBC Curriculum: Integrated Science, Pre-Technical Studies, Life Skills, PE"
- **Duration:** 24 weeks
- **Chapters:** 20 chapters (no limit, AI decided)

### Agent 2 Output
- **Total Lessons:** 78 lessons
- **Total Time:** 65 hours
- **Per Week:** 3-4 lessons
- **Example Chapter:** "Introduction to Cell Theory and Organelles"
  - Lesson 1: "What is a Cell?" (45 min, intro)
  - Lesson 2: "Cell Theory and History" (50 min, intermediate)
  - Lesson 3: "Cell Organelles and Functions" (60 min, proficient)
  - Lesson 4: "Comparing Plant and Animal Cells" (45 min, proficient)

### Schedule
- Week 1-3: Cell biology (8 lessons)
- Week 4-6: Body systems (10 lessons)
- Week 7: Review + Assessment
- ... continues through week 24

---

## Summary

We've built a complete two-agent system that:
1. ✅ Generates comprehensive course structures (Agent 1)
2. ✅ Plans detailed lessons with durations (Agent 2)
3. ✅ Creates realistic weekly schedules
4. ✅ Auto-triggers after course creation
5. ✅ Provides rich UI for viewing plans
6. ✅ Prepares groundwork for classroom import

The student now gets:
- Clear timeline expectations
- Realistic time commitments per lesson
- Progressive learning paths
- State-of-the-art depth in every subject
- All automatically, with no extra clicks

**Next:** Integrate with classroom for import functionality and on-demand lesson generation.
