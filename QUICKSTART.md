# 🚀 Quick Start Guide

Follow these steps to get Shatter the Ice running in under 5 minutes!

## ✅ Prerequisites Check

Before starting, ensure you have:

1. **Node.js** installed (v18+)
   ```bash
   node --version
   ```

2. **MongoDB** running locally
   ```bash
   # Check if MongoDB is running
   mongosh --eval "db.version()"

   # If not running, start it:
   # macOS (with Homebrew):
   brew services start mongodb-community

   # Or run manually:
   mongod --dbpath /usr/local/var/mongodb
   ```

3. **Anthropic API Key**
   - Get one at: https://console.anthropic.com
   - You'll need this for the semantic matching features

## 🎯 Step-by-Step Setup

### 1. Configure Environment

```bash
# Copy the example .env file
cd /Users/eddyz/CalHacks2025/server
cp .env.example .env
```

**⚠️ IMPORTANT:** Open `server/.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

### 2. Seed the Database

```bash
cd /Users/eddyz/CalHacks2025/server
npm run seed
```

You should see output like:
```
🌱 Starting database seed...
✓ Created 4 schools
✓ Created 5 users

📋 Sample Users:
============================================================

👨‍💻 Alex Chen
   School: UC Berkeley
   Shareable Link: /user/abc12345
   Interests: Anime, Mechanical keyboards, Competitive programming...

👩‍🎨 Maya Rodriguez
   School: UC Berkeley
   Shareable Link: /user/xyz67890
   Interests: Digital art, Cosplay, Anime conventions...
```

**📝 Copy the shareable IDs** - you'll need them for testing!

### 3. Start the Backend

Open a terminal window:
```bash
cd /Users/eddyz/CalHacks2025/server
npm run dev
```

You should see:
```
🧊 Shatter the Ice API
Server running on http://localhost:3000
```

Keep this terminal running!

### 4. Start the Frontend

Open a **NEW** terminal window:
```bash
cd /Users/eddyz/CalHacks2025/client
npm run dev
```

You should see:
```
VITE v6.x.x ready in XXX ms
➜ Local:   http://localhost:5173/
```

### 5. Test the App! 🎉

1. **Visit the home page:**
   Open http://localhost:5173 in your browser

2. **View a user profile:**
   Use one of the shareable IDs from step 2:
   ```
   http://localhost:5173/user/abc12345
   ```

3. **Test matching:**
   Add a viewer ID to see compatibility:
   ```
   http://localhost:5173/user/abc12345?viewer=xyz67890
   ```

   Then click **"Shatter the Ice"** to see:
   - Match score
   - Shared interests
   - Related interests
   - AI-generated conversation starters

## 🧪 Testing the API Directly

You can also test the API with curl:

```bash
# Get user info
curl http://localhost:3000/api/users/abc12345

# Calculate a match
curl -X POST http://localhost:3000/api/match \
  -H "Content-Type: application/json" \
  -d '{"viewerId": "abc12345", "targetUserId": "xyz67890"}'

# Get recommendations
curl http://localhost:3000/api/recommendations/abc12345?limit=5
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** MongoDB is not running. Start it with:
```bash
brew services start mongodb-community
# or
mongod --dbpath /usr/local/var/mongodb
```

### Missing API Key Error
```
Error: ANTHROPIC_API_KEY is not set
```
**Solution:** Make sure you copied `.env.example` to `.env` and added your API key.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Kill the process using port 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

### Frontend Not Loading
**Solution:** Make sure both server AND client are running in separate terminals.

## 📚 Next Steps

- Read the full [README.md](./README.md)
- Check out the [API Documentation](./API_DOCS.md)
- Start building Phase 2 features!

## 💡 Pro Tips

1. **Keep both terminals visible** - use split screen to monitor logs
2. **Check server logs** when something isn't working - errors appear there
3. **Use the seed script** to reset data if needed (run `npm run seed` again)
4. **Save those shareable IDs** from the seed output for quick testing

---

**Happy hacking! 🧊**
