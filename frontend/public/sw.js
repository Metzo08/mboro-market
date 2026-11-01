// Service worker JëndCiThiès — cache offline-first pour pages publiques
const CACHE = 'jendcithies-v1';
const PRECACHE = [
  '/',
  '/products',
  '/shops',
  '/manifest.json',
  '/pwa/icon-192.png',
  '/pwa/icon-512.png',
  '/offline',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Jamais mettre en cache l'API, ni les routes marchand (privées)
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/merchant')) return;

  // Navigations : network-first avec fallback cache puis /offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/offline')))
    );
    return;
  }

  // Assets statiques : cache-first
  if (/\.(png|jpg|jpeg|webp|svg|css|js|woff2?)$/.test(url.pathname) || url.pathname.startsWith('/pwa/')) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          })
      )
    );
  }
});
