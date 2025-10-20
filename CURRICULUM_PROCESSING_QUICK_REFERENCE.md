# Curriculum Processing - Quick Reference

## Overview
Both CBC and GCSE/Cambridge curricula have been successfully processed with unique IDs for all strands.

## Files Generated

### CBC Curriculum (Kenyan System)
| File | Path | Purpose |
|------|------|---------|
| **Full with IDs** | `src/components/CBCStudent/cbc_curriculum_with_ids.json` | Complete curriculum for AI prompts |
| **Simple** | `src/components/CBCStudent/cbc_curriculum_simple.json` | Lightweight for modal dropdowns |
| **Original** | `src/components/CBCStudent/cbc_curriculum.json` | Source data (unchanged) |

### GCSE/Cambridge Curriculum (British System)
| File | Path | Purpose |
|------|------|---------|
| **Full with IDs** | `src/components/GCSEStudent/gcse_curriculum_with_ids.json` | Complete curriculum for AI prompts |
| **Simple** | `src/components/GCSEStudent/gcse_curriculum_simple.json` | Lightweight for modal dropdowns |
| **Original** | `src/components/GCSEStudent/gcse_curriculum.json` | Source data (unchanged) |

## Statistics Comparison

| Metric | CBC (Kenya) | GCSE (British) |
|--------|-------------|----------------|
| **Grade/Year Levels** | 9 grades | 13 years |
| **Total Subjects** | Varies by grade | 129 total |
| **Total Strands** | Varies | 591 strands |
| **ID Format** | `{subject}-g{grade}-{strand}` | `{subject}-y{year}-{strand}` |
| **Coverage** | Grades 1-9 (CBC system) | Years 1-13 (Primary to A-Level) |

## ID Format Examples

### CBC (Kenyan System)
```
english-g1-listening-and-speaking
math-g5-numbers
science-g7-plants
```

### GCSE (British System)
```
english-y1-reading
math-y10-algebra
science-bi-y13-physics
```

## Processing Scripts

### CBC Processor
- **File**: `process_curriculum.py`
- **Coverage**: CBC Grades 1-9
- **Key Features**:
  - Handles pathway subjects (Grades 9+)
  - Processes core and pathway subjects separately
  - Validates grade structure

### GCSE Processor
- **File**: `process_gcse_curriculum.py`
- **Coverage**: Cambridge Years 1-13
- **Key Features**:
  - Handles nested curriculum structures
  - Supports both `subtopics` and `objectives`
  - Processes Primary, Lower Secondary, IGCSE, AS, and A-Level

## Usage in Application

### 1. Modal Dropdowns (Use Simple Version)

```typescript
// CBC Student
import cbcSimple from '@/components/CBCStudent/cbc_curriculum_simple.json';

// GCSE Student
import gcseSimple from '@/components/GCSEStudent/gcse_curriculum_simple.json';

// Get strands for selection
const strands = curriculum[gradeOrYear].subjects
  .find(s => s.name === selectedSubject)
  ?.strands || [];
```

### 2. AI Lesson Generation (Use Full Version)

```typescript
// CBC Student
import cbcFull from '@/components/CBCStudent/cbc_curriculum_with_ids.json';

// GCSE Student
import gcseFull from '@/components/GCSEStudent/gcse_curriculum_with_ids.json';

// Get full strand data with descriptions
const strandData = curriculum[gradeOrYear].subjects
  .find(s => s.name === selectedSubject)
  ?.strands.find(str => str.id === strandId);

// strandData includes: id, name, description, subtopics
```

## Next Integration Steps

### 1. Update Type Definitions
```typescript
// For CBC
type CBCGrade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// For GCSE
type GCSEYear = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

interface Strand {
  id: string;
  name: string;
  description?: string;
  subtopics?: string[];
  objectives?: string[];
}
```

### 2. Update Modal Components
- Replace hardcoded curriculum data with simple JSON imports
- Use strand IDs for selection state
- Display strand names in dropdowns

### 3. Update Lesson Generator
- Import full curriculum JSON
- Look up strand by ID
- Pass full strand data (with descriptions) to AI

### 4. Update API Routes
- Accept strand IDs instead of strand names
- Look up curriculum data server-side
- Generate lessons with full curriculum context

## Benefits of This Approach

✅ **Consistent IDs**: Unique identifiers for all curriculum strands
✅ **Dual Formats**: Full context for AI, lightweight for UI
✅ **Scalable**: Easy to add new grades/years or update content
✅ **Type-Safe**: Can generate TypeScript types from JSON
✅ **Maintainable**: Single source of truth for curriculum data
✅ **Efficient**: Simple JSON reduces modal loading time
✅ **Traceable**: IDs allow tracking user selections and lesson generation

## File Locations Summary

```
ai-tutors-frontend/
├── src/components/
│   ├── CBCStudent/
│   │   ├── cbc_curriculum.json (original)
│   │   ├── cbc_curriculum_with_ids.json (full)
│   │   └── cbc_curriculum_simple.json (simple)
│   └── GCSEStudent/
│       ├── gcse_curriculum.json (original)
│       ├── gcse_curriculum_with_ids.json (full)
│       └── gcse_curriculum_simple.json (simple)
├── process_curriculum.py (CBC processor)
├── process_gcse_curriculum.py (GCSE processor)
├── CBC_CURRICULUM_PROCESSING_SUMMARY.md
└── GCSE_CURRICULUM_PROCESSING_SUMMARY.md
```

## Re-running Processors

### If curriculum data changes:

```bash
# Re-process CBC curriculum
python process_curriculum.py

# Re-process GCSE curriculum
python process_gcse_curriculum.py
```

Both scripts will:
1. Validate the curriculum structure
2. Generate new IDs if strand names changed
3. Create updated full and simple versions
4. Show progress and statistics

---

**Status**: ✅ Both curricula processed successfully
**Total Strands**: 591 (GCSE) + varies (CBC)
**Ready for Integration**: Yes
