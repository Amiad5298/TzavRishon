-- Convert question_type enum columns to VARCHAR for better compatibility with JPA

-- Update questions table
ALTER TABLE questions
  ALTER COLUMN type TYPE VARCHAR(50) USING type::varchar;

-- Update practice_sessions table
ALTER TABLE practice_sessions 
  ALTER COLUMN type TYPE VARCHAR(50) USING type::varchar;

-- Update exam_sections table (column is "type" not "question_type")
ALTER TABLE exam_sections
  ALTER COLUMN type TYPE VARCHAR(50) USING type::varchar;

-- Update recent_questions table (column is "question_type")
ALTER TABLE recent_questions
  ALTER COLUMN question_type TYPE VARCHAR(50) USING question_type::varchar;

-- Drop the enum type (it's no longer needed)
DROP TYPE IF EXISTS question_type;

