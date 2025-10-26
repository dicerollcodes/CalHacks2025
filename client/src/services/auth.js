import { API_BASE_URL } from '../config/api.js'

// In development, use relative URLs for Vite proxy. In production, use full URL.
const API_URL = import.meta.env.MODE === 'production' ? API_BASE_URL : '/api';

/**
 * Send verification code to email
 */
export async function sendVerificationCode(email) {
  const response = await fetch(`${API_URL}/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send code');
  }

  return response.json();
}

/**
 * Verify email code
 */
export async function verifyCode(email, code) {
  const response = await fetch(`${API_URL}/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Invalid code');
  }

  return response.json();
}

/**
 * Complete signup with profile info
 */
export async function completeSignup(data) {
  const response = await fetch(`${API_URL}/auth/complete-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }

  return response.json();
}

/**
 * Login with email (sends code)
 */
export async function login(email) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

/**
 * Verify login code
 */
export async function verifyLogin(email, code) {
  const response = await fetch(`${API_URL}/auth/verify-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Verification failed');
  }

  return response.json();
}

/**
 * Get schools list
 */
export async function getSchools() {
  const response = await fetch(`${API_URL}/users/schools`);

  if (!response.ok) {
    throw new Error('Failed to fetch schools');
  }

  return response.json();
}

/**
 * Local storage helpers
 */
export function saveAuthToken(token) {
  localStorage.setItem('auth_token', token);
}

export function getAuthToken() {
  return localStorage.getItem('auth_token');
}

export function removeAuthToken() {
  localStorage.removeItem('auth_token');
}

export function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function removeUser() {
  localStorage.removeItem('user');
}

export function logout() {
  removeAuthToken();
  removeUser();
}

export function isAuthenticated() {
  return !!getAuthToken();
}
