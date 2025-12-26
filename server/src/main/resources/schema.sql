-- ============================================
-- Tzav Rishon Database Schema
-- ============================================
-- Complete database schema for the Tzav Rishon platform
-- This file creates all tables, indexes, and constraints
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    avatar_url TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Guest identities
CREATE TABLE IF NOT EXISTS guest_identities (
    guest_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- QUESTIONS & OPTIONS
-- ============================================

-- Questions table (using VARCHAR instead of ENUM for JPA compatibility)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    format VARCHAR(50) NOT NULL,
    prompt_text TEXT,
    prompt_image_url TEXT,
    explanation TEXT,
    difficulty INTEGER NOT NULL DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
    is_exam_question BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_is_exam_question ON questions(is_exam_question);

-- Question options (for multiple choice questions)
CREATE TABLE IF NOT EXISTS question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    text TEXT,
    image_url TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    option_order INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_question_options_question ON question_options(question_id);

-- Unique constraint: only one correct answer per question
CREATE UNIQUE INDEX IF NOT EXISTS idx_question_options_single_correct 
ON question_options (question_id) 
WHERE is_correct = TRUE;

-- ============================================
-- PRACTICE SESSIONS
-- ============================================

-- Recent questions cache (to avoid repeating questions)
CREATE TABLE IF NOT EXISTS recent_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guest_identities(guest_id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_type VARCHAR(50) NOT NULL,
    served_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_or_guest CHECK (
        (user_id IS NOT NULL AND guest_id IS NULL) OR 
        (user_id IS NULL AND guest_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_recent_questions_user_type ON recent_questions(user_id, question_type);
CREATE INDEX IF NOT EXISTS idx_recent_questions_guest_type ON recent_questions(guest_id, question_type);
CREATE INDEX IF NOT EXISTS idx_recent_questions_served_at ON recent_questions(served_at);

-- Practice sessions
CREATE TABLE IF NOT EXISTS practice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guest_identities(guest_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_practice_user_or_guest CHECK (
        (user_id IS NOT NULL AND guest_id IS NULL) OR 
        (user_id IS NULL AND guest_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_guest ON practice_sessions(guest_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_type ON practice_sessions(type);

-- Practice user answers (renamed from practice_answers)
CREATE TABLE IF NOT EXISTS practice_user_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_answer_raw TEXT,
    selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
    is_correct BOOLEAN NOT NULL,
    time_ms INTEGER,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_practice_user_answers_session ON practice_user_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_practice_user_answers_question ON practice_user_answers(question_id);

-- ============================================
-- EXAM ATTEMPTS
-- ============================================

-- Exam attempts
CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_score_90 INTEGER
);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_user ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_created ON exam_attempts(created_at);

-- Exam sections
CREATE TABLE IF NOT EXISTS exam_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    order_index INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    locked BOOLEAN DEFAULT FALSE,
    score_section INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_exam_sections_attempt ON exam_sections(attempt_id);
CREATE INDEX IF NOT EXISTS idx_exam_sections_order ON exam_sections(attempt_id, order_index);

-- Exam user answers (renamed from exam_answers)
CREATE TABLE IF NOT EXISTS exam_user_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES exam_sections(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_answer_raw TEXT,
    selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
    is_correct BOOLEAN NOT NULL,
    time_ms INTEGER,
    order_index INTEGER NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exam_user_answers_section ON exam_user_answers(section_id);
CREATE INDEX IF NOT EXISTS idx_exam_user_answers_question ON exam_user_answers(question_id);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Registered users with Google OAuth authentication';
COMMENT ON TABLE guest_identities IS 'Anonymous guest users for limited practice sessions';
COMMENT ON TABLE questions IS 'Question bank for practice and exams';
COMMENT ON TABLE question_options IS 'Multiple choice options for questions';
COMMENT ON TABLE recent_questions IS 'Cache of recently served questions to avoid repetition';
COMMENT ON TABLE practice_sessions IS 'Practice session tracking for users and guests';
COMMENT ON TABLE practice_user_answers IS 'User answers submitted during practice sessions';
COMMENT ON TABLE exam_attempts IS 'Full exam attempts by registered users';
COMMENT ON TABLE exam_sections IS 'Individual sections within an exam attempt';
COMMENT ON TABLE exam_user_answers IS 'User answers submitted during exam attempts';

COMMENT ON COLUMN questions.is_exam_question IS 'If true, question is reserved for exams only. If false, question is for practice sessions only';
COMMENT ON INDEX idx_question_options_single_correct IS 'Ensures that each question has exactly one correct answer';

