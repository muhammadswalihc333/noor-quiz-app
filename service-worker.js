// Noor Al Madrasa Quiz App - v3.1.0 Photo Model 6 Column Final
// MUHAMMAD Key Safe - Auto Update
// Photo Model - 6 Column Desktop View

const CACHE = "noor-v3.1.0-photo-model-6-col-final";
const urlsToCache = [
  "/",
  "/index.html",
  "/icon.png",
  "/manifest.json"
];

// Install - New Version
self.addEventListener("install", event => {
  self.skipWaiting();
  console.log("Installing v3.1.0 Photo Model");
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate - Delete Old Cache - Keep MUHAMMAD Key Safe (localStorage not touched)
self.addEventListener("activate", event => {
  console.log("Activating v3.1.0 Photo Model - MUHAMMAD Safe");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE)
          .map(name => {
            console.log("Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Network First, Cache Fallback - Photo Model Fast
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache new version
        return caches.open(CACHE).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        // Offline - Use Cache
        return caches.match(event.request);
      })
  );
});