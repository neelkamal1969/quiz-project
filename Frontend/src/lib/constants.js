// App-wide constants — single home for storage keys, route paths and API endpoints
// so there are no magic strings scattered across components.

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};

// Route paths. These match the paths declared in App.jsx (React Router matches
// case-insensitively, so links using these constants stay consistent).
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROFILE_SETUP: '/profile-setup',
  IMAGE_INPUT: '/imageInput',
  VALUE_INPUT: '/valueInput',
  VAULT: '/myQuestions',
  ADMIN_LOGS: '/AdminLogs',
  REVIEW: '/review',
  ANALYTICS: '/analytics',
  QUIZ: '/quiz',
  WIKI: '/wiki',
};

// Backend endpoint paths (relative to VITE_API_URL).
export const ENDPOINTS = {
  SIGNUP: '/signup',
  LOGIN: '/login',
  INFO: '/info',
  PAGE: '/page',
  SEARCH: (value) => `/search/${encodeURIComponent(value)}`,
  SAVE_CARD: '/save-card',
  VAULT: (userId) => `/vault/${userId}`,
  VAULT_CARD: (cardId) => `/vault/${cardId}`,
  LOG_SEARCH: '/log-search',
  ADMIN_LOGS: '/admin/logs',
  REVIEWS: '/reviews',
  REVIEWS_DUE: '/reviews/due',
  STATS: '/stats',
  SESSIONS: '/sessions',
};
