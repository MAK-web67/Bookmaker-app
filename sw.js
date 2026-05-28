var CACHE_NAME = ‘bookmaker-v1’;
var OFFLINE_URLS = [
‘/bookmaker-app.html’,
‘/client.html’,
‘https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap’
];

// Install - cache key files
self.addEventListener(‘install’, function(e) {
e.waitUntil(
caches.open(CACHE_NAME).then(function(cache) {
return cache.addAll(OFFLINE_URLS);
}).catch(function(err) {
console.log(‘Cache install error:’, err);
})
);
self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener(‘activate’, function(e) {
e.waitUntil(
caches.keys().then(function(keys) {
return Promise.all(
keys.filter(function(key) { return key !== CACHE_NAME; })
.map(function(key) { return caches.delete(key); })
);
})
);
self.clients.claim();
});

// Fetch - serve from cache, fallback to network
self.addEventListener(‘fetch’, function(e) {
// Don’t cache API calls
if(e.request.url.includes(’/api/’)) {
return;
}

e.respondWith(
caches.match(e.request).then(function(cached) {
if(cached) return cached;

```
  return fetch(e.request).then(function(response) {
    // Cache successful GET requests
    if(e.request.method === 'GET' && response.status === 200) {
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(e.request, clone);
      });
    }
    return response;
  }).catch(function() {
    // Offline fallback
    if(e.request.destination === 'document') {
      return caches.match('/bookmaker-app.html');
    }
  });
})
```

);
});
