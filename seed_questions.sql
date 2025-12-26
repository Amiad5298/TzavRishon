-- ============================================
-- Tzav Rishon - Sample Questions Seed Data
-- ============================================
-- Run this script manually in Neon SQL Editor to populate test questions
-- This will create sample questions for all 4 question types
-- ============================================

-- ============================================
-- VERBAL ANALOGY QUESTIONS (אנלוגיות מילוליות)
-- ============================================

-- Question 1: Easy Verbal Analogy
INSERT INTO questions (type, format, prompt_text, explanation, difficulty, is_exam_question)
VALUES ('VERBAL_ANALOGY', 'SINGLE_CHOICE_IMAGE', 
        'כלב : נביחה :: חתול : ?',
        'כלב משמיע נביחה, חתול משמיע מיאו. זהו קשר של בעל חיים לקול שהוא משמיע.',
        1, false)
RETURNING id AS verbal_q1_id;

-- Get the last inserted ID for options (you'll need to replace this UUID manually)
-- For now, let's use a variable approach that works in PostgreSQL

DO $$
DECLARE
    verbal_q1_id UUID;
    verbal_q2_id UUID;
    verbal_q3_id UUID;
    shape_q1_id UUID;
    shape_q2_id UUID;
    shape_q3_id UUID;
    quant_q1_id UUID;
    quant_q2_id UUID;
    quant_q3_id UUID;
    dir_q1_id UUID;
    dir_q2_id UUID;
    dir_q3_id UUID;
BEGIN

-- ============================================
-- VERBAL ANALOGY QUESTIONS
-- ============================================

-- Question 1: Easy Verbal Analogy
INSERT INTO questions (type, format, prompt_text, explanation, difficulty, is_exam_question)
VALUES ('VERBAL_ANALOGY', 'SINGLE_CHOICE_IMAGE', 
        'כלב : נביחה :: חתול : ?',
        'כלב משמיע נביחה, חתול משמיע מיאו. זהו קשר של בעל חיים לקול שהוא משמיע.',
        1, false)
RETURNING id INTO verbal_q1_id;

INSERT INTO question_options (question_id, text, is_correct, option_order)
VALUES 
    (verbal_q1_id, 'מיאו', true, 1),
    (verbal_q1_id, 'צפצוף', false, 2),
    (verbal_q1_id, 'נהימה', false, 3),
    (verbal_q1_id, 'שאגה', false, 4);

-- Question 2: Medium Verbal Analogy
INSERT INTO questions (type, format, prompt_text, explanation, difficulty, is_exam_question)
VALUES ('VERBAL_ANALOGY', 'SINGLE_CHOICE_IMAGE', 
        'רופא : חולה :: מורה : ?',
        'רופא מטפל בחולה, מורה מלמד תלמיד. זהו קשר של מקצוע למושא הטיפול.',
        2, false)
RETURNING id INTO verbal_q2_id;

INSERT INTO question_options (question_id, text, is_correct, option_order)
VALUES 
    (verbal_q2_id, 'תלמיד', true, 1),
    (verbal_q2_id, 'ספר', false, 2),
    (verbal_q2_id, 'כיתה', false, 3),
    (verbal_q2_id, 'לוח', false, 4);

-- Question 3: Hard Verbal Analogy
INSERT INTO questions (type, format, prompt_text, explanation, difficulty, is_exam_question)
VALUES ('VERBAL_ANALOGY', 'SINGLE_CHOICE_IMAGE', 
        'אופטימי : פסימי :: נדיב : ?',
        'אופטימי הוא ההפך מפסימי, נדיב הוא ההפך מקמצן. זהו קשר של ניגוד.',
        4, false)
RETURNING id INTO verbal_q3_id;

INSERT INTO question_options (question_id, text, is_correct, option_order)
VALUES 
    (verbal_q3_id, 'קמצן', true, 1),
    (verbal_q3_id, 'עשיר', false, 2),
    (verbal_q3_id, 'חכם', false, 3),
    (verbal_q3_id, 'אמיץ', false, 4);

-- ============================================
-- SHAPE ANALOGY QUESTIONS (אנלוגיות צורניות)
-- ============================================

-- Question 1: Easy Shape Pattern
INSERT INTO questions (type, format, prompt_text, explanation, difficulty, is_exam_question)
VALUES ('SHAPE_ANALOGY', 'SINGLE_CHOICE_IMAGE', 
        'מצא את הצורה החסרה בסדרה: ○ △ ○ △ ○ ?',
        'הדפוס חוזר על עצמו: עיגול, משולש, עיגול, משולש. הצורה הבאה היא עיגול.',
        1, false)
RETURNING id INTO shape_q1_id;

INSERT INTO question_options (question_id, text, is_correct, option_order)
VALUES 
    (shape_q1_id, '△', true, 1),
    (shape_q1_id, '○', false, 2),
    (shape_q1_id, '□', false, 3),
    (shape_q1_id, '◇', false, 4);

-- Question 2: Medium Shape Rotation
INSERT INTO questions (type, format, prompt_text, explanation, difficulty, is_exam_question)
VALUES ('SHAPE_ANALOGY', 'SINGLE_CHOICE_IMAGE', 
        'אם ↑ מסתובב 90° עם כיוון השעון, מה יהיה התוצאה?',
        'חץ שמצביע למעלה (↑) שמסתובב 90° עם כיוון השעון יצביע ימינה (→).',
        2, false)
RETURNING id INTO shape_q2_id;

INSERT INTO question_options (question_id, text, is_correct, option_order)
VALUES 
    (shape_q2_id, '→', true, 1),
    (shape_q2_id, '←', false, 2),
    (shape_q2_id, '↓', false, 3),
    (shape_q2_id, '↑', false, 4);

-- Question 3: Hard Shape Logic
INSERT INTO questions (type, format, prompt_text, explanation, difficulty, is_exam_question)
VALUES ('SHAPE_ANALOGY', 'SINGLE_CHOICE_IMAGE', 
        'בכל שורה, הצורה השלישית היא שילוב של שתי הראשונות. מה חסר? [●○] [■□] [?]',
        'הצורה השלישית משלבת את שתי הראשונות. ● ו-■ ביחד יוצרים ●■.',
        4, false)
RETURNING id INTO shape_q3_id;

INSERT INTO question_options (question_id, text, is_correct, option_order)
VALUES 
    (shape_q3_id, '●■', true, 1),
    (shape_q3_id, '○□', false, 2),
    (shape_q3_id, '●□', false, 3),
    (shape_q3_id, '○■', false, 4);

-- ============================================
-- QUANTITATIVE QUESTIONS (חשיבה כמותית)
-- ============================================

-- Question 1: Easy Math
INSERT INTO questions (type, format, prompt_text, explanation, difficulty, is_exam_question)
VALUES ('QUANTITATIVE', 'SINGLE_CHOICE_IMAGE', 
        'מה המספר הבא בסדרה? 2, 4, 6, 8, ?',
        'הסדרה עולה ב-2 כל פעם. 8 + 2 = 10.',
        1, false)
RETURNING id INTO quant_q1_id;

INSERT INTO question_options (question_id, text, is_correct, option_order)
VALUES
    (quant_q1_id, '10', true, 1),
    (quant_q1_id, '9', false, 2),
    (quant_q1_id, '12', false, 3),
    (quant_q1_id, '16', false, 4);

-- Question 2: Medium Math
INSERT INTO questions (type, format, prompt_text, explanation, difficulty, is_exam_question)
VALUES ('QUANTITATIVE', 'SINGLE_CHOICE_IMAGE',
        'אם 3x + 5 = 20, מה ערכו של x?',
        '3x + 5 = 20, לכן 3x = 15, ולכן x = 5.',
        3, false)
RETURNING id INTO quant_q2_id;

INSERT INTO question_options (question_id, text, is_correct, option_order)
VALUES
    (quant_q2_id, '5', true, 1),
    (quant_q2_id, '3', false, 2),
    (quant_q2_id, '15', false, 3),
    (quant_q2_id, '7', false, 4);

-- Question 3: Hard Math
INSERT INTO questions (type, format, prompt_text, explanation, difficulty, is_exam_question)
VALUES ('QUANTITATIVE', 'SINGLE_CHOICE_IMAGE',
        'מכולית נוסעת 60 ק"מ בשעה. כמה זמן ייקח לה לנסוע 150 ק"מ?',
        'מהירות = מרחק / זמן. זמן = מרחק / מהירות = 150 / 60 = 2.5 שעות.',
        4, false)
RETURNING id INTO quant_q3_id;

INSERT INTO question_options (question_id, text, is_correct, option_order)
VALUES
    (quant_q3_id, '2.5 שעות', true, 1),
    (quant_q3_id, '2 שעות', false, 2),
    (quant_q3_id, '3 שעות', false, 3),
    (quant_q3_id, '90 דקות', false, 4);

-- ============================================
-- INSTRUCTIONS & DIRECTIONS QUESTIONS (הוראות וכיוונים)
-- ============================================

-- Question 1: Easy Directions
INSERT INTO questions (type, format, prompt_text, explanation, difficulty, is_exam_question)
VALUES ('INSTRUCTIONS_DIRECTIONS', 'SINGLE_CHOICE_IMAGE',
        'אתה עומד מול צפון. אם תסתובב 90° ימינה, לאיזה כיוון תפנה?',
        'כשעומדים מול צפון ומסתובבים ימינה, פונים מזרחה.',
        1, false)
RETURNING id INTO dir_q1_id;

INSERT INTO question_options (question_id, text, is_correct, option_order)
VALUES
    (dir_q1_id, 'מזרח', true, 1),
    (dir_q1_id, 'מערב', false, 2),
    (dir_q1_id, 'דרום', false, 3),
    (dir_q1_id, 'צפון', false, 4);

-- Question 2: Medium Instructions
INSERT INTO questions (type, format, prompt_text, explanation, difficulty, is_exam_question)
VALUES ('INSTRUCTIONS_DIRECTIONS', 'SINGLE_CHOICE_IMAGE',
        'בצומת, השלט אומר: "פנה שמאלה לתל אביב, ימינה לירושלים, ישר לחיפה". אם אתה רוצה להגיע לירושלים, לאן תפנה?',
        'השלט מציין שירושלים נמצאת בפנייה ימינה.',
        2, false)
RETURNING id INTO dir_q2_id;

INSERT INTO question_options (question_id, text, is_correct, option_order)
VALUES
    (dir_q2_id, 'ימינה', true, 1),
    (dir_q2_id, 'שמאלה', false, 2),
    (dir_q2_id, 'ישר', false, 3),
    (dir_q2_id, 'אחורה', false, 4);

-- Question 3: Hard Multi-step Directions
INSERT INTO questions (type, format, prompt_text, explanation, difficulty, is_exam_question)
VALUES ('INSTRUCTIONS_DIRECTIONS', 'SINGLE_CHOICE_IMAGE',
        'התחל בנקודה A. לך 3 צעדים צפונה, 2 צעדים מזרחה, 3 צעדים דרומה, 2 צעדים מערבה. איפה אתה עכשיו?',
        '3 צפונה ו-3 דרומה מבטלים זה את זה. 2 מזרחה ו-2 מערבה מבטלים זה את זה. אתה חוזר לנקודה A.',
        4, false)
RETURNING id INTO dir_q3_id;

INSERT INTO question_options (question_id, text, is_correct, option_order)
VALUES
    (dir_q3_id, 'נקודה A (התחלה)', true, 1),
    (dir_q3_id, '3 צעדים צפונה מ-A', false, 2),
    (dir_q3_id, '2 צעדים מזרחה מ-A', false, 3),
    (dir_q3_id, '5 צעדים מ-A', false, 4);

-- ============================================
-- EXAM QUESTIONS (שאלות למבחן בלבד)
-- ============================================

-- Exam Question 1: Verbal Analogy
INSERT INTO questions (type, format, prompt_text, explanation, difficulty, is_exam_question)
VALUES ('VERBAL_ANALOGY', 'SINGLE_CHOICE_IMAGE',
        'ספר : קריאה :: מחשבון : ?',
        'ספר משמש לקריאה, מחשבון משמש לחישוב. זהו קשר של כלי לפעולה.',
        3, true)
RETURNING id INTO verbal_q1_id;

INSERT INTO question_options (question_id, text, is_correct, option_order)
VALUES
    (verbal_q1_id, 'חישוב', true, 1),
    (verbal_q1_id, 'כתיבה', false, 2),
    (verbal_q1_id, 'מספרים', false, 3),
    (verbal_q1_id, 'מתמטיקה', false, 4);

-- Exam Question 2: Quantitative
INSERT INTO questions (type, format, prompt_text, explanation, difficulty, is_exam_question)
VALUES ('QUANTITATIVE', 'SINGLE_CHOICE_IMAGE',
        'מה המספר הבא בסדרה? 1, 4, 9, 16, 25, ?',
        'הסדרה היא ריבועים: 1², 2², 3², 4², 5², 6² = 36.',
        3, true)
RETURNING id INTO quant_q1_id;

INSERT INTO question_options (question_id, text, is_correct, option_order)
VALUES
    (quant_q1_id, '36', true, 1),
    (quant_q1_id, '30', false, 2),
    (quant_q1_id, '32', false, 3),
    (quant_q1_id, '35', false, 4);

END $$;

-- ============================================
-- SUMMARY
-- ============================================
-- Total Questions Created: 14
--
-- Practice Questions (is_exam_question = false): 12
--   - VERBAL_ANALOGY: 3 questions (Easy, Medium, Hard)
--   - SHAPE_ANALOGY: 3 questions (Easy, Medium, Hard)
--   - QUANTITATIVE: 3 questions (Easy, Medium, Hard)
--   - INSTRUCTIONS_DIRECTIONS: 3 questions (Easy, Medium, Hard)
--
-- Exam Questions (is_exam_question = true): 2
--   - VERBAL_ANALOGY: 1 question (Medium)
--   - QUANTITATIVE: 1 question (Medium)
--
-- All questions use SINGLE_CHOICE_IMAGE format with 4 options each
-- Each question has exactly one correct answer
-- ============================================

