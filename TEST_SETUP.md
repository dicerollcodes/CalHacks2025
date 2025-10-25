# Troubleshooting Guide

## Issue: Page doesn't work at http://localhost:5173/user/5i4jgrem?viewer=clojdniv

### Step 1: Verify Backend is Running

```bash
cd server
npm run dev
```

Should see:
```
🧊 Shatter the Ice API
Server running on http://localhost:3000
```

### Step 2: Verify Frontend is Running

```bash
cd client
npm run dev
```

Should see Vite running on http://localhost:5173

### Step 3: Check if Users Exist

Open browser console and test API directly:

```javascript
// Check if user exists
fetch('/api/users/5i4jgrem')
  .then(r => r.json())
  .then(console.log)

// Check if viewer exists
fetch('/api/users/clojdniv')
  .then(r => r.json())
  .then(console.log)
```

### Step 4: Test Match Calculation

```javascript
fetch('/api/match', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    viewerId: 'clojdniv',
    targetUserId: '5i4jgrem'
  })
})
.then(r => r.json())
.then(console.log)
```

### Common Issues:

#### 1. "User not found"
- Users don't exist in database
- Run seed script: `cd server && npm run seed`
- Or create users manually

#### 2. "Failed to calculate match"
- Backend not running
- MongoDB not connected
- Check `.env` file exists with MONGODB_URI

#### 3. Conversation starters don't appear
- Match score might be < 70
- Check console for `matchData` object
- Ensure `sharedInterests` array has items

#### 4. CORS errors
- Backend CORS should be enabled (already in code)
- Frontend proxy should work (Vite default)

### Debug Console Commands:

Open browser console on the page and run:

```javascript
// Check what's in matchData
console.log('Match Data:', window.matchData)

// Check user
fetch('/api/users/5i4jgrem').then(r => r.json()).then(console.log)

// Force match calculation
fetch('/api/match', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    viewerId: 'clojdniv',
    targetUserId: '5i4jgrem'
  })
}).then(r => r.json()).then(data => {
  console.log('Match result:', data)
  console.log('Score:', data.match.score)
  console.log('Shared interests:', data.match.sharedInterests)
  console.log('Can message (70+)?', data.match.score >= 70)
})
```

