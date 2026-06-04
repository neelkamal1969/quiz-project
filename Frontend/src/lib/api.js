// Centralised API client.
// - Guards a missing VITE_API_URL (loud error instead of silent http://undefined/...).
// - Injects the Bearer token automatically (harmless for public endpoints).
// - Handles 401 globally by clearing the session.
// - Normalises errors so callers get a clean Error(message).
import { getToken, clearSession } from './auth';

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.error(
    '[api] VITE_API_URL is not set. Create Frontend/.env with: VITE_API_URL=http://localhost:3000'
  );
}

async function request(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  if (!BASE_URL) throw new Error('API URL is not configured (VITE_API_URL missing).');

  const finalHeaders = { 'Content-Type': 'application/json', ...headers };
  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Network error. Please check your connection and try again.');
  }

  // Global session-expiry handling: a 401 means the token is gone/expired.
  if (res.status === 401) clearSession();

  // Parse body defensively (some endpoints may return empty or non-JSON).
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status; // let callers distinguish 403 / 404 / 500 etc.
    if (data && data.requestId) err.requestId = data.requestId; // trace to server logs
    throw err;
  }
  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
  request,
};
