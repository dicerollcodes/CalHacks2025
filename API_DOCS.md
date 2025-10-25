# 📡 Shatter the Ice - API Documentation

Complete API reference for the Shatter the Ice backend.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, no authentication is required (Phase 1). Authentication will be added in Phase 2.

---

## Endpoints

### 1. Create User

Create a new user profile.

**Endpoint:** `POST /api/users`

**Request Body:**
```json
{
  "name": "Alex Chen",
  "avatar": "👨‍💻",
  "socials": {
    "instagram": "alex.chen",
    "twitter": "alexchen",
    "discord": "alexc#1234",
    "linkedin": "alex-chen"
  },
  "schoolId": "65f8a1b2c3d4e5f6a7b8c9d0",
  "privateInterests": [
    "Anime",
    "Mechanical keyboards",
    "Competitive programming",
    "J-pop"
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "_id": "65f8a1b2c3d4e5f6a7b8c9d1",
    "name": "Alex Chen",
    "avatar": "👨‍💻",
    "socials": {
      "instagram": "alex.chen",
      "discord": "alexc#1234"
    },
    "schoolId": {
      "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
      "name": "UC Berkeley",
      "domain": "berkeley.edu"
    },
    "privateInterests": ["Anime", "Mechanical keyboards", ...],
    "shareableId": "abc12345",
    "createdAt": "2025-10-25T00:00:00.000Z"
  },
  "shareableLink": "/user/abc12345"
}
```

---

### 2. Get User (Public Info)

Get a user's public profile by their shareable ID. Private interests are NOT included.

**Endpoint:** `GET /api/users/:shareableId`

