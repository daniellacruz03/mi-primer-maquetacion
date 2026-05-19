const CACHE_NAME = 'burger-house-v1';

self.addEventListener('install', (event) => {
    // Fuerza al SW a activarse inmediatamente
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Toma el control de las pestañas abiertas inmediatamente
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Es vital que este evento responda algo (passthrough)
    // para que Chrome valide la PWA para instalación nativa.
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});