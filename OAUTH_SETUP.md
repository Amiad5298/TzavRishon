# Google OAuth Setup Guide

## 🚨 **Why Am I Getting a 404 on the Login Endpoint?**

The Google OAuth login endpoint at `/api/v1/auth/google/login` returns 404 because **Google OAuth credentials are not configured**. This is a required setup step for authentication to work.

---

## 📋 **Quick Setup (5 minutes)**

### **Step 1: Create Google OAuth Credentials**

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)

2. **Create/Select Project**:
   - Click project dropdown at the top
   - Create new project or select existing one
   - Name it something like "Tzav Rishon Dev"

3. **Enable Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**

4. **Create OAuth Credentials**:
   - Go to **APIs & Services** → **Credentials**
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - If prompted, configure OAuth consent screen first:
     - User Type: **External**
     - App name: "Tzav Rishon"
     - User support email: your email
     - Developer contact: your email
     - Click **Save and Continue**
     - Scopes: Click **Save and Continue** (default scopes are fine)
     - Test users: Add your Google account email
     - Click **Save and Continue**

5. **Configure OAuth Client**:
   - Application type: **Web application**
   - Name: "Tzav Rishon Local Dev"
   
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     http://localhost:8080
     ```
   
   - **Authorized redirect URIs**:
     ```
     http://localhost:8080/login/oauth2/code/google
     ```
   
   - Click **CREATE**

6. **Copy Credentials**:
   - You'll see a popup with **Client ID** and **Client Secret**
   - **Copy these** - you'll need them in the next step!

---

### **Step 2: Configure Environment Variables**

1. **Create `.env` file** in the project root (if it doesn't exist):

```bash
cd /Users/amiad.dvir/private-dev
touch .env
```

2. **Add the following to `.env`**:

```bash
# Google OAuth Credentials (REQUIRED)
OAUTH_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
OAUTH_GOOGLE_CLIENT_SECRET=your-actual-client-secret

# OAuth Redirect URI (this default should work)
OAUTH_GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google

# JWT Secret (generate a secure random string)
JWT_SECRET=your-secure-random-string-at-least-32-chars

# Application URLs
APP_FRONTEND_URL=http://localhost:3000

# Guest Practice Limits
APP_GUEST_PRACTICE_LIMIT_PER_TYPE=5

# Exam Configuration
APP_SECTION_COUNTS=VERBAL_ANALOGY:10,SHAPE_ANALOGY:10,INSTRUCTIONS_DIRECTIONS:10,QUANTITATIVE:10
APP_SECTION_DURATIONS_SEC=VERBAL_ANALOGY:480,SHAPE_ANALOGY:480,INSTRUCTIONS_DIRECTIONS:360,QUANTITATIVE:600

# AdSense (optional - leave false for development)
ADSENSE_ENABLED=false
VITE_ADSENSE_ENABLED=false
```

3. **Replace placeholders**:
   - `OAUTH_GOOGLE_CLIENT_ID`: Paste your actual Client ID
   - `OAUTH_GOOGLE_CLIENT_SECRET`: Paste your actual Client Secret
   - `JWT_SECRET`: Generate a secure random string (see below)

4. **Generate JWT Secret** (run in terminal):

```bash
openssl rand -base64 32
```

Copy the output and use it as your `JWT_SECRET`.

---

### **Step 3: Restart the Backend**

```bash
cd /Users/amiad.dvir/private-dev
docker-compose down
docker-compose up -d
```

Wait 10-15 seconds for the backend to fully start.

---

### **Step 4: Test OAuth Login**

#### **Option A: Use the Frontend (Recommended)**

1. Open: `http://localhost:3000`
2. Click **"Sign in with Google"** button
3. You should be redirected to Google's consent screen
4. After authorizing, you'll be redirected back and logged in

#### **Option B: Test Backend Directly**

Open this URL in your browser:

```
http://localhost:8080/oauth2/authorization/google
```

**Expected behavior**:
- ✅ Browser redirects to Google's OAuth consent screen
- ✅ After login, redirects back to `http://localhost:3000/auth/callback`
- ✅ JWT cookie is set

