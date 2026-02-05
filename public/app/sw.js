/*
  Minimal PWA Service Worker for /app.

  - Pre-caches the app shell routes (best-effort)
  - Runtime cache for GET requests under /app

  Notes:
  - This intentionally avoids aggressive caching to reduce staleness.
  - If you later add versioned assets, you can tighten the allowlist.
*/

const CACHE = "revive-app-v1";
const CORE = [
  "/app",
  "/app/manifest.webmanifest",
  "/app/offline.html",
  "/app/icons/icon-192.png",
  "/app/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("revive-app-") && k !== CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin /app/* GET requests.
  if (req.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith("/app")) return;

  // Network-first for HTML navigations.
  const accept = req.headers.get("accept") || "";
  const isHtml = accept.includes("text/html") || req.mode === "navigate";

  if (isHtml) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(req);
          return cached || caches.match("/app/offline.html") || Response.error();
        }
      })()
    );
    return;
  }

  // Cache-first for other assets.
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const fresh = await fetch(req);
      const cache = await caches.open(CACHE);
      cache.put(req, fresh.clone());
      return fresh;
    })()
  );
});
