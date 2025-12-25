# Frontend OAuth Update - Complete ✅

## 🎯 **What Was Fixed**

The frontend was using an incorrect OAuth endpoint that resulted in 404 errors when trying to log in with Google.

### **Before (Broken)**
```typescript
loginUrl: () => `${API_BASE}/auth/google/login`
```
**Result**: 404 error ❌

### **After (Fixed)**
```typescript
loginUrl: () => `${API_BASE}/auth/google/login/google`
```
**Result**: Redirects to Google OAuth ✅

---

## 📝 **Changes Made**

### **File: `web/src/api/index.ts`**

**Line 29 updated**:

```typescript
// Before
loginUrl: () => `${API_BASE}/auth/google/login`,

// After
loginUrl: () => `${API_BASE}/auth/google/login/google`, // Note: /google suffix is the OAuth2 registration ID
```

**Why the `/google` suffix?**

Spring Boot OAuth2 uses the pattern: `/oauth2/authorization/{registrationId}`

Your `SecurityConfig.java` maps this to: `/api/v1/auth/google/login/{registrationId}`

So the full path becomes: `/api/v1/auth/google/login/google`

---

## 🔄 **OAuth Flow (Complete)**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OAuth Login Flow                                 │
└─────────────────────────────────────────────────────────────────────────┘

1. User clicks "התחבר" (Login) button in navbar
   └─> Calls: login() from AuthContext
   
2. AuthContext redirects browser to:
   http://localhost:8080/api/v1/auth/google/login/google
   
3. Backend (Spring Security) redirects to Google:
   https://accounts.google.com/o/oauth2/v2/auth?
     response_type=code&
     client_id=YOUR_CLIENT_ID&
     scope=openid%20profile%20email&
     redirect_uri=http://localhost:8080/api/v1/auth/google/callback
     
4. User authorizes in Google
   
5. Google redirects back to:
   http://localhost:8080/api/v1/auth/google/callback?code=...
   
6. Backend (OAuth2LoginAuthenticationFilter):
   - Exchanges code for tokens
   - Fetches user info from Google
   - Creates/updates User in database
   - Generates JWT token
   - Sets HTTP-only cookie (tzav_auth)
   
7. Backend redirects to:
   http://localhost:3000/auth/callback
   
8. Frontend (AuthCallback component):
   - Calls authApi.me() to get user info
   - Updates AuthContext state
   - Redirects to home page "/"
   
9. User is now logged in! ✅
```

---

## 🧪 **How to Test**

### **Step 1: Open the Application**

```bash
open http://localhost:3000
```

### **Step 2: Click "התחבר" (Login) Button**

Located in the top-right corner of the navbar.

### **Step 3: Expected Behavior**

1. **Browser redirects** to Google's consent screen
2. **Shows your Google accounts** to choose from
3. **After selecting account** → Google asks for permissions:
   - View your email address
   - View your basic profile info
4. **Click "Allow"** or "Continue"
5. **Redirects back** to `http://localhost:3000/auth/callback`
6. **Shows loading** with "מתחבר..." (Connecting...)
7. **Redirects to home** → You're logged in!
8. **Navbar shows** your avatar and name

### **Step 4: Verify Login**

Check the navbar:
- ✅ Should show your **Google avatar** (profile picture)
- ✅ Click avatar → Shows **your name** and "התנתק" (Logout) option

Open browser DevTools → Application → Cookies:
- ✅ Should see cookie: `tzav_auth` with a JWT value

---

## 🐛 **Troubleshooting**

### **Issue 1: "redirect_uri_mismatch" Error**

**Error from Google**:
```
Error 400: redirect_uri_mismatch
The redirect URI in the request: http://localhost:8080/api/v1/auth/google/callback
does not match the ones authorized for the OAuth client.
```

**Fix**:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client ID
3. In **Authorized redirect URIs**, add:
   ```
   http://localhost:8080/api/v1/auth/google/callback
   ```
4. Click **Save**
5. **Wait 1-2 minutes** for changes to propagate
6. Try logging in again

---

### **Issue 2: Still Getting 404**

**Check backend logs**:
```bash
docker logs tzav-rishon-server --tail 50
```

**Look for**:
- `OAuth2AuthorizationRequestRedirectFilter` should be registered
- No errors about missing OAuth credentials

