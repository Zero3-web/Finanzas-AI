const CACHE_NAME = 'personal-finance-pwa-v1';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
];

// Install the service worker and cache the app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache and caching app shell');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Serve cached content when offline
self.addEventListener('fetch', (event) => {
    // We are using a cache-first strategy
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Not in cache - fetch from network
                return fetch(event.request).then(
                    (response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        // We don't want to cache extension requests
                        if (event.request.url.startsWith('chrome-extension://')) {
                            return response;
                        }
                        
                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});
