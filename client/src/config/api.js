// API Configuration
// Uses environment variables in production, falls back to localhost in development

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

// Helper to get full API URL
export function getApiUrl(path) {
  // Remove leading /api if present (since it's already in API_BASE_URL)
  const cleanPath = path.startsWith('/api') ? path.slice(4) : path
  return `${API_BASE_URL}${cleanPath}`
}
