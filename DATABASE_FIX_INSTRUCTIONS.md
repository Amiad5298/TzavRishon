# Database Fix Instructions for Render Deployment

## 🎯 Problem
The V5 migration was applied locally but not committed to Git. This caused Flyway validation errors on Render deployment.

## ✅ Solution
We've removed the V5 migration file from Git and will apply the changes directly to the Neon database.

---

## 📋 Step-by-Step Instructions

### **Step 1: Access Neon Database Console**

1. Go to https://console.neon.tech
2. Log in to your account
3. Select your project: `ep-divine-mouse-abe8cey6`
4. Click on **"SQL Editor"** in the left sidebar

### **Step 2: Run the Database Fix Script**

Copy and paste the contents of `fix_neon_database.sql` into the SQL Editor and execute:

```sql
-- Check if column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'questions' 
        AND column_name = 'is_exam_question'
    ) THEN
        -- Add the column with default value false (practice questions)
        ALTER TABLE questions ADD COLUMN is_exam_question BOOLEAN NOT NULL DEFAULT false;
        
        -- Add index for query performance
        CREATE INDEX idx_questions_is_exam_question ON questions(is_exam_question);
        
        -- Add a comment to the column for documentation
        COMMENT ON COLUMN questions.is_exam_question IS 'If true, question is reserved for exams only. If false, question is for practice sessions only.';
        
        RAISE NOTICE 'Column is_exam_question added successfully';
    ELSE
        RAISE NOTICE 'Column is_exam_question already exists';
    END IF;
END $$;

-- Split existing questions 50/50 between practice and exam pools
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
    WHERE rn <= total_per_type / 2
)
UPDATE questions
SET is_exam_question = true
WHERE id IN (SELECT id FROM exam_questions)
AND is_exam_question = false;

-- Verify the update
SELECT 
    type,
    is_exam_question,
    COUNT(*) as count
FROM questions
GROUP BY type, is_exam_question
ORDER BY type, is_exam_question;
```

**Expected Output:**
- You should see a message: "Column is_exam_question added successfully" (or "already exists")
- A table showing the distribution of questions by type and exam status

### **Step 3: Clean Up Flyway History**

Copy and paste the contents of `cleanup_flyway_history.sql` into the SQL Editor and execute:

```sql
-- Check current Flyway history
SELECT * FROM flyway_schema_history ORDER BY installed_rank;

-- Delete V5 migration record if it exists
DELETE FROM flyway_schema_history 
WHERE version = '5';

-- Verify deletion
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

**Expected Output:**
- First query shows all migrations (including V5 if it exists)
- After deletion, only V1, V2, V3, V4 should remain

### **Step 4: Redeploy on Render**

1. Go to https://dashboard.render.com
2. Find your `tzavrishon-server` service
3. Click **"Manual Deploy"** → **"Clear build cache & deploy"**
4. Wait for the build to complete (~5-10 minutes)

---

## ✅ Verification

Once deployed, check the logs in Render:

### **Success Indicators:**
```
✅ Flyway migrations: V1, V2, V3, V4 validated successfully
✅ Hibernate schema validation passed
✅ Started TzavRishonApplication in X.XXX seconds
```

### **Test the API:**
```bash
curl https://your-backend-url.onrender.com/actuator/health
```

Expected response:
```json
{"status":"UP"}
```

---

## 🔍 What Changed

### **Before:**
- V5 migration file existed locally
- Neon database had V5 applied
- Git didn't have V5 (blocked by .gitignore)
- Render couldn't find V5 → Flyway validation failed

### **After:**
- V5 migration file removed from codebase
- Database has `is_exam_question` column (applied manually)
- Flyway history cleaned (no V5 record)
- Render deployment will succeed with V1-V4 only

---

## 📝 Notes

- The `is_exam_question` column is now in the database
- The Question entity in Java already has the field
- No code changes needed
- Future migrations will start from V6 if needed

---

## 🆘 Troubleshooting

### **If column already exists:**
The script is idempotent - it checks before adding. Safe to run multiple times.

### **If Flyway still fails:**
1. Check Flyway history: `SELECT * FROM flyway_schema_history;`
2. Ensure V5 is deleted
3. Clear Render build cache and redeploy

### **If you need to rollback:**
```sql
-- Remove the column
ALTER TABLE questions DROP COLUMN IF EXISTS is_exam_question;
DROP INDEX IF EXISTS idx_questions_is_exam_question;
```

---

## ✨ Summary

1. ✅ Run `fix_neon_database.sql` in Neon console
2. ✅ Run `cleanup_flyway_history.sql` in Neon console
3. ✅ Redeploy on Render with "Clear build cache"
4. ✅ Verify deployment success

That's it! Your backend should now deploy successfully. 🎉

