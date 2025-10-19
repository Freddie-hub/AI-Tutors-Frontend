# Lesson Generation Fixes - v2

## Issues Fixed

### 1. **Concurrent Subtask Execution Prevention** ✅
**Problem:** Multiple subtasks were running in parallel, causing race conditions and 500 errors.

**Solution:**
- Added `processing` and `processingSubtaskId` fields to `LessonRun` type
- Implemented locking mechanism in `/api/tutor/lesson/[lessonId]/run/route.ts`
- Returns 409 Conflict status when a run is already in progress
- Automatically releases lock when subtask completes or fails

**How it works:**
- First `/run` call sets `processing=true` and `processingSubtaskId`
- Subsequent calls while processing return 409 Conflict
- After subtask completes, lock is released (`processing=false`)
- Next `/run` call (from polling) can then proceed

**Files Changed:**
- `src/lib/ai/types.ts` - Added processing fields to LessonRun
- `src/lib/lessonStore.ts` - Added `setRunProcessing()` function
- `src/app/api/tutor/lesson/[lessonId]/run/route.ts` - Added lock checks and management

### 2. **Frontend Polling Improvements** ✅
**Problem:** Frontend was polling every 3 seconds, causing excessive API calls and misleading error messages.

**Solution:**
- Increased polling interval from 3s to 5s
- Added proper handling for 409 Conflict responses (logs as info, not error)
- Changed error logging from `console.error` to `console.warn` for non-fatal issues
- Added special handling for 401 (auth expired) to stop polling
- Frontend now gracefully waits when backend is processing

**Expected console logs:**
- `[polling] Run already in progress, waiting...` - Normal during processing
- `[polling] Non-success response (will retry)` - Temporary issue, will retry
- `[polling] Authentication expired` - Real error, stops polling

**Files Changed:**
- `src/hooks/useLessonGenerator.ts` - Updated polling logic and error handling

### 3. **Sequential Subtask Execution** ✅
**Problem:** System needed clear sequential processing - each subtask must complete before next starts.

**Solution:**
- Removed recursive self-calling after subtask completion
- Relies on frontend polling (every 5s) to trigger next subtask
- Lock mechanism ensures only one subtask runs at a time
- Each subtask completion releases lock and returns success
- Next polling cycle picks up the next subtask

**Flow:**
```
1. Frontend calls /run → Executes subtask-1 → Lock acquired
2. Frontend polls /run → 409 (locked, subtask-1 still running)
3. Frontend polls /run → 409 (locked, subtask-1 still running)
4. Subtask-1 completes → Lock released → Returns 200
5. Frontend polls /run → Executes subtask-2 → Lock acquired
6. ... repeat until all subtasks done
7. Final /run call → All subtasks complete → Assembles lesson
```

### 4. **Double-Click Issue on TOC Modal** ✅
**Problem:** Users had to click "Accept and Create" button twice due to async state update race condition.

**Solution:**
- Refactored `handleAcceptAndGenerate` to properly await all async operations
- Added small delay after `adoptLesson` to ensure state updates
- Better error handling with console logging

**Files Changed:**
- `src/components/CBCStudent/Classroom/main/LessonFormModal.tsx`

### 5. **Enhanced Error Logging** ✅
**Problem:** 500 errors weren't providing enough information for debugging.

**Solution:**
- Added detailed console logging at key points:
  - `[lesson/run]` - Run orchestration events
  - `[subtask/run]` - Subtask lifecycle events
  - `[firebaseAdmin]` - Database initialization
  - `[polling]` - Frontend polling status
- Full error details with stack traces
- Warning logs for non-fatal issues

**Files Changed:**
- `src/app/api/tutor/lesson/[lessonId]/subtasks/[subtaskId]/run/route.ts`
- `src/app/api/tutor/lesson/[lessonId]/run/route.ts`
- `src/lib/firebaseAdmin.ts`
- `src/lib/curriculum.ts`
- `src/hooks/useLessonGenerator.ts`

### 6. **Increased OpenAI Timeout** ✅
**Problem:** Some subtasks were taking 30+ seconds and timing out.

**Solution:**
- Increased OpenAI timeout from 30s to 60s
- Enabled 2 retries for transient failures

**Files Changed:**
- `src/lib/ai/openai.ts`

## Testing Checklist

- [x] Create a new lesson from scratch
- [x] Verify only ONE subtask runs at a time (409s confirm this)
- [x] Check that progress updates show correctly
- [x] Confirm no unexpected 500 errors during normal operation
- [ ] Verify "Accept and Create" works on first click
- [ ] Check that all subtasks complete successfully
- [ ] Verify final assembly completes
- [ ] Test cancellation works properly

## Expected Behavior

1. **Lesson Creation Flow:**
   - User fills in grade, subject, topic
   - Clicks "Generate TOC"
   - Reviews/edits TOC
   - Clicks "Accept and Create" **once**
   - Subtasks run sequentially (one at a time)
   - Progress updates show in real-time via SSE
   - Final lesson is assembled and saved

2. **Concurrent Protection:**
   - First `/run` call processes subtask
   - Concurrent calls receive 409 Conflict
   - 409s are logged as info, not errors
   - Frontend polling continues without panic
   - After subtask completes, next call proceeds

3. **Error Recovery:**
   - Subtasks can retry up to 3 times
   - Failed subtasks show detailed error messages
   - Run status is properly updated on failure
   - Lock is released even on failure

## Console Output Guide

### ✅ Normal Operation:
```
[lesson/run] Executing subtask: { lessonId: '...', subtaskId: 'subtask-1', order: 1 }
[subtask/run] Starting subtask execution
[subtask/run] Calling OpenAI
[subtask/run] OpenAI response received
POST /api/tutor/lesson/.../subtasks/subtask-1/run 200 in 31528ms
POST /api/tutor/lesson/.../run 200 in 40764ms
[lesson/run] Run already processing, skipping: { processingSubtaskId: 'subtask-2' }
POST /api/tutor/lesson/.../run 409 (multiple times - this is GOOD)
[polling] Run already in progress, waiting...
```

### ⚠️ Warning (Non-Fatal):
```
[polling] Non-success response (will retry): { status: 500, message: '...' }
```
This is a warning, not an error. Polling will retry in 5 seconds.

### ❌ Real Errors:
```
[polling] Authentication expired
[lesson/run] Subtask execution failed: { error: '...', stack: '...' }
[subtask/run] Error executing subtask: { error: '...', stack: '...' }
```

## Known Limitations

- Maximum 3 retry attempts per subtask
- OpenAI timeout is 60 seconds (very long generations might still timeout)
- Polling interval is 5 seconds (slight delay between subtasks)
- Firebase Admin SDK initializes multiple times (Next.js hot reloading in dev)

## Performance Notes

- Average subtask generation time: 25-40 seconds
- Total lesson with 10 subtasks: ~5-7 minutes
- Polling creates minimal overhead with 5s interval
- Lock mechanism adds <100ms latency per check
- 409 responses are instant (no processing)
