const CACHE_NAME = 'finance-manager-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './js/main.js',
  './js/analytics.js',
  './js/charts.js',
  './js/db-actions.js',
  './js/db.js',
  './js/handlers.js',
  './js/navigation.js',
  './js/state.js',
  './js/ui.js'
  // Tambahkan aset lainnya (gambar, library CDN jika diperlukan)
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Jika ada di cache, kembalikan respons tersebut; jika tidak, lakukan fetch
      return response || fetch(event.request);
    })
  );
});
