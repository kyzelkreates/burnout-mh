// ═══════════════════════════════════════════════════════
//  FOUR PAWS ACADEMY — PWA Service Worker
//  Offline-first caching for Training Companion
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'fourpaws-training-v2';
const OFFLINE_PAGE = '/pwa/index.html';

const PRECACHE_ASSETS = [
  '/pwa/index.html',
  '/pwa/patient.css',
  '/pwa/patient-app.js',
  '/pwa/manifest.json',
  '/pwa/ap3x-sw.js',
];

// ── Install: pre-cache core assets ───────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {
        // Fail silently — assets may not exist at install time
      });
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: purge old caches ────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first with network fallback ──────────
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip non-http requests (chrome-extension, etc.)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Only cache valid responses for same-origin assets
        if (
          response.status === 200 &&
          response.type === 'basic' &&
          event.request.url.includes('/pwa/')
        ) {
          const toCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        }
        return response;
      }).catch(() => {
        // Network failed — return offline page for navigation
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_PAGE);
        }
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

// ── Background sync (future: push sessions to trainer) ─
self.addEventListener('sync', event => {
  if (event.tag === 'sync-sessions') {
    event.waitUntil(syncPendingSessions());
  }
});

async function syncPendingSessions() {
  try {
    // Placeholder: in production this would POST pending sessions to the academy API
    const pending = await getPendingSessions();
    if (!pending.length) return;
    console.log('[Recharge SW] Syncing', pending.length, 'pending session(s)');
  } catch (err) {
    console.warn('[Recharge SW] Sync failed:', err);
  }
}

function getPendingSessions() {
  return Promise.resolve([]);
}

// ── Push notifications (future: trainer messages) ─────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Recharge Academy';
  const options = {
    body: data.body || 'You have a new message from your trainer.',
    icon: '/icons/fp-icon-192.png',
    badge: '/icons/fp-badge-96.png',
    tag: data.tag || 'fourpaws-notification',
    data: { url: data.url || '/pwa/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/pwa/')
  );
});
