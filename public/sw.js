const CACHE_NAME = "nopsa-pwa";
const files = [
  "/",
  "/index.html",
  "/help.html",
  "/global.css",
  "/build/bundle.css",
  "/build/bundle.js",
  "/favicon/favicon-192.png",
  "/register-sw.js",
  "/manifest.json",
  "/sw.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js", // PDF.js
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(files)));
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.response))
  );
});
