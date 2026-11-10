// AIR OS — service worker: офлайн-режим. Сначала сеть (свежая версия), если сети нет — из кэша.
const V = 'air-v2.3';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './site/', './site/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const ok = url.origin === location.origin || url.hostname === 'cdnjs.cloudflare.com';
  if (!ok) return;
  e.respondWith(
    fetch(req.url, { cache: 'no-cache' })
      .then(res => {
        if (res && res.status === 200) { const copy = res.clone(); caches.open(V).then(c => c.put(req.url, copy)); }
        return res;
      })
      .catch(() => caches.match(req.url, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
