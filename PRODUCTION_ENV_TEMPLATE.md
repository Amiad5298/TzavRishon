# 🔧 Production Environment Variables Template

This file contains the exact environment variables you need to set in **Render** for production deployment.

---

## 📋 Backend Environment Variables (Render Web Service)

Copy these to your **tzavrishon-server** service in Render:

```env
# ===== DATABASE (Neon Cloud) =====
DATABASE_URL=YOUR_DATABASE_URL
DATABASE_USERNAME=YOUR_DATABASE_USERNAME
DATABASE_PASSWORD=YOUR_DATABASE_PASSWORD

# ===== JWT AUTHENTICATION =====
JWT_SECRET=YOUR_JWT_SECRET

# ===== GOOGLE OAUTH =====
OAUTH_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
OAUTH_GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
OAUTH_GOOGLE_REDIRECT_URI=https://tzavrishonplus.co.il/login/oauth2/code/google

# ===== APPLICATION SETTINGS =====
APP_FRONTEND_URL=https://tzavrishonplus.co.il
APP_GUEST_PRACTICE_LIMIT_PER_TYPE=5
APP_SECTION_COUNTS=VERBAL_ANALOGY:10,SHAPE_ANALOGY:10,INSTRUCTIONS_DIRECTIONS:10,QUANTITATIVE:10
APP_SECTION_DURATIONS_SEC=VERBAL_ANALOGY:480,SHAPE_ANALOGY:480,INSTRUCTIONS_DIRECTIONS:360,QUANTITATIVE:600

# ===== ADSENSE (Optional) =====
ADSENSE_ENABLED=false
ADSENSE_CLIENT=
```

---

## 🎨 Frontend Environment Variables (Render Static Site)

Copy these to your **tzavrishon-web** service in Render:

```env
# ===== API CONFIGURATION =====
VITE_API_BASE=https://tzavrishonplus.co.il/api/v1

# ===== ADSENSE (Optional) =====
VITE_ADSENSE_ENABLED=false
```

---

## 🔄 Alternative: Using API Subdomain

If you decide to use a separate subdomain for your API (e.g., `api.tzavrishonplus.co.il`):

### Backend Environment Variables

```env
# Update these:
OAUTH_GOOGLE_REDIRECT_URI=https://api.tzavrishonplus.co.il/login/oauth2/code/google
APP_FRONTEND_URL=https://tzavrishonplus.co.il
```

### Frontend Environment Variables

```env
# Update this:
VITE_API_BASE=https://api.tzavrishonplus.co.il/api/v1
```

### Google OAuth Configuration

Add to **Authorized redirect URIs**:
```
https://api.tzavrishonplus.co.il/login/oauth2/code/google
```

---

## 📝 How to Add Environment Variables in Render

### For Web Service (Backend)

1. Go to https://dashboard.render.com
2. Select your **tzavrishon-server** service
3. Click **"Environment"** in the left sidebar
4. Click **"Add Environment Variable"**
5. Add each variable one by one:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value
6. Click **"Save Changes"**
7. Service will automatically redeploy

### For Static Site (Frontend)

1. Select your **tzavrishon-web** service
2. Click **"Environment"** in the left sidebar
3. Add environment variables
4. Click **"Save Changes"**
5. Trigger manual deploy if needed

---

## ✅ Verification Checklist

After setting environment variables, verify:

