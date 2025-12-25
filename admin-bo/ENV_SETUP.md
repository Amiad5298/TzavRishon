# Environment Variables Setup Guide

Quick reference for setting up environment variables for the Admin Back Office.

---

## Required Environment Variables

### 1. Database Connection

```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

**Example with Neon Database:**
```env
DATABASE_URL=postgresql://neondb_owner:npg_cm7lIzA0pfxH@ep-divine-mouse-abe8cey6-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

**Format Breakdown:**
- `postgresql://` - Protocol
- `user:password` - Database credentials
- `@host:5432` - Database host and port
- `/database` - Database name
- `?sslmode=require` - SSL mode (required for Neon and most cloud databases)

---

### 2. Admin Authentication

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here
```

**Security Tips:**
- Use a strong password (min 12 characters)
- Include uppercase, lowercase, numbers, and symbols
- Don't use common passwords
- Don't reuse passwords from other services

**Generate a secure password:**
```bash
# Linux/Mac
openssl rand -base64 16

# Or use a password manager
```

---

### 3. Session Security

```env
AUTH_SECRET=your-random-secret-key-here
```

**Generate a secure secret:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Important:**
- Must be unique for each deployment
- Never share or commit to version control
- Keep it secret and secure

---

### 4. Node Environment

```env
NODE_ENV=production
```

**Always set to `production` for Render deployment.**

---

## Complete Example for Render

Copy this template and fill in your values:

```env
# Database Connection (use your actual database URL)
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST.neon.tech/neondb?sslmode=require

# Admin Authentication (change these!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=MySecurePassword123!

# Session Security (generate a new one!)
AUTH_SECRET=Kx9mP2vN8qR5tY7wZ3bC6fH1jL4nM0pS

# Node Environment
NODE_ENV=production
```

---

## Local Development (.env.local)

For local development, create a `.env.local` file:

```env
# Database Connection (can use same as production or local PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/tzavrishon

# Admin Authentication (use simple values for dev)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Session Security (any value for dev)
AUTH_SECRET=dev-secret-key

# Node Environment
NODE_ENV=development
```

**Note:** Never commit `.env.local` to version control!

---

## Setting Variables in Render

### Via Dashboard

1. Go to your service in Render dashboard
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Enter key and value
5. Click **"Save Changes"**

### Via render.yaml (Optional)

Create a `render.yaml` file in the `admin-bo` directory:

```yaml
services:
  - type: web
    name: tzavrishon-admin-bo
    env: docker
    dockerfilePath: ./Dockerfile
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false  # Set manually in dashboard for security
      - key: ADMIN_USERNAME
        sync: false
      - key: ADMIN_PASSWORD
        sync: false
      - key: AUTH_SECRET
        sync: false
```

---

## Troubleshooting

### "Unauthorized" on all pages
- Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set correctly
- Verify `AUTH_SECRET` is set
- Clear browser cookies and try again

### Database connection errors
- Verify `DATABASE_URL` format is correct
- Ensure `?sslmode=require` is included
- Check database credentials are valid
- Verify database host is accessible from Render

### Login works but no data shows
- Database connection is working but queries may be failing
- Check Render logs for SQL errors
- Verify database has data in tables
- Ensure database user has SELECT permissions

---

## Security Checklist

- [ ] Strong admin password (12+ characters)
- [ ] Unique AUTH_SECRET (generated with openssl)
- [ ] DATABASE_URL uses SSL (`?sslmode=require`)
- [ ] NODE_ENV set to `production`
- [ ] Environment variables not committed to git
- [ ] Different credentials for dev and production

---

## Quick Commands

```bash
# Generate AUTH_SECRET
openssl rand -base64 32

# Generate secure password
openssl rand -base64 16

# Test database connection (requires psql)
psql "postgresql://user:password@host:5432/database?sslmode=require"

# View environment variables in Render
# Go to: Dashboard → Service → Environment tab
```

---

**Need help?** See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for complete deployment guide.

