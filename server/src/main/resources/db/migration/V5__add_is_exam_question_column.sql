-- V5__add_is_exam_question_column.sql
-- Add is_exam_question column to questions table
-- This column distinguishes between practice questions and exam-only questions

-- Add the column with default value false (practice questions)
ALTER TABLE questions ADD COLUMN is_exam_question BOOLEAN NOT NULL DEFAULT false;

-- Add index for query performance
CREATE INDEX idx_questions_is_exam_question ON questions(is_exam_question);

-- Add a comment to the column for documentation
COMMENT ON COLUMN questions.is_exam_question IS 'If true, question is reserved for exams only. If false, question is for practice sessions only.';

