/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Plus,
	Play,
	Pause,
	Square as StopIcon,
	Clock,
	Calendar,
	User,
	Building,
	DollarSign,
	TrendingUp,
	CheckCircle,
	AlertCircle,
	MoreHorizontal,
	Edit,
	Trash2,
	Eye,
	Download,
	Filter,
	Search,
	Timer,
	BarChart3,
	Target,
	Loader2,
} from "lucide-react";
import {
	useTimeEntries,
	useTimeTrackingStats,
	useStartTimeTracking,
	useStopTimeTracking,
	useApproveTimeEntry,
	useDeleteTimeEntry,
	type TimeEntry,
} from "@/hooks/hr/use-time-tracking";
import { TimeEntryForm } from "@/components/hr/time-entry-form";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";

export default function TimeTrackingPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("");
	const [employeeFilter, setEmployeeFilter] = useState<string>("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedEntry, setSelectedEntry] = useState<TimeEntry | undefined>();
	const queryClient = useQueryClient();
	const { user } = useUser();
	const approveMutation = useApproveTimeEntry();
	const deleteMutation = useDeleteTimeEntry();
	const startMutation = useStartTimeTracking();
	const stopMutation = useStopTimeTracking();

	const { data: timeEntries = [], isLoading, error } = useTimeEntries({
		status: statusFilter || undefined,
		employeeId: employeeFilter || undefined,
	});

	const { data: stats } = useTimeTrackingStats();

	const getStatusColor = (status: string) => {
		switch (status) {
			case "approved":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "pending":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "rejected":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			case "running":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
			case "completed":
				return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
		}
	};

	const timeStats = {
		totalHours: stats?.totalHours || 0,
		billableHours: stats?.billableHours || 0,
		nonBillableHours: stats?.nonBillableHours || 0,
		totalCost: stats?.totalCost || 0,
		pendingApproval: timeEntries.filter((e) => e.status === "draft" && e.requiresApproval).length,
		approved: timeEntries.filter((e) => e.isApproved).length,
	};

	// Group time entries by project
	const projectStats = timeEntries.reduce((acc, entry) => {
		const projectId = entry.projectId || "unknown";
		if (!acc[projectId]) {
			acc[projectId] = {
				id: projectId,
				name: projectId,
				totalHours: 0,
				billableHours: 0,
				entries: [],
			};
		}
		const hours = parseFloat(entry.duration || "0");
		acc[projectId].totalHours += hours;
		if (entry.isBillable) {
			acc[projectId].billableHours += hours;
		}
		acc[projectId].entries.push(entry);
		return acc;
	}, {} as Record<string, { id: string; name: string; totalHours: number; billableHours: number; entries: TimeEntry[] }>);

	const projects = Object.values(projectStats);

	const handleApprove = async (id: string) => {
		await approveMutation.mutateAsync(id);
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this time entry?")) {
			await deleteMutation.mutateAsync(id);
		}
	};

	const handleEdit = (entry: TimeEntry) => {
		setSelectedEntry(entry);
		setIsFormOpen(true);
	};

	const handleAdd = () => {
		setSelectedEntry(undefined);
		setIsFormOpen(true);
	};

	const handleFormSuccess = () => {
		queryClient.invalidateQueries({ queryKey: ["time-entries"] });
		queryClient.invalidateQueries({ queryKey: ["time-tracking-stats"] });
	};

	if (error) {
		return (
			<div className="p-8">
				<div className="text-center text-red-600">
					Error loading time entries: {error.message}
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Time Tracking</h1>
					<p className="text-gray-600 dark:text-gray-300 mt-2">
						Track time, manage projects, and monitor productivity
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm">
						<Download className="h-4 w-4 mr-2" />
						Export Timesheets
					</Button>
					<Button className="flex items-center gap-2" onClick={handleAdd}>
						<Plus className="h-4 w-4" />
						Log Time
					</Button>
				</div>
			</div>

			{/* Time Tracking Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Hours</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : (
								`${timeStats.totalHours.toFixed(1)}h`
							)}
						</div>
						<p className="text-xs text-green-600 flex items-center">
							<TrendingUp className="h-3 w-3 mr-1" />
							+12% from last week
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : (
								`${timeStats.billableHours.toFixed(1)}h`
							)}
						</div>
						<p className="text-xs text-green-600">
							{timeStats.totalHours > 0
								? ((timeStats.billableHours / timeStats.totalHours) * 100).toFixed(1)
								: 0}
							% utilization
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Cost</CardTitle>
						<Building className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : (
								`$${timeStats.totalCost.toLocaleString()}`
							)}
						</div>
						<p className="text-xs text-green-600">This week</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
						<AlertCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : (
								timeStats.pendingApproval
							)}
						</div>
						<p className="text-xs text-yellow-600">Requires review</p>
					</CardContent>
				</Card>
			</div>

			{/* Time Tracking Management */}
			<Tabs defaultValue="entries" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="entries">Time Entries</TabsTrigger>
					<TabsTrigger value="projects">Projects</TabsTrigger>
					<TabsTrigger value="reports">Reports</TabsTrigger>
				</TabsList>

				{/* Time Entries Tab */}
				<TabsContent value="entries" className="mt-6">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Time Entries</CardTitle>
									<CardDescription>View and manage all time entries</CardDescription>
								</div>
								<div className="flex items-center gap-2">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
										<Input
											placeholder="Search entries..."
											className="pl-10 w-64"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</div>
									<Select value={statusFilter} onValueChange={setStatusFilter}>
										<SelectTrigger className="w-40">
											<SelectValue placeholder="All Status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="">All Status</SelectItem>
											<SelectItem value="draft">Draft</SelectItem>
											<SelectItem value="running">Running</SelectItem>
											<SelectItem value="completed">Completed</SelectItem>
											<SelectItem value="approved">Approved</SelectItem>
										</SelectContent>
									</Select>
									<Button variant="outline" size="sm">
										<Filter className="h-4 w-4 mr-2" />
										More Filters
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex items-center justify-center py-12">
									<Loader2 className="h-8 w-8 animate-spin" />
								</div>
							) : timeEntries.length === 0 ? (
								<div className="text-center py-12">
									<Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
										No time entries found
									</h3>
									<p className="text-slate-600 dark:text-slate-300 mb-4">
										Get started by logging your first time entry
									</p>
									<Button onClick={handleAdd}>
										<Plus className="h-4 w-4 mr-2" />
										Log Time Entry
									</Button>
								</div>
							) : (
								<div className="space-y-4">
									{timeEntries.map((entry) => (
										<div
											key={entry.id}
											className="border rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
										>
											<div className="flex items-center justify-between mb-4">
												<div className="flex items-center gap-4">
													<div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
														<User className="h-6 w-6 text-blue-600 dark:text-blue-300" />
													</div>
													<div>
														<h3 className="font-semibold text-lg">{entry.description}</h3>
														<p className="text-sm text-gray-600 dark:text-gray-300">
															Project: {entry.projectId?.slice(0, 8) || "N/A"}
															{entry.taskName && ` • Task: ${entry.taskName}`}
														</p>
													</div>
													<Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
													{entry.isBillable && (
														<Badge variant="outline" className="bg-green-50 dark:bg-green-900">
															Billable
														</Badge>
													)}
												</div>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => handleEdit(entry)}>
															<Edit className="h-4 w-4 mr-2" />
															Edit Entry
														</DropdownMenuItem>
														{entry.requiresApproval && !entry.isApproved && (
															<DropdownMenuItem onClick={() => handleApprove(entry.id)}>
																<CheckCircle className="h-4 w-4 mr-2" />
																Approve
															</DropdownMenuItem>
														)}
														<DropdownMenuItem
															onClick={() => handleDelete(entry.id)}
															className="text-red-600"
														>
															<Trash2 className="h-4 w-4 mr-2" />
															Delete Entry
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>

											<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
												<div>
													<p className="text-sm text-gray-600 dark:text-gray-300">Date</p>
													<p className="font-semibold">
														{new Date(entry.startTime).toLocaleDateString()}
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600 dark:text-gray-300">Time</p>
													<p className="font-semibold">
														{new Date(entry.startTime).toLocaleTimeString()}
														{entry.endTime && ` - ${new Date(entry.endTime).toLocaleTimeString()}`}
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600 dark:text-gray-300">Duration</p>
													<p className="font-semibold">
														{parseFloat(entry.duration || "0").toFixed(1)}h
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600 dark:text-gray-300">Total Cost</p>
													<p className="font-semibold">
														${parseFloat(entry.totalAmount || "0").toLocaleString()}
													</p>
												</div>
											</div>

											<div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
												<div className="flex items-center gap-4">
													{entry.hourlyRate && (
														<span className="flex items-center gap-1">
															<DollarSign className="h-4 w-4" />
															Rate: ${entry.hourlyRate}/{entry.currency || "USD"}
														</span>
													)}
													<span className="flex items-center gap-1">
														<Calendar className="h-4 w-4" />
														{new Date(entry.startTime).toLocaleDateString()}
													</span>
												</div>
												{entry.notes && (
													<div className="text-right">
														<p className="text-sm text-gray-700 dark:text-gray-300">{entry.notes}</p>
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Projects Tab */}
				<TabsContent value="projects" className="mt-6">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Project Time Tracking</CardTitle>
									<CardDescription>Monitor time spent on different projects</CardDescription>
								</div>
								<Button className="flex items-center gap-2" onClick={handleAdd}>
									<Plus className="h-4 w-4" />
									Add Project
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{projects.length === 0 ? (
								<div className="text-center py-12">
									<Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
									<p className="text-slate-600 dark:text-slate-300">No project time tracked yet</p>
								</div>
							) : (
								<div className="space-y-4">
									{projects.map((project) => (
										<div
											key={project.id}
											className="border rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
										>
											<div className="flex items-center justify-between mb-4">
												<div className="flex items-center gap-4">
													<div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
														<Building className="h-6 w-6 text-purple-600 dark:text-purple-300" />
													</div>
													<div>
														<h3 className="font-semibold text-lg">{project.name}</h3>
														<p className="text-sm text-gray-600 dark:text-gray-300">
															{project.entries.length} time entries
														</p>
													</div>
												</div>
											</div>

											<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
												<div>
													<p className="text-sm text-gray-600 dark:text-gray-300">Total Hours</p>
													<p className="font-semibold">{project.totalHours.toFixed(1)}h</p>
												</div>
												<div>
													<p className="text-sm text-gray-600 dark:text-gray-300">Billable Hours</p>
													<p className="font-semibold">{project.billableHours.toFixed(1)}h</p>
												</div>
												<div>
													<p className="text-sm text-gray-600 dark:text-gray-300">Total Cost</p>
													<p className="font-semibold">
														$
														{project.entries
															.reduce(
																(sum, e) => sum + parseFloat(e.totalAmount || "0"),
																0
															)
															.toLocaleString()}
													</p>
												</div>
												<div>
													<p className="text-sm text-gray-600 dark:text-gray-300">Utilization</p>
													<p className="font-semibold">
														{project.totalHours > 0
															? ((project.billableHours / project.totalHours) * 100).toFixed(1)
															: 0}
														%
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Reports Tab */}
				<TabsContent value="reports" className="mt-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Time Summary</CardTitle>
								<CardDescription>Weekly time tracking summary</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Billable Hours</span>
										<Badge variant="secondary">{timeStats.billableHours.toFixed(1)}h</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Non-billable Hours</span>
										<Badge variant="secondary">{timeStats.nonBillableHours.toFixed(1)}h</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Total Cost</span>
										<Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
											${timeStats.totalCost.toLocaleString()}
										</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Utilization Rate</span>
										<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
											{timeStats.totalHours > 0
												? ((timeStats.billableHours / timeStats.totalHours) * 100).toFixed(1)
												: 0}
											%
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Top Time Trackers</CardTitle>
								<CardDescription>Employees with most logged hours</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{timeEntries
										.slice(0, 5)
										.map((entry, index) => (
											<div key={entry.id} className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-semibold">
														{index + 1}
													</div>
													<div>
														<p className="font-medium">{entry.description}</p>
														<p className="text-sm text-gray-600 dark:text-gray-300">
															{entry.projectId?.slice(0, 8) || "N/A"}
														</p>
													</div>
												</div>
												<Badge variant="secondary">
													{parseFloat(entry.duration || "0").toFixed(1)}h
												</Badge>
											</div>
										))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>

			<TimeEntryForm
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				timeEntry={selectedEntry}
				onSuccess={handleFormSuccess}
			/>
		</div>
	);
}
