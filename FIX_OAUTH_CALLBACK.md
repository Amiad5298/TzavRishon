# Fix OAuth Callback 404 Error

## 🐛 **The Problem**

After Google authorization, you're getting a 404 error because:

- **Google redirects to**: `http://localhost:8080/api/v1/auth/google/callback`  
- **Spring Boot expects**: `http://localhost:8080/login/oauth2/code/google` (default)

## ✅ **The Solution (3 Steps)**

### **Step 1: Update Your `.env` File**

Open your `.env` file:

```bash
nano /Users/amiad.dvir/private-dev/.env
```

**Add or update this line**:

```bash
OAUTH_GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
```

**Save and exit** (Ctrl+O, Enter, Ctrl+X in nano)

---

### **Step 2: Update Google Cloud Console**

1. Go to: https://console.cloud.google.com/apis/credentials

2. Click the **pencil icon** next to your OAuth Client:
   - `243845576904-quct3mod7ko7fnltaiqaat1be76ctkiv`

3. In **"Authorized redirect URIs"**:
   
   **Remove the old URI**:
   ```
   ❌ http://localhost:8080/api/v1/auth/google/callback
   ```
   
   **Add the new URI**:
   ```
   ✅ http://localhost:8080/login/oauth2/code/google
   ```

4. Click **"SAVE"**

5. **⏱️ Wait 2 minutes** for changes to propagate

---

### **Step 3: Restart Backend**

Run these commands:

```bash
cd /Users/amiad.dvir/private-dev
docker-compose stop server
docker-compose up -d server
```

Wait 15 seconds for the backend to start.

---

## 🧪 **Test the Fix**

1. Open: `http://localhost:3000`
2. Click **"התחבר"**
3. Select your Google account
4. Approve
5. Should redirect to `http://localhost:3000/auth/callback` ✅
6. Then redirect to home page ✅
7. You're logged in! ✅

---

## 📋 **What Changed**

### **Before (Broken)**

```
Start OAuth → /api/v1/auth/google/login/google
Google redirects to → /api/v1/auth/google/callback ❌ (404 - not handled)
```

### **After (Working)**

```
Start OAuth → /api/v1/auth/google/login/google
Google redirects to → /login/oauth2/code/google ✅ (handled by Spring)
Backend redirects to → http://localhost:3000/auth/callback
Frontend shows → "מתחבר..." → Home page
User is logged in! ✅
```

---

## 🔍 **Verify Configuration**

After restarting, check the backend has the correct URI:

```bash
docker exec tzav-rishon-server env | grep OAUTH_GOOGLE_REDIRECT_URI
```

**Should show**:
```
OAUTH_GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
```

---

## ✅ **Success Checklist**

- [ ] Updated `.env` with correct redirect URI
- [ ] Updated Google Console with correct redirect URI
- [ ] Clicked "SAVE" in Google Console
- [ ] Waited 2 minutes
- [ ] Restarted backend with `docker-compose stop server && docker-compose up -d server`
- [ ] Waited 15 seconds for startup
- [ ] Tested login at `http://localhost:3000`
- [ ] Selected Google account
- [ ] Approved app
- [ ] Redirected to `http://localhost:3000/auth/callback`
- [ ] Saw "מתחבר..." message
- [ ] Redirected to home
- [ ] Avatar appears in navbar
- [ ] Logged in successfully! ✅

---

## 🎯 **Quick Commands**

```bash
# 1. Edit .env (add OAUTH_GOOGLE_REDIRECT_URI line)
nano /Users/amiad.dvir/private-dev/.env

# 2. Restart backend
cd /Users/amiad.dvir/private-dev
docker-compose stop server && docker-compose up -d server

# 3. Wait for startup
sleep 15

# 4. Verify new redirect URI
docker exec tzav-rishon-server env | grep OAUTH_GOOGLE_REDIRECT_URI

# 5. Test in browser
open http://localhost:3000
```

---

## 🐛 **Still Not Working?**

### **Check Backend Logs**

```bash
docker logs tzav-rishon-server --tail 50
```

Look for errors or the correct redirect URI being loaded.

### **Check Google Console**

Make sure **Authorized redirect URIs** shows:
```
☑ http://localhost:8080/login/oauth2/code/google
```

NOT:
```
☒ http://localhost:8080/api/v1/auth/google/callback
```

### **Clear Browser Cache**

Try in an incognito/private window to avoid cached OAuth state.

---

## 📝 **Why This Fix Works**

Spring Boot OAuth2 has a default callback path pattern:
```
/login/oauth2/code/{registrationId}
```

For Google (registration ID = `google`), the path is:
```
/login/oauth2/code/google
```

We were trying to use a custom path `/api/v1/auth/google/callback`, but Spring Boot wasn't configured to handle it. Instead of customizing Spring Boot, it's easier to use its default path.

---

**Follow the 3 steps above and you'll be logged in!** 🚀

