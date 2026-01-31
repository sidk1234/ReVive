/*
 * Simple service worker for Rec AI PWA.
 *
 * This service worker precaches the application shell and uses
 * a network-first strategy for runtime requests. If the network is
 * unavailable it serves the offline fallback route (`/app/offline`).
 */

const CACHE_NAME = 'recai-cache-v1';
const APP_SHELL = [
  '/app/',
  '/app/index.html',
  '/app/manifest.webmanifest',
  '/app/assets/logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Only handle requests within the /app/ scope
  if (!url.pathname.startsWith('/app')) return;
  if (request.mode === 'navigate') {
    // For navigations try network first, fall back to offline route
    event.respondWith(
      fetch(request)
        .then((res) => {
          // If offline page requested directly just return it
          if (res.status === 404) throw new Error('Not found');
          return res;
        })
        .catch(() => caches.match('/app/offline')),
    );
  } else {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached || fetch(request).then((res) => {
            if (res.status === 200) {
              const resClone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
            }
            return res;
          }),
      ),
    );
  }
});