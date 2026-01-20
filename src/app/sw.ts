import { defaultCache } from "@serwist/next/worker";
import type {
  PrecacheEntry,
  RuntimeCaching,
  SerwistGlobalConfig,
} from "serwist";
import { ExpirationPlugin, Serwist, StaleWhileRevalidate } from "serwist";

// ALVIN-specific caching rules for dashboard data
// StaleWhileRevalidate: Show cached data immediately, update in background
// This ensures dashboard works offline with recent activity data
const alvinCache: RuntimeCaching[] = [
  {
    matcher: ({ url }) => url.pathname.startsWith("/api/trpc/dashboard"),
    handler: new StaleWhileRevalidate({
      cacheName: "alvin-dashboard-data",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        }),
      ],
    }),
  },
];

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...alvinCache, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

// Push notification payload type
interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
}

// Default push notification data
const DEFAULT_NOTIFICATION: PushNotificationPayload = {
  title: "ALVIN",
  body: "You have a new notification",
  url: "/dashboard",
  tag: "default",
};

// Push notification handler
self.addEventListener("push", (event: PushEvent) => {
  const data: PushNotificationPayload = event.data
    ? (event.data.json() as PushNotificationPayload)
    : DEFAULT_NOTIFICATION;

  const options: NotificationOptions = {
    body: data.body,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: data.tag ?? "default",
    requireInteraction: data.requireInteraction ?? false,
    data: { url: data.url ?? "/dashboard" },
  };

  // CRITICAL: Must use waitUntil or browser shows default notification
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handler - opens relevant URL
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  const notificationData = event.notification.data as { url?: string } | null;
  const url: string = notificationData?.url ?? "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(url);
    }),
  );
});
