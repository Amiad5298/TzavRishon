# Environment Variables Template

This file documents all environment variables needed for the Tzav Rishon application.

## 🔧 Setup Instructions

1. **Create `.env` file** in the project root
2. **Copy the template** below and update with your actual values
3. **Never commit** `.env` to git (it's in `.gitignore`)

---

## 📋 Environment Variables Template

```env
# ===== DATABASE CONFIGURATION =====
# Neon Cloud Database (Production)
DATABASE_URL=jdbc:postgresql://your-neon-host.region.aws.neon.tech/neondb?sslmode=require
DATABASE_USERNAME=your-neon-username
DATABASE_PASSWORD=your-neon-password

# Local PostgreSQL (Development - comment out when using Neon)
# DATABASE_URL=jdbc:postgresql://db:5432/tzav
# DATABASE_USERNAME=tzav
# DATABASE_PASSWORD=tzav

# ===== JWT AUTHENTICATION =====
# Generate: openssl rand -base64 64
# CRITICAL: Use unique secret per environment
JWT_SECRET=your-production-jwt-secret-min-64-characters

# ===== GOOGLE OAUTH 2.0 =====
# Get from: https://console.cloud.google.com/
OAUTH_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
OAUTH_GOOGLE_CLIENT_SECRET=your-client-secret
OAUTH_GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google

# ===== APPLICATION SETTINGS =====
APP_FRONTEND_URL=http://localhost:3000

# ===== GUEST USER LIMITS =====
APP_GUEST_PRACTICE_LIMIT_PER_TYPE=5

# ===== EXAM CONFIGURATION =====
APP_SECTION_COUNTS=VERBAL_ANALOGY:10,SHAPE_ANALOGY:10,INSTRUCTIONS_DIRECTIONS:10,QUANTITATIVE:10

# Development (1 min per section for testing):
# APP_SECTION_DURATIONS_SEC=VERBAL_ANALOGY:60,SHAPE_ANALOGY:60,INSTRUCTIONS_DIRECTIONS:60,QUANTITATIVE:60

# Production (actual exam timers):
APP_SECTION_DURATIONS_SEC=VERBAL_ANALOGY:480,SHAPE_ANALOGY:480,INSTRUCTIONS_DIRECTIONS:360,QUANTITATIVE:600

# ===== GOOGLE ADSENSE (OPTIONAL) =====
ADSENSE_ENABLED=false
ADSENSE_CLIENT=

# ===== FRONTEND ENVIRONMENT =====
VITE_API_BASE=http://localhost:8080/api/v1
VITE_ADSENSE_ENABLED=false
```

---

## 🌍 Environment-Specific Settings

### **Local Development**

```env
DATABASE_URL=jdbc:postgresql://db:5432/tzav
APP_FRONTEND_URL=http://localhost:3000
VITE_API_BASE=http://localhost:8080/api/v1
APP_SECTION_DURATIONS_SEC=VERBAL_ANALOGY:60,SHAPE_ANALOGY:60,INSTRUCTIONS_DIRECTIONS:60,QUANTITATIVE:60
```

### **Production (Neon + Railway/Render)**

```env
DATABASE_URL=jdbc:postgresql://ep-divine-mouse-abe8cey6-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
DATABASE_USERNAME=neondb_owner
DATABASE_PASSWORD=npg_cm7lIzA0pfxH
APP_FRONTEND_URL=https://your-domain.com
VITE_API_BASE=https://your-domain.com/api/v1
OAUTH_GOOGLE_REDIRECT_URI=https://your-domain.com/login/oauth2/code/google
APP_SECTION_DURATIONS_SEC=VERBAL_ANALOGY:480,SHAPE_ANALOGY:480,INSTRUCTIONS_DIRECTIONS:360,QUANTITATIVE:600
```

---

## 🔐 Security Notes

1. **JWT_SECRET**: Generate with `openssl rand -base64 64`, use unique values per environment
2. **Database Password**: Use Neon's auto-generated password, never share
3. **OAuth Credentials**: Different credentials for dev/prod environments
4. **.env file**: Never commit to git, use `.env.example` for templates
5. **Production Secrets**: Use platform secret management (Railway Secrets, Render Env Groups, etc.)

---

## ✅ Verification

After setting up `.env`, verify:

```bash
# Check environment is loaded
docker-compose config

# Start application
docker-compose up -d

# Check logs for successful connection
docker logs tzav-rishon-server | grep "Started TzavRishonApplication"
```

---

## 📝 Current Configuration

Your app is currently configured for:
- ✅ **Database**: Neon Cloud PostgreSQL (ep-divine-mouse-abe8cey6-pooler.eu-west-2.aws.neon.tech)
- ✅ **JWT Secret**: Generated secure 64-character secret
- ✅ **Exam Timers**: Production values (8/8/6/10 minutes)
- ⚠️ **OAuth**: Update with your Google OAuth credentials

---

## 🚀 Next Steps

1. Update `OAUTH_GOOGLE_CLIENT_ID` and `OAUTH_GOOGLE_CLIENT_SECRET` in your `.env`
2. Restart the application: `docker-compose up -d`
3. Test login functionality
4. Ready for deployment!

