# Lesson ChapterId Mismatch Fix

## Problem
Lessons are saved successfully to Firestore but showing "No Lessons Available Yet" on the chapter page.

## Root Cause
**ChapterId mismatch** between course chapters and saved lessons:
- Course chapters use slug-style IDs: `"business-plan-development"`
- AI-generated lesson plans were using different IDs from the AI response
- Query `WHERE chapterId == "business-plan-development"` was returning 0 results

## Solution Applied

### 1. **Fixed courseGenerator.ts** (Line 395-397)
```typescript
// Ensure the chapterId aligns with the source course chapter
parsed.chapterId = chapter.id;
if (!parsed.chapterTitle) parsed.chapterTitle = chapter.title;
```

This forces the `ChapterLessonPlan.chapterId` to match the original `chapter.id` from the course, ensuring lessons can be queried correctly.

### 2. **Added Debug Logging**
- `courseGenerator.ts`: Shows actual chapter ID being used
- `lessons/route.ts`: Logs the chapterId filter and results

## What You Need to Do

### Option A: Re-generate Lessons (Recommended)
The course `yg3s2vM2GVKVlT7Z7CRz` was created with the OLD code. You need to:

1. **Delete the existing course** from Firestore (or just delete its `lessons` subcollection)
2. **Create a new course** - the lesson planning will now use correct chapter IDs
3. **Verify** by checking the chapter page - lessons should appear

### Option B: Manual Firestore Fix (For Existing Data)
If you want to keep the existing course:

1. Go to Firebase Console → Firestore
2. Navigate to: `courses/{courseId}/lessons`
3. For each lesson document, update the `chapterId` field to match the slug-style ID from the course chapters

Example mapping for your course:
- "Developing a Business Plan" → `business-plan-development`
- "Understanding Market Analysis" → `market-analysis-and-segmentation`
- etc.

## Verification
After the fix, you should see in the logs:
```
[LessonPlanner] Chapter "Developing a Business Plan" (id="business-plan-development"): 6 lessons
[GetLessons] Filtering by chapterId: "business-plan-development"
[GetLessons] Found 6 lessons for chapterId="business-plan-development"
```

## Future Prevention
✅ The fix is now in place - all NEW courses will automatically use matching chapter IDs.
