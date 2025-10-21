"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAnalytics } from "@/lib/analytics";
import {
	AlertCircle,
	BarChart3,
	Calendar,
	Clock,
	Code,
	ExternalLink,
	Headphones,
	HelpCircle,
	Key,
	LayoutDashboard,
	Plus,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SupportTicket {
	id: number;
	ticketNumber: string;
	subject: string;
	status: string;
	priority: string;
	component: string;
	createdAt: string;
	slaDeadline?: string;
}

interface SupportWidgetProps {
	component?: string;
	maxDisplay?: number;
}

export function SupportWidget({
	component = "dashboard",
	maxDisplay = 5,
}: SupportWidgetProps) {
	const [tickets, setTickets] = useState<SupportTicket[]>([]);
	const [loading, setLoading] = useState(true);
	const { track, events } = useAnalytics();

	useEffect(() => {
		fetchTickets();
	}, []);

	const fetchTickets = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`/api/support/tickets?component=${component}&status=open`,
			);

			if (!response.ok) {
				throw new Error("Failed to fetch tickets");
			}

			const data = await response.json();
			setTickets(data.tickets || []);
		} catch (_error) {
			// TODO: Implement logic
		} finally {
			setLoading(false);
		}
	};

	const handleCreateTicket = () => {
		// Navigate to help page to create ticket
		window.open("/help?action=create", "_blank");

		// Track analytics
		track(events.SUPPORT_TICKET_VIEWED, {
			component,
			action: "create_clicked",
		});
	};

	const getPriorityColor = (priority: string) => {
		const colors = {
			low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
			medium:
				"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
			high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
			urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
		};
		return colors[priority as keyof typeof colors] || colors.medium;
	};

	const getStatusColor = (status: string) => {
		const colors = {
			open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
			pending:
				"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
			resolved:
				"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
			closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
		};
		return colors[status as keyof typeof colors] || colors.open;
	};

	const isNearSla = (slaDeadline?: string) => {
		if (!slaDeadline) {
			return false;
		}
		const deadline = new Date(slaDeadline);
		const now = new Date();
		const hoursUntilDeadline =
			(deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
		return hoursUntilDeadline < 2 && hoursUntilDeadline > 0;
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Support Tickets</CardTitle>
						<CardDescription>Your open support requests</CardDescription>
					</div>
					<Button size="sm" onClick={handleCreateTicket}>
						<Plus className="h-4 w-4 mr-2" />
						New Ticket
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="animate-pulse">
								<div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg" />
							</div>
						))}
					</div>
				) : tickets.length === 0 ? (
					<div className="text-center py-8">
						<p className="text-muted-foreground mb-4">
							No open support tickets
						</p>
						<p className="text-sm text-muted-foreground">
							Click "New Ticket" above if you need help
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{tickets.slice(0, maxDisplay).map((ticket) => (
							<div
								key={ticket.id}
								className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
								onClick={() =>
									window.open(`/help?ticket=${ticket.ticketNumber}`, "_blank")
								}
							>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<span className="font-medium text-sm truncate">
											{ticket.subject}
										</span>
										{isNearSla(ticket.slaDeadline) && (
											<AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
										)}
									</div>
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<span>{ticket.ticketNumber}</span>
										<span>•</span>
										<Clock className="h-3 w-3" />
										<span>
											{new Date(ticket.createdAt).toLocaleDateString()}
										</span>
									</div>
								</div>
								<div className="flex flex-col items-end gap-1 flex-shrink-0">
									<Badge
										className={getPriorityColor(ticket.priority)}
										variant="secondary"
									>
										{ticket.priority}
									</Badge>
									<Badge
										className={getStatusColor(ticket.status)}
										variant="secondary"
									>
										{ticket.status}
									</Badge>
								</div>
								<ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
							</div>
						))}
						{tickets.length > maxDisplay && (
							<Button
								variant="outline"
								className="w-full"
								onClick={() => window.open("/help", "_blank")}
							>
								View All Tickets ({tickets.length})
							</Button>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