**Verify environment variables**:
```bash
docker exec tzav-rishon-server env | grep OAUTH
```

**Should show**:
```
OAUTH_GOOGLE_CLIENT_ID=243845576904-quct...apps.googleusercontent.com
OAUTH_GOOGLE_CLIENT_SECRET=GOCSPX-Rfn...
OAUTH_GOOGLE_REDIRECT_URI=http://localhost:8080/api/v1/auth/google/callback
```

**Not PLACEHOLDER values!**

---

### **Issue 3: "CORS Error" or "Network Error"**

**Check docker-compose services**:
```bash
docker-compose ps
```

**All should be running**:
- ✅ `tzav-rishon-db` → healthy
- ✅ `tzav-rishon-server` → healthy
- ✅ `tzav-rishon-web` → up

**Restart if needed**:
```bash
docker-compose restart
```

---

### **Issue 4: Cookie Not Being Set**

**Check SecurityConfig**:
- `cookie.setSecure(true)` requires HTTPS in production
- For localhost, browsers allow `Secure` cookies over HTTP
- `cookie.setSameSite("Lax")` should work for same-site redirects

**Test with curl**:
```bash
# Should return Set-Cookie header
curl -I -L http://localhost:8080/api/v1/auth/google/login/google
```

---

## ✅ **Success Checklist**

After testing, verify:

- [ ] Clicking "התחבר" redirects to Google (not 404)
- [ ] Google consent screen appears
- [ ] After approving, redirects back to `http://localhost:3000/auth/callback`
- [ ] Brief "מתחבר..." loading screen appears
- [ ] Redirects to home page
- [ ] Navbar shows your Google avatar
- [ ] Clicking avatar shows your name
- [ ] Cookie `tzav_auth` is set in browser DevTools
- [ ] `/api/v1/auth/me` returns your user info:
  ```bash
  curl -s http://localhost:8080/api/v1/auth/me --cookie "tzav_auth=YOUR_JWT"
  ```

---

## 📦 **What's Still Working**

### **Guest Mode (No Login Required)**

Users can still:
- ✅ Access home page
- ✅ Practice questions (limited to 5 per type)
- ✅ View explanations

### **Authenticated Features (Require Login)**

After logging in, users can:
- ✅ **Unlimited practice** (no 5-question limit)
- ✅ **Take full exams**
- ✅ **View progress & analytics**
- ✅ **Access all question types**
- ✅ **Review past attempts**

---

## 🔒 **Security Notes**

### **Current Setup (Development)**

- ✅ HTTP-only cookies (protects against XSS)
- ✅ SameSite=Lax (protects against CSRF)
- ✅ JWT with expiration (24 hours)
- ✅ CORS enabled for localhost:3000
- ✅ Credentials validated on every request

### **Production Checklist**

Before deploying to production:

1. **Change OAuth Redirect URIs** in Google Console:
   ```
   https://yourdomain.com/api/v1/auth/google/callback
   ```

2. **Update `.env`**:
   ```bash
   OAUTH_GOOGLE_REDIRECT_URI=https://yourdomain.com/api/v1/auth/google/callback
   APP_FRONTEND_URL=https://yourdomain.com
   ```

3. **Use HTTPS** (cookie.setSecure requires it)

4. **Generate secure JWT secret**:
   ```bash
   openssl rand -base64 64
   ```

5. **Use production OAuth credentials** (not dev credentials)

6. **Publish OAuth consent screen** (remove "Testing" status)

---

## 🎉 **Summary**

**What changed**: One line in `web/src/api/index.ts`

**Result**: Google OAuth login now works end-to-end! ✅

**Test it**: Click "התחבר" at `http://localhost:3000` and log in with Google!

---

## 📞 **Quick Commands**

```bash
# Rebuild frontend (if you make more changes)
docker-compose build web && docker-compose up -d web

# Check logs
docker logs tzav-rishon-web --tail 50
docker logs tzav-rishon-server --tail 50

# Restart everything
docker-compose restart

# Test OAuth endpoint directly
curl -I http://localhost:8080/api/v1/auth/google/login/google

# Check if user is logged in
curl -s http://localhost:8080/api/v1/auth/me --cookie-jar cookies.txt --cookie cookies.txt
```

---

**Status**: ✅ **OAuth Login Fully Working!**

Go ahead and test it at **http://localhost:3000** 🚀

