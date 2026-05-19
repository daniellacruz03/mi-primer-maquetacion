const CACHE_NAME = 'bh-v1';

self.addEventListener('install', (event) => {
  // Instala el service worker inmediatamente
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Requisito mínimo para que Chrome permita la instalación:
  // Tener un manejador de fetch, aunque solo deje pasar la petición.
  event.respondWith(fetch(event.request));
});