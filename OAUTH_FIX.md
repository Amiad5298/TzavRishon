# OAuth Redirect URI Fix

## ⚠️ Problem

Your Google OAuth configuration has a redirect URI mismatch.

**Current `.env`**:
```
OAUTH_GOOGLE_REDIRECT_URI=http://localhost:8080/api/v1/auth/google/callback
```

**Spring Boot expects**:
```
http://localhost:8080/login/oauth2/code/google
```

---

## ✅ Solution (Choose ONE)

### **Option A: Update `.env` (Recommended)**

1. **Edit `.env` file**:
   ```bash
   cd /Users/amiad.dvir/private-dev
   nano .env
   ```

2. **Change this line**:
   ```bash
   # OLD (wrong):
   OAUTH_GOOGLE_REDIRECT_URI=http://localhost:8080/api/v1/auth/google/callback
   
   # NEW (correct):
   OAUTH_GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
   ```

3. **Update Google Cloud Console**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Edit your OAuth 2.0 Client ID
   - In **Authorized redirect URIs**, add:
     ```
     http://localhost:8080/login/oauth2/code/google
     ```
   - Click **Save**
   - **Wait 2 minutes** for changes to propagate

4. **Restart backend**:
   ```bash
   docker-compose stop server && docker-compose up -d server
   ```

5. **Test** (open in browser):
   ```
   http://localhost:8080/oauth2/authorization/google
   ```
   Should redirect to Google! ✅

---

### **Option B: Update Google Console Only**

If your `.env` already says `http://localhost:8080/api/v1/auth/google/callback`:

1. **Go to Google Cloud Console**:
   - https://console.cloud.google.com/apis/credentials
   - Edit your OAuth 2.0 Client ID

2. **Add BOTH redirect URIs** (to be safe):
   ```
   http://localhost:8080/login/oauth2/code/google
   http://localhost:8080/api/v1/auth/google/callback
   ```

3. **Wait 2 minutes** for changes to propagate

4. **Update `.env`** to use the Spring default:
   ```bash
   OAUTH_GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
   ```

5. **Restart**:
   ```bash
   docker-compose stop server && docker-compose up -d server
   ```

---

## 🧪 Testing

### **Test 1: OAuth Authorization Endpoint**

Open in browser:
```
http://localhost:8080/oauth2/authorization/google
```

**Expected**: Redirects to Google's consent screen ✅

**If 404**: OAuth client not properly configured

### **Test 2: Frontend Integration**

Open:
```
http://localhost:3000
```

Click "Sign in with Google" button.

**Expected flow**:
1. Redirects to `http://localhost:8080/oauth2/authorization/google`
2. Then to Google's consent screen
3. After auth, Google redirects to `http://localhost:8080/login/oauth2/code/google`
4. Backend processes, sets JWT cookie
5. Redirects to `http://localhost:3000/auth/callback`
6. User is logged in! ✅

---

## 🐛 Common Errors

### **"redirect_uri_mismatch"**

**Google error message**:
```
Error 400: redirect_uri_mismatch
```

**Fix**: The redirect URI in Google Console doesn't match what Spring Boot is using.

**Solution**:
1. Check your `.env`: `cat .env | grep REDIRECT`
2. Go to Google Console → Credentials
3. Make sure **Authorized redirect URIs** includes the exact URI from `.env`
4. Wait 1-2 minutes, try again

### **Still getting 404**

**Check OAuth credentials are loaded**:
```bash
docker exec tzav-rishon-server env | grep OAUTH
```

Should show **real values** (not PLACEHOLDER).

**Check backend logs**:
```bash
docker logs tzav-rishon-server 2>&1 | grep -i "oauth\|error"
```

Look for `OAuth2AuthorizationRequestRedirectFilter` - should be registered.

---

## ✅ Success Checklist

- [ ] `.env` has real Google OAuth Client ID (not PLACEHOLDER)
- [ ] `.env` has real Google OAuth Client Secret (not PLACEHOLDER)
- [ ] `.env` has correct redirect URI: `http://localhost:8080/login/oauth2/code/google`
- [ ] Google Console has matching redirect URI
- [ ] Backend restarted with `docker-compose stop server && docker-compose up -d server`
- [ ] `http://localhost:8080/oauth2/authorization/google` redirects to Google
- [ ] After Google auth, redirects back to frontend
- [ ] JWT cookie is set
- [ ] `/api/v1/auth/me` returns user info

---

## 🎯 Quick Command Reference

```bash
# 1. Edit .env
nano .env

# 2. Verify changes
cat .env | grep OAUTH

# 3. Restart backend (picks up new env vars)
docker-compose stop server && docker-compose up -d server

# 4. Wait for startup
sleep 15

# 5. Check if OAuth creds loaded
docker exec tzav-rishon-server env | grep OAUTH

# 6. Test OAuth endpoint (should get 302 redirect)
curl -I http://localhost:8080/oauth2/authorization/google

# 7. Or open in browser
open http://localhost:8080/oauth2/authorization/google
```

---

**Status**: Follow Option A above to fix the redirect URI mismatch! 🚀

