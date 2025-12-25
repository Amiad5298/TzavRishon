# 🚀 Render Deployment Guide - Tzav Rishon Plus

Complete guide to deploy your application to **Render** with your domain **tzavrishonplus.co.il** (without using GitHub).

---

## 📋 Prerequisites

- ✅ Render account (sign up at https://render.com)
- ✅ Domain: **tzavrishonplus.co.il**
- ✅ Google OAuth credentials
- ✅ Neon database (already configured)

---

## 🎯 Deployment Strategy

Since you're not using GitHub, we'll deploy using **Docker images** or **manual deployment**:

### **Option A: Docker Registry (Recommended)**
1. Build Docker images locally
2. Push to Docker Hub
3. Deploy to Render from Docker Hub

### **Option B: Render CLI**
1. Use Render CLI to deploy directly
2. No need for Docker Hub

We'll use **Option A** as it's more reliable for production.

---

## 📦 Step 1: Prepare Docker Images

### 1.1 Create Docker Hub Account
1. Go to https://hub.docker.com
2. Sign up for free account
3. Create repository: `tzavrishon-server`
4. Create repository: `tzavrishon-web`

### 1.2 Configure Production Environment

Before building, update `web/.env.production` with your production API URL:

```env
# Choose one of these options:

# Option 1: Use Render's provided URL (you'll get this after deploying backend)
VITE_API_BASE=https://tzavrishon-server.onrender.com
# Option 2: Use custom domain with API subdomain (recommended for production)
VITE_API_BASE=https://api.tzavrishonplus.co.il/api/v1

# Option 3: Use main domain (if backend is on same domain)
VITE_API_BASE=https://tzavrishonplus.co.il/api/v1
```

**Recommendation**: Start with Option 1 (Render URL) to test, then switch to Option 2 (custom domain) for production.

### 1.3 Build and Push Images

**IMPORTANT**: Render requires images built for `linux/amd64` platform.

```bash
# Login to Docker Hub
docker login

# Build backend image for linux/amd64
cd server
docker build --platform linux/amd64 -t YOUR_DOCKERHUB_USERNAME/tzavrishon-server:latest .
docker push YOUR_DOCKERHUB_USERNAME/tzavrishon-server:latest

# Build frontend image for linux/amd64
cd ../web
docker build --platform linux/amd64 -t YOUR_DOCKERHUB_USERNAME/tzavrishon-web:latest .
docker push YOUR_DOCKERHUB_USERNAME/tzavrishon-web:latest
```

**Note**: If you need to rebuild the frontend with a different API URL, update `.env.production` and rebuild the Docker image.

---

## 🌐 Step 2: Deploy Backend to Render

### 2.1 Create Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select **"Deploy an existing image from a registry"**
4. Enter image URL: `YOUR_DOCKERHUB_USERNAME/tzavrishon-server:latest`
5. Configure:
   - **Name**: `tzavrishon-server`
   - **Region**: Choose closest to Israel (e.g., Frankfurt)
   - **Instance Type**: **Free** (or Starter $7/month for better performance)
   - **Port**: `8080`

### 2.2 Add Environment Variables

In the **Environment** section, add these variables:

```env
DATABASE_URL=YOUR_DATABASE_URL
DATABASE_USERNAME=YOUR_DATABASE_USERNAME
DATABASE_PASSWORD=YOUR_DATABASE_PASSWORD

JWT_SECRET=YOUR_JWT_SECRET

OAUTH_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
OAUTH_GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# IMPORTANT: Update this after you get your Render URL
APP_FRONTEND_URL=https://tzavrishonplus.co.il
OAUTH_GOOGLE_REDIRECT_URI=https://tzavrishonplus.co.il/login/oauth2/code/google

APP_GUEST_PRACTICE_LIMIT_PER_TYPE=5
APP_SECTION_COUNTS=VERBAL_ANALOGY:10,SHAPE_ANALOGY:10,INSTRUCTIONS_DIRECTIONS:10,QUANTITATIVE:10
APP_SECTION_DURATIONS_SEC=VERBAL_ANALOGY:480,SHAPE_ANALOGY:480,INSTRUCTIONS_DIRECTIONS:360,QUANTITATIVE:600

ADSENSE_ENABLED=false
ADSENSE_CLIENT=
```

### 2.3 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://tzavrishon-server-XXXX.onrender.com`

---

## 🎨 Step 3: Deploy Frontend to Render

### 3.1 Create Web Service (Not Static Site!)

1. Click **"New +"** → **"Web Service"**
2. Select **"Deploy an existing image from a registry"**
3. Enter image URL: `YOUR_DOCKERHUB_USERNAME/tzavrishon-web:latest`
4. Configure:
   - **Name**: `tzavrishon-web`
   - **Region**: Same as backend
   - **Instance Type**: **Free**
   - **Port**: `80` (nginx default port)

### 3.2 Add Environment Variables

**Note**: Environment variables for Vite must be set at **build time**, not runtime.
Since we're using pre-built Docker images, make sure your `.env.production` file has the correct values before building.

For now, the frontend will use the values baked into the Docker image.

### 3.3 Deploy Frontend

1. Click **"Create Web Service"**
2. Wait for deployment
3. Note your frontend URL: `https://tzavrishon-web-XXXX.onrender.com`

---

## 🔗 Step 4: Configure Custom Domain

### 4.1 Add Domain to Render

**For Frontend:**
1. Go to your frontend service in Render
2. Click **"Settings"** → **"Custom Domain"**
3. Add domain: `tzavrishonplus.co.il`
4. Render will provide DNS records

**For Backend (API subdomain):**
1. Go to your backend service
2. Add custom domain: `api.tzavrishonplus.co.il` (recommended)
   - OR use the main domain with path routing

### 4.2 Update DNS Records

Go to your domain registrar (where you bought tzavrishonplus.co.il) and add:

**Option A: Separate API subdomain (Recommended)**
```
Type    Name    Value
A       @       Render IP (provided by Render)
CNAME   api     tzavrishon-server-XXXX.onrender.com
```

**Option B: Single domain with path routing**
```
Type    Name    Value
A       @       Render IP (provided by Render)
```

### 4.3 Update Environment Variables

After domain is configured, update backend environment variables:

```env
APP_FRONTEND_URL=https://tzavrishonplus.co.il
OAUTH_GOOGLE_REDIRECT_URI=https://tzavrishonplus.co.il/login/oauth2/code/google
```

Update frontend environment variables:

```env
# If using separate API subdomain:
VITE_API_BASE=https://api.tzavrishonplus.co.il/api/v1

# If using single domain:
VITE_API_BASE=https://tzavrishonplus.co.il/api/v1
```

---

## 🔐 Step 5: Update Google OAuth

### 5.1 Add Production URLs to Google Console

1. Go to https://console.cloud.google.com/
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add to **Authorized JavaScript origins**:
   ```
   https://tzavrishonplus.co.il
   ```
6. Add to **Authorized redirect URIs**:
   ```
   https://tzavrishonplus.co.il/login/oauth2/code/google
   ```
   (Or `https://api.tzavrishonplus.co.il/login/oauth2/code/google` if using subdomain)

### 5.2 Publish OAuth Consent Screen

1. Go to **OAuth consent screen**
2. If status is "Testing", click **"Publish App"**
3. This allows any Google user to log in

---

## ✅ Step 6: Test Deployment

### 6.1 Health Check

```bash
# Test backend health
curl https://tzavrishonplus.co.il/actuator/health

# Expected response:
{"status":"UP"}
```

### 6.2 Test Frontend

1. Open https://tzavrishonplus.co.il
2. Click "התחבר" (Login)
3. Should redirect to Google OAuth
4. After login, should redirect back to your site

### 6.3 Test Practice Mode

1. Try guest practice (should work without login)
2. Verify question loading
3. Check answer submission

---

## 🔄 Step 7: Update and Redeploy

When you make code changes:

```bash
# Rebuild and push images (with correct platform)
cd server
docker build --platform linux/amd64 -t YOUR_DOCKERHUB_USERNAME/tzavrishon-server:latest .
docker push YOUR_DOCKERHUB_USERNAME/tzavrishon-server:latest

cd ../web
docker build --platform linux/amd64 -t YOUR_DOCKERHUB_USERNAME/tzavrishon-web:latest .
docker push YOUR_DOCKERHUB_USERNAME/tzavrishon-web:latest

# In Render dashboard:
# 1. Go to each service
# 2. Click "Manual Deploy" → "Deploy latest commit"
```

---

## 💰 Cost Breakdown

### Free Tier
- **Backend**: Free (with limitations: spins down after 15 min inactivity)
- **Frontend**: Free
- **Database**: Neon free tier (3GB)
- **Total**: $0/month

### Paid Tier (Recommended for production)
- **Backend**: $7/month (Starter plan, always on)
- **Frontend**: Free
- **Database**: Neon free tier
- **Total**: $7/month

---

## 🐛 Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify all environment variables are set
- Test database connection

### CORS errors
- Verify `APP_FRONTEND_URL` matches your domain
- Check browser console for exact error

### OAuth not working
- Verify redirect URIs in Google Console match exactly
- Check that OAuth consent screen is published
- Verify `OAUTH_GOOGLE_REDIRECT_URI` environment variable

### Frontend can't reach backend
- Verify `VITE_API_BASE` is correct
- Check network tab in browser dev tools
- Ensure backend is running

---

## 📞 Next Steps

1. ✅ Build and push Docker images
2. ✅ Deploy backend to Render
3. ✅ Deploy frontend to Render
4. ✅ Configure custom domain
5. ✅ Update Google OAuth
6. ✅ Test everything
7. 🎉 Go live!

---

## 🔗 Useful Links

- Render Dashboard: https://dashboard.render.com
- Docker Hub: https://hub.docker.com
- Google Cloud Console: https://console.cloud.google.com
- Neon Dashboard: https://console.neon.tech

---

**Need help?** Check Render documentation: https://render.com/docs

