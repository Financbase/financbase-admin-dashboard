/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

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
import { toast } from "@/lib/toast";
import {
	parseApiError,
	getUserFriendlyMessage,
	createErrorFromFetch,
} from "@/lib/utils/api-error-handler";
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
import { logger } from '@/lib/logger';

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [component, maxDisplay]);

	const fetchTickets = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`/api/help/tickets?status=open&limit=${maxDisplay * 2}`,
			);

			if (!response.ok) {
				// Use standardized error parsing utility
				const parsedError = await parseApiError(response);
				
				if (parsedError) {
					// Log full error details for debugging
					logger.error('API Error Response:', {
						code: parsedError.code,
						message: parsedError.message,
						requestId: parsedError.requestId,
						timestamp: parsedError.timestamp,
						status: response.status,
						statusText: response.statusText,
						url: response.url,
						details: parsedError.details,
					});
					
					// Throw error with parsed message
					throw new Error(parsedError.message);
				} else {
					// Fallback if parsing fails
					logger.error('API Error Response: Failed to parse error', {
						status: response.status,
						statusText: response.statusText,
						url: response.url,
					});
					throw new Error(`Request failed with status ${response.status}`);
				}
			}

			const data = await response.json();
			// Map API response to component's expected structure
			const mappedTickets = (data.tickets || []).map((ticket: any) => ({
				id: ticket.id,
				ticketNumber: ticket.ticketNumber,
				subject: ticket.subject,
				status: ticket.status,
				priority: ticket.priority,
				component: ticket.category || component, // Use category as component, fallback to prop
				createdAt: typeof ticket.createdAt === 'string' 
					? ticket.createdAt 
					: new Date(ticket.createdAt).toISOString(),
				slaDeadline: ticket.customFields?.slaDeadline 
					? (typeof ticket.customFields.slaDeadline === 'string'
						? ticket.customFields.slaDeadline
						: new Date(ticket.customFields.slaDeadline).toISOString())
					: undefined,
			}));
			
			// Filter by component if specified (client-side filtering)
			const filteredTickets = component !== "dashboard"
				? mappedTickets.filter((t: SupportTicket) => t.component === component)
				: mappedTickets;
			
			setTickets(filteredTickets);
		} catch (error) {
			// Handle error fetching tickets
			logger.error('Error fetching support tickets:', error);
			
			// Create standardized error from fetch error if needed
			let parsedError;
			if (error instanceof Error) {
				// Check if it's a network/fetch error
				if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
					parsedError = createErrorFromFetch(error);
				} else {
					// Use the error message directly
					parsedError = {
						code: 'UNKNOWN_ERROR',
						message: error.message,
					};
				}
			} else {
				parsedError = createErrorFromFetch(error);
			}
			
			// Get user-friendly error message
			const userFriendlyMessage = getUserFriendlyMessage(parsedError);
			const errorMessage = parsedError.message || 'Failed to load support tickets';
			
			// Show user-friendly error message
			toast.error(
				'Unable to load tickets',
				userFriendlyMessage
			);
			
			// Set empty tickets array to prevent UI errors
			setTickets([]);
			
			// Track error analytics
			track(events.SUPPORT_TICKET_VIEWED, {
				component,
				action: 'fetch_error',
				error: errorMessage,
				errorCode: parsedError.code,
				requestId: parsedError.requestId,
			});
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
