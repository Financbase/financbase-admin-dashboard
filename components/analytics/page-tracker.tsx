/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface PageTrackerProps {
	children: React.ReactNode;
}

export default function PageTracker({ children }: PageTrackerProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [pageLoadTime, setPageLoadTime] = useState<number>(0);
	const [isVisible, setIsVisible] = useState<boolean>(true);

	useEffect(() => {
		// Track page load time
		const loadTime = performance.now();
		setPageLoadTime(loadTime);

		// Track page visibility changes
		const handleVisibilityChange = () => {
			setIsVisible(!document.hidden);
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		// Track performance metrics
		const trackPerformance = () => {
			if (typeof window !== "undefined" && "performance" in window) {
				const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;

				if (navigation) {
					const metrics = {
						page: pathname,
						loadTime: navigation.loadEventEnd - navigation.loadEventStart,
						domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
						responseTime: navigation.responseEnd - navigation.requestStart,
						networkLatency: navigation.responseStart - navigation.requestStart,
						timestamp: new Date().toISOString(),
						userAgent: navigator.userAgent,
						referrer: document.referrer,
						screenResolution: `${screen.width}x${screen.height}`,
						viewport: `${window.innerWidth}x${window.innerHeight}`,
					};

					// Send metrics to analytics service (implement based on your needs)
					console.log("Page Performance Metrics:", metrics);

					// Example: Send to analytics API
					// fetch("/api/analytics/page-metrics", {
					//   method: "POST",
					//   headers: { "Content-Type": "application/json" },
					//   body: JSON.stringify(metrics),
					// });
				}
			}
		};

		// Track after page loads
		const timeoutId = setTimeout(trackPerformance, 0);

		return () => {
			clearTimeout(timeoutId);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [pathname]);

	useEffect(() => {
		// Track route changes
		const routeChangeData = {
			from: pathname,
			to: pathname,
			search: searchParams.toString(),
			timestamp: new Date().toISOString(),
			visibility: isVisible ? "visible" : "hidden",
		};

		console.log("Route Change:", routeChangeData);

		// Example: Send to analytics API
		// fetch("/api/analytics/route-change", {
		//   method: "POST",
		//   headers: { "Content-Type": "application/json" },
		//   body: JSON.stringify(routeChangeData),
		// });
	}, [pathname, searchParams, isVisible]);

	// Track user interactions
	useEffect(() => {
		const trackUserInteraction = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			const interactionData = {
				type: "click",
				element: target.tagName.toLowerCase(),
				path: pathname,
				timestamp: new Date().toISOString(),
				x: event.clientX,
				y: event.clientY,
				viewport: `${window.innerWidth}x${window.innerHeight}`,
			};

			console.log("User Interaction:", interactionData);

			// Example: Send to analytics API (throttled)
			// if (Math.random() < 0.1) { // Sample 10% of interactions
			//   fetch("/api/analytics/interaction", {
			//     method: "POST",
			//     headers: { "Content-Type": "application/json" },
			//     body: JSON.stringify(interactionData),
			//   });
			// }
		};

		document.addEventListener("click", trackUserInteraction, true);

		return () => {
			document.removeEventListener("click", trackUserInteraction, true);
		};
	}, [pathname]);

	return <>{children}</>;
}

// Hook for tracking custom events
export function usePageTracker() {
	const pathname = usePathname();

	const trackEvent = (eventName: string, data: Record<string, any> = {}) => {
		const eventData = {
			event: eventName,
			page: pathname,
			data,
			timestamp: new Date().toISOString(),
			userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
		};

		console.log("Custom Event:", eventData);

		// Example: Send to analytics API
		// fetch("/api/analytics/custom-event", {
		//   method: "POST",
		//   headers: { "Content-Type": "application/json" },
		//   body: JSON.stringify(eventData),
		// });
	};

	const trackError = (error: Error, context: Record<string, any> = {}) => {
		const errorData = {
			error: {
				name: error.name,
				message: error.message,
				stack: error.stack,
			},
			page: pathname,
			context,
			timestamp: new Date().toISOString(),
			userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
		};

		console.error("Tracked Error:", errorData);

		// Send to error tracking service
		// fetch("/api/analytics/error", {
		//   method: "POST",
		//   headers: { "Content-Type": "application/json" },
		//   body: JSON.stringify(errorData),
		// });
	};

	return { trackEvent, trackError };
}
