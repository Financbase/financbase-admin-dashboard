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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
	Plus,
	Search,
	Filter,
	Download,
	Settings,
	Bell,
	BarChart3,
	TrendingUp,
	AlertTriangle
} from "lucide-react";
import { useState } from "react";

export function AlertsHeader() {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [typeFilter, setTypeFilter] = useState("all");

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Analytics Alerts</h1>
					<p className="text-muted-foreground mt-2">
						Monitor your business metrics and get notified of important changes
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<Button variant="outline" size="sm">
						<Settings className="h-4 w-4 mr-2" />
						Settings
					</Button>
					<Button variant="outline" size="sm">
						<Download className="h-4 w-4 mr-2" />
						Export
					</Button>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Create Alert
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Bell className="h-5 w-5 text-blue-500" />
							<div>
								<p className="text-sm text-muted-foreground">Active Alerts</p>
								<p className="text-2xl font-bold">12</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<AlertTriangle className="h-5 w-5 text-orange-500" />
							<div>
								<p className="text-sm text-muted-foreground">Triggered Today</p>
								<p className="text-2xl font-bold">3</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<TrendingUp className="h-5 w-5 text-green-500" />
							<div>
								<p className="text-sm text-muted-foreground">Success Rate</p>
								<p className="text-2xl font-bold">94%</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<BarChart3 className="h-5 w-5 text-purple-500" />
							<div>
								<p className="text-sm text-muted-foreground">Avg Response</p>
								<p className="text-2xl font-bold">2.3s</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export function AlertsFilters() {
	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex flex-col md:flex-row gap-4 items-center">
					<div className="flex-1">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search alerts..."
								className="pl-10"
							/>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<Select defaultValue="all">
							<SelectTrigger className="w-32">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="inactive">Inactive</SelectItem>
								<SelectItem value="triggered">Triggered</SelectItem>
							</SelectContent>
						</Select>

						<Select defaultValue="all">
							<SelectTrigger className="w-32">
								<SelectValue placeholder="Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value="revenue">Revenue</SelectItem>
								<SelectItem value="performance">Performance</SelectItem>
								<SelectItem value="error">Error</SelectItem>
								<SelectItem value="custom">Custom</SelectItem>
							</SelectContent>
						</Select>

						<Button variant="outline" size="sm">
							<Filter className="h-4 w-4 mr-2" />
							More Filters
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
