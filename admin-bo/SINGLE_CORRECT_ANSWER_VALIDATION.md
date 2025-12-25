# Admin-BO Single Correct Answer Validation

## Overview
This document describes the admin-bo (Next.js) validation fixes to ensure that each question has exactly one correct answer. These fixes complement the server-side fixes implemented in the Java backend.

## Problem Statement
The admin-bo application allowed creating and editing questions with:
- Multiple correct answers (causing ambiguous scoring)
- Zero correct answers (causing all answers to be marked incorrect)

This was possible because:
1. No API validation in POST/PUT endpoints
2. No client-side validation before submission
3. UI relied only on radio buttons (which help but don't prevent programmatic errors)

## Solutions Implemented

### 1. API Validation - POST Endpoint
**File:** `src/app/api/manage/questions/route.ts`

**What it does:**
- Validates options before creating question in database
- Checks for SINGLE_CHOICE_IMAGE format:
  - At least one option exists
  - Exactly one option is marked as correct (not zero, not multiple)
- Returns clear error messages with HTTP 400 status

**Example error responses:**
```json
{
  "error": "SINGLE_CHOICE_IMAGE format requires exactly one correct answer. Found 0 correct answers."
}
```

```json
{
  "error": "SINGLE_CHOICE_IMAGE format requires exactly one correct answer. Found 3 correct answers."
}
```

### 2. API Validation - PUT Endpoint
**File:** `src/app/api/manage/questions/[id]/route.ts`

**What it does:**
- Same validation as POST endpoint
- Validates options before updating question in database
- Only validates if options are being updated (options !== undefined)

**Impact:**
- Prevents invalid data from reaching the database
- Provides clear error messages to the client

### 3. Client-Side Validation - Create Modal
**File:** `src/app/(dashboard)/manage/questions/page.tsx`

**What it does:**
- Validates before submitting to API
- For SINGLE_CHOICE_IMAGE format:
  - Checks exactly one correct answer
  - Checks all options have text
- For TEXT_INPUT format:
  - Checks at least one acceptable answer exists
- Shows user-friendly alert messages

**User experience:**
- Immediate feedback before API call
- Clear instructions on what needs to be fixed
- Prevents unnecessary API calls

**Example alerts:**
```
"Please select exactly one correct answer. Currently, no answer is marked as correct."
"Please select exactly one correct answer. Currently, 3 answers are marked as correct."
"Please fill in all option texts before submitting."
```

### 4. Client-Side Validation - Edit Page
**File:** `src/app/(dashboard)/manage/questions/[id]/edit/page.tsx`

**What it does:**
- Same validation as create modal
- Validates before saving changes
- Prevents saving invalid question updates

**Impact:**
- Consistent validation across create and edit flows
- Better user experience with immediate feedback

## Defense in Depth Strategy

| Layer | Component | Action | When |
|-------|-----------|--------|------|
| 1 | Client-side validation | **ALERTS** user | Before API call |
| 2 | API validation (Next.js) | **REJECTS** with 400 | Before database |
| 3 | Database constraint | **BLOCKS** invalid data | At database level |
| 4 | Java validation | **REJECTS** with error | Import endpoint |

## Validation Flow

### Creating a Question
1. User fills form in create modal
2. User clicks "Create Question"
3. **Client validation** checks options → Shows alert if invalid
4. If valid, sends POST to `/api/manage/questions`
5. **API validation** checks options → Returns 400 if invalid
6. If valid, inserts into database
7. **Database constraint** enforces single correct answer

### Editing a Question
1. User modifies question in edit page
2. User clicks "Save Changes"
3. **Client validation** checks options → Shows alert if invalid
4. If valid, sends PUT to `/api/manage/questions/[id]`
5. **API validation** checks options → Returns 400 if invalid
6. If valid, updates database
7. **Database constraint** enforces single correct answer

## Files Changed

```
admin-bo/
├── SINGLE_CORRECT_ANSWER_VALIDATION.md (NEW)
├── src/app/api/manage/questions/
│   ├── route.ts (MODIFIED - POST validation)
│   └── [id]/route.ts (MODIFIED - PUT validation)
└── src/app/(dashboard)/manage/questions/
    ├── page.tsx (MODIFIED - Create modal validation)
    └── [id]/edit/page.tsx (MODIFIED - Edit page validation)
```

## Testing Checklist

### Manual Testing
- [ ] Try to create question with 0 correct answers → Should show alert
- [ ] Try to create question with 2+ correct answers → Should show alert
- [ ] Try to create question with empty option text → Should show alert
- [ ] Create valid question with 1 correct answer → Should succeed
- [ ] Try to edit question to have 0 correct answers → Should show alert
- [ ] Try to edit question to have 2+ correct answers → Should show alert
- [ ] Edit question to change which answer is correct → Should succeed

### API Testing
```bash
# Test POST with multiple correct answers
curl -X POST http://localhost:3000/api/manage/questions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "VERBAL_ANALOGY",
    "format": "SINGLE_CHOICE_IMAGE",
    "difficulty": 3,
    "options": [
      {"text": "Option 1", "is_correct": true},
      {"text": "Option 2", "is_correct": true}
    ]
  }'
# Expected: 400 error with message about multiple correct answers

# Test PUT with zero correct answers
curl -X PUT http://localhost:3000/api/manage/questions/[id] \
  -H "Content-Type: application/json" \
  -d '{
    "type": "VERBAL_ANALOGY",
    "format": "SINGLE_CHOICE_IMAGE",
    "difficulty": 3,
    "options": [
      {"text": "Option 1", "is_correct": false},
      {"text": "Option 2", "is_correct": false}
    ]
  }'
# Expected: 400 error with message about zero correct answers
```

## Benefits

### User Experience
- ✅ Immediate feedback with clear error messages
- ✅ Prevents submission of invalid data
- ✅ Reduces frustration from server errors

### Data Integrity
- ✅ Multiple layers of protection
- ✅ Consistent validation across all entry points
- ✅ Clear error messages for debugging

### Maintainability
- ✅ Validation logic is centralized
- ✅ Easy to update validation rules
- ✅ Consistent patterns across create/edit flows

## Related Changes
This complements the server-side fixes:
- **Server Branch:** `fix/server-single-correct-answer-validation`
  - Database constraint
  - Java AdminController validation
  - Defensive logging in services

## Questions?
Contact the development team for any questions or issues related to these changes.

