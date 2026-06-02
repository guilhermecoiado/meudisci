const CACHE_NAME = 'meudisci-v42';
const URLS_TO_CACHE = [
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './img/logo.png',
  './img/logo_branco.png',
  './img/discipanel.jpg',
  './img/mountain.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const isGet = request.method === 'GET';
  const isSameOrigin = new URL(request.url).origin === self.location.origin;

  if (!isGet || !isSameOrigin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          throw new Error('Network error');
        });
    })
  );
});
