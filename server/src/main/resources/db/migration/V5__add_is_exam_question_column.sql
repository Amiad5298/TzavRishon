-- Add is_exam_question column to questions table
-- This separates questions into two pools: practice (false) and exam (true)

-- Add the column with default value false (practice questions)
ALTER TABLE questions ADD COLUMN is_exam_question BOOLEAN NOT NULL DEFAULT false;

-- Add index for query performance
CREATE INDEX idx_questions_is_exam_question ON questions(is_exam_question);

-- Split existing questions 50/50 between practice and exam pools
-- We'll use a deterministic approach based on row number within each question type
-- to ensure even distribution across all question types

-- Create a temporary table to hold the question IDs that should become exam questions
WITH ranked_questions AS (
    SELECT 
        id,
        type,
        ROW_NUMBER() OVER (PARTITION BY type ORDER BY created_at, id) as rn,
        COUNT(*) OVER (PARTITION BY type) as total_per_type
    FROM questions
),
exam_questions AS (
    SELECT id
    FROM ranked_questions
    WHERE rn <= total_per_type / 2  -- First half of each type becomes exam questions
)
UPDATE questions
SET is_exam_question = true
WHERE id IN (SELECT id FROM exam_questions);

-- Add a comment to the column for documentation
COMMENT ON COLUMN questions.is_exam_question IS 'If true, question is reserved for exams only. If false, question is for practice sessions only.';

