# Lesson Generation - Quick Reference

## 🚀 System Status: WORKING ✅

The lesson generation system is now functioning correctly with sequential subtask execution and proper concurrent request handling.

## 📊 What You'll See (Normal Operation)

### Backend Logs:
```
[lesson/run] Executing subtask: { subtaskId: 'subtask-1', order: 1 }
[subtask/run] Starting subtask execution
[subtask/run] Calling OpenAI
[subtask/run] OpenAI response received
POST /api/tutor/lesson/.../run 200 in 40s

[lesson/run] Run already processing, skipping ← This is GOOD!
POST /api/tutor/lesson/.../run 409 (multiple times)

[lesson/run] Executing subtask: { subtaskId: 'subtask-2', order: 2 }
...
```

### Frontend Console:
```
[polling] Run already in progress, waiting...  ← Normal, expected
[polling] Run already in progress, waiting...  ← Still normal
```

## ❓ Is This Normal?

| Message | Status | Meaning |
|---------|--------|---------|
| `POST /run 409` | ✅ GOOD | Lock is working! Request waiting for current subtask to finish |
| `[polling] Run already in progress` | ✅ GOOD | Frontend sees lock, will retry in 5s |
| `[lesson/run] Executing subtask` | ✅ GOOD | New subtask started |
| `[subtask/run] OpenAI response received` | ✅ GOOD | Subtask completed successfully |
| `POST /run 200` | ✅ GOOD | Subtask or assembly completed |
| `POST /run 500` | ❌ ERROR | Real error - check logs for details |
| `[polling] Authentication expired` | ❌ ERROR | Token expired - refresh page |

## 🔄 Execution Flow

```
User clicks "Accept and Create"
    ↓
Split workload into subtasks
    ↓
Start generation (initial /run call)
    ↓
┌─────────────────────────────────┐
│ Execute subtask-1               │ ← Lock acquired
│ • OpenAI call (25-40s)          │
│ • Save results                  │
│ • Release lock                  │
└─────────────────────────────────┘
    ↓
Frontend polls /run (every 5s)
    ↓ (409 while subtask-1 running)
    ↓ (409 while subtask-1 running)
    ↓ (200 when lock released)
    ↓
┌─────────────────────────────────┐
│ Execute subtask-2               │ ← Lock acquired again
│ • OpenAI call (25-40s)          │
│ • Save results                  │
│ • Release lock                  │
└─────────────────────────────────┘
    ↓
... repeat for all subtasks ...
    ↓
All subtasks complete
    ↓
Assemble final lesson
    ↓
✅ DONE!
```

## 🐛 Troubleshooting

### Lesson generation stuck?
**Check:** Look for the last log message
- If it says `[subtask/run] Calling OpenAI` → OpenAI is processing (wait up to 60s)
- If it says `POST /run 409` repeatedly → Lock is working, subtask still running
- If no new logs for >60s → Possible timeout, check for error messages

### Too many 409 responses?
**This is normal!** The frontend polls every 5 seconds. If a subtask takes 30 seconds, you'll see ~6 409 responses. This proves the lock is working correctly.

### "Continue generation failed" in console?
**This has been fixed!** The new version uses `console.warn` for non-fatal issues. If you still see `console.error`, it's a real problem that needs investigation.

### Progress not updating?
**Check:** SSE connection status
- Open browser DevTools → Network tab
- Look for `/progress` request with "EventStream" type
- Should stay connected throughout generation

## ⏱️ Expected Timing

| Task | Duration |
|------|----------|
| Generate TOC | 5-10s |
| Split workload | 10-15s |
| Single subtask | 25-40s |
| Full lesson (10 subtasks) | 5-7 minutes |
| Assembly | <5s |

## 🎯 Quick Checks

**Is it working?**
- ✅ Subtasks execute one at a time
- ✅ See 409 responses between subtasks
- ✅ Progress bar advances
- ✅ Final lesson appears when complete

**Something wrong?**
- ❌ Multiple subtasks running in parallel (check logs for concurrent `[subtask/run] Calling OpenAI`)
- ❌ 500 errors (check error details in logs)
- ❌ Stuck on one subtask >60s (possible timeout)
- ❌ No 409s at all (lock mechanism may not be working)

## 📝 Developer Notes

### Key Files:
- `src/app/api/tutor/lesson/[lessonId]/run/route.ts` - Orchestration & locking
- `src/app/api/tutor/lesson/[lessonId]/subtasks/[subtaskId]/run/route.ts` - Subtask execution
- `src/hooks/useLessonGenerator.ts` - Frontend polling
- `src/lib/lessonStore.ts` - Database operations with lock management

### Lock Mechanism:
- Uses Firestore document field `processing: boolean`
- Set to `true` when subtask starts
- Set to `false` when subtask completes or fails
- Checked on every `/run` call

### Why 409 Instead of 503?
- 409 Conflict = "Resource is being modified by another request"
- 503 Service Unavailable = "Service is down"
- 409 is more semantically correct for our lock mechanism

## 🔧 Configuration

Current settings (in `.env.local`):
- OpenAI timeout: 60s
- OpenAI retries: 2
- Frontend polling interval: 5s
- Max subtask retries: 3

## 📞 Need Help?

1. Check this guide first
2. Look at the console logs (both frontend and backend)
3. Compare your logs to the "Normal Operation" examples above
4. If still stuck, share:
   - Last 20 lines of backend logs
   - Browser console errors
   - Lesson ID and run ID
