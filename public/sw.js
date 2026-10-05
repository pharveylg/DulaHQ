/* Minimal by design: it exists so the browser will offer installation (Chrome
   requires a registered service worker with a fetch handler), and it caches
   nothing. Tournament data is served fresh from the network every time. */
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  event.respondWith(fetch(event.request));
});
