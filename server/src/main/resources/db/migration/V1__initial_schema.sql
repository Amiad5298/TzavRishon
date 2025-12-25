-- V1__initial_schema.sql
-- Create tables for Tzav Rishon platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    avatar_url TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- Question types enum
CREATE TYPE question_type AS ENUM ('VERBAL_ANALOGY', 'SHAPE_ANALOGY', 'INSTRUCTIONS_DIRECTIONS', 'QUANTITATIVE');
CREATE TYPE question_format AS ENUM ('TEXT_INPUT', 'SINGLE_CHOICE_IMAGE');

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type question_type NOT NULL,
    format question_format NOT NULL,
    prompt_text TEXT,
    prompt_image_url TEXT,
    explanation TEXT,
    difficulty INTEGER NOT NULL DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

-- Question options (for multiple choice questions)
CREATE TABLE question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    text TEXT,
    image_url TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    option_order INTEGER NOT NULL
);

CREATE INDEX idx_question_options_question ON question_options(question_id);

-- Acceptable answers (for text input questions)
CREATE TABLE acceptable_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    numeric_tolerance DECIMAL(10, 4)
);

CREATE INDEX idx_acceptable_answers_question ON acceptable_answers(question_id);

-- Guest identities
CREATE TABLE guest_identities (
    guest_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recent questions cache (to avoid repeating questions)
CREATE TABLE recent_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guest_identities(guest_id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_type question_type NOT NULL,
    served_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_or_guest CHECK (
        (user_id IS NOT NULL AND guest_id IS NULL) OR 
        (user_id IS NULL AND guest_id IS NOT NULL)
    )
);

CREATE INDEX idx_recent_questions_user_type ON recent_questions(user_id, question_type);
CREATE INDEX idx_recent_questions_guest_type ON recent_questions(guest_id, question_type);
CREATE INDEX idx_recent_questions_served_at ON recent_questions(served_at);

-- Practice sessions
CREATE TABLE practice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guest_identities(guest_id) ON DELETE CASCADE,
    type question_type NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_practice_user_or_guest CHECK (
        (user_id IS NOT NULL AND guest_id IS NULL) OR 
        (user_id IS NULL AND guest_id IS NOT NULL)
    )
);

CREATE INDEX idx_practice_sessions_user ON practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_guest ON practice_sessions(guest_id);
CREATE INDEX idx_practice_sessions_type ON practice_sessions(type);

-- Practice answers
CREATE TABLE practice_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_answer_raw TEXT,
    selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
    is_correct BOOLEAN NOT NULL,
    time_ms INTEGER,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_practice_answers_session ON practice_answers(session_id);
CREATE INDEX idx_practice_answers_question ON practice_answers(question_id);

-- Exam attempts
CREATE TABLE exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_score_90 INTEGER
);

CREATE INDEX idx_exam_attempts_user ON exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_created ON exam_attempts(created_at);

-- Exam sections
CREATE TABLE exam_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    type question_type NOT NULL,
    order_index INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    locked BOOLEAN DEFAULT FALSE,
    score_section INTEGER DEFAULT 0
);

CREATE INDEX idx_exam_sections_attempt ON exam_sections(attempt_id);
CREATE INDEX idx_exam_sections_order ON exam_sections(attempt_id, order_index);

-- Exam answers
CREATE TABLE exam_answers (
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

CREATE INDEX idx_exam_answers_section ON exam_answers(section_id);
CREATE INDEX idx_exam_answers_question ON exam_answers(question_id);
CREATE INDEX idx_exam_answers_order ON exam_answers(section_id, order_index);

