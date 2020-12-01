const CACHE_NAME = "nopsa-pwa";
const files = [
  "./",
  "./index.html",
  "./help.html",
  "./global.css",
  "./build/bundle.css",
  "./build/bundle.js",
  "./favicon/favicon-192.png",
  "./register-sw.js",
  "./sw.js",
  "./manifest.json",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(files)));
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.response))
  );
});
