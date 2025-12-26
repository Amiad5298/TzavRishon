# 🔧 Fix 404 Errors - Frontend to Backend Communication

## 🔍 Problem Diagnosis

You're getting 404 errors because:
1. **Frontend is calling the wrong backend URL**
2. **CORS configuration mismatch**
3. **Environment variables not properly configured**

---

## ✅ Solution Steps

### Step 1: Update Backend Environment Variables in Render

Go to your **tzavrishon-backend** service in Render and verify these environment variables:

```env
# This should match your FRONTEND URL (where users access your site)
APP_FRONTEND_URL=https://tzavrishonplus.co.il

# OR if you haven't set up custom domain yet:
APP_FRONTEND_URL=https://tzavrishon-web.onrender.com

# OAuth redirect should match your backend URL
OAUTH_GOOGLE_REDIRECT_URI=https://tzavrishon-backend.onrender.com/login/oauth2/code/google
```

**Important**: The `APP_FRONTEND_URL` must match where your frontend is actually deployed!

---

### Step 2: Rebuild and Redeploy Frontend

The frontend `.env.production` has been updated to point to your Render backend URL.

**You MUST rebuild and redeploy your frontend** for this change to take effect:

```bash
# Navigate to web directory
cd web

# Build the Docker image with the new environment variable
docker build --platform linux/amd64 -t YOUR_DOCKERHUB_USERNAME/tzavrishon-web:latest .

# Push to Docker Hub
docker push YOUR_DOCKERHUB_USERNAME/tzavrishon-web:latest

# Then in Render dashboard:
# 1. Go to your tzavrishon-web service
# 2. Click "Manual Deploy" → "Deploy latest commit"
# OR
# 3. Click "Settings" → "Redeploy"
```

---

### Step 3: Verify the Configuration

After redeploying, check:

1. **Frontend API calls**: Open browser DevTools → Network tab
   - Requests should go to: `https://tzavrishon-backend.onrender.com/api/v1/*`
   
2. **Backend CORS**: Check backend logs for CORS errors
   - Should allow requests from your frontend domain

3. **Test endpoints**:
   - `https://tzavrishon-backend.onrender.com/api/v1/auth/me` (should return 200)
   - `https://tzavrishon-backend.onrender.com/actuator/health` (should return 200)

---

## 🎯 Quick Test

Open your browser console on your frontend and run:

```javascript
// Check what API_BASE is configured
console.log('API Base:', import.meta.env.VITE_API_BASE);

// Test backend connection
fetch('https://tzavrishon-backend.onrender.com/api/v1/auth/me', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## 🔄 Alternative: Use Custom Domain (Recommended for Production)

If you want to use your custom domain `tzavrishonplus.co.il`:

### Option A: Backend and Frontend on Same Domain

1. **Deploy backend to**: `https://tzavrishonplus.co.il`
2. **Deploy frontend to**: `https://tzavrishonplus.co.il`
3. **Update `.env.production`**:
   ```env
   VITE_API_BASE=https://tzavrishonplus.co.il/api/v1
   ```
4. **Update backend env**:
   ```env
   APP_FRONTEND_URL=https://tzavrishonplus.co.il
   OAUTH_GOOGLE_REDIRECT_URI=https://tzavrishonplus.co.il/login/oauth2/code/google
   ```

### Option B: Backend on Subdomain

1. **Deploy backend to**: `https://api.tzavrishonplus.co.il`
2. **Deploy frontend to**: `https://tzavrishonplus.co.il`
3. **Update `.env.production`**:
   ```env
   VITE_API_BASE=https://api.tzavrishonplus.co.il/api/v1
   ```
4. **Update backend env**:
   ```env
   APP_FRONTEND_URL=https://tzavrishonplus.co.il
   OAUTH_GOOGLE_REDIRECT_URI=https://api.tzavrishonplus.co.il/login/oauth2/code/google
   ```

---

## 📝 Checklist

- [ ] Backend `APP_FRONTEND_URL` matches frontend deployment URL
- [ ] Frontend `VITE_API_BASE` points to backend URL
- [ ] Frontend rebuilt and redeployed after changing `.env.production`
- [ ] Backend CORS allows frontend domain
- [ ] OAuth redirect URI matches backend URL
- [ ] Test `/api/v1/auth/me` endpoint returns 200
- [ ] Test practice session creation works
- [ ] Test login flow works

---

## 🐛 Still Getting 404s?

Check these common issues:

1. **Frontend not rebuilt**: Environment variables are baked into the build at build time
2. **Wrong domain in CORS**: Check backend logs for CORS errors
3. **Typo in URLs**: Double-check all URLs match exactly
4. **Cache issues**: Clear browser cache and hard refresh (Ctrl+Shift+R)
5. **Backend not running**: Check backend logs in Render dashboard

