// Custom Service Worker for CMS Admin Dashboard
// This file is used by next-pwa with InjectManifest

import { BackgroundSyncPlugin } from "workbox-background-sync";
import { Queue } from "workbox-background-sync";
import { ExpirationPlugin } from "workbox-expiration";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
	CacheFirst,
	NetworkFirst,
	StaleWhileRevalidate,
} from "workbox-strategies";

// Precache and route static assets
precacheAndRoute(self.__WB_MANIFEST);

// Clean up outdated caches
cleanupOutdatedCaches();

// Background sync for offline actions
const backgroundSyncQueue = new Queue("background-sync-queue", {
	onSync: async ({ queue }) => {
		let entry;
		while ((entry = await queue.shiftRequest())) {
			try {
				await fetch(entry.request);
				console.log("Background sync successful:", entry.request.url);
			} catch (error) {
				console.error("Background sync failed:", error);
				await queue.unshiftRequest(entry);
				throw error;
			}
		}
	},
});

// Register background sync plugin
const bgSyncPlugin = new BackgroundSyncPlugin("background-sync-queue", {
	maxRetentionTime: 24 * 60, // 24 hours
});

// Cache strategies for different types of content
registerRoute(
	({ request }) => request.destination === "document",
	new NetworkFirst({
		cacheName: "pages-cache",
		plugins: [
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 24 * 60 * 60, // 24 hours
			}),
			bgSyncPlugin,
		],
	}),
);

// API routes with network-first strategy
registerRoute(
	({ url }) => url.pathname.startsWith("/api/"),
	new NetworkFirst({
		cacheName: "api-cache",
		plugins: [
			new ExpirationPlugin({
				maxEntries: 100,
				maxAgeSeconds: 5 * 60, // 5 minutes
			}),
			bgSyncPlugin,
		],
		networkTimeoutSeconds: 10,
	}),
);

// Static assets with cache-first strategy
registerRoute(
	({ request }) =>
		request.destination === "script" ||
		request.destination === "style" ||
		request.destination === "image",
	new CacheFirst({
		cacheName: "static-assets",
		plugins: [
			new ExpirationPlugin({
				maxEntries: 200,
				maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
			}),
		],
	}),
);

// Fonts with cache-first strategy
registerRoute(
	({ url }) => url.pathname.includes("fonts") || url.hostname.includes("fonts"),
	new CacheFirst({
		cacheName: "fonts-cache",
		plugins: [
			new ExpirationPlugin({
				maxEntries: 10,
				maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
			}),
		],
	}),
);

// Analytics and tracking with stale-while-revalidate
registerRoute(
	({ url }) =>
		url.hostname.includes("analytics") ||
		url.hostname.includes("tracking") ||
		url.pathname.includes("/analytics/"),
	new StaleWhileRevalidate({
		cacheName: "analytics-cache",
		plugins: [
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 60 * 60, // 1 hour
			}),
		],
	}),
);

// Dashboard data with network-first strategy
registerRoute(
	({ url }) =>
		url.pathname.includes("/dashboard") ||
		url.pathname.includes("/analytics") ||
		url.pathname.includes("/reports"),
	new NetworkFirst({
		cacheName: "dashboard-cache",
		plugins: [
			new ExpirationPlugin({
				maxEntries: 30,
				maxAgeSeconds: 60 * 60, // 1 hour
			}),
			bgSyncPlugin,
		],
		networkTimeoutSeconds: 5,
	}),
);

// Handle push notifications
self.addEventListener("push", (event) => {
	if (event.data) {
		const data = event.data.json();
		const options = {
			body: data.body,
			icon: "/icons/icon-192x192.png",
			badge: "/icons/badge-72x72.png",
			vibrate: [100, 50, 100],
			data: {
				dateOfArrival: Date.now(),
				primaryKey: data.primaryKey || 1,
			},
			actions: [
				{
					action: "explore",
					title: "View Details",
					icon: "/icons/checkmark.png",
				},
				{
					action: "close",
					title: "Close",
					icon: "/icons/xmark.png",
				},
			],
		};

		event.waitUntil(self.registration.showNotification(data.title, options));
	}
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	if (event.action === "explore") {
		event.waitUntil(clients.openWindow("/dashboard"));
	} else if (event.action === "close") {
		// Just close the notification
		return;
	} else {
		// Default action - open the app
		event.waitUntil(clients.openWindow("/"));
	}
});

// Handle background sync
self.addEventListener("sync", (event) => {
	if (event.tag === "background-sync") {
		event.waitUntil(backgroundSyncQueue.replayRequests());
	}
});

// Handle install event
self.addEventListener("install", (event) => {
	console.log("Service Worker installing...");
	self.skipWaiting();
});

// Handle activate event
self.addEventListener("activate", (event) => {
	console.log("Service Worker activating...");
	event.waitUntil(clients.claim());
});

// Handle fetch events for custom caching logic
self.addEventListener("fetch", (event) => {
	// Skip cross-origin requests
	if (!event.request.url.startsWith(self.location.origin)) {
		return;
	}

	// Handle offline fallbacks
	if (event.request.destination === "document") {
		event.respondWith(
			fetch(event.request).catch(() => {
				// Return offline page for navigation requests
				return caches.match("/_offline");
			}),
		);
	}
});

// Message handling for communication with the main thread
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}

	if (event.data && event.data.type === "GET_VERSION") {
		event.ports[0].postMessage({ version: "1.0.0" });
	}
});

// Periodic background sync (if supported)
if (
	"serviceWorker" in navigator &&
	"sync" in window.ServiceWorkerRegistration.prototype
) {
	self.addEventListener("sync", (event) => {
		if (event.tag === "periodic-sync") {
			event.waitUntil(
				// Perform periodic sync tasks
				syncDashboardData(),
			);
		}
	});
}

// Function to sync dashboard data in background
async function syncDashboardData() {
	try {
		const response = await fetch("/api/sync/dashboard-data");
		if (response.ok) {
			console.log("Dashboard data synced successfully");
		}
	} catch (error) {
		console.error("Failed to sync dashboard data:", error);
	}
}

// Cache warming for critical resources
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open("critical-resources").then((cache) => {
			return cache.addAll([
				"/",
				"/dashboard",
				"/analytics",
				"/manifest.json",
				"/icons/icon-192x192.png",
				"/icons/icon-512x512.png",
			]);
		}),
	);
});
