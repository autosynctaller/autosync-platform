const CACHE_NAME = 'autosync-v1'
const CACHE_URLS = ['/', '/login', '/talleres', '/manifest.json', '/app/taller/carga-rapida', '/app/taller/vehiculos']
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CACHE_URLS).catch(() => {}))); self.skipWaiting() })
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE_NAME).map(x => caches.delete(x))))); self.clients.claim() })
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || e.request.url.includes('/api/')) return
  e.respondWith(fetch(e.request).then(r => { if (r.status === 200) { const c = r.clone(); caches.open(CACHE_NAME).then(ca => ca.put(e.request, c)) } return r }).catch(() => caches.match(e.request).then(c => c || (e.request.mode === 'navigate' ? caches.match('/') : null))))
})
