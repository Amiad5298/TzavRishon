# Single Correct Answer Validation - Server-Side Fixes

## Overview
This document describes the server-side fixes implemented to ensure that each question has exactly one correct answer. These fixes provide multiple layers of protection against data integrity issues.

## Problem Statement
The original system allowed questions to have:
- Multiple correct answers (causing ambiguous scoring)
- Zero correct answers (causing all answers to be marked incorrect)

This was possible because:
1. No database constraint prevented multiple `is_correct = TRUE` values
2. No validation in the Java import endpoint
3. No defensive checks when serving questions

## Solutions Implemented

### 1. Database Constraint (V6 Migration)
**File:** `src/main/resources/db/migration/V6__add_single_correct_answer_constraint.sql`

**What it does:**
- Adds a unique partial index on `question_options(question_id)` where `is_correct = TRUE`
- This ensures at the database level that only one option per question can be marked as correct
- The constraint is enforced by PostgreSQL and cannot be bypassed

**Impact:**
- **Critical protection** - Prevents any code from creating invalid data
- Will throw `DataIntegrityViolationException` if violated

### 2. Java AdminController Validation
**File:** `src/main/java/com/tzavrishon/controller/AdminController.java`

**What it does:**
- Added `validateSingleCorrectAnswer()` method
- Validates options before saving to database
- Checks for:
  - At least one option exists
  - Exactly one option is marked as correct (not zero, not multiple)

**Impact:**
- Provides clear error messages before database constraint is hit
- Better user experience with descriptive validation errors

**Example error messages:**
```
"SINGLE_CHOICE_IMAGE format requires exactly one correct answer. Found 0 correct answers."
"SINGLE_CHOICE_IMAGE format requires exactly one correct answer. Found 3 correct answers."
```

### 3. Defensive Validation in PracticeService
**File:** `src/main/java/com/tzavrishon/service/PracticeService.java`

**What it does:**
- Added `validateQuestionIntegrity()` method
- Logs warnings when serving questions with data integrity issues
- Does not block serving questions (defensive only)

**Impact:**
- Helps detect existing data issues in production
- Provides visibility through logs for monitoring

**Example log messages:**
```
WARN: DATA INTEGRITY ISSUE: Question abc-123 (type: VERBAL_ANALOGY) has ZERO correct answers. 
      This will cause all user answers to be marked incorrect.

WARN: DATA INTEGRITY ISSUE: Question def-456 (type: QUANTITATIVE) has 2 correct answers. 
      Only one correct answer is allowed. This may cause incorrect scoring.
```

### 4. Defensive Validation in ExamService
**File:** `src/main/java/com/tzavrishon/service/ExamService.java`

**What it does:**
- Same defensive validation as PracticeService
- Logs warnings for exam questions with integrity issues

**Impact:**
- Ensures exam questions are also monitored for data integrity

### 5. Integration Tests
**File:** `src/test/java/com/tzavrishon/constraint/SingleCorrectAnswerConstraintTest.java`

**What it does:**
- Tests that the database constraint works correctly
- Verifies multiple correct answers are rejected
- Verifies single correct answer with multiple incorrect answers works
- Verifies updating the correct answer works properly

**Test cases:**
1. `testCannotCreateMultipleCorrectAnswers()` - Ensures constraint blocks multiple correct answers
2. `testCanCreateOneCorrectAndMultipleIncorrectAnswers()` - Ensures valid data works
3. `testCanUpdateCorrectAnswerToAnotherOption()` - Ensures correct answer can be changed

## Verification Script
**File:** `check_multiple_correct_answers.sql`

**What it does:**
- SQL script to check existing database for data integrity issues
- Identifies questions with multiple correct answers
- Identifies questions with zero correct answers
- Provides summary statistics

**Usage:**
```sql
psql -h <host> -U <user> -d <database> -f check_multiple_correct_answers.sql
```

## Deployment Checklist

### Before Deployment
1. ✅ Run `check_multiple_correct_answers.sql` on production database
2. ✅ Fix any existing data issues found
3. ✅ Verify all tests pass: `./mvnw test`

### During Deployment
1. ✅ Deploy code changes
2. ✅ Flyway will automatically run V6 migration
3. ✅ Verify migration succeeded in logs

### After Deployment
1. ✅ Monitor logs for "DATA INTEGRITY ISSUE" warnings
2. ✅ Verify no constraint violations in error logs
3. ✅ Test creating/editing questions in admin-bo

## Error Handling

### If Constraint Violation Occurs
When the database constraint is violated, you'll see:
```
org.springframework.dao.DataIntegrityViolationException: 
could not execute statement; SQL [n/a]; 
constraint [idx_question_options_single_correct]
```

**Resolution:**
1. Check the data being submitted
2. Ensure exactly one option has `is_correct = true`
3. Fix the data and retry

### If Validation Error Occurs
When Java validation fails, you'll see:
```
java.lang.IllegalArgumentException: 
SINGLE_CHOICE_IMAGE format requires exactly one correct answer. Found X correct answers.
```

**Resolution:**
1. Review the question options
2. Mark exactly one option as correct
3. Retry the import

## Benefits

### Defense in Depth
Multiple layers of protection:
1. **Database constraint** - Cannot be bypassed
2. **Java validation** - Clear error messages
3. **Defensive logging** - Visibility into issues

### Data Integrity
- Guarantees exactly one correct answer per question
- Prevents scoring errors
- Maintains system reliability

### Monitoring
- Log warnings help identify issues early
- Can proactively fix data problems
- Better operational visibility

## Related Changes
This is part of a larger effort to ensure single correct answer validation across the entire system:
- **Branch 1 (this):** Server-side fixes
- **Branch 2 (separate):** Admin-BO UI and API validation

## Questions?
Contact the development team for any questions or issues related to these changes.

