"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Clock,
	AlertTriangle,
	Info,
	CheckCircle,
	XCircle,
	MoreVertical,
	Eye,
	RefreshCw,
} from "lucide-react";
import { useState } from "react";

interface AlertEvent {
	id: string;
	alertName: string;
	triggeredAt: string;
	severity: "low" | "medium" | "high" | "critical";
	status: "acknowledged" | "resolved" | "dismissed" | "pending";
	message: string;
	source: string;
	acknowledgedBy?: string;
	acknowledgedAt?: string;
	resolvedAt?: string;
}

const mockAlertHistory: AlertEvent[] = [
	{
		id: "1",
		alertName: "Revenue Drop Alert",
		triggeredAt: "2024-01-20 14:30:00",
		severity: "high",
		status: "acknowledged",
		message: "Daily revenue dropped below $10,000 threshold",
		source: "Revenue Monitor",
		acknowledgedBy: "John Doe",
		acknowledgedAt: "2024-01-20 14:35:00",
	},
	{
		id: "2",
		alertName: "High Error Rate",
		triggeredAt: "2024-01-20 13:45:00",
		severity: "critical",
		status: "resolved",
		message: "Error rate exceeded 5% threshold for 10 minutes",
		source: "Error Monitor",
		acknowledgedBy: "Jane Smith",
		acknowledgedAt: "2024-01-20 13:47:00",
		resolvedAt: "2024-01-20 14:15:00",
	},
	{
		id: "3",
		alertName: "Performance Degradation",
		triggeredAt: "2024-01-20 12:20:00",
		severity: "medium",
		status: "dismissed",
		message: "Response time exceeded 3 seconds",
		source: "Performance Monitor",
	},
];

export function AlertsHistory() {
	const [events, setEvents] = useState<AlertEvent[]>(mockAlertHistory);

	const getSeverityColor = (severity: string) => {
		switch (severity) {
			case "low":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "medium":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "high":
				return "bg-orange-100 text-orange-800 border-orange-200";
			case "critical":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "acknowledged":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "resolved":
				return "bg-green-100 text-green-800 border-green-200";
			case "dismissed":
				return "bg-gray-100 text-gray-800 border-gray-200";
			case "pending":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "acknowledged":
				return <Info className="h-4 w-4 text-blue-500" />;
			case "resolved":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "dismissed":
				return <XCircle className="h-4 w-4 text-gray-500" />;
			case "pending":
				return <Clock className="h-4 w-4 text-yellow-500" />;
			default:
				return <AlertTriangle className="h-4 w-4 text-gray-500" />;
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						Alert History
					</CardTitle>
					<Button variant="outline" size="sm">
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh
					</Button>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Alert</TableHead>
							<TableHead>Severity</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Triggered</TableHead>
							<TableHead>Source</TableHead>
							<TableHead>Acknowledged By</TableHead>
							<TableHead className="w-12"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{events.map((event) => (
							<TableRow key={event.id}>
								<TableCell>
									<div>
										<p className="font-medium">{event.alertName}</p>
										<p className="text-sm text-muted-foreground line-clamp-1">
											{event.message}
										</p>
									</div>
								</TableCell>
								<TableCell>
									<Badge variant="outline" className={getSeverityColor(event.severity)}>
										{event.severity}
									</Badge>
								</TableCell>
								<TableCell>
									<div className="flex items-center space-x-2">
										{getStatusIcon(event.status)}
										<Badge variant="outline" className={getStatusColor(event.status)}>
											{event.status}
										</Badge>
									</div>
								</TableCell>
								<TableCell className="text-sm text-muted-foreground">
									{new Date(event.triggeredAt).toLocaleString()}
								</TableCell>
								<TableCell className="text-sm">{event.source}</TableCell>
								<TableCell className="text-sm text-muted-foreground">
									{event.acknowledgedBy || "-"}
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem>
												<Eye className="h-4 w-4 mr-2" />
												View Details
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem className="text-red-600">
												Delete Record
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
