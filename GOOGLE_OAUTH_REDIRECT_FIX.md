# Fix: Google OAuth Redirect URI Mismatch

## ❌ **Error You're Seeing**

```
Error 400: redirect_uri_mismatch

You can't sign in because this app sent an invalid request.
```

## ✅ **The Solution**

Your app is sending this redirect URI:
```
http://localhost:8080/api/v1/auth/google/callback
```

This exact URI must be added to Google Cloud Console.

---

## 🛠️ **Step-by-Step Fix**

### **1. Open Google Cloud Console**

Navigate to: https://console.cloud.google.com/apis/credentials

### **2. Select Your Project**

- Click the project dropdown at the top
- Make sure you're in the correct project

### **3. Find Your OAuth 2.0 Client ID**

- Under "OAuth 2.0 Client IDs" section
- Look for: `243845576904-quct3mod7ko7fnltaiqaat1be76ctkiv`
- Click the **pencil/edit icon** on the right

### **4. Add Redirect URI**

Scroll down to **"Authorized redirect URIs"**

**Click: "+ ADD URI"**

**Copy-paste EXACTLY** (no spaces, no trailing slash):
```
http://localhost:8080/api/v1/auth/google/callback
```

### **5. Save Changes**

- Click **"SAVE"** button at the bottom
- You'll see a confirmation message

### **6. Wait for Propagation**

⏱️ **Wait 1-2 minutes** for changes to take effect

Google needs time to propagate the configuration across their servers.

### **7. Test Again**

1. Go to: `http://localhost:3000`
2. Click **"התחבר"** (Login)
3. Should redirect to Google successfully
4. Authorize the app
5. You should be redirected back and logged in! ✅

---

## 📸 **What It Should Look Like**

### **Before (Missing Redirect URI)**

```
Authorized redirect URIs
[Empty or different URI]
```

### **After (Correct)**

```
Authorized redirect URIs
☑ http://localhost:8080/api/v1/auth/google/callback
```

---

## 🧪 **Verify the Fix**

After adding the URI and waiting 2 minutes:

```bash
# Test from terminal (should redirect to Google, no error)
open http://localhost:8080/api/v1/auth/google/login/google
```

**Expected**: Google consent screen appears (no error 400) ✅

---

## 🐛 **Common Mistakes**

### **Mistake 1: Wrong Protocol**

❌ `https://localhost:8080/api/v1/auth/google/callback`

✅ `http://localhost:8080/api/v1/auth/google/callback`

**Note**: Use `http` for localhost development, `https` for production.

---

### **Mistake 2: Trailing Slash**

❌ `http://localhost:8080/api/v1/auth/google/callback/`

✅ `http://localhost:8080/api/v1/auth/google/callback`

**Note**: No trailing slash!

---

### **Mistake 3: Extra Spaces**

❌ `http://localhost:8080/api/v1/auth/google/callback `

✅ `http://localhost:8080/api/v1/auth/google/callback`

**Note**: Trim any leading/trailing spaces when copy-pasting.

---

### **Mistake 4: Wrong Port**

❌ `http://localhost:3000/api/v1/auth/google/callback`

✅ `http://localhost:8080/api/v1/auth/google/callback`

**Note**: The callback is on the **backend** (port 8080), not frontend (port 3000).

---

## 🔍 **Still Not Working?**

### **Check 1: Verify the Exact URI**

Run this command to see what your app is sending:

```bash
curl -s -I http://localhost:8080/api/v1/auth/google/login/google | grep "Location:"
```

Look for `redirect_uri=` in the output.

### **Check 2: Wait Longer**

Sometimes Google takes up to 5 minutes to propagate changes.

- Wait 5 minutes
- Clear your browser cache
- Try in an incognito/private window

### **Check 3: Try Both URIs**

Some Spring Boot OAuth2 configs need **both** URIs:

Add these to Google Console:
```
http://localhost:8080/api/v1/auth/google/callback
http://localhost:8080/login/oauth2/code/google
```

(The second one is Spring Boot's default OAuth2 callback path)

### **Check 4: Verify Client ID**

Make sure the Client ID in the error message matches your `.env`:

**Error shows**: `client_id=243845576904-quct...`

**Your .env shows**:
```bash
docker exec tzav-rishon-server env | grep OAUTH_GOOGLE_CLIENT_ID
```

Should be the same!

---

## 📝 **Production Notes**

When deploying to production:

### **Update Redirect URI in Google Console**

```
# Development
http://localhost:8080/api/v1/auth/google/callback

# Production
https://yourdomain.com/api/v1/auth/google/callback
```

### **Update .env for Production**

```bash
# Use HTTPS in production
OAUTH_GOOGLE_REDIRECT_URI=https://yourdomain.com/api/v1/auth/google/callback
APP_FRONTEND_URL=https://yourdomain.com
```

### **Publish OAuth Consent Screen**

1. Go to: OAuth consent screen
2. Change status from **"Testing"** to **"Published"**
3. Submit for verification if needed

---

## ✅ **Success Checklist**

After completing the fix:

- [ ] Opened Google Cloud Console
- [ ] Found correct OAuth 2.0 Client ID
- [ ] Added redirect URI: `http://localhost:8080/api/v1/auth/google/callback`
- [ ] Clicked SAVE
- [ ] Waited 2 minutes
- [ ] Tested login at `http://localhost:3000`
- [ ] Google consent screen appears (no error 400)
- [ ] Authorized app
- [ ] Redirected back to `http://localhost:3000/auth/callback`
- [ ] Logged in successfully
- [ ] Avatar appears in navbar

---

## 🎯 **Quick Reference**

| What | Value |
|------|-------|
| **Google Console** | https://console.cloud.google.com/apis/credentials |
| **Redirect URI to Add** | `http://localhost:8080/api/v1/auth/google/callback` |
| **Client ID** | `243845576904-quct3mod7ko7fnltaiqaat1be76ctkiv` |
| **Test URL** | http://localhost:3000 → Click "התחבר" |

---

## 🚀 **After Fix**

Once the redirect URI is added, the complete OAuth flow will work:

1. ✅ Click "התחבר" → Redirects to Google
2. ✅ Google consent screen (no error)
3. ✅ Authorize app
4. ✅ Redirect to `http://localhost:3000/auth/callback`
5. ✅ Shows "מתחבר..." (connecting)
6. ✅ Redirects to home page
7. ✅ Avatar appears in navbar
8. ✅ You're logged in!

**Go add that redirect URI in Google Console and try again in 2 minutes!** 🎉

