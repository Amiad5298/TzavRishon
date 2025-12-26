-- V7__drop_acceptable_answers_table.sql
-- Drop the obsolete acceptable_answers table
-- This table was used for TEXT_INPUT questions, but all questions were converted
-- to SINGLE_CHOICE_IMAGE format in V4 migration, making this table obsolete.

-- Drop the index first (if it exists)
DROP INDEX IF EXISTS idx_acceptable_answers_question;

-- Drop the table
DROP TABLE IF EXISTS acceptable_answers;

-- Add comment to document the change
COMMENT ON SCHEMA public IS 'Removed acceptable_answers table in V7 - obsolete after TEXT_INPUT to SINGLE_CHOICE_IMAGE conversion';

