/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts";
import {
	Bell,
	AlertTriangle,
	TrendingUp,
	TrendingDown,
	CheckCircle,
	Clock,
	Users,
	Zap,
} from "lucide-react";

const alertsData = [
	{ name: "Mon", triggered: 4, acknowledged: 3, falsePositives: 1 },
	{ name: "Tue", triggered: 6, acknowledged: 5, falsePositives: 1 },
	{ name: "Wed", triggered: 2, acknowledged: 2, falsePositives: 0 },
	{ name: "Thu", triggered: 8, acknowledged: 6, falsePositives: 2 },
	{ name: "Fri", triggered: 5, acknowledged: 4, falsePositives: 1 },
	{ name: "Sat", triggered: 1, acknowledged: 1, falsePositives: 0 },
	{ name: "Sun", triggered: 3, acknowledged: 2, falsePositives: 1 },
];

const alertTypesData = [
	{ name: "Revenue", value: 35, color: "#22c55e" },
	{ name: "Performance", value: 28, color: "#3b82f6" },
	{ name: "Error", value: 22, color: "#ef4444" },
	{ name: "Custom", value: 15, color: "#8b5cf6" },
];

const severityData = [
	{ name: "Critical", value: 12, color: "#dc2626" },
	{ name: "High", value: 28, color: "#ea580c" },
	{ name: "Medium", value: 45, color: "#eab308" },
	{ name: "Low", value: 15, color: "#22c55e" },
];

export function AlertsStats() {
	return (
		<div className="space-y-6">
			{/* Overview Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Bell className="h-5 w-5 text-blue-500" />
							<div>
								<p className="text-sm text-muted-foreground">Total Alerts</p>
								<p className="text-2xl font-bold">127</p>
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
								<p className="text-2xl font-bold">23</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<CheckCircle className="h-5 w-5 text-green-500" />
							<div>
								<p className="text-sm text-muted-foreground">Acknowledged</p>
								<p className="text-2xl font-bold">89%</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Clock className="h-5 w-5 text-purple-500" />
							<div>
								<p className="text-sm text-muted-foreground">Avg Response</p>
								<p className="text-2xl font-bold">2.3m</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Daily Trends */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5" />
							Daily Alert Trends
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={alertsData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="triggered" fill="#3b82f6" name="Triggered" />
								<Bar dataKey="acknowledged" fill="#22c55e" name="Acknowledged" />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Alert Types Distribution */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Zap className="h-5 w-5" />
							Alert Types
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie
									data={alertTypesData}
									cx="50%"
									cy="50%"
									labelLine={false}
									label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
								>
									{alertTypesData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			{/* Severity and Performance */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Severity Distribution */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							Severity Distribution
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{severityData.map((item) => (
							<div key={item.name} className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<div
											className="w-3 h-3 rounded-full"
											style={{ backgroundColor: item.color }}
										/>
										<span className="text-sm font-medium">{item.name}</span>
									</div>
									<span className="text-sm text-muted-foreground">{item.value}%</span>
								</div>
								<Progress value={item.value} className="h-2" />
							</div>
						))}
					</CardContent>
				</Card>

				{/* Performance Metrics */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BarChart className="h-5 w-5" />
							Performance Metrics
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm">Response Rate</span>
								<span className="text-sm font-medium">94.2%</span>
							</div>
							<Progress value={94.2} className="h-2" />
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm">False Positive Rate</span>
								<span className="text-sm font-medium">5.8%</span>
							</div>
							<Progress value={5.8} className="h-2" />
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm">Avg Resolution Time</span>
								<span className="text-sm font-medium">12.3 min</span>
							</div>
							<Progress value={75} className="h-2" />
						</div>

						<div className="pt-4 border-t">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Overall Score</span>
								<Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
									Excellent
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
