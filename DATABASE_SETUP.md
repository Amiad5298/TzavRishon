# 🗄️ Database Setup Guide

## Overview

The application uses a **single schema file** approach for database management. This is simpler and faster than migrations, but requires a clean database on first deployment.

## Database Schema

The complete database schema is defined in:
- **File**: `server/src/main/resources/schema.sql`
- **Auto-applied**: Yes, on application startup
- **Idempotent**: Yes, uses `CREATE TABLE IF NOT EXISTS`

## 🚀 First Time Setup (Production)

### Step 1: Reset Neon Database

1. **Go to Neon Console**
   - Visit: https://console.neon.tech
   - Select your project: `ep-divine-mouse-abe8cey6`

2. **Drop All Tables**
   - Click on **"SQL Editor"**
   - Run this script to clean the database:

```sql
-- Drop all tables (this will delete all data!)
DROP TABLE IF EXISTS exam_user_answers CASCADE;
DROP TABLE IF EXISTS exam_sections CASCADE;
DROP TABLE IF EXISTS exam_attempts CASCADE;
DROP TABLE IF EXISTS practice_user_answers CASCADE;
DROP TABLE IF EXISTS practice_sessions CASCADE;
DROP TABLE IF EXISTS recent_questions CASCADE;
DROP TABLE IF EXISTS question_options CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS guest_identities CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS flyway_schema_history CASCADE;

-- Drop extensions if needed
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
```

3. **Verify Clean State**
```sql
-- Should return no tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Step 2: Deploy on Render

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Find your `tzavrishon-server` service

2. **Trigger Deployment**
   - Click **"Manual Deploy"**
   - Select **"Clear build cache & deploy"**
   - Wait for build to complete (5-10 minutes)

3. **Monitor Logs**
   - Watch for: `Executing SQL script from URL [classpath:schema.sql]`
   - Should see: `Started TzavRishonApplication in X.XXX seconds`

### Step 3: Verify Success

1. **Check Health Endpoint**
```bash
curl https://your-backend-url.onrender.com/actuator/health
```

Expected response:
```json
{"status":"UP"}
```

2. **Verify Tables Created**
   - Go back to Neon SQL Editor
   - Run:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- `exam_attempts`
- `exam_sections`
- `exam_user_answers`
- `guest_identities`
- `practice_sessions`
- `practice_user_answers`
- `question_options`
- `questions`
- `recent_questions`
- `users`

## 📝 Schema Details

### Key Tables

- **users**: Registered users with Google OAuth
- **guest_identities**: Anonymous guest users
- **questions**: Question bank (practice + exam questions)
- **question_options**: Multiple choice options
- **practice_sessions**: Practice session tracking
- **practice_user_answers**: Answers during practice
- **exam_attempts**: Full exam attempts
- **exam_sections**: Sections within exams
- **exam_user_answers**: Answers during exams

### Important Features

- ✅ **UUID primary keys** for all tables
- ✅ **Cascade deletes** for related data
- ✅ **Indexes** on frequently queried columns
- ✅ **Unique constraint** ensuring one correct answer per question
- ✅ **Check constraints** for data validation
- ✅ **Comments** on tables and columns for documentation

## 🔄 Future Updates

When you need to change the schema:

1. **Update** `server/src/main/resources/schema.sql`
2. **Reset database** (drop all tables)
3. **Redeploy** application
4. Schema will be recreated automatically

**Note**: This approach is simple but **destroys all data** on schema changes. For production with real users, you would need a migration strategy.

## 🆘 Troubleshooting

### "Table already exists" Error

The schema uses `CREATE TABLE IF NOT EXISTS`, so this shouldn't happen. If it does:
- The database wasn't properly cleaned
- Run the drop script again

### "Relation does not exist" Error

- Schema wasn't applied
- Check application logs for SQL errors
- Verify `spring.sql.init.mode=always` in application.yml

### Application Won't Start

1. Check Render logs for specific errors
2. Verify database connection (DATABASE_URL, USERNAME, PASSWORD)
3. Ensure Neon database is accessible
4. Check that schema.sql file exists in the JAR

## ✅ Success Checklist

- [ ] Database cleaned (all tables dropped)
- [ ] Application deployed successfully
- [ ] Health endpoint returns UP
- [ ] All 10 tables created in database
- [ ] No errors in application logs

---

**That's it!** Your database is now set up with a clean, simple schema. 🎉

