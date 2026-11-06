// DataSketch service worker
// Bump VERSION on every deploy so installed copies pick up the new files.
const VERSION = 'datasketch-1.3.2';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css', 'js/app.js', 'js/data.js',
  'icons/favicon.svg', 'icons/favicon.ico', 'icons/favicon-16.png', 'icons/favicon-32.png', 'icons/apple-touch-icon.png',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/mark-96.png', 'icons/mark-white.svg', 'icons/wordmark.png', 'icons/wordmark-dark.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS.map(a => new Request(a, { cache: 'reload' })))));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('datasketch-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

// Cache first: the app works fully offline, and a new VERSION swaps every file at once.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('index.html', { ignoreSearch: true }).then(r => r || fetch(req)));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  })));
});
