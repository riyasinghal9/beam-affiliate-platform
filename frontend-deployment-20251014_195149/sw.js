const CACHE_NAME = 'beam-affiliate-v1';
const STATIC_CACHE = 'beam-static-v1';
const DYNAMIC_CACHE = 'beam-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// API endpoints to cache
const API_CACHE = [
  '/api/dashboard',
  '/api/products',
  '/api/analytics',
  '/api/gamification'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static files
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// Handle API requests with cache fallback
async function handleApiRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    // Only cache GET requests, not POST/PUT/DELETE
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    // Fallback to cache for GET requests only
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({ 
        error: 'You are offline. Please check your connection.',
        offline: true 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static file requests
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Failed to fetch:', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Beam Affiliate',
    body: 'You have a new notification!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: {}
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.log('Error parsing push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      actions: [
        {
          action: 'open',
          title: 'Open',
          icon: '/icons/open.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss.png'
        }
      ],
      requireInteraction: true,
      tag: 'beam-notification'
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Sync any pending data
    const pendingData = await getPendingData();
    
    for (const data of pendingData) {
      try {
        await syncData(data);
        await removePendingData(data.id);
      } catch (error) {
        console.log('Failed to sync data:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Get pending data from IndexedDB
async function getPendingData() {
  // This would typically use IndexedDB to store pending actions
  return [];
}

// Sync data to server
async function syncData(data) {
  const response = await fetch(data.url, {
    method: data.method,
    headers: data.headers,
    body: data.body
  });
  
  if (!response.ok) {
    throw new Error('Sync failed');
  }
  
  return response;
}

// Remove pending data from IndexedDB
async function removePendingData(id) {
  // This would typically remove from IndexedDB
  console.log('Removed pending data:', id);
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync triggered:', event.tag);
  
  if (event.tag === 'periodic-sync') {
    event.waitUntil(doPeriodicSync());
  }
});

// Periodic sync function
async function doPeriodicSync() {
  try {
    // Update cached data
    await updateCachedData();
    
    // Check for new content
    await checkForUpdates();
  } catch (error) {
    console.log('Periodic sync failed:', error);
  }
}

// Update cached data
async function updateCachedData() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, response);
      }
    } catch (error) {
      console.log('Failed to update cached data:', error);
    }
  }
}

// Check for updates
async function checkForUpdates() {
  try {
    const response = await fetch('/api/version');
    const data = await response.json();
    
    if (data.version !== CACHE_NAME) {
      // New version available
      self.registration.showNotification('Update Available', {
        body: 'A new version of Beam Affiliate is available. Refresh to update.',
        icon: '/logo192.png',
        requireInteraction: true
      });
    }
  } catch (error) {
    console.log('Failed to check for updates:', error);
  }
}

// Handle app install
self.addEventListener('beforeinstallprompt', (event) => {
  console.log('App install prompt available');
  // Store the event for later use
  self.deferredPrompt = event;
});

// Handle app installed
self.addEventListener('appinstalled', (event) => {
  console.log('App installed successfully');
  // Clear the deferred prompt
  self.deferredPrompt = null;
});

console.log('Service Worker loaded'); 