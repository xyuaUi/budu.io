// Service Worker for Budu.io PWA
// Version: 1.0.0

const CACHE_NAME = 'budu-io-v1';
const STATIC_CACHE = 'budu-static-v1';
const DYNAMIC_CACHE = 'budu-dynamic-v1';

// Files to cache on install
const STATIC_FILES = [
  '/budu.io/',
  '/budu.io/index.html',
  '/budu.io/style.css',
  '/budu.io/main.js',
  '/budu.io/manifest.json',
  '/budu.io/icons/icon-192x192.png',
  '/budu.io/icons/icon-512x512.png'
];

// =====================
// INSTALL EVENT
// =====================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets...');
      return cache.addAll(STATIC_FILES).catch((err) => {
        console.warn('[SW] Some files failed to cache:', err);
      });
    }).then(() => {
      console.log('[SW] Install complete. Skipping waiting...');
      return self.skipWaiting();
    })
  );
});

// =====================
// ACTIVATE EVENT
// =====================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients...');
      return self.clients.claim();
    })
  );
});

// =====================
// FETCH EVENT
// =====================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version, but also update in background
        fetchAndCache(request);
        return cachedResponse;
      }

      // Not cached — fetch from network and cache it
      return fetchAndCache(request);
    }).catch(() => {
      // Offline fallback — return index.html for navigation requests
      if (request.destination === 'document') {
        return caches.match('/budu.io/index.html');
      }
    })
  );
});

function fetchAndCache(request) {
  return fetch(request).then((response) => {
    if (!response || response.status !== 200 || response.type === 'opaque') {
      return response;
    }

    const responseClone = response.clone();
    caches.open(DYNAMIC_CACHE).then((cache) => {
      cache.put(request, responseClone);
    });

    return response;
  });
}

// =====================
// MESSAGE EVENT
// =====================
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.action === 'CLEAR_CACHE') {
    caches.keys().then((keyList) => {
      Promise.all(keyList.map((key) => caches.delete(key)));
    });
  }
});

// =====================
// PUSH EVENT (optional)
// =====================
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Budu.io';
  const options = {
    body: data.body || 'Ada update baru!',
    icon: '/budu.io/icons/icon-192x192.png',
    badge: '/budu.io/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/budu.io/' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/budu.io/')
  );
});
