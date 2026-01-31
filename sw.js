const CACHE_VERSION = 'v1';
const STATIC_CACHE = `flirt-bird-static-${CACHE_VERSION}`;
const ASSETS_CACHE = `flirt-bird-assets-${CACHE_VERSION}`;

// Что кэшируем ПРИ УСТАНОВКЕ (минимум!)
const STATIC_FILES = [
  './',
  './index.html',
  './manifest.json'
];

// Установка
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_FILES))
  );
  self.skipWaiting();
});

// Активация — чистим старые кэши
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (![STATIC_CACHE, ASSETS_CACHE].includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH — умная логика
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 🖼 Картинки, ассеты — Cache First
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/')
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // 📄 HTML и всё остальное — Network First
  event.respondWith(networkFirst(event.request));
});

// ===== STRATEGIES =====

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    return cache.match(request);
  }
}
