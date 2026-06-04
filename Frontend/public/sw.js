/* StudyAI service worker — deliberately minimal and deploy-safe.
 *
 * It does NOT cache the app's hashed JS/CSS or index.html, so every new
 * deployment is ALWAYS served fresh from the network — eliminating the classic
 * "service worker serves a stale/broken bundle forever" failure mode.
 *
 * Its only job: cache a single static offline page and show it when a top-level
 * navigation fails because the user is offline. All other requests (assets, API)
 * pass straight through to the network untouched.
 */
const CACHE = 'studyai-offline-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Drop any old caches from previous versions, then take control immediately.
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Only intercept page navigations; never cache or alter assets/API calls.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
  }
});
