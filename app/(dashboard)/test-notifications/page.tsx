// Test page to verify notifications component
"use client";

import { EnhancedNotificationsPanel } from "@/components/core/enhanced-notifications-panel";
import { useUser } from "@clerk/nextjs";

export default function TestNotificationsPage() {
	const { user, isLoaded } = useUser();

	return (
		<div className="container mx-auto p-8">
			<h1 className="text-2xl font-bold mb-4">Notifications Test Page</h1>
			
			<div className="space-y-4 mb-8">
				<div className="p-4 border rounded">
					<h2 className="font-semibold mb-2">User Status</h2>
					<p>Loaded: {isLoaded ? "Yes" : "No"}</p>
					<p>User ID: {user?.id || "Not available"}</p>
					<p>Email: {user?.emailAddresses[0]?.emailAddress || "Not available"}</p>
				</div>
			</div>

			<div className="p-4 border rounded">
				<h2 className="font-semibold mb-4">Notification Component</h2>
				<div className="flex items-center gap-4">
					<EnhancedNotificationsPanel />
					<span className="text-sm text-muted-foreground">
						Click the bell icon above to test notifications
					</span>
				</div>
			</div>

			<div className="mt-8 p-4 border rounded bg-muted">
				<h3 className="font-semibold mb-2">Debug Instructions</h3>
				<ol className="list-decimal list-inside space-y-1 text-sm">
					<li>Open browser console (F12)</li>
					<li>Look for logs starting with [Notifications]</li>
					<li>Check Network tab for /api/notifications request</li>
					<li>Verify the bell icon shows a badge if unreadCount &gt; 0</li>
				</ol>
			</div>
		</div>
	);
}

