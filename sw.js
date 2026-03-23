// Minimal Service Worker for PWA installation
const CACHE_NAME = 'navithya-v1';
const assets = [
    './',
    './index.html',
    './app.js',
    './styles.css'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(assets);
        })
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});