**❌ If you still get 404**:
- Check `.env` file has correct credentials
- Check backend logs: `docker logs tzav-rishon-server`
- Make sure you restarted: `docker-compose restart server`

---

## 🔍 **Understanding OAuth Endpoints**

| Endpoint | Purpose | Who Calls It |
|----------|---------|--------------|
| `/oauth2/authorization/google` | Initiates OAuth flow, redirects to Google | Frontend (browser redirect) |
| `/login/oauth2/code/google` | Callback from Google after user authorizes | Google (automatic redirect) |
| `/api/v1/auth/me` | Get current user info | Frontend (API call) |
| `/api/v1/auth/logout` | Logout and clear cookie | Frontend (API call) |

**Note**: `/api/v1/auth/google/login` in the codebase is configured as an alias for `/oauth2/authorization/google`.

---

## 🐛 **Troubleshooting**

### **"redirect_uri_mismatch" error from Google**

**Problem**: The redirect URI in Google Cloud Console doesn't match the one your app is using.

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth Client ID
3. Make sure **Authorized redirect URIs** includes:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```
4. Click **Save**
5. Wait 1-2 minutes for changes to propagate

### **Still getting 404 after configuration**

**Check backend logs**:
```bash
docker logs tzav-rishon-server 2>&1 | grep -i oauth
```

**Expected in logs**:
- `OAuth2AuthorizationRequestRedirectFilter` should be registered
- `OAuth2LoginAuthenticationFilter` should be registered

**If missing**, check:
1. `.env` file has correct format (no extra spaces, quotes)
2. Environment variables are loaded: `docker-compose config | grep OAUTH`
3. Restart with fresh build: `docker-compose up -d --build server`

### **"invalid_client" error from Google**

**Problem**: Client ID or Client Secret is incorrect.

**Solution**:
1. Double-check credentials in `.env` match Google Cloud Console exactly
2. No extra spaces or quotes around values
3. Restart backend: `docker-compose restart server`

---

## 📱 **Frontend Integration**

The frontend should have a "Sign in with Google" button that redirects to:

```typescript
// In your React component
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:8080/oauth2/authorization/google';
};
```

After successful login, the user will be redirected to `http://localhost:3000/auth/callback` with a JWT cookie set.

---

## 🔒 **Security Notes**

### **For Development**
- Using `http://localhost` is fine
- JWT secret can be simple for local testing

### **For Production**
1. **OAuth Redirect URI** must be HTTPS:
   ```
   https://yourdomain.com/login/oauth2/code/google
   ```

2. **JWT Secret** must be cryptographically secure:
   ```bash
   openssl rand -base64 64
   ```

3. **Environment Variables** should be stored securely:
   - Use secrets management (AWS Secrets Manager, Azure Key Vault, etc.)
   - Never commit `.env` to git
   - Use different credentials for prod vs dev

4. **Google OAuth Consent Screen**:
   - Change from "Testing" to "Published"
   - Add privacy policy URL
   - Add terms of service URL

---

## ✅ **Success Checklist**

After setup, verify:

- [ ] `.env` file exists with valid Google OAuth credentials
- [ ] Backend starts without errors: `docker logs tzav-rishon-server`
- [ ] `http://localhost:8080/oauth2/authorization/google` redirects to Google
- [ ] After Google login, redirects back to `http://localhost:3000/auth/callback`
- [ ] JWT cookie is set in browser
- [ ] `/api/v1/auth/me` returns user info

---

## 📞 **Need Help?**

If you're still having issues:

1. **Check backend logs**:
   ```bash
   docker logs tzav-rishon-server -f
   ```

2. **Verify environment variables**:
   ```bash
   docker-compose config | grep OAUTH
   ```

3. **Test OAuth flow step by step**:
   ```bash
   # Should redirect (302) to Google
   curl -I http://localhost:8080/oauth2/authorization/google
   ```

---

**Status**: OAuth is **not configured** by default. Follow this guide to set it up! 🚀

