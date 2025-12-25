# ✅ Production Deployment Checklist - Tzav Rishon Plus

Quick checklist to deploy your app to **tzavrishonplus.co.il** on Render (free tier).

---

## 📋 Pre-Deployment Checklist

### ✅ What's Already Done

- [x] Neon cloud database configured
- [x] JWT secret generated
- [x] Docker configuration ready
- [x] Environment variables prepared
- [x] Cookie security configured (auto-detects HTTPS)
- [x] CORS configured (uses environment variable)
- [x] Production timers set (8/8/6/10 minutes)

### ⚠️ What You Need to Do

- [ ] Create Docker Hub account
- [ ] Build and push Docker images
- [ ] Create Render account
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Render
- [ ] Configure custom domain
- [ ] Update Google OAuth
- [ ] Test everything

---

## 🚀 Step-by-Step Deployment

### Step 1: Docker Hub Setup (5 minutes)

1. [ ] Go to https://hub.docker.com
2. [ ] Sign up for free account
3. [ ] Create repository: `tzavrishon-server`
4. [ ] Create repository: `tzavrishon-web`
5. [ ] Note your username: `_______________`

### Step 2: Build and Push Images (10 minutes)

```bash
# Login to Docker Hub
docker login

# Build and push backend
cd server
docker build -t YOUR_USERNAME/tzavrishon-server:latest .
docker push YOUR_USERNAME/tzavrishon-server:latest

# Build and push frontend
cd ../web
docker build -t YOUR_USERNAME/tzavrishon-web:latest .
docker push YOUR_USERNAME/tzavrishon-web:latest
```

**Checklist:**
- [ ] Backend image built successfully
- [ ] Backend image pushed to Docker Hub
- [ ] Frontend image built successfully
- [ ] Frontend image pushed to Docker Hub

### Step 3: Render Account Setup (2 minutes)

1. [ ] Go to https://render.com
2. [ ] Sign up for free account
3. [ ] Verify email
4. [ ] Go to dashboard: https://dashboard.render.com

### Step 4: Deploy Backend (10 minutes)

1. [ ] Click **"New +"** → **"Web Service"**
2. [ ] Select **"Deploy an existing image from a registry"**
3. [ ] Enter image: `YOUR_USERNAME/tzavrishon-server:latest`
4. [ ] Configure:
   - Name: `tzavrishon-server`
   - Region: Frankfurt (closest to Israel)
   - Instance Type: **Free**
   - Port: `8080`
5. [ ] Add environment variables (see `PRODUCTION_ENV_TEMPLATE.md`)
6. [ ] Click **"Create Web Service"**
7. [ ] Wait for deployment (5-10 minutes)
8. [ ] Note backend URL: `https://tzavrishon-server-XXXX.onrender.com`
9. [ ] Test health: `curl https://tzavrishon-server-XXXX.onrender.com/actuator/health`

### Step 5: Deploy Frontend (10 minutes)

1. [ ] Click **"New +"** → **"Static Site"**
2. [ ] Select **"Deploy an existing image from a registry"**
3. [ ] Enter image: `YOUR_USERNAME/tzavrishon-web:latest`
4. [ ] Configure:
   - Name: `tzavrishon-web`
   - Region: Frankfurt
5. [ ] Add environment variables:
   - `VITE_API_BASE=https://tzavrishonplus.co.il/api/v1`
   - `VITE_ADSENSE_ENABLED=false`
6. [ ] Click **"Create Static Site"**
7. [ ] Wait for deployment
8. [ ] Note frontend URL: `https://tzavrishon-web-XXXX.onrender.com`
9. [ ] Test: Open URL in browser

### Step 6: Configure Custom Domain (15 minutes)

1. [ ] In Render, go to **tzavrishon-web** service
2. [ ] Click **"Settings"** → **"Custom Domain"**
3. [ ] Add domain: `tzavrishonplus.co.il`
4. [ ] Render provides DNS records
5. [ ] Go to your domain registrar
6. [ ] Add DNS records:
   - Type: `A`
   - Name: `@`
   - Value: (IP from Render)
7. [ ] Wait for DNS propagation (5-60 minutes)
8. [ ] Test: Open https://tzavrishonplus.co.il

### Step 7: Update Google OAuth (10 minutes)

1. [ ] Go to https://console.cloud.google.com/
2. [ ] Navigate to **APIs & Services** → **Credentials**
3. [ ] Click on your OAuth client
4. [ ] Add to **Authorized JavaScript origins**:
   - `https://tzavrishonplus.co.il`
5. [ ] Add to **Authorized redirect URIs**:
   - `https://tzavrishonplus.co.il/login/oauth2/code/google`
