const CACHE_NAME = "budu-io-v1";
const BASE_URL = "https://xyuaui.github.io/budu.io/";

const ASSETS = [
  BASE_URL,
  BASE_URL + "index.html",
  BASE_URL + "manifest.json",

  // Audio
  BASE_URL + "assets/audio/lobbyost.m4a",
  BASE_URL + "assets/audio/characterost.m4a",

  // Images
  BASE_URL + "assets/splashscreen.png",
  BASE_URL + "assets/loadingbg.png",
  BASE_URL + "assets/lobbybg.png",
  BASE_URL + "assets/splashloading.png",
  BASE_URL + "assets/sofa.png",

  // Characters
  BASE_URL + "assets/characters/panda.png",
  BASE_URL + "assets/characters/bear.png",

  // Icons (any)
  BASE_URL + "icons/icon-16.png",
  BASE_URL + "icons/icon-32.png",
  BASE_URL + "icons/icon-48.png",
  BASE_URL + "icons/icon-72.png",
  BASE_URL + "icons/icon-96.png",
  BASE_URL + "icons/icon-128.png",
  BASE_URL + "icons/icon-144.png",
  BASE_URL + "icons/icon-152.png",
  BASE_URL + "icons/icon-180.png",
  BASE_URL + "icons/icon-192.png",
  BASE_URL + "icons/icon-256.png",
  BASE_URL + "icons/icon-384.png",
  BASE_URL + "icons/icon-512.png",
  BASE_URL + "icons/icon-16-maskable.png",
  BASE_URL + "icons/icon-32-maskable.png",
  BASE_URL + "icons/icon-48-maskable.png",
  BASE_URL + "icons/icon-72-maskable.png",
  BASE_URL + "icons/icon-96-maskable.png",
  BASE_URL + "icons/icon-128-maskable.png",
  BASE_URL + "icons/icon-144-maskable.png",
  BASE_URL + "icons/icon-152-maskable.png",
  BASE_URL + "icons/icon-180-maskable.png",
  BASE_URL + "icons/icon-192-maskable.png",
  BASE_URL + "icons/icon-256-maskable.png",
  BASE_URL + "icons/icon-384-maskable.png",
  BASE_URL + "icons/icon-512-maskable.png"
];

// Install: cache semua assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // addAll tapi tidak gagal kalau ada 1 asset missing
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

// Activate: hapus cache lama
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => clients.claim())
  );
});

// Fetch: cache-first, fallback ke network
self.addEventListener("fetch", event => {
  // Skip non-GET
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache response baru untuk next time
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached); // fallback ke cache kalau offline
    })
  );
});
