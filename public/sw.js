// Service worker for YEWA - Network first strategy
const CACHE_NAME = 'yewa-v2';

self.addEventListener('install', (event) => {
  console.log('SW: Installing new version');
  self.skipWaiting(); // Immediately activate new service worker
});

self.addEventListener('activate', (event) => {
  console.log('SW: Activating');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Take control of all clients
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip caching for API requests and auth
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('supabase.co') ||
      event.request.method !== 'GET') {
    return fetch(event.request);
  }

  // Network first strategy - always try network first, then fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If network succeeds, cache the response and return it
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            })
            .catch(() => {
              // Silent fail for caching errors
            });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            return cachedResponse || new Response('Network error and no cached version available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});