**Example:** `GET /api/users/abc12345`

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "65f8a1b2c3d4e5f6a7b8c9d1",
    "name": "Alex Chen",
    "avatar": "👨‍💻",
    "socials": {
      "instagram": "alex.chen",
      "discord": "alexc#1234"
    },
    "schoolId": {
      "_id": "65f8a1b2c3d4e5f6a7b8c9d0",
      "name": "UC Berkeley"
    },
    "shareableId": "abc12345"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "User not found"
}
```

---

### 3. Calculate Match

Calculate compatibility between two users and reveal shared/related interests.

**Endpoint:** `POST /api/match`

**Request Body:**
```json
{
  "viewerId": "abc12345",
  "targetUserId": "xyz67890"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "match": {
    "score": 78,
    "sharedInterests": [
      "Anime",
      "K-pop"
    ],
    "relatedInterests": [
      {
        "userInterest": "Mechanical keyboards",
        "targetInterest": "PC gaming",
        "relationship": "Both involve hardware customization and enthusiast communities"
      },
      {
        "userInterest": "J-pop",
        "targetInterest": "K-pop",
        "relationship": "Asian pop music genres with similar fan culture"
      }
    ],
    "conversationStarters": [
      "I saw you're into anime too! Have you watched any of this season's shows?",
      "I noticed we both like Asian pop music - do you have any favorite groups or songs?",
      "I'm curious about your PC setup! What kind of hardware are you running?"
    ]
  },
  "viewer": {
    "name": "Alex Chen",
    "avatar": "👨‍💻"
  },
  "target": {
    "name": "Maya Rodriguez",
    "avatar": "👩‍🎨",
    "socials": {
      "instagram": "maya.art"
    },
    "school": "UC Berkeley"
  }
}
```

**Match Score Interpretation:**
- **80-100**: Amazing match - very high compatibility
- **60-79**: Great compatibility - significant overlap
- **40-59**: Some common ground - worth connecting
- **0-39**: Different interests - less likely to connect

---

### 4. Get Recommendations

Get a ranked list of compatible users for a given user.

**Endpoint:** `GET /api/recommendations/:shareableId`

**Query Parameters:**
- `sameSchool` (boolean, default: true) - Filter by same school
- `limit` (number, default: 10) - Number of recommendations to return

**Example:** `GET /api/recommendations/abc12345?sameSchool=true&limit=5`

**Response (200 OK):**
```json
{
  "success": true,
  "recommendations": [
    {
      "user": {
        "shareableId": "xyz67890",
        "name": "Maya Rodriguez",
        "avatar": "👩‍🎨",
        "school": "UC Berkeley"
      },
      "matchScore": 78,
      "sharedInterestsCount": 2,
      "relatedInterestsCount": 3
    },
    {
      "user": {
        "shareableId": "def45678",
        "name": "Jordan Lee",
        "avatar": "🎮",
        "school": "UC Berkeley"
      },
      "matchScore": 65,
      "sharedInterestsCount": 1,
      "relatedInterestsCount": 4
    }
  ]
}
```

---

## Data Models

### User Schema

```javascript
{
  name: String (required),
  avatar: String (default: null),
  socials: {
    instagram: String,
    twitter: String,
    discord: String,
    linkedin: String
  },
  schoolId: ObjectId (required, ref: 'School'),
  privateInterests: [String],
  shareableId: String (unique, required),
  createdAt: Date,
  updatedAt: Date
}
```

### School Schema

```javascript
{
  name: String (required, unique),
  domain: String (required, unique),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200 OK** - Request succeeded
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request body or parameters
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

Error response format:
```json
{
  "error": "Error message description"
}
```

---

## Rate Limiting

No rate limiting is currently implemented (Phase 1). Will be added in future phases.

---

## Claude API Integration

### Semantic Matching

The `/api/match` endpoint uses Claude to analyze interest compatibility:

1. **Exact Matches**: Identifies identical or very similar interests
2. **Semantic Similarity**: Finds conceptually related interests
3. **Niche Bonus**: Rewards rare/specific interests (stronger connection signal)

### Caching

Match results are cached in memory to reduce API calls and improve performance. Cache is cleared on server restart.

---

## Example Workflows

### Workflow 1: New User Sign-up

```bash
# 1. Get list of schools (you'd need to add this endpoint)
GET /api/schools

# 2. Create user
POST /api/users
{
  "name": "Sam Park",
  "schoolId": "...",
  "privateInterests": ["Fantasy novels", "D&D"]
}

# 3. Receive shareable link
# Response: { "shareableLink": "/user/sam123" }
```

### Workflow 2: Profile Visit & Match

```bash
# 1. Visitor opens link: /user/sam123?viewer=alex456

# 2. Frontend fetches target user's public info
GET /api/users/sam123

# 3. User clicks "Shatter the Ice"
POST /api/match
{
  "viewerId": "alex456",
  "targetUserId": "sam123"
}

# 4. Display match results with conversation starters
```

### Workflow 3: Discover Matches

```bash
# 1. Get recommendations at my school
GET /api/recommendations/alex456?sameSchool=true&limit=10

# 2. View a promising match
GET /api/users/sam123

# 3. Shatter the ice with them
POST /api/match
{
  "viewerId": "alex456",
  "targetUserId": "sam123"
}
```

---

## Testing with cURL

```bash
# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "avatar": "😊",
    "schoolId": "YOUR_SCHOOL_ID",
    "privateInterests": ["Reading", "Gaming"]
  }'

# Get user info
curl http://localhost:3000/api/users/abc12345

# Calculate match
curl -X POST http://localhost:3000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "viewerId": "abc12345",
    "targetUserId": "xyz67890"
  }'

# Get recommendations
curl "http://localhost:3000/api/recommendations/abc12345?limit=5"
```

---

## Next Steps

Future API improvements:
- [ ] Add authentication endpoints (login, register, logout)
- [ ] Add school listing endpoint
- [ ] Add user profile update endpoint
- [ ] Add analytics endpoints
- [ ] Implement rate limiting
- [ ] Add WebSocket support for real-time notifications
- [ ] Add pagination for recommendations
- [ ] Add filtering/sorting options

---

**Questions?** Open an issue on GitHub or check the main [README](./README.md).
