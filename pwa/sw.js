// sw.js — v1.3.0
const CACHE = 'kids-quiz-v1.3.0';
const CORE = [
  '../',
  '../index.html',
  '../assets/app.css',
  '../assets/config.js',
  '../assets/app-online.js',
  './manifest.webmanifest',
  '../icons/android-chrome-192x192.png',
  '../icons/android-chrome-512x512.png',
  '../img/hero-bg.png',
  '../img/bg-tile.png'
];
self.addEventListener('install', e=> e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate', e=> e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k===CACHE?null:caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.origin===self.location.origin){ e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))); return; }
  // network-first for online APIs
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
