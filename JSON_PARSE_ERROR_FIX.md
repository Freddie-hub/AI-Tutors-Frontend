# JSON Parse Error Fix

## Issue
```
[planner] ERROR: SyntaxError: Unexpected end of JSON input
```

## Root Cause
The `max_tokens: 500` limit was too restrictive, causing OpenAI to cut off the JSON response mid-generation, especially for GCSE topics which may have longer subject names and more detailed curriculum contexts.

## Fix Applied

### 1. Increased Token Limit
**File:** `src/app/api/tutor/plan/toc/route.ts`

**Before:**
```typescript
max_tokens: 500, // Reduced further
```

**After:**
```typescript
max_tokens: 1000, // Increased to allow complete JSON response
```

### 2. Added Better Error Handling
**File:** `src/app/api/tutor/plan/toc/route.ts`

Added:
- Content length logging
- Preview of response for debugging
- Try-catch around JSON.parse with helpful error message
- Validation of TOC structure

```typescript
// Log content for debugging
console.log('[planner] Response content length:', content.length);
console.log('[planner] Response preview:', content.substring(0, 200));

let parsed;
try {
  parsed = JSON.parse(content);
} catch (parseError) {
  console.error('[planner] JSON parse error. Full content:', content);
  throw new Error('Failed to parse planner response. The response may have been truncated.');
}

// Validate required fields
if (!parsed.toc || !Array.isArray(parsed.toc) || parsed.toc.length === 0) {
  console.error('[planner] Invalid TOC structure:', parsed);
  throw new Error('Invalid table of contents structure received from planner');
}
```

### 3. Streamlined Planner Prompt
**File:** `src/lib/ai/prompts.ts`

Made the prompt more concise to:
- Reduce input token usage
- Make output requirements clearer
- Emphasize "ONLY JSON" to prevent extra text

**Key Changes:**
- Removed verbose explanations
- Simplified task description
- Added "Return ONLY this JSON (no markdown, no extra text)"
- Condensed guidelines

## Expected Result

**Before:**
```
[planner] Completion received
[planner] ERROR: SyntaxError: Unexpected end of JSON input
POST /api/tutor/plan/toc 500
```

**After:**
```
[planner] Completion received
[planner] Response content length: 847
[planner] Response preview: {"toc":[{"chapterId":"chap-1","title":"Introduction to...
[planner] Plan stored, returning response
POST /api/tutor/plan/toc 200
```

## Testing

Try the same request again:
- Grade: "Cambridge IGCSE (British-style) - Year 10 / Grade 9"
- Subject: "Computing / Information and Communication Technology (ICT)"
- Topic: "Computational Thinking"

The planner should now return complete, valid JSON with the TOC structure.

## Additional Notes

The 1000 token limit is still conservative enough to:
- Keep costs low (~$0.001 per TOC generation)
- Prevent excessive verbosity
- Allow complete JSON for complex topics

If you still encounter truncation issues with very complex topics, you can increase to 1500 tokens, but 1000 should be sufficient for most cases.
