// sw.js — Kids Quiz PWA
const CACHE_VERSION = 'kq-v1.2.2';
const CACHE_NAME = `kids-quiz-${CACHE_VERSION}`;
const CORE = [
  '../',
  '../index.html',
  '../assets/app.css',
  '../assets/app.js',
  './manifest.webmanifest',
  '../icons/android-chrome-192x192.png',
  '../icons/android-chrome-512x512.png',
  '../icons/apple-touch-icon.png',
  '../img/hero-bg.png',
  '../img/bg-tile.png',
  '../img/btn-start.png',
  '../img/btn-reveal.png',
  '../img/btn-next.png',
  '../img/btn-review.png',
  '../img/btn-retry.png',
  '../img/btn-home.png',
  '../img/chip-kr.png',
  '../img/chip-math.png',
  '../img/chip-en.png',
  '../img/chip-gk.png'
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)).then(()=> self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))).then(()=> self.clients.claim()));
});
const RUNTIME_CDN=['https://cdn.tailwindcss.com','https://fonts.googleapis.com','https://fonts.gstatic.com','https://cdn.jsdelivr.net'];
self.addEventListener('fetch', (event)=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin===self.location.origin){
    event.respondWith(caches.match(event.request).then(c=>c||fetch(event.request)));
    return;
  }
  if(RUNTIME_CDN.some(p=>url.href.startsWith(p))){
    event.respondWith(caches.open(CACHE_NAME).then(async cache=>{
      const cached=await cache.match(event.request);
      const fetcher=fetch(event.request).then(res=>{ if(res&&res.status===200) cache.put(event.request,res.clone()); return res; }).catch(()=>cached);
      return cached || fetcher;
    }));
  }
});
