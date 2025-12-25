# 🔐 Google OAuth Production Setup Guide

Complete guide to configure Google OAuth for your production domain **tzavrishonplus.co.il**.

---

## 📋 Current OAuth Configuration

Your current OAuth credentials are configured for **localhost only**:

```env
OAUTH_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
OAUTH_GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
OAUTH_GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
```

---

## 🎯 What You Need to Do

You have **two options**:

### **Option A: Update Existing OAuth Client (Recommended)**
Add production URLs to your existing OAuth client. This allows both localhost and production to work.

### **Option B: Create New OAuth Client**
Create a separate OAuth client for production. This keeps dev and prod credentials separate.

We recommend **Option A** for simplicity.

---

## 🔧 Option A: Update Existing OAuth Client

### Step 1: Open Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Select your project (or the project where you created OAuth credentials)
3. Navigate to **APIs & Services** → **Credentials**

### Step 2: Find Your OAuth Client

1. Look for **OAuth 2.0 Client IDs** section
2. Find the client with ID: `243845576904-quct3mod7ko7fnltaiqaat1be76ctkiv.apps.googleusercontent.com`
3. Click on it to edit

### Step 3: Add Production URLs

#### Authorized JavaScript Origins

Add these URLs (keep existing localhost URLs):

```
http://localhost:3000
https://tzavrishonplus.co.il
```

**If using API subdomain, also add:**
```
https://api.tzavrishonplus.co.il
```

#### Authorized Redirect URIs

Add these URLs (keep existing localhost URLs):

```
http://localhost:8080/login/oauth2/code/google
https://tzavrishonplus.co.il/login/oauth2/code/google
```

**If using API subdomain:**
```
http://localhost:8080/login/oauth2/code/google
https://api.tzavrishonplus.co.il/login/oauth2/code/google
```

### Step 4: Save Changes

1. Click **"Save"** at the bottom
2. Wait a few minutes for changes to propagate (usually instant)

---

## 🆕 Option B: Create New OAuth Client (Alternative)

### Step 1: Create New OAuth Client

1. Go to https://console.cloud.google.com/
2. Navigate to **APIs & Services** → **Credentials**
3. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
4. Select **"Web application"**
5. Name it: `Tzav Rishon Plus - Production`

### Step 2: Configure URLs

#### Authorized JavaScript Origins
```
https://tzavrishonplus.co.il
```

#### Authorized Redirect URIs
```
https://tzavrishonplus.co.il/login/oauth2/code/google
```

### Step 3: Get New Credentials

1. Click **"Create"**
2. Copy the **Client ID** and **Client Secret**
3. Update your production `.env` file with these new credentials

---

## 📱 Step 5: Publish OAuth Consent Screen

**IMPORTANT**: If your OAuth consent screen is in "Testing" mode, only test users can log in.

### Check Current Status

1. Go to **APIs & Services** → **OAuth consent screen**
2. Check the **Publishing status**

### If Status is "Testing"

1. Click **"PUBLISH APP"**
2. Review the information
3. Click **"Confirm"**

**Note**: Publishing allows any Google user to log in. If you want to restrict access, keep it in Testing mode and add specific test users.

### Add Test Users (If Keeping in Testing Mode)

1. Scroll to **Test users** section
2. Click **"+ ADD USERS"**
3. Add email addresses of users who should have access
4. Click **"Save"**

---

## 🔄 Update Environment Variables

After configuring Google OAuth, update your environment variables:

### For Production (Render)

Update these in Render dashboard:

```env
OAUTH_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
OAUTH_GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
OAUTH_GOOGLE_REDIRECT_URI=https://tzavrishonplus.co.il/login/oauth2/code/google
APP_FRONTEND_URL=https://tzavrishonplus.co.il
```

### For Local Development

Keep your local `.env` as is:

```env
OAUTH_GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
APP_FRONTEND_URL=http://localhost:3000
```

---

## ✅ Testing OAuth

### Test Locally

1. Start your app: `docker-compose up`
2. Open http://localhost:3000
3. Click "התחבר" (Login)
4. Should redirect to Google
5. After login, should redirect back to localhost

### Test Production

1. Open https://tzavrishonplus.co.il
2. Click "התחבר" (Login)
3. Should redirect to Google
4. After login, should redirect back to your domain

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause**: The redirect URI in your request doesn't match what's configured in Google Console.

**Solution**:
1. Check the exact error message for the redirect URI being used
2. Make sure it's added to **Authorized redirect URIs** in Google Console
3. Make sure there are no typos or extra slashes
4. Wait a few minutes after saving changes in Google Console

### Error: "Access blocked: This app's request is invalid"

**Cause**: OAuth consent screen is not properly configured.

**Solution**:
1. Go to **OAuth consent screen**
2. Make sure all required fields are filled
3. Add required scopes (email, profile, openid)
4. Save and try again

### Error: "This app isn't verified"

**Cause**: Your app is in Testing mode or not verified by Google.

**Solution**:
1. Click **"Advanced"** → **"Go to [Your App] (unsafe)"**
2. This is normal for apps in development
3. To remove this warning, you need to verify your app (requires Google review)

### Users can't log in (403 error)

**Cause**: OAuth consent screen is in Testing mode and user is not added as test user.

**Solution**:
1. Either publish the app (allows anyone to log in)
2. Or add the user's email to test users list

---

## 📊 OAuth Scopes

Your app requests these scopes:

- `openid` - Basic authentication
- `profile` - User's name and profile picture
- `email` - User's email address

These are configured in your Spring Security OAuth2 configuration and don't need to be changed.

---

## 🔒 Security Best Practices

### ✅ Do's

- ✅ Keep `OAUTH_GOOGLE_CLIENT_SECRET` secret (never commit to git)
- ✅ Use HTTPS in production
- ✅ Regularly review authorized users
- ✅ Monitor OAuth usage in Google Console

### ❌ Don'ts

- ❌ Don't share your client secret publicly
- ❌ Don't use production credentials in development
- ❌ Don't add wildcard redirect URIs
- ❌ Don't skip HTTPS in production

---

## 📞 Quick Reference

### Google Cloud Console URLs

- **Credentials**: https://console.cloud.google.com/apis/credentials
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent
- **API Dashboard**: https://console.cloud.google.com/apis/dashboard

### Your OAuth Configuration

- **Client ID**: `243845576904-quct3mod7ko7fnltaiqaat1be76ctkiv.apps.googleusercontent.com`
- **Production Domain**: `tzavrishonplus.co.il`
- **Redirect URI**: `https://tzavrishonplus.co.il/login/oauth2/code/google`

---

## 🎉 Summary

1. ✅ Open Google Cloud Console
2. ✅ Add production URLs to OAuth client
3. ✅ Publish OAuth consent screen (or add test users)
4. ✅ Update environment variables in Render
5. ✅ Test login on production domain
6. 🎉 Done!

---

**Need help?** Check Google's OAuth documentation: https://developers.google.com/identity/protocols/oauth2

