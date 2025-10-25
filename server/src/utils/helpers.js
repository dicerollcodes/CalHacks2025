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
