-- V9__rename_exam_answers_to_exam_user_answers.sql
-- Rename exam_answers table to exam_user_answers for clarity
-- The new name makes it clear that this table stores USER answers, not correct answers

-- Rename the table
ALTER TABLE exam_answers RENAME TO exam_user_answers;

-- Rename the indexes
ALTER INDEX idx_exam_answers_section RENAME TO idx_exam_user_answers_section;
ALTER INDEX idx_exam_answers_question RENAME TO idx_exam_user_answers_question;

-- Add comment to document the purpose
COMMENT ON TABLE exam_user_answers IS 'Stores user answers submitted during exam attempts';

