// Single source of truth for client-side auth data in localStorage.
// Every read is crash-safe (corrupt JSON can never throw).
import { STORAGE_KEYS } from './constants';

export const getToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN);

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
  } catch {
    return null;
  }
};

export const isAuthenticated = () => !!getToken();

// Persist a fresh login (token + user object).
export const setSession = (token, user) => {
  if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

// Update only the stored user (e.g. after profile edits).
export const updateUser = (user) => {
  if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

// Remove only the auth keys (never wipes unrelated localStorage).
export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};
