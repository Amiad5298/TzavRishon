# 🔧 Fix 404 Errors - Render GitHub Deployment

## 🔍 Current Problem

Your services are deployed via GitHub to Render, but:
1. Backend OAuth redirect points to wrong URL
2. Frontend has no environment variables configured
3. Frontend doesn't know where to call the backend

---

## ✅ Step-by-Step Fix

### Step 1: Fix Backend Environment Variables

Go to **Render Dashboard** → **tzavrishon-backend** service → **Environment**

**Change this variable:**
```env
# WRONG (current):
OAUTH_GOOGLE_REDIRECT_URI=https://api.tzavrishonplus.co.il/login/oauth2/code/google

# CORRECT (change to):
OAUTH_GOOGLE_REDIRECT_URI=https://tzavrishon-backend.onrender.com/login/oauth2/code/google
```

**Keep these as they are:**
```env
APP_FRONTEND_URL=https://tzavrishonplus.co.il
# (or whatever your frontend URL is)
```

Click **"Save Changes"** - backend will automatically redeploy.

---

### Step 2: Add Frontend Environment Variables

Go to **Render Dashboard** → **tzavrishon-web** service → **Environment**

**Add this environment variable:**
```env
VITE_API_BASE=https://tzavrishon-backend.onrender.com/api/v1
```

**Important Notes:**
- Vite environment variables MUST start with `VITE_`
- They are baked into the build at build time
- After adding, you MUST trigger a manual redeploy

Click **"Save Changes"** and then **"Manual Deploy"** → **"Clear build cache & deploy"**

---

### Step 3: Update Google OAuth Redirect URIs

Go to **Google Cloud Console** → **APIs & Services** → **Credentials**

Find your OAuth 2.0 Client ID and add these **Authorized redirect URIs**:
```
https://tzavrishon-backend.onrender.com/login/oauth2/code/google
```

If you already have `https://api.tzavrishonplus.co.il/login/oauth2/code/google`, you can keep it for future use, but add the Render URL.

---

### Step 4: Verify the Fix

After both services redeploy:

1. **Check backend health:**
   ```
   https://tzavrishon-backend.onrender.com/actuator/health
   ```
   Should return: `{"status":"UP"}`

2. **Check backend auth endpoint:**
   ```
   https://tzavrishon-backend.onrender.com/api/v1/auth/me
   ```
   Should return: `{"authenticated":false,"guestId":null}`

3. **Open your frontend** and check browser DevTools → Network tab
   - API calls should go to: `https://tzavrishon-backend.onrender.com/api/v1/*`
   - Should NOT get 404 errors

4. **Test practice session:**
   - Go to Practice page
   - Start a practice session
   - Should work without 404 errors

---

## 🎯 Alternative: Use Custom Domain (Recommended)

If you want to use your custom domain `tzavrishonplus.co.il`:

### Option A: Both on Same Domain

1. **Add custom domain to backend:**
   - Render Dashboard → tzavrishon-backend → Settings → Custom Domain
   - Add: `tzavrishonplus.co.il`
   - Configure DNS as instructed by Render

2. **Update backend environment variables:**
   ```env
   OAUTH_GOOGLE_REDIRECT_URI=https://tzavrishonplus.co.il/login/oauth2/code/google
   APP_FRONTEND_URL=https://tzavrishonplus.co.il
   ```

3. **Update frontend environment variable:**
   ```env
   VITE_API_BASE=https://tzavrishonplus.co.il/api/v1
   ```

4. **Redeploy both services**

### Option B: Backend on Subdomain

1. **Add custom domain to backend:**
   - Add: `api.tzavrishonplus.co.il`

2. **Update backend environment variables:**
   ```env
   OAUTH_GOOGLE_REDIRECT_URI=https://api.tzavrishonplus.co.il/login/oauth2/code/google
   APP_FRONTEND_URL=https://tzavrishonplus.co.il
   ```

3. **Update frontend environment variable:**
   ```env
   VITE_API_BASE=https://api.tzavrishonplus.co.il/api/v1
   ```

4. **Redeploy both services**

---

## 📋 Quick Checklist

- [ ] Backend `OAUTH_GOOGLE_REDIRECT_URI` points to actual backend URL
- [ ] Frontend has `VITE_API_BASE` environment variable set
- [ ] Frontend redeployed with "Clear build cache & deploy"
- [ ] Google OAuth has correct redirect URI
- [ ] Backend health check returns 200
- [ ] Frontend API calls go to correct backend URL
- [ ] No 404 errors in browser console
- [ ] Practice session works
- [ ] Login flow works

---

## 🐛 Troubleshooting

### Still getting 404s?

1. **Check frontend build logs:**
   - Render Dashboard → tzavrishon-web → Logs
   - Look for: `VITE_API_BASE` during build
   - Should show: `https://tzavrishon-backend.onrender.com/api/v1`

2. **Check browser console:**
   ```javascript
   // Run this in browser console on your frontend
   console.log('API Base:', import.meta.env.VITE_API_BASE);
   ```
   Should output: `https://tzavrishon-backend.onrender.com/api/v1`

3. **Check CORS errors:**
   - Look for CORS errors in browser console
   - If present, verify `APP_FRONTEND_URL` matches your frontend domain

4. **Clear Render build cache:**
   - Manual Deploy → "Clear build cache & deploy"
   - This ensures environment variables are picked up

### Backend not responding?

1. **Check if backend is sleeping:**
   - Free tier spins down after 15 min inactivity
   - First request may take 30-60 seconds to wake up

2. **Check backend logs:**
   - Render Dashboard → tzavrishon-backend → Logs
   - Look for startup errors or exceptions

---

## 📝 Summary

The key issue is that **Vite environment variables must be set in Render's Environment tab** when deploying via GitHub. The `.env.production` file in your repo is NOT used by Render's build process.

After fixing:
- Backend will accept OAuth redirects at the correct URL
- Frontend will call the correct backend URL
- No more 404 errors!

