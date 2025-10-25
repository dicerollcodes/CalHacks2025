const API_BASE = '/api';

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
