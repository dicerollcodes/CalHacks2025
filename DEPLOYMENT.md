# 🚀 Shatter the Ice - Deployment Guide

Complete guide to deploying your app to **Heroku (Backend)** and **GitHub Pages (Frontend)**.

---

## 📋 Prerequisites

- Heroku account and [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- GitHub account
- Your repository pushed to GitHub
- MongoDB Atlas database URL
- Anthropic API key

---

## 🔧 Part 1: Deploy Backend to Heroku

### Step 1: Prepare Your Repository

Make sure you're in the server directory:
```bash
cd /Users/eddyz/CalHacks2025/server
```

### Step 2: Login to Heroku

```bash
heroku login
```

### Step 3: Create Heroku App

```bash
heroku create shatter-the-ice-api
# Or use your own name: heroku create your-app-name
```

This will output a URL like: `https://shatter-the-ice-api.herokuapp.com`

**⚠️ SAVE THIS URL - you'll need it for the frontend!**

### Step 4: Set Environment Variables

Set all your environment variables on Heroku:

```bash
# Required variables
heroku config:set MONGODB_URI="your-mongodb-atlas-connection-string"
heroku config:set ANTHROPIC_API_KEY="your-anthropic-api-key"
heroku config:set JWT_SECRET="your-secret-key-here"

# Email service (Brevo)
heroku config:set BREVO_API_KEY="your-brevo-api-key"
heroku config:set EMAIL_FROM="noreply@yourapp.com"

# Client URL (we'll update this after deploying frontend)
heroku config:set CLIENT_URL="https://yourusername.github.io/CalHacks2025"

# Optional: Node environment
heroku config:set NODE_ENV="production"
```

### Step 5: Deploy to Heroku

Initialize git if not already done (from server directory):
```bash
git init
git add .
git commit -m "Prepare for Heroku deployment"
```

Add Heroku remote and deploy:
```bash
heroku git:remote -a shatter-the-ice-api
git push heroku main
```

Or if you're in the monorepo:
```bash
# From root directory
git subtree push --prefix server heroku main
```

### Step 6: Verify Deployment

```bash
# Check if app is running
heroku logs --tail

# Open in browser
heroku open
```

Visit `https://your-app-name.herokuapp.com/health` - you should see:
```json
{"status":"ok","timestamp":"2025-..."}
```

### Step 7: (Optional) Scale Dynos

```bash
heroku ps:scale web=1
```

---

## 🎨 Part 2: Deploy Frontend to GitHub Pages

### Step 1: Install gh-pages Package

From the client directory:
```bash
cd /Users/eddyz/CalHacks2025/client
npm install --save-dev gh-pages
```

### Step 2: Update package.json

Add these scripts to `client/package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### Step 3: Configure vite.config.js

Update `client/vite.config.js` for GitHub Pages:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/CalHacks2025/', // Change to your repo name
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

### Step 4: Create .env.production File

Create `client/.env.production` with your Heroku backend URL:
```env
VITE_API_URL=https://shatter-the-ice-api.herokuapp.com/api
VITE_SOCKET_URL=https://shatter-the-ice-api.herokuapp.com
```

**Replace with YOUR actual Heroku app URL from Step 3 of backend deployment!**

### Step 5: Update Remaining API Calls

Some files still have hardcoded `localhost:3000`. Update these files to use the config:

**Files to update:**
- `src/pages/Preferences.jsx`
- `src/pages/Explore.jsx`
- `src/pages/AddInterests.jsx`
- `src/pages/CreateProfile.jsx`
- `src/pages/Auth.jsx`
- `src/services/auth.js`

**Pattern to replace:**
```javascript
// OLD:
fetch('http://localhost:3000/api/...')

// NEW:
import { API_BASE_URL } from '../config/api'
const apiUrl = import.meta.env.MODE === 'production' ? `${API_BASE_URL}/...` : `/api/...`
fetch(apiUrl)
```

### Step 6: Test Production Build Locally

```bash
npm run build
npm run preview
```

Visit `http://localhost:4173` and test the app.

### Step 7: Deploy to GitHub Pages

Make sure your changes are committed to your GitHub repository:
```bash
cd /Users/eddyz/CalHacks2025
git add .
git commit -m "Configure for production deployment"
git push origin main
```

Then deploy from the client directory:
```bash
cd client
npm run deploy
```

This will:
1. Build your app (`npm run build`)
2. Deploy to `gh-pages` branch
3. GitHub Pages will automatically serve it

### Step 8: Enable GitHub Pages

1. Go to your GitHub repository settings
2. Navigate to **Pages** (in left sidebar)
3. Under **Source**, select branch: `gh-pages` and folder: `/ (root)`
4. Click **Save**

Your site will be live at: `https://yourusername.github.io/CalHacks2025/`

### Step 9: Update Heroku CLIENT_URL

Now that you know your GitHub Pages URL, update it on Heroku:
```bash
cd /Users/eddyz/CalHacks2025/server
heroku config:set CLIENT_URL="https://yourusername.github.io/CalHacks2025"
```

This ensures CORS allows requests from your frontend.

---

## ✅ Part 3: Verify Everything Works

### Test Checklist:

1. **Backend Health Check**
   - Visit: `https://your-heroku-app.herokuapp.com/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend Loads**
   - Visit: `https://yourusername.github.io/CalHacks2025/`
   - Home page should load

3. **Authentication Works**
   - Try signing up with email verification
   - Check Heroku logs: `heroku logs --tail`

4. **API Calls Work**
   - Create a profile
   - Add interests
   - Visit another user's profile to shatter the ice
   - Check browser console for errors

5. **Real-time Messaging**
   - Send a message to another user
   - Verify Socket.IO connection in Network tab

---

## 🐛 Troubleshooting

### Backend Issues:

**App crashes on Heroku:**
```bash
heroku logs --tail
heroku restart
```

**Database connection fails:**
- Verify `MONGODB_URI` is set correctly
- Check MongoDB Atlas allows Heroku IPs (0.0.0.0/0 for testing)

**API returns 500 errors:**
- Check environment variables: `heroku config`
- View logs: `heroku logs --tail`

### Frontend Issues:

**404 on GitHub Pages:**
- Ensure `base` in `vite.config.js` matches your repo name
- Check that `gh-pages` branch exists

**API calls fail (CORS errors):**
- Verify `.env.production` has correct Heroku URL
- Check `CLIENT_URL` on Heroku matches your GitHub Pages URL
- Clear browser cache

**Blank page:**
- Check browser console for errors
- Verify build was successful: `npm run build`
- Test locally: `npm run preview`

---

## 🔄 Making Updates

### Update Backend:
```bash
cd server
git add .
git commit -m "Update backend"
git push heroku main
# Or from root: git subtree push --prefix server heroku main
```

### Update Frontend:
```bash
cd client
npm run deploy
```

---

## 📊 Monitoring

### View Heroku Logs:
```bash
heroku logs --tail
```

### Check Heroku Metrics:
```bash
heroku ps
heroku config
```

---

## 🎉 Success!

Your app is now live!

- **Frontend:** `https://yourusername.github.io/CalHacks2025/`
- **Backend API:** `https://your-heroku-app.herokuapp.com/`

Share your frontend URL to let people shatter the ice! 🧊

---

## 💡 Tips for Demo

1. **Pre-populate test users:** Run `node populate-fake-users.js` on Heroku:
   ```bash
   heroku run node populate-fake-users.js
   ```

2. **Monitor during demo:** Keep `heroku logs --tail` running

3. **Have backup accounts ready:** Create 2-3 test accounts before demo

4. **Test on mobile:** GitHub Pages URL should work on phones too!

---

## 🆘 Emergency Commands

```bash
# Restart Heroku app
heroku restart

# View recent logs
heroku logs --tail --num 100

# Check dyno status
heroku ps

# Scale up (if slow)
heroku ps:scale web=1

# Open Heroku dashboard
heroku open

# SSH into Heroku (for debugging)
heroku run bash
```

---

Good luck with your demo! 🚀
