-- V5__add_is_exam_question_column.sql
-- Add is_exam_question column to questions table
-- This column distinguishes between practice questions and exam-only questions
-- This migration is idempotent - it checks if the column exists before adding it

-- Add the column with default value false (practice questions)
-- Use DO block to make it idempotent
DO $$
BEGIN
    -- Check if column already exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'questions'
        AND column_name = 'is_exam_question'
    ) THEN
        ALTER TABLE questions ADD COLUMN is_exam_question BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Add index for query performance (IF NOT EXISTS is supported in PostgreSQL 9.5+)
CREATE INDEX IF NOT EXISTS idx_questions_is_exam_question ON questions(is_exam_question);

-- Add a comment to the column for documentation
COMMENT ON COLUMN questions.is_exam_question IS 'If true, question is reserved for exams only. If false, question is for practice sessions only.';

