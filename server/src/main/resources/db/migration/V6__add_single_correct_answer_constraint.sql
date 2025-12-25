-- V6__add_single_correct_answer_constraint.sql
-- Add a unique partial index to enforce that only one option per question can be marked as correct
-- This prevents data integrity issues where multiple answers could be marked as correct

-- Create a unique partial index that allows only one is_correct=TRUE per question
-- The partial index (WHERE is_correct = TRUE) means it only indexes rows where is_correct is TRUE
-- This enforces that each question_id can appear at most once in the index, ensuring single correct answer
CREATE UNIQUE INDEX idx_question_options_single_correct 
ON question_options (question_id) 
WHERE is_correct = TRUE;

-- Add a comment to document the constraint
COMMENT ON INDEX idx_question_options_single_correct IS 
'Ensures that each question has exactly one correct answer by allowing only one is_correct=TRUE per question_id';

