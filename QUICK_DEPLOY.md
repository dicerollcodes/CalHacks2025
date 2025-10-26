# ⚡ Quick Deploy Checklist

**Time required:** ~15-20 minutes

Follow these steps in order for a smooth deployment!

---

## 🔙 Backend (Heroku) - 10 minutes

### 1. Create Heroku App
```bash
cd server
heroku create your-app-name
```
**→ Save the URL that's output!**

### 2. Set Environment Variables
```bash
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set ANTHROPIC_API_KEY="your-key"
heroku config:set JWT_SECRET="any-random-string"
heroku config:set BREVO_API_KEY="your-brevo-key"
heroku config:set EMAIL_FROM="noreply@yourapp.com"
heroku config:set CLIENT_URL="https://yourusername.github.io/CalHacks2025"
```

### 3. Deploy
```bash
git add .
git commit -m "Deploy backend"

# If server is a subdirectory:
git subtree push --prefix server heroku main

# If server is root:
git push heroku main
```

### 4. Verify
```bash
heroku open
# Visit /health endpoint - should see {"status":"ok"}
```

✅ **Backend Done!** Copy your Heroku URL for the next step.

---

## 🎨 Frontend (GitHub Pages) - 10 minutes

### 1. Create .env.production
```bash
cd client
cat > .env.production << EOF
VITE_API_URL=https://your-heroku-app.herokuapp.com/api
VITE_SOCKET_URL=https://your-heroku-app.herokuapp.com
EOF
```
**→ Replace with YOUR Heroku URL!**

### 2. Update vite.config.js Base
Make sure `base:` matches your GitHub repo name:
```javascript
base: '/CalHacks2025/', // Change if your repo has a different name
```

### 3. Update package.json Homepage
```json
"homepage": "https://yourusername.github.io/CalHacks2025"
```
**→ Replace 'yourusername' with your actual GitHub username!**

### 4. Install gh-pages
```bash
npm install --save-dev gh-pages
```

### 5. Deploy
```bash
npm run deploy
```

### 6. Enable GitHub Pages
1. Go to your repo on GitHub
2. Settings → Pages
3. Source: `gh-pages` branch, `/ (root)` folder
4. Save

✅ **Frontend Done!** Your site will be live in ~1 minute.

---

## 🔄 Update Backend with Frontend URL

```bash
cd server
heroku config:set CLIENT_URL="https://yourusername.github.io/CalHacks2025"
```

---

## ✨ Test Your Deployment

1. Visit: `https://yourusername.github.io/CalHacks2025/`
2. Try signing up with email
3. Create a profile
4. Add interests
5. Visit another user's profile

---

## 🐛 If Something Breaks

**Backend issues:**
```bash
heroku logs --tail
```

**Frontend issues:**
- Check browser console (F12)
- Verify .env.production has correct URLs
- Try: `npm run build && npm run preview` locally

---

## 🔄 Making Updates Later

**Backend:**
```bash
cd server
git push heroku main
```

**Frontend:**
```bash
cd client
npm run deploy
```

---

## 🎉 You're Live!

Share your URL: `https://yourusername.github.io/CalHacks2025/`

**Pro tip:** Pre-populate test users for your demo:
```bash
heroku run node populate-fake-users.js
```

---

**Need help?** Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide.
