const CACHE = 'vespatrek-v44';
const BASE = '/MientrasHayaCaminos/';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);

    const urls = [
      BASE + 'Vespa100.html',
      BASE + 'manifest.json',
      BASE + 'icon-192.png',
      BASE + 'icon-512.png'
    ];

    for (const url of urls) {
      try { await cache.add(url); } catch (e) {}
    }

    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE) ? caches.delete(k) : null));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Applica la regola solo al tuo sito
  if (url.origin !== location.origin) return;

  // ✅ Network-first per la pagina HTML principale (aggiornamenti automatici)
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await caches.match(req);
        return cached || caches.match(BASE + 'Vespa100.html');
      }
    })());
    return;
  }

  // Cache-first per il resto (icone/manifest ecc.)
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
