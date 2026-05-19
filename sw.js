const CACHE_NAME = 'bh-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // El evento fetch es obligatorio para que el navegador 
    // elimine el sello de 'acceso directo' y lo convierta en App.
    event.respondWith(fetch(event.request));
});