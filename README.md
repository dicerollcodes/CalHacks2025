# 🧊 Shatter the Ice

> "Don't just break the ice — shatter it."

**The intelligent roommate matching platform that helps college students find their perfect living partners through AI-powered compatibility analysis.**

---

## 🎯 What We Built

Shatter the Ice is a full-stack roommate matching platform designed specifically for college students. We use Claude AI to analyze private interests and lifestyle preferences to create meaningful connections between potential roommates.

### The Problem

Finding a compatible roommate is one of the most stressful parts of college life. Traditional platforms rely on basic questionnaires that don't capture the nuanced compatibility between two people. Students often end up living with strangers who don't share their values, interests, or lifestyle habits.

### Our Solution

Shatter the Ice uses advanced AI semantic matching to go beyond surface-level compatibility. We analyze:
- **Private interests** (kept confidential until mutual connection)
- **Roommate lifestyle preferences** (sleep schedule, cleanliness, social habits)
- **Hard filters** (gender preferences, pet allergies - non-negotiable)
- **Conversation potential** through AI-generated ice breakers

---

## ✨ Key Features

### 🔐 Privacy-First Design
- Email verification with secure JWT authentication
- Private interests revealed only after "breaking the ice" (30%+ match)
- Messaging unlocked at 50%+ compatibility

### 🤖 AI-Powered Matching
- **Claude Haiku 4.5** semantic interest analysis
- Finds connections beyond exact matches (e.g., "gaming" ↔ "esports" ↔ "streaming")
- Balanced scoring algorithm rewards multiple strong matches
- Decimal precision for granular differentiation

### 🏠 Roommate Intelligence
- **Secret algorithm**: 60% interests + 40% lifestyle preferences
- **Hard filters**: Gender preferences & pet allergies (auto-filter incompatible matches)
- **Soft scores**: Sleep schedule, cleanliness, social level, smoking, guests
- Top 20 recommendations ranked by combined compatibility

### 💬 Smart Connections
- Break the ice to reveal compatibility scores
- AI-generated conversation starters based on shared interests
- Integrated messaging (unlocked at 50%+ match)
- Profile links shareable via social media

### 🎨 Modern UX
- Glassmorphism UI with smooth animations
- Ice cube shattering animation
- Animated score reveals with count-up effects
- Responsive design for all devices

---

## 🏗️ Tech Stack

### Backend
- **Node.js + Express** - RESTful API server
- **MongoDB + Mongoose** - NoSQL database with caching
- **Anthropic Claude Haiku 4.5** - Semantic matching AI
- **JWT** - Secure authentication (7-day expiration)
- **Nodemailer** - Email verification system

### Frontend
- **React 18 + Vite** - Fast, modern UI framework
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Custom hooks** - useCountUp for animations

### Deployment
- **Heroku** - Scalable cloud hosting
- **Git Subtree** - Separate client/server deployments
- **Environment variables** - Secure credential management

---

## 🚀 How It Works

### 1. Account Creation
```
Sign up with .edu email → Verify with 6-digit code → Create profile
```

### 2. Profile Setup (Required Before Access)
- Add private interests (unlimited, hidden from everyone initially)
- Set roommate preferences (7 key lifestyle factors)
- Answer gender and pet questions

### 3. Discover Matches
- **Connect tab**: View top 20 ranked matches from your school
- **Interest Match score**: Shows pure interest compatibility
- **Ranking**: Secret algorithm combining interests + preferences
- **Filters**: Gender preference and pet allergies applied automatically

### 4. Break the Ice
- Click someone's profile → "Shatter the Ice" animation
- Reveals **two scores**:
  - **Friend Match**: Pure interest compatibility
  - **Roommate Match**: Interests + lifestyle (if eligible)
- See shared interests, related interests, conversation starters

### 5. Connect
- **50%+ match**: Messaging unlocked
- Send AI-generated conversation starters or custom messages
- Build connections with compatible roommates

---

## 📊 The Algorithm

### Interest Matching (Claude AI)
```
Scoring Philosophy: BALANCED
- 90-100: Identical interests (e.g., "programming" & "coding")
- 80-89: Very strongly related (e.g., "League of Legends" & "MOBAs")
- 70-79: Clearly related (e.g., "basketball" & "sports")
- 60-69: Good conversation potential
- 50-59: Some common ground

Bonuses:
- +5 for EACH match scoring 90+
- +5 if 3+ matches score 70+
- +5 if 5+ total matches
- +7 if 6+ total matches
```

### Lifestyle Matching
```
Weighted scoring across 7 factors:
- Gender preference (25 pts) - hard filter
- Sleep schedule (20 pts)
- Bedtime/wake time alignment (15 pts)
- Cleanliness (15 pts)
- Smoking (15 pts)
- Social level (10 pts)
- Pet compatibility (10 pts) - hard filter
- Guest frequency (10 pts)
```

### Final Score
```
Secret Ranking = (Interest Score × 0.6) + (Lifestyle Score × 0.4)
Display Scores = Rounded to nearest integer
Individual Interest Scores = Keep decimal precision
```

---

## 🎪 Live Demo

**Deployed at**: [shatter-the-ice-client.herokuapp.com](https://shatter-the-ice-client-5c659b59f73c.herokuapp.com)

**Test Accounts**: Create your own with any .edu email!

---

## 💻 Local Development

### Prerequisites
- Node.js 18+
- MongoDB running locally
- Anthropic API key

### Setup

```bash
# Clone and install
git clone <repo-url>
cd CalHacks2025

# Server setup
cd server
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Client setup
cd ../client
npm install

# Run both (in separate terminals)
cd server && npm run dev  # http://localhost:3000
cd client && npm run dev  # http://localhost:5173
```

---

## 🔑 Key Implementation Highlights

### Performance Optimization
- **Match caching**: MongoDB cache stores Claude API results
- **In-memory cache**: Secondary cache for ultra-fast lookups
- **Cache invalidation**: Automatic clearing when interests change

### Security
- **Email verification**: 6-digit codes with 10-minute expiration
- **JWT tokens**: HttpOnly cookies, 7-day expiration
- **Password hashing**: bcrypt with salt rounds
- **Input validation**: Server-side validation on all endpoints

### UX Innovations
- **Progressive disclosure**: Reveal scores only after ice-breaking
- **Gamification**: Ice cube shattering creates engagement
- **Smart messaging**: Unlock messaging at reasonable threshold (50%)
- **Conversation starters**: Remove friction from first message

---

## 📦 Deployment

### Heroku Deployment
```bash
# Backend
git subtree push --prefix server heroku-api main

# Frontend
git subtree push --prefix client heroku-client main

# Clear match cache after algorithm changes
heroku run "node -e 'mongoose.connect(process.env.MONGODB_URI); MatchCache.deleteMany({})...'" -a shatter-the-ice-api
```

---

## 🔮 Future Enhancements

- [ ] Multi-school support expansion
- [ ] Group roommate matching (3-4 people)
- [ ] Lease coordination tools
- [ ] Housing listing integration
- [ ] Mobile native apps (iOS/Android)
- [ ] Video ice-breaker feature
- [ ] Roommate agreement templates

---

## 🏆 Built For CalHacks 2025

**Team**: [Your Team Name]
**Powered by**: Claude AI by Anthropic
**Hackathon**: CalHacks 11.0

---

## 📝 License

MIT License - See LICENSE file for details

---

**Questions?** Open an issue or reach out to the team!
