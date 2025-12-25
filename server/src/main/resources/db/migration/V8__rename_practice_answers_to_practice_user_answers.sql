-- V8__rename_practice_answers_to_practice_user_answers.sql
-- Rename practice_answers table to practice_user_answers for clarity
-- The new name makes it clear that this table stores USER answers, not correct answers

-- Rename the table
ALTER TABLE practice_answers RENAME TO practice_user_answers;

-- Rename the indexes
ALTER INDEX idx_practice_answers_session RENAME TO idx_practice_user_answers_session;
ALTER INDEX idx_practice_answers_question RENAME TO idx_practice_user_answers_question;

-- Add comment to document the purpose
COMMENT ON TABLE practice_user_answers IS 'Stores user answers submitted during practice sessions';

