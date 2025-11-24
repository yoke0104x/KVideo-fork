const CACHE_NAME = 'video-cache-v2';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip proxy API routes - they handle their own caching and URL rewriting
    if (url.pathname.startsWith('/api/proxy')) {
        return; // Let the request pass through without Service Worker intervention
    }

    // Intercept HLS manifest files (.m3u8)
    if (url.pathname.endsWith('.m3u8')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
                    // Always fetch fresh manifest but return cached while fetching
                    const fetchPromise = fetch(event.request).then((networkResponse) => {
                        // Check if network response is valid
                        if (!networkResponse || networkResponse.status !== 200) {
                            throw new Error('Network response was not ok');
                        }
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    }).catch((err) => {
                        // If network fails, return cached response if available
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // If no cache and network fails, throw error so browser handles it
                        // This allows the client (VideoPlayer) to catch the error and retry with proxy
                        throw err;
                    });

                    // Return cache immediately if available, otherwise wait for network
                    return cachedResponse || fetchPromise;
                });
            })
        );
    }

    // Intercept video segment files (.ts)
    if (url.pathname.endsWith('.ts')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
                    // Cache hit - return immediately for instant playback
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    // Cache miss - fetch from network
                    return fetch(event.request).then((response) => {
                        // Only cache valid responses
                        if (response && response.status === 200) {
                            cache.put(event.request, response.clone());
                            return response;
                        }
                        // If response is not valid (e.g. 403, 404), return it as is
                        // so the browser/player can handle the error status
                        return response;
                    }).catch((error) => {
                        console.error('[SW] Failed to fetch segment:', error);
                        // Throw error to let browser handle it
                        throw error;
                    });
                });
            })
        );
    }
});
