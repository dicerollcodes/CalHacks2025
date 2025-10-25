import User from '../models/User.js';

/**
 * Generate a unique shareable ID for users
 */
export async function generateShareableId() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const length = 8;

  let shareableId;
  let isUnique = false;

  while (!isUnique) {
    shareableId = '';
    for (let i = 0; i < length; i++) {
      shareableId += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Check if this ID already exists
    const existing = await User.findOne({ shareableId });
    if (!existing) {
      isUnique = true;
    }
  }

  return shareableId;
}

/**
 * Normalize interests to handle typos and variations
 * - Lowercase
 * - Trim whitespace
 * - Remove special characters
 * - Sort alphabetically for consistent comparisons
 */
export function normalizeInterests(interests) {
  return interests
    .map(interest =>
      interest
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // Remove special chars
        .replace(/\s+/g, ' ')     // Normalize whitespace
    )
    .filter(interest => interest.length > 0)
    .sort();
}

/**
 * Create a deterministic cache key from two user IDs
 * Ensures user1-user2 matches user2-user1
 */
export function createMatchCacheKey(userId1, userId2) {
  return [userId1, userId2].sort().join('-');
}
