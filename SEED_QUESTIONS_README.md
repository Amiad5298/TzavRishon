# 📝 Seed Questions Script

## Overview

This script populates your database with **14 sample questions** to test your website functionality. It includes questions for all 4 question types used in the Tzav Rishon platform.

## 📊 What's Included

### Practice Questions (12 total)
Questions available for practice sessions (guests and authenticated users):

| Type | Hebrew Name | Count | Difficulty Levels |
|------|-------------|-------|-------------------|
| **VERBAL_ANALOGY** | אנלוגיות מילוליות | 3 | Easy, Medium, Hard |
| **SHAPE_ANALOGY** | אנלוגיות צורניות | 3 | Easy, Medium, Hard |
| **QUANTITATIVE** | חשיבה כמותית | 3 | Easy, Medium, Hard |
| **INSTRUCTIONS_DIRECTIONS** | הוראות וכיוונים | 3 | Easy, Medium, Hard |

### Exam Questions (2 total)
Questions reserved for full exam attempts (authenticated users only):

- **VERBAL_ANALOGY**: 1 question (Medium)
- **QUANTITATIVE**: 1 question (Medium)

## 🚀 How to Run

### Step 1: Open Neon SQL Editor

1. Go to https://console.neon.tech
2. Select your project: `ep-divine-mouse-abe8cey6`
3. Click **"SQL Editor"**

### Step 2: Copy and Paste the Script

1. Open the file: `seed_questions.sql`
2. Copy the **entire contents** of the file
3. Paste it into the Neon SQL Editor

### Step 3: Execute

1. Click **"Run"** button
2. Wait for execution to complete (should take ~2 seconds)
3. You should see: `Query returned successfully`

### Step 4: Verify

Run this query to check the questions were created:

```sql
-- Count questions by type and exam status
SELECT 
    type,
    is_exam_question,
    COUNT(*) as count
FROM questions
GROUP BY type, is_exam_question
ORDER BY type, is_exam_question;
```

Expected result:
```
INSTRUCTIONS_DIRECTIONS | false | 3
QUANTITATIVE           | false | 3
QUANTITATIVE           | true  | 1
SHAPE_ANALOGY          | false | 3
VERBAL_ANALOGY         | false | 3
VERBAL_ANALOGY         | true  | 1
```

## ✅ Testing Your Website

After running the script, you can test:

### 1. **Practice Mode** (Guest or Authenticated)
- Go to your website
- Select any question type
- You should see 3 questions for each type
- Each question has 4 multiple choice options

### 2. **Exam Mode** (Authenticated Only)
- Login with Google
- Start a full exam
- You should see 2 exam questions (1 verbal, 1 quantitative)

## 📋 Sample Questions Preview

### Verbal Analogy Example
**Question:** כלב : נביחה :: חתול : ?
- ✅ מיאו
- ❌ צפצוף
- ❌ נהימה
- ❌ שאגה

### Quantitative Example
**Question:** מה המספר הבא בסדרה? 2, 4, 6, 8, ?
- ✅ 10
- ❌ 9
- ❌ 12
- ❌ 16

### Shape Analogy Example
**Question:** מצא את הצורה החסרה בסדרה: ○ △ ○ △ ○ ?
- ✅ △
- ❌ ○
- ❌ □
- ❌ ◇

### Instructions & Directions Example
**Question:** אתה עומד מול צפון. אם תסתובב 90° ימינה, לאיזה כיוון תפנה?
- ✅ מזרח
- ❌ מערב
- ❌ דרום
- ❌ צפון

## 🔄 Re-running the Script

The script is **idempotent** - you can run it multiple times safely. Each run will create **new questions** (it doesn't check for duplicates).

If you want to start fresh:

```sql
-- Delete all questions and their options
DELETE FROM question_options;
DELETE FROM questions;
```

Then run the seed script again.

## 🎯 Next Steps

1. **Run the seed script** in Neon
2. **Deploy your application** (if not already deployed)
3. **Test practice mode** with different question types
4. **Test exam mode** (requires login)
5. **Add more questions** as needed using the admin panel

## 📝 Notes

- All questions are in **Hebrew** (right-to-left)
- All questions use **SINGLE_CHOICE_IMAGE** format
- Each question has **exactly one correct answer**
- Questions include **explanations** for learning
- Difficulty ranges from **1 (Easy) to 5 (Very Hard)**

---

**Happy Testing!** 🎉

