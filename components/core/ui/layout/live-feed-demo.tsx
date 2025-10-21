import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationCenterFeed } from "@/components/ui/live-feed";
import { useActivityLogger } from "@/lib/activity-logger";
import {
	Clock,
	CreditCard,
	Database,
	Headphones,
	LayoutDashboard,
	Puzzle,
	XCircle,
} from "lucide-react";

export default function LiveFeedDemo() {
	const activityLogger = useActivityLogger();

	// Demo function to create sample activities
	const createDemoActivity = () => {
		const activities = [
			() =>
				activityLogger.logProjectCreated(
					"demo-project-1",
					"Demo E-commerce Site",
					"user-123",
				),
			() =>
				activityLogger.logPaymentReceived("payment-123", 299.99, "user-123"),
			() => activityLogger.logUserRegistration("user-demo-1", "John Doe"),
			() =>
				activityLogger.logTaskCompleted(
					"task-123",
					"Setup database schema",
					"user-123",
				),
		];

		// Pick a random activity to create
		const randomActivity =
			activities[Math.floor(Math.random() * activities.length)];
		randomActivity();
	};

	return (
		<div className="p-6 space-y-6 max-w-4xl mx-auto">
			<Card>
				<CardHeader>
					<CardTitle>Live Feed Integration Demo</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						This demo shows the live feed component with real API integration,
						error handling, and loading states.
					</p>

					<div className="flex flex-wrap gap-2">
						<Button onClick={createDemoActivity} size="sm">
							Create Demo Activity
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => window.location.reload()}
						>
							Refresh Page
						</Button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Basic live feed */}
						<div>
							<h3 className="text-lg font-semibold mb-3">Basic Live Feed</h3>
							<NotificationCenterFeed
								limit={5}
								autoRefresh={true}
								cardTitle="Recent Activity"
								cardDescription="Live updates from your dashboard"
							/>
						</div>

						{/* Live feed with controls */}
						<div>
							<h3 className="text-lg font-semibold mb-3">
								Live Feed with Controls
							</h3>
							<NotificationCenterFeed
								limit={8}
								autoRefresh={true}
								showControls={true}
								entityTypes={["user", "project", "payment"]}
								cardTitle="Filtered Activity"
								cardDescription="Showing user, project, and payment activities"
							/>
						</div>
					</div>

					<div className="mt-6 p-4 bg-muted rounded-lg">
						<h4 className="font-medium mb-2">Features Demonstrated:</h4>
						<ul className="text-sm space-y-1 text-muted-foreground">
							<li>• Real-time data fetching from API</li>
							<li>• Automatic refresh every 30 seconds</li>
							<li>• Error handling with retry functionality</li>
							<li>• Loading states during data fetch</li>
							<li>• Pause on hover for better UX</li>
							<li>• Status indicators (connected/paused/error)</li>
							<li>• Entity type filtering</li>
							<li>• Manual refresh controls</li>
							<li>• Dark mode support</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
