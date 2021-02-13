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

/**
 * Helper to check if an url is a request for the page's manifest.json
 * @param {String} url
 */
const requestIsManifest = (url) =>
  url.origin === location.origin && url.pathname.endsWith("manifest.json");

/**
 * Caches all files in the 'files' array upon installing
 */
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(files)));
});

/**
 * Returns cached files when fetching,
 * and checks for a new software version whenever
 * the manifest.json is fetched.
 */
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  if (requestIsManifest(url)) {
    const checkVersion = async () => {
      try {
        const cached = await (await caches.match(e.request)).json();
        const manifest = await (await fetch(e.request)).json();

        if (!manifest) {
          console.warn("could not load newest manifest");
          return;
        }

        if (manifest.version !== cached.version) {
          const client = await clients.get(e.clientId);
          if (!client) return;

          client.postMessage({
            action: "update",
            message: "Update available",
            detail: `Version: ${manifest.version}`,
          });
        }

        console.log("up to date");
      } catch (err) {
        console.log(err);
      }
    };

    e.waitUntil(checkVersion());
  }

  e.respondWith(
    caches
      .match(e.request)
      .then((response) => response || fetch(e.response).catch(console.warn))
  );
});

/**
 * Listen for messages from main page
 */
self.addEventListener("message", async (e) => {
  if (!(e && e.data)) return;

  switch (e.data.action) {
    case "update":
      await caches.delete(CACHE_NAME);
      await (await caches.open(CACHE_NAME)).addAll(files); // re-download files

      const client = await clients.get(e.source.id);
      client.postMessage({
        action: "refresh",
        message: "Update ready",
        detail: "Reload to apply",
      });
      break;
  }
});