6. [ ] Click **"Save"**
7. [ ] Go to **OAuth consent screen**
8. [ ] Click **"PUBLISH APP"** (or add test users)
9. [ ] Confirm

### Step 8: Final Testing (10 minutes)

**Backend Health:**
- [ ] `curl https://tzavrishonplus.co.il/actuator/health` returns `{"status":"UP"}`

**Frontend:**
- [ ] Open https://tzavrishonplus.co.il
- [ ] Page loads correctly
- [ ] Hebrew text displays correctly
- [ ] No console errors

**Guest Practice:**
- [ ] Click on a practice type
- [ ] Questions load
- [ ] Can answer questions
- [ ] Can submit answers
- [ ] Results display correctly

**OAuth Login:**
- [ ] Click "התחבר" (Login)
- [ ] Redirects to Google
- [ ] Can select Google account
- [ ] Redirects back to site
- [ ] User is logged in
- [ ] User info displays in header

**Authenticated Features:**
- [ ] Can start exam
- [ ] Timer works correctly
- [ ] Can complete exam
- [ ] Results are saved
- [ ] Progress page shows data

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check logs in Render dashboard
# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port configuration wrong
```

### Frontend shows blank page
```bash
# Check browser console for errors
# Common issues:
# - VITE_API_BASE incorrect
# - CORS error (check APP_FRONTEND_URL)
# - Build failed
```

### OAuth not working
```bash
# Common issues:
# - Redirect URI mismatch
# - OAuth consent screen not published
# - Test users not added
# - Wrong client ID/secret
```

### CORS errors
```bash
# Check:
# - APP_FRONTEND_URL in backend matches your domain
# - No trailing slash in APP_FRONTEND_URL
# - Backend is running
```

---

## 💰 Cost Summary

### Free Tier (What you're using)
- **Backend**: Free (spins down after 15 min inactivity)
- **Frontend**: Free
- **Database**: Neon free tier (3GB)
- **Domain**: You already own it
- **Total**: **$0/month** 🎉

### Limitations of Free Tier
- Backend spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month of backend runtime
- 100GB bandwidth/month

### Upgrade Options (If Needed)
- **Starter Plan**: $7/month (backend always on, faster)
- **Neon Pro**: $19/month (more database storage)

---

## 📊 Monitoring

### Render Dashboard
- View logs: Click on service → **"Logs"**
- View metrics: Click on service → **"Metrics"**
- View deployments: Click on service → **"Events"**

### Neon Dashboard
- Database usage: https://console.neon.tech
- Query performance
- Storage usage
- Connection stats

### Google Analytics (Optional)
- Already configured in your app
- View traffic, user behavior, etc.

---

## 🔄 Updating Your App

When you make code changes:

```bash
# 1. Rebuild images
cd server
docker build -t YOUR_USERNAME/tzavrishon-server:latest .
docker push YOUR_USERNAME/tzavrishon-server:latest

cd ../web
docker build -t YOUR_USERNAME/tzavrishon-web:latest .
docker push YOUR_USERNAME/tzavrishon-web:latest

# 2. In Render dashboard:
# - Go to each service
# - Click "Manual Deploy" → "Deploy latest commit"
```

---

## 🎉 Success Criteria

Your deployment is successful when:

- [x] https://tzavrishonplus.co.il loads
- [x] Guest practice works
- [x] Google login works
- [x] Authenticated users can take exams
- [x] Progress is saved and displayed
- [x] No console errors
- [x] Mobile responsive
- [x] Hebrew text displays correctly

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Neon Docs**: https://neon.tech/docs
- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2

---

## 🎯 Quick Reference

### Your Configuration
- **Domain**: tzavrishonplus.co.il
- **Database**: Neon (ep-divine-mouse-abe8cey6-pooler.eu-west-2.aws.neon.tech)
- **OAuth Client**: 243845576904-quct3mod7ko7fnltaiqaat1be76ctkiv.apps.googleusercontent.com
- **Platform**: Render (free tier)

### Important URLs
- **Render Dashboard**: https://dashboard.render.com
- **Docker Hub**: https://hub.docker.com
- **Google Console**: https://console.cloud.google.com
- **Neon Console**: https://console.neon.tech

---

## 📝 Notes

- DNS propagation can take 5-60 minutes
- Free tier backend spins down after 15 min inactivity
- First request after spin-down takes 30-60 seconds
- SSL certificate is automatically provided by Render
- Backups are automatic on Neon (7-day retention)

---

**Ready to deploy?** Start with Step 1! 🚀

**Need detailed instructions?** See `RENDER_DEPLOYMENT_GUIDE.md`

**Need help with OAuth?** See `GOOGLE_OAUTH_PRODUCTION_SETUP.md`

**Need environment variables?** See `PRODUCTION_ENV_TEMPLATE.md`

