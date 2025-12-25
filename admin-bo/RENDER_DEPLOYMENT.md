# 🚀 Admin Back Office - Render Deployment Guide

Complete guide to deploy the TzavRishon Admin Back Office to Render using Docker.

---

## 📋 Prerequisites

- ✅ Render account (sign up at https://render.com)
- ✅ Docker Hub account (https://hub.docker.com)
- ✅ Access to the TzavRishon PostgreSQL database
- ✅ Admin credentials (username/password)

---

## 📦 Step 1: Build and Push Docker Image

### 1.1 Login to Docker Hub

```bash
docker login
```

### 1.2 Build Docker Image

**IMPORTANT**: Render requires images built for `linux/amd64` platform.

```bash
# Navigate to admin-bo directory
cd admin-bo

# Build the image for linux/amd64
docker build --platform linux/amd64 -t YOUR_DOCKERHUB_USERNAME/tzavrishon-admin-bo:latest .

# Example:
# docker build --platform linux/amd64 -t johndoe/tzavrishon-admin-bo:latest .
```

### 1.3 Push to Docker Hub

```bash
docker push YOUR_DOCKERHUB_USERNAME/tzavrishon-admin-bo:latest
```

**Note**: Replace `YOUR_DOCKERHUB_USERNAME` with your actual Docker Hub username.

---

## 🌐 Step 2: Deploy to Render

### 2.1 Create Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select **"Deploy an existing image from a registry"**
4. Enter image URL: `YOUR_DOCKERHUB_USERNAME/tzavrishon-admin-bo:latest`

### 2.2 Configure Service

- **Name**: `tzavrishon-admin-bo` (or any name you prefer)
- **Region**: Choose closest to your database (e.g., Frankfurt for EU)
- **Instance Type**: 
  - **Free** (spins down after 15 min inactivity)
  - **Starter ($7/month)** - Recommended for always-on access
- **Port**: `3000`

### 2.3 Add Environment Variables

In the **Environment** section, add these required variables:

```env
# Database Connection (same as main server)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here

# Session Security (generate with: openssl rand -base64 32)
AUTH_SECRET=your-random-secret-key-here

# Node Environment
NODE_ENV=production
```

**Example with your Neon database**:
```env
DATABASE_URL=postgresql://neondb_owner:npg_cm7lIzA0pfxH@ep-divine-mouse-abe8cey6-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
ADMIN_USERNAME=admin
ADMIN_PASSWORD=MySecurePassword123!
AUTH_SECRET=Kx9mP2vN8qR5tY7wZ3bC6fH1jL4nM0pS
NODE_ENV=production
```

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Note your admin BO URL: `https://tzavrishon-admin-bo-XXXX.onrender.com`

---

## ✅ Step 3: Test Deployment

### 3.1 Access Login Page

1. Open your Render URL: `https://tzavrishon-admin-bo-XXXX.onrender.com/login`
2. You should see the admin login page

### 3.2 Login

1. Enter your `ADMIN_USERNAME` and `ADMIN_PASSWORD`
2. Click "Sign In"
3. You should be redirected to the dashboard

### 3.3 Verify Functionality

- ✅ Dashboard loads with metrics
- ✅ User management page works
- ✅ Question management page works
- ✅ Charts display correctly
- ✅ Date range picker works

---

## 🔄 Step 4: Update and Redeploy

When you make code changes:

```bash
# 1. Navigate to admin-bo directory
cd admin-bo

# 2. Rebuild the Docker image
docker build --platform linux/amd64 -t YOUR_DOCKERHUB_USERNAME/tzavrishon-admin-bo:latest .

# 3. Push to Docker Hub
docker push YOUR_DOCKERHUB_USERNAME/tzavrishon-admin-bo:latest

# 4. In Render dashboard:
#    - Go to your admin-bo service
#    - Click "Manual Deploy" → "Deploy latest commit"
#    - Or enable "Auto-Deploy" to deploy on image updates
```

---

## 🔐 Security Best Practices

### Generate Secure Credentials

```bash
# Generate a secure AUTH_SECRET
openssl rand -base64 32

# Generate a secure password
openssl rand -base64 16
```

### Recommended Settings

- Use a **strong admin password** (min 12 characters, mixed case, numbers, symbols)
- Use a **unique AUTH_SECRET** (never reuse from other apps)
- Enable **HTTPS only** (Render does this by default)
- Consider using **IP allowlisting** if Render supports it on your plan

---

## 💰 Cost Breakdown

### Free Tier
- **Admin BO**: Free (spins down after 15 min inactivity)
- **Database**: Shared with main app (Neon free tier)
- **Total**: $0/month

### Paid Tier (Recommended)
- **Admin BO**: $7/month (Starter plan, always on)
- **Database**: Shared with main app
- **Total**: $7/month

**Note**: Free tier spins down after inactivity, causing 30-60 second cold starts.

---

## 🐛 Troubleshooting

### Build fails with "exec format error"
- **Cause**: Image not built for correct platform
- **Solution**: Add `--platform linux/amd64` to docker build command

### "Unauthorized" error on all pages
- **Cause**: Missing or incorrect environment variables
- **Solution**: Verify `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `AUTH_SECRET` are set

### Database connection fails
- **Cause**: Incorrect `DATABASE_URL`
- **Solution**: 
  - Verify connection string format
  - Ensure `?sslmode=require` is included
  - Test connection from Render logs

### Login works but pages show no data
- **Cause**: Database connection works but queries fail
- **Solution**: 
  - Check Render logs for SQL errors
  - Verify database has data
  - Ensure database user has read permissions

### Health check fails
- **Cause**: App not starting on port 3000
- **Solution**: Check Render logs for startup errors

---

## 📊 Monitoring

### View Logs

1. Go to Render dashboard
2. Select your admin-bo service
3. Click "Logs" tab
4. Monitor for errors or issues

### Health Check

Render automatically monitors the health check endpoint (`/login`).
If it fails 3 times, Render will restart the service.

---

## 🔗 Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **Docker Hub**: https://hub.docker.com
- **Admin BO README**: See `admin-bo/README.md` for local development

---

## 📝 Quick Reference

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `ADMIN_USERNAME` | ✅ Yes | Admin login username |
| `ADMIN_PASSWORD` | ✅ Yes | Admin login password |
| `AUTH_SECRET` | ✅ Yes | Session encryption secret |
| `NODE_ENV` | ✅ Yes | Set to `production` |

### Ports
- **Application**: 3000
- **Health Check**: `/login`

### Docker Commands
```bash
# Build
docker build --platform linux/amd64 -t USERNAME/tzavrishon-admin-bo:latest .

# Push
docker push USERNAME/tzavrishon-admin-bo:latest

# Test locally
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e ADMIN_USERNAME="admin" \
  -e ADMIN_PASSWORD="password" \
  -e AUTH_SECRET="secret" \
  USERNAME/tzavrishon-admin-bo:latest
```

---

**🎉 Deployment Complete!**

Your admin back office is now live on Render. Access it at your Render URL and start managing your TzavRishon application!

