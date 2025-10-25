# 🧊 Shatter the Ice

> "Don't just break the ice — shatter it."

A full-stack application that helps students reveal their authentic interests only where they're appreciated — with people who share the same passions.

## ✨ Mission

Students hide their most authentic interests because they fear judgment and being seen as "cringe." This app helps them reveal those interests only where they're appreciated — with people who share the same passions.

## 🎯 Core Concept

Users privately list ALL their interests — especially niche ones they wouldn't post publicly. When another user visits their link (e.g., from Instagram), they "shatter the ice" to reveal:
- A compatibility score
- Shared + semantically related interests
- AI-generated conversation starters

## 🏗️ Project Structure

```
CalHacks2025/
├── server/              # Express + MongoDB backend
│   ├── src/
│   │   ├── models/      # Mongoose schemas (School, User)
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Claude API integration
│   │   ├── utils/       # Helper functions, seed script
│   │   └── config/      # Database configuration
│   └── package.json
├── client/              # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Route pages
│   │   ├── services/    # API client
│   │   └── utils/
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally on port 27017)
- Anthropic API key ([get one here](https://console.anthropic.com))

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd CalHacks2025

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```bash
cd server
cp .env.example .env
```

Edit `.env` and add your credentials:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/shatter-the-ice
ANTHROPIC_API_KEY=your_actual_api_key_here
NODE_ENV=development
```

### 3. Seed the Database

```bash
cd server
npm run seed
```

This will create sample schools and users. Note the shareable IDs printed in the console!

### 4. Start the Backend

```bash
cd server
npm run dev
```

Server will run on `http://localhost:3000`

### 5. Start the Frontend

In a new terminal:

```bash
cd client
npm run dev
```

Client will run on `http://localhost:5173`

### 6. Test the App

1. Visit `http://localhost:5173` to see the home page
2. Copy a shareable ID from the seed output (e.g., `abc12345`)
3. Visit `http://localhost:5173/user/abc12345` to see that user's profile
4. To test matching, add a viewer ID: `http://localhost:5173/user/abc12345?viewer=xyz67890`
5. Click "Shatter the Ice" to see compatibility results!

## 📡 API Endpoints

### User Management

**Create User**
```bash
POST /api/users
Content-Type: application/json

{
  "name": "Alex Chen",
  "avatar": "👨‍💻",
  "socials": {
    "instagram": "alex.chen",
    "discord": "alexc#1234"
  },
  "schoolId": "65f8a1b2c3d4e5f6a7b8c9d0",
  "privateInterests": [
    "Anime",
    "Mechanical keyboards",
    "Competitive programming"
  ]
}
```

**Get User (Public Info)**
```bash
GET /api/users/:shareableId
```

Returns user info WITHOUT private interests.

### Matching

**Calculate Match**
```bash
POST /api/match
Content-Type: application/json

{
  "viewerId": "abc12345",
  "targetUserId": "xyz67890"
}
```

Returns:
- Match score (0-100)
- Shared interests
- Related interests (semantic similarity)
- Conversation starters

### Recommendations

**Get Recommended Matches**
```bash
GET /api/recommendations/:shareableId?sameSchool=true&limit=10
```

Query parameters:
- `sameSchool` (default: true) - Only show users from the same school
- `limit` (default: 10) - Number of recommendations

## 🧠 Claude API Integration

The app uses Claude for:

1. **Semantic Similarity**: Analyzes interest compatibility beyond exact matches
   - Example: "Anime" ↔ "Manga" ↔ "Japanese culture"

2. **Match Scoring**: Combines multiple factors:
   - Exact interest matches
   - Semantic similarity
   - Niche interest bonus (rare interests = stronger connection)

3. **Conversation Starters**: Generates personalized, natural conversation prompts based on shared interests

All Claude API calls are cached to optimize performance.

## 🎨 Tech Stack

### Backend
- **Express.js** - Web framework
- **MongoDB + Mongoose** - Database
- **Anthropic Claude API** - Semantic matching & conversation generation
- **CORS** - Cross-origin support

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation

## 📝 Example Use Cases

### Scenario 1: Link Sharing
1. Maya creates her profile with interests: "Cosplay, Digital art, K-pop"
2. Maya shares her link on Instagram: `shatter.app/user/maya123`
3. Jordan clicks the link and adds his viewer ID
4. System reveals: 70% match, shared interest in anime culture, conversation starters

### Scenario 2: Discovery
1. Alex logs in and wants to find friends at UC Berkeley
2. Visits recommendations page
3. Sees top matches ranked by compatibility
4. Clicks to "shatter the ice" with high-scoring matches

## 🔜 Future Enhancements (Phase 2+)

- [ ] Ice cube shattering animation
- [ ] User authentication
- [ ] Profile creation flow
- [ ] Real-time notifications
- [ ] School verification system
- [ ] Enhanced recommendation algorithm
- [ ] Mobile app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with Claude by Anthropic
Made for CalHacks 2025

---

**Need help?** Check the [API Documentation](./API_DOCS.md) or open an issue!
