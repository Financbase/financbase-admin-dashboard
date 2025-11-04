/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
	Bell,
	MoreVertical,
	Edit,
	Trash2,
	Copy,
	Play,
	Pause,
	AlertTriangle,
	Info,
	CheckCircle,
	XCircle,
	Clock,
	Users,
} from "lucide-react";
import { useState } from "react";

interface Alert {
	id: string;
	name: string;
	description: string;
	type: "revenue" | "performance" | "error" | "custom";
	severity: "low" | "medium" | "high" | "critical";
	status: "active" | "inactive" | "triggered";
	enabled: boolean;
	lastTriggered?: string;
	triggerCount: number;
	recipients: number;
	createdAt: string;
}

const mockAlerts: Alert[] = [
	{
		id: "1",
		name: "Revenue Drop Alert",
		description: "Alert when daily revenue drops below $10,000",
		type: "revenue",
		severity: "high",
		status: "active",
		enabled: true,
		lastTriggered: "2 hours ago",
		triggerCount: 5,
		recipients: 3,
		createdAt: "2024-01-15",
	},
	{
		id: "2",
		name: "High Error Rate",
		description: "Alert when error rate exceeds 5%",
		type: "error",
		severity: "critical",
		status: "triggered",
		enabled: true,
		lastTriggered: "30 minutes ago",
		triggerCount: 2,
		recipients: 5,
		createdAt: "2024-01-10",
	},
	{
		id: "3",
		name: "Performance Degradation",
		description: "Alert when response time exceeds 3 seconds",
		type: "performance",
		severity: "medium",
		status: "active",
		enabled: false,
		triggerCount: 0,
		recipients: 2,
		createdAt: "2024-01-12",
	},
];

export function AlertsList() {
	const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
	const [viewMode, setViewMode] = useState<"table" | "cards">("table");

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800 border-green-200";
			case "inactive":
				return "bg-gray-100 text-gray-800 border-gray-200";
			case "triggered":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

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

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "revenue":
				return <span className="text-green-500">$</span>;
			case "performance":
				return <span className="text-blue-500">⚡</span>;
			case "error":
				return <AlertTriangle className="h-4 w-4 text-red-500" />;
			default:
				return <Bell className="h-4 w-4 text-gray-500" />;
		}
	};

	const toggleAlert = (alertId: string) => {
		setAlerts(prev =>
			prev.map(alert =>
				alert.id === alertId
					? { ...alert, enabled: !alert.enabled }
					: alert
			)
		);
	};

	if (viewMode === "cards") {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{alerts.map((alert) => (
					<Card key={alert.id} className="hover:shadow-md transition-shadow">
						<CardContent className="p-4">
							<div className="space-y-3">
								<div className="flex items-start justify-between">
									<div className="flex items-center space-x-2">
										{getTypeIcon(alert.type)}
										<h3 className="font-medium text-sm">{alert.name}</h3>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem>
												<Edit className="h-4 w-4 mr-2" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem>
												<Copy className="h-4 w-4 mr-2" />
												Duplicate
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem className="text-red-600">
												<Trash2 className="h-4 w-4 mr-2" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								<p className="text-sm text-muted-foreground line-clamp-2">
									{alert.description}
								</p>

								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<Badge variant="outline" className={`text-xs ${getStatusColor(alert.status)}`}>
											{alert.status}
										</Badge>
										<Badge variant="outline" className={`text-xs ${getSeverityColor(alert.severity)}`}>
											{alert.severity}
										</Badge>
									</div>
									<Switch
										checked={alert.enabled}
										onCheckedChange={() => toggleAlert(alert.id)}
									/>
								</div>

								<div className="flex items-center justify-between text-xs text-muted-foreground">
									<span>{alert.triggerCount} triggers</span>
									<span>{alert.recipients} recipients</span>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<Card>
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Alert</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Severity</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Triggers</TableHead>
							<TableHead>Recipients</TableHead>
							<TableHead>Last Triggered</TableHead>
							<TableHead>Enabled</TableHead>
							<TableHead className="w-12"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{alerts.map((alert) => (
							<TableRow key={alert.id}>
								<TableCell>
									<div>
										<p className="font-medium">{alert.name}</p>
										<p className="text-sm text-muted-foreground">
											{alert.description}
										</p>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex items-center space-x-2">
										{getTypeIcon(alert.type)}
										<span className="capitalize">{alert.type}</span>
									</div>
								</TableCell>
								<TableCell>
									<Badge variant="outline" className={getSeverityColor(alert.severity)}>
										{alert.severity}
									</Badge>
								</TableCell>
								<TableCell>
									<Badge variant="outline" className={getStatusColor(alert.status)}>
										{alert.status}
									</Badge>
								</TableCell>
								<TableCell>{alert.triggerCount}</TableCell>
								<TableCell>
									<div className="flex items-center space-x-1">
										<Users className="h-4 w-4 text-muted-foreground" />
										<span>{alert.recipients}</span>
									</div>
								</TableCell>
								<TableCell className="text-sm text-muted-foreground">
									{alert.lastTriggered || "Never"}
								</TableCell>
								<TableCell>
									<Switch
										checked={alert.enabled}
										onCheckedChange={() => toggleAlert(alert.id)}
									/>
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
												<Edit className="h-4 w-4 mr-2" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem>
												<Copy className="h-4 w-4 mr-2" />
												Duplicate
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem className="text-red-600">
												<Trash2 className="h-4 w-4 mr-2" />
												Delete
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
