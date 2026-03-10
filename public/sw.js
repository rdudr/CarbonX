const CACHE_NAME = 'carbonx-v1.0.0';
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

// ─── Install: Pre-cache static assets ───────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[CarbonX SW] Pre-caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    // Force the new SW to activate immediately
    self.skipWaiting();
});

// ─── Activate: Clean up old caches ──────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log(`[CarbonX SW] Deleting old cache: ${name}`);
                        return caches.delete(name);
                    })
            )
        )
    );
    // Take control of all clients immediately
    self.clients.claim();
});

// ─── Fetch: Network-first for API/data, Cache-first for static ──────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests (e.g. Firebase, analytics)
    if (url.origin !== self.location.origin) return;

    // Network-first for API routes (energy data should always be fresh)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    // Cache successful API responses for 5-min offline fallback
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Cache-first for static assets (JS, CSS, images, fonts)
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                // Serve from cache, but update cache in background (stale-while-revalidate)
                const fetchPromise = fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, networkResponse.clone());
                        });
                    }
                    return networkResponse;
                });
                return cachedResponse;
            }

            // Not in cache — fetch from network and cache it
            return fetch(request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
                    return networkResponse;
                }
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseClone);
                });
                return networkResponse;
            });
        })
    );
});

// ─── Push Notifications (for critical energy loss alerts) ─────────────────
self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {};
    const title = data.title ?? 'CarbonX Alert';
    const options = {
        body: data.body ?? 'New energy monitoring alert.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: data.critical ? [200, 100, 200, 100, 200] : [100],
        data: { url: data.url ?? '/' },
        tag: data.tag ?? 'carbonx-alert',
        requireInteraction: data.critical ?? false,
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// ─── Notification Click: Open app ─────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url ?? '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
