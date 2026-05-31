const CACHE = 'recharge-recovery-v1';
const ASSETS = [
  './',
  './index.html',
  './log.html',
  './courses.html',
  './course-picker.html',
  './course-view.html',
  './progress.html',
  './enrichment.html',
  './coach.html',
  './app.css',
  './app-shared.js',
  './manifest.json',
];
self.addEventListener('install',  e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',    e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
