const CACHE_NAME = "monichat-v3";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Source+Sans+3:wght@300;400;500;600&display=swap",
  "https://unpkg.com/react@18/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
];

// Install — cache core assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network-first for API, cache-first for assets
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Always go to network for API calls
  if (url.hostname === "api.anthropic.com") {
    e.respondWith(fetch(e.request));
    return;
  }

  // Cache-first for everything else
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((response) => {
        // Cache successful GET responses
        if (response.ok && e.request.method === "GET") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback
      if (e.request.destination === "document") {
        return caches.match("/index.html");
      }
    })
  );
});

// Push notification handler
self.addEventListener("push", (e) => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || "MoniChat";
  const options = {
    body: data.body || "Time to log your expenses!",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag || "nudge",
    data: { url: data.url || "/" },
    vibrate: [200, 100, 200],
    actions: [
      { action: "log", title: "Log Now" },
      { action: "later", title: "Later" },
    ],
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  if (e.action === "later") return;
  e.waitUntil(
    clients.matchAll({ type: "window" }).then((list) => {
      for (const client of list) {
        if (client.url.includes("/") && "focus" in client) return client.focus();
      }
      return clients.openWindow(e.notification.data?.url || "/");
    })
  );
});

// Background sync for offline expense logging
self.addEventListener("sync", (e) => {
  if (e.tag === "sync-expenses") {
    e.waitUntil(syncPendingExpenses());
  }
});

async function syncPendingExpenses() {
  // Future: sync queued offline expenses to backend
  console.log("[SW] Background sync triggered");
}
