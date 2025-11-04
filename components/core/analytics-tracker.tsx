/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { BarChart3, FileText, LayoutDashboard } from "lucide-react";
("use client");

import { useHybridAnalytics } from "@/lib/analytics";
import { usePostHogIdentify } from "@/lib/posthog-identify";
import { useEffect } from "react";

export default function DashboardAnalyticsTracker() {
	const { track, events } = useHybridAnalytics();

	// Auto-identify user in PostHog when component mounts
	usePostHogIdentify();

	useEffect(() => {
		// Track dashboard page view with hybrid analytics
		track(events.DASHBOARD_VIEWED, {
			timestamp: new Date().toISOString(),
			page: "/dashboard",
			source: "dashboard-tracker",
		});

		// Track session start
		const sessionId = sessionStorage.getItem("analytics_session_id");
		if (sessionId) {
			track("session_start", {
				sessionId,
				component: "dashboard",
				referrer: document.referrer || "direct",
				source: "dashboard-tracker",
			});
		}
	}, [track, events]);

	return null; // This component doesn't render anything
}
