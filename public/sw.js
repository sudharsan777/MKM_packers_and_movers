const CACHE_VERSION = 'mkm-pwa-v2';
const CACHE_NAME = `mkm-cache-${CACHE_VERSION}`;

// Static Application Shell Assets (physical files only)
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
];

// Domains and endpoints to NEVER intercept or cache
const NEVER_CACHE_PATTERNS = [
  'firestore.googleapis.com',
  'firebasestorage.googleapis.com',
  'firebaseio.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'google-analytics.com',
  'apis.google.com',
];

// Install Event - Pre-cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(APP_SHELL).catch((err) => {
          console.warn('[SW] App Shell pre-caching notice:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale cache versions immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith('mkm-')) {
              console.log('[SW] Purging old cache version:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Message Listener for update actions
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch Event - Network First with SPA index.html fallback for navigation
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = request.url;

  // 1. Only intercept GET requests
  if (request.method !== 'GET') {
    return;
  }

  // 2. Pass-through for Firebase Firestore, Auth, Storage, and external cloud APIs
  const isExcluded = NEVER_CACHE_PATTERNS.some((pattern) => url.includes(pattern));
  if (isExcluded || !url.startsWith('http')) {
    return;
  }

  // 3. SPA Navigation requests (HTML navigation for routes like /dashboard, /invoices, /login)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // If server returns a 404 for a client route, fallback to index.html
          if (!networkResponse || networkResponse.status === 404) {
            return caches.match('/index.html').then((cached) => cached || networkResponse);
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html').then((cachedIndex) => {
            return cachedIndex || fetch('/index.html');
          });
        })
    );
    return;
  }

  // 4. Static Assets (CSS, JS, Images, Icons)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== 'basic'
          ) {
            return networkResponse;
          }

          // Cache local static bundle assets
          if (
            url.includes('/assets/') ||
            url.includes('/icons/') ||
            url.endsWith('.png') ||
            url.endsWith('.svg') ||
            url.endsWith('.css') ||
            url.endsWith('.js')
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }

          return networkResponse;
        })
        .catch(() => {
          return cachedResponse;
        });
    })
  );
});
