/**
 * Cleanup-only service worker.
 *
 * The previous build shipped a full Workbox service-worker that precached
 * assets AND cached authenticated /api/* responses for 24 h.  That is both
 * a performance and a security risk (stale private data / cache poisoning).
 *
 * PWA is intentionally disabled in next.config.ts.  This tiny worker
 * ensures any previously-registered SW is torn down and its caches are
 * purged.  After cleanup the worker self-destructs.
 */
self.addEventListener('install', () => {
  // Activate immediately – no waiting
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Unregister this service worker
      const registrations = await self.registration.unregister();

      // Delete ALL caches created by the old Workbox build
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    })()
  );
});