- [ ] All backend variables are set (15 variables)
- [ ] All frontend variables are set (2 variables)
- [ ] `APP_FRONTEND_URL` matches your domain
- [ ] `OAUTH_GOOGLE_REDIRECT_URI` matches your domain
- [ ] `VITE_API_BASE` points to correct API URL
- [ ] No typos in URLs (check https:// prefix)
- [ ] Database credentials are correct
- [ ] JWT secret is the same as local

---

## 🔐 Security Notes

### ✅ Safe to Share (Public)
- `DATABASE_URL` (contains host but not full credentials)
- `APP_FRONTEND_URL`
- `OAUTH_GOOGLE_CLIENT_ID`
- `VITE_API_BASE`

### ⚠️ Keep Secret (Never Share)
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `OAUTH_GOOGLE_CLIENT_SECRET`

### 🔒 Best Practices
1. Never commit `.env` files to git
2. Use different JWT secrets for dev/prod
3. Rotate secrets periodically
4. Use Render's secret management (environment variables are encrypted)
5. Enable 2FA on your Render account

---

## 🐛 Common Issues

### Issue: "Database connection failed"

**Check**:
- `DATABASE_URL` is correct
- `DATABASE_USERNAME` is correct
- `DATABASE_PASSWORD` is correct
- Neon database is active (check Neon dashboard)

### Issue: "CORS error"

**Check**:
- `APP_FRONTEND_URL` matches your actual frontend URL
- No trailing slash in `APP_FRONTEND_URL`
- Frontend is deployed and accessible

### Issue: "OAuth redirect_uri_mismatch"

**Check**:
- `OAUTH_GOOGLE_REDIRECT_URI` matches exactly what's in Google Console
- No typos or extra characters
- HTTPS (not HTTP) in production

### Issue: "JWT token invalid"

**Check**:
- `JWT_SECRET` is the same in all environments
- `JWT_SECRET` is at least 64 characters
- No extra spaces or newlines in the secret

---

## 🔄 Updating Environment Variables

When you need to change environment variables:

1. Go to Render dashboard
2. Select your service
3. Click **"Environment"**
4. Edit the variable
5. Click **"Save Changes"**
6. Service will automatically redeploy

**Note**: Changing environment variables triggers a redeploy, which may cause a few minutes of downtime.

---

## 📊 Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection URL |
| `DATABASE_USERNAME` | ✅ Yes | - | Database username |
| `DATABASE_PASSWORD` | ✅ Yes | - | Database password |
| `JWT_SECRET` | ✅ Yes | - | Secret for JWT signing (64+ chars) |
| `OAUTH_GOOGLE_CLIENT_ID` | ✅ Yes | - | Google OAuth client ID |
| `OAUTH_GOOGLE_CLIENT_SECRET` | ✅ Yes | - | Google OAuth client secret |
| `OAUTH_GOOGLE_REDIRECT_URI` | ✅ Yes | - | OAuth callback URL |
| `APP_FRONTEND_URL` | ✅ Yes | - | Frontend URL for CORS |
| `APP_GUEST_PRACTICE_LIMIT_PER_TYPE` | ❌ No | 5 | Guest practice limit |
| `APP_SECTION_COUNTS` | ✅ Yes | - | Exam section question counts |
| `APP_SECTION_DURATIONS_SEC` | ✅ Yes | - | Exam section durations |
| `ADSENSE_ENABLED` | ❌ No | false | Enable Google AdSense |
| `ADSENSE_CLIENT` | ❌ No | - | AdSense client ID |
| `VITE_API_BASE` | ✅ Yes | - | API base URL for frontend |
| `VITE_ADSENSE_ENABLED` | ❌ No | false | Enable AdSense in frontend |

---

## 🎯 Quick Copy-Paste

### Backend (15 variables)

```
DATABASE_URL=YOUR_DATABASE_URL
DATABASE_USERNAME=YOUR_DATABASE_USERNAME
DATABASE_PASSWORD=YOUR_DATABASE_PASSWORD
JWT_SECRET=YOUR_JWT_SECRET
OAUTH_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
OAUTH_GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
OAUTH_GOOGLE_REDIRECT_URI=https://tzavrishonplus.co.il/login/oauth2/code/google
APP_FRONTEND_URL=https://tzavrishonplus.co.il
APP_GUEST_PRACTICE_LIMIT_PER_TYPE=5
APP_SECTION_COUNTS=VERBAL_ANALOGY:10,SHAPE_ANALOGY:10,INSTRUCTIONS_DIRECTIONS:10,QUANTITATIVE:10
APP_SECTION_DURATIONS_SEC=VERBAL_ANALOGY:480,SHAPE_ANALOGY:480,INSTRUCTIONS_DIRECTIONS:360,QUANTITATIVE:600
ADSENSE_ENABLED=false
ADSENSE_CLIENT=
```

### Frontend (2 variables)

```
VITE_API_BASE=https://tzavrishonplus.co.il/api/v1
VITE_ADSENSE_ENABLED=false
```

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs/environment-variables
- **Neon Dashboard**: https://console.neon.tech
- **Google Cloud Console**: https://console.cloud.google.com

---

**Ready to deploy?** Follow the steps in `RENDER_DEPLOYMENT_GUIDE.md`! 🚀

