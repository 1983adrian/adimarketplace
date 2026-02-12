/// <reference lib="webworker" />

// Custom service worker for Web Push notifications
// This file extends the auto-generated workbox service worker

declare const self: ServiceWorkerGlobalScope;

// Handle push events - shows notification in phone notification bar
self.addEventListener('push', (event) => {
  const defaultTitle = '📦 Marketplace România';
  const defaultBody = 'Ai o notificare nouă.';

  let title = defaultTitle;
  let body = defaultBody;
  let data: any = {};

  if (event.data) {
    try {
      const payload = event.data.json();
      title = payload.title || defaultTitle;
      body = payload.body || payload.message || defaultBody;
      data = payload.data || {};
    } catch {
      body = event.data.text() || defaultBody;
    }
  }

  const options: NotificationOptions = {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    tag: data.type || 'general',
    renotify: true,
    data,
    actions: [
      { action: 'open', title: 'Deschide' },
      { action: 'dismiss', title: 'Închide' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let url = '/';

  // Route based on notification type
  switch (data.type) {
    case 'tracking_reminder':
      url = '/orders?section=selling';
      break;
    case 'new_order':
    case 'order':
      url = '/orders';
      break;
    case 'message':
      url = data.conversation_id ? `/messages?conversation=${data.conversation_id}` : '/messages';
      break;
    default:
      url = '/notifications';
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          (client as WindowClient).navigate(url);
          return;
        }
      }
      // Open new window
      return self.clients.openWindow(url);
    })
  );
});
