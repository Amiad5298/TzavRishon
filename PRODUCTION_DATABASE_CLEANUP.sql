-- ============================================
-- PRODUCTION DATABASE CLEANUP SCRIPT
-- ============================================
-- This script prepares the production database for the new migrations V5-V9
-- Run this in the Neon SQL Editor BEFORE redeploying on Render
--
-- What this script does:
-- 1. Checks current Flyway migration history
-- 2. Removes any V5 entry if it exists (from previous manual application)
-- 3. Verifies database schema state
-- 4. Ensures all prerequisites for V5-V9 migrations are met
-- ============================================

-- Step 1: Check current Flyway migration history
SELECT 
    version,
    description,
    type,
    script,
    installed_on,
    success
FROM flyway_schema_history 
ORDER BY installed_rank;

-- Expected output: Should show V1, V2, V3, V4 (and possibly V5 if manually applied)

-- Step 2: Remove V5 from Flyway history if it exists
-- This allows Flyway to apply the new V5 migration file
DELETE FROM flyway_schema_history 
WHERE version = '5';

-- Step 3: Verify the deletion
SELECT 
    version,
    description
FROM flyway_schema_history 
ORDER BY installed_rank;

-- Expected output: Should show only V1, V2, V3, V4

-- Step 4: Verify database schema state
-- Check if is_exam_question column exists (it should from previous manual application)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'questions' 
AND column_name = 'is_exam_question';

-- Expected output: Should show the column exists with type 'boolean', NOT NULL, default false

-- Step 5: Verify table names are correct (should be OLD names before V8/V9 migrations)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('practice_answers', 'practice_user_answers', 'exam_answers', 'exam_user_answers')
ORDER BY table_name;

-- Expected output: Should show 'practice_answers' and 'exam_answers' (OLD names)
-- If you see 'practice_user_answers' or 'exam_user_answers', the migrations were already applied

-- Step 6: Check if acceptable_answers table exists (should exist before V7 migration)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'acceptable_answers';

-- Expected output: Should show 'acceptable_answers' table exists

-- Step 7: Check if single correct answer constraint exists (should NOT exist before V6)
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'question_options' 
AND indexname = 'idx_question_options_single_correct';

-- Expected output: Should be empty (no rows) - constraint will be added by V6 migration

-- ============================================
-- SUMMARY OF EXPECTED STATE BEFORE DEPLOYMENT:
-- ============================================
-- ✅ Flyway history: V1, V2, V3, V4 only (V5 removed)
-- ✅ is_exam_question column: EXISTS (from previous manual application)
-- ✅ Tables: practice_answers, exam_answers (OLD names)
-- ✅ acceptable_answers table: EXISTS
-- ✅ Single correct answer constraint: DOES NOT EXIST
--
-- After this cleanup, Render deployment will:
-- 1. Apply V5 migration (will skip column creation since it exists)
-- 2. Apply V6 migration (add single correct answer constraint)
-- 3. Apply V7 migration (drop acceptable_answers table)
-- 4. Apply V8 migration (rename practice_answers → practice_user_answers)
-- 5. Apply V9 migration (rename exam_answers → exam_user_answers)
-- ============================================

-- Step 8: Final verification query
-- This shows the complete state of the database
SELECT 
    'Flyway Migrations' as check_type,
    COUNT(*) as count,
    STRING_AGG(version, ', ' ORDER BY version) as details
FROM flyway_schema_history
UNION ALL
SELECT 
    'Questions with is_exam_question',
    COUNT(*),
    CONCAT(SUM(CASE WHEN is_exam_question THEN 1 ELSE 0 END), ' exam, ', 
           SUM(CASE WHEN NOT is_exam_question THEN 1 ELSE 0 END), ' practice')
FROM questions
UNION ALL
SELECT 
    'Tables (old names)',
    COUNT(*),
    STRING_AGG(table_name, ', ')
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('practice_answers', 'exam_answers')
UNION ALL
SELECT 
    'acceptable_answers table',
    COUNT(*),
    CASE WHEN COUNT(*) > 0 THEN 'EXISTS' ELSE 'DOES NOT EXIST' END
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'acceptable_answers';

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. Run this script in Neon SQL Editor
-- 2. Review the output of each query
-- 3. If everything looks correct, proceed to Render deployment
-- 4. Render will automatically apply V5-V9 migrations on startup
-- 5. Monitor Render logs for successful migration application
-- ============================================

