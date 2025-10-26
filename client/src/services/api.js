import { API_BASE_URL } from '../config/api.js'

// In development, use relative URLs for Vite proxy. In production, use full URL.
const API_BASE = import.meta.env.MODE === 'production' ? API_BASE_URL : '/api';

export async function getUser(shareableId) {
  const response = await fetch(`${API_BASE}/users/${shareableId}`);
  if (!response.ok) {
    throw new Error('User not found');
  }
  return response.json();
}

export async function calculateMatch(viewerId, targetUserId) {
  const response = await fetch(`${API_BASE}/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ viewerId, targetUserId }),
  });

  if (!response.ok) {
    throw new Error('Failed to calculate match');
  }
  return response.json();
}

export async function getRecommendations(shareableId, sameSchool = true, limit = 10) {
  const response = await fetch(
    `${API_BASE}/recommendations/${shareableId}?sameSchool=${sameSchool}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error('Failed to get recommendations');
  }
  return response.json();
}

export async function createUser(userData) {
  const response = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  return response.json();
}

// === Messaging APIs ===

export async function sendMessage(senderId, recipientId, content) {
  const response = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      senderId,
      recipientId,
      content,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }
  return response.json();
}

export async function getConversations(userId) {
  const response = await fetch(`${API_BASE}/messages/conversations/${userId}`);

  if (!response.ok) {
    throw new Error('Failed to get conversations');
  }
  return response.json();
}

export async function getMessages(userId, otherUserId, limit = 50) {
  const response = await fetch(
    `${API_BASE}/messages/${userId}/${otherUserId}?limit=${limit}`
  );

  if (!response.ok) {
    throw new Error('Failed to get messages');
  }
  return response.json();
}