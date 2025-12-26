# Render Deployment Fix for Next.js

## Problem
The deployment is failing with: `Publish directory dist does not exist!`

This happens because your Render service is configured as a **Static Site** but Next.js requires a **Web Service** with a Node.js server.

## Solution

### Quick Fix (via Render Dashboard)

1. **Go to your Render Dashboard**: https://dashboard.render.com/

2. **Delete the current Static Site** (if it exists)

3. **Create a New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `Amiad5298/TzavRishon`
   - Select the `main` branch

4. **Configure the Service**:
   ```
   Name: tzavrishon-web
   Region: Frankfurt (or closest to your users)
   Branch: main
   Root Directory: web
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm run start
   ```

5. **Set Environment Variables**:
   ```
   NEXT_PUBLIC_SITE_URL=https://tzavrishonplus.co.il
   NEXT_PUBLIC_API_URL=https://your-api-url.com/api/v1
   NODE_VERSION=22.16.0
   ```

6. **Advanced Settings**:
   - **Port**: 3000 (or leave auto-detect)
   - **Health Check Path**: `/`
   - **Auto-Deploy**: Yes

7. **Click "Create Web Service"**

### Alternative: Use render.yaml (Infrastructure as Code)

If you prefer to manage configuration via code:

1. The `render.yaml` file has been created in the repository root
2. Commit and push it:
   ```bash
   git add render.yaml RENDER_DEPLOYMENT_FIX.md
   git commit -m "docs: Add Render deployment configuration"
   git push origin main
   ```

3. In Render Dashboard:
   - Go to "Blueprint" → "New Blueprint Instance"
   - Connect your repository
   - Render will automatically detect and use `render.yaml`

## Key Differences: Static Site vs Web Service

| Feature | Static Site | Web Service (Next.js) |
|---------|-------------|----------------------|
| Output | HTML/CSS/JS files in `dist/` | Node.js server with `.next/` |
| Deployment | Files copied to CDN | Server runs continuously |
| Routing | Client-side only | Server-side + Client-side |
| SEO | Limited (CSR) | Full (SSR) ✅ |
| API Routes | Not supported | Supported ✅ |
| Cost | Free (100GB bandwidth) | Free tier available |

## Verification

After deployment succeeds:

1. **Check the URL**: Your service will be at `https://tzavrishon-web.onrender.com`
2. **Test SSR**: View page source - you should see full HTML content
3. **Custom Domain**: Add `tzavrishonplus.co.il` in Render settings

## Troubleshooting

### Build succeeds but deployment fails
- Make sure you're using **Web Service**, not Static Site
- Verify `Start Command` is set to `npm run start`

### Port binding errors
- Render automatically sets `PORT` environment variable
- Next.js uses port 3000 by default, but will use `PORT` if set

### Environment variables not working
- Make sure they start with `NEXT_PUBLIC_` for client-side access
- Server-side variables don't need the prefix

### Health check fails
- Set Health Check Path to `/` or any valid route
- Make sure the server responds with 200 OK

## Next Steps

1. ✅ Fix Render configuration (Web Service)
2. ✅ Deploy and verify
3. Add custom domain `tzavrishonplus.co.il`
4. Configure SSL (automatic with Render)
5. Submit to Google Search Console for indexing

## Support

- Render Docs: https://render.com/docs/web-services
- Next.js Deployment: https://nextjs.org/docs/deployment

