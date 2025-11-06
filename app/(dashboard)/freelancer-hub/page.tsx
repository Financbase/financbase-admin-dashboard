/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
	Users, 
	Briefcase, 
	CheckCircle, 
	DollarSign, 
	TrendingUp, 
	Clock,
	Play,
	Pause,
	Square,
	Plus,
	Search,
	Loader2,
	Calendar,
	Target,
	Timer
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface Project {
	id: string;
	userId: string;
	clientId?: string;
	name: string;
	description?: string;
	status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
	priority: 'low' | 'medium' | 'high' | 'urgent';
	startDate?: string;
	dueDate?: string;
	budget?: string;
	hourlyRate?: string;
	currency: string;
	isBillable: boolean;
	allowOvertime: boolean;
	requireApproval: boolean;
	progress: string;
	estimatedHours?: string;
	actualHours: string;
	createdAt: string;
	updatedAt: string;
}

interface TimeEntry {
	id: string;
	userId: string;
	projectId: string;
	description: string;
	startTime: string;
	endTime?: string;
	duration?: string;
	status: 'draft' | 'running' | 'paused' | 'completed' | 'approved' | 'billed';
	isBillable: boolean;
	hourlyRate?: string;
	totalAmount?: string;
	currency: string;
	requiresApproval: boolean;
	isApproved: boolean;
	isBilled: boolean;
	createdAt: string;
	updatedAt: string;
}

interface ProjectStats {
	totalProjects: number;
	activeProjects: number;
	completedProjects: number;
	totalHours: number;
	totalBillableHours: number;
	totalRevenue: number;
	averageProjectDuration: number;
	projectsByStatus: Array<{
		status: string;
		count: number;
	}>;
	recentActivity: Array<{
		id: string;
		type: 'project' | 'time_entry' | 'task';
		description: string;
		createdAt: string;
	}>;
}

interface TimeTrackingStats {
	totalHours: number;
	billableHours: number;
	nonBillableHours: number;
	totalRevenue: number;
	averageHourlyRate: number;
	hoursByProject: Array<{
		projectId: string;
		projectName: string;
		hours: number;
		revenue: number;
	}>;
	weeklyHours: Array<{
		week: string;
		hours: number;
		billableHours: number;
	}>;
}

export default function FreelancerHubPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [isTracking, setIsTracking] = useState(false);

	// Fetch projects data
	const { data: projectsData, isLoading: projectsLoading, error: projectsError } = useQuery({
		queryKey: ['projects', searchQuery],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (searchQuery) params.append('search', searchQuery);

			const response = await fetch(`/api/projects?${params.toString()}`);
			if (!response.ok) throw new Error('Failed to fetch projects');
			return response.json();
		},
	});

	// Fetch time entries data
	const { data: timeEntriesData, isLoading: timeEntriesLoading } = useQuery({
		queryKey: ['time-entries'],
		queryFn: async () => {
			const response = await fetch('/api/time-entries');
			if (!response.ok) throw new Error('Failed to fetch time entries');
			return response.json();
		},
	});

	// Fetch project stats
	const { data: projectStatsData, isLoading: projectStatsLoading } = useQuery({
		queryKey: ['project-stats'],
		queryFn: async () => {
			const response = await fetch('/api/projects/stats');
			if (!response.ok) throw new Error('Failed to fetch project stats');
			return response.json();
		},
	});

	// Fetch time tracking stats
	const { data: timeStatsData, isLoading: timeStatsLoading } = useQuery({
		queryKey: ['time-tracking-stats'],
		queryFn: async () => {
			const response = await fetch('/api/time-entries/stats');
			if (!response.ok) throw new Error('Failed to fetch time tracking stats');
			return response.json();
		},
	});

	const projects: Project[] = projectsData?.projects || [];
	const timeEntries: TimeEntry[] = timeEntriesData?.timeEntries || [];
	const projectStats: ProjectStats = projectStatsData?.stats || {
		totalProjects: 0,
		activeProjects: 0,
		completedProjects: 0,
		totalHours: 0,
		totalBillableHours: 0,
		totalRevenue: 0,
		averageProjectDuration: 0,
		projectsByStatus: [],
		recentActivity: [],
	};

	const timeStats: TimeTrackingStats = timeStatsData?.stats || {
		totalHours: 0,
		billableHours: 0,
		nonBillableHours: 0,
		totalRevenue: 0,
		averageHourlyRate: 0,
		hoursByProject: [],
		weeklyHours: [],
	};

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case 'active':
			case 'completed':
				return 'default';
			case 'planning':
				return 'secondary';
			case 'on_hold':
				return 'outline';
			case 'cancelled':
				return 'destructive';
			default:
				return 'secondary';
		}
	};

	const getPriorityBadgeVariant = (priority: string) => {
		switch (priority) {
			case 'urgent':
				return 'destructive';
			case 'high':
				return 'default';
			case 'medium':
				return 'secondary';
			case 'low':
				return 'outline';
			default:
				return 'secondary';
		}
	};

	const getTimeEntryStatusIcon = (status: string) => {
		switch (status) {
			case 'running':
				return <Play className="h-4 w-4 text-green-600" />;
			case 'paused':
				return <Pause className="h-4 w-4 text-yellow-600" />;
			case 'completed':
				return <CheckCircle className="h-4 w-4 text-blue-600" />;
			default:
				return <Clock className="h-4 w-4 text-gray-600" />;
		}
	};

	if (projectsLoading || timeEntriesLoading || projectStatsLoading || timeStatsLoading) {
		return (
			<div className="space-y-8 p-8">
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}

	if (projectsError) {
		return (
			<div className="space-y-8 p-8">
				<div className="text-center text-red-600">
					Error loading projects: {projectsError.message}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Freelance Hub</h1>
					<p className="text-muted-foreground">
						Manage your projects, track time, and monitor your freelance business
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline">
						<Plus className="mr-2 h-4 w-4" />
						New Project
					</Button>
					<Button>
						<Play className="mr-2 h-4 w-4" />
						Start Timer
					</Button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Active Projects</h3>
						<Briefcase className="h-5 w-5 text-blue-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{projectStats.activeProjects}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{projectStats.totalProjects} total projects
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Total Hours</h3>
						<Clock className="h-5 w-5 text-green-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{timeStats.totalHours.toFixed(1)}h</div>
						<p className="text-xs text-muted-foreground mt-1">
							{timeStats.billableHours.toFixed(1)}h billable
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
						<DollarSign className="h-5 w-5 text-green-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">${timeStats.totalRevenue.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">
							${timeStats.averageHourlyRate.toFixed(0)}/hr average
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
						<CheckCircle className="h-5 w-5 text-green-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{projectStats.completedProjects}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Projects delivered
						</p>
					</div>
				</div>
			</div>

			{/* Time Tracking Section */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Current Time Entry */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Current Time Entry</h3>
						<p className="text-sm text-muted-foreground">Track your work in real-time</p>
					</div>
					<div className="p-6">
						{timeEntries.find(entry => entry.status === 'running') ? (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Working on: {timeEntries.find(entry => entry.status === 'running')?.description}</p>
										<p className="text-sm text-muted-foreground">
											Started: {new Date(timeEntries.find(entry => entry.status === 'running')?.startTime || '').toLocaleTimeString()}
										</p>
									</div>
									<div className="flex items-center gap-2">
										<Button variant="outline" size="sm">
											<Pause className="h-4 w-4" />
										</Button>
										<Button variant="destructive" size="sm">
											<Square className="h-4 w-4" />
										</Button>
									</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-bold">2:34:15</div>
									<p className="text-sm text-muted-foreground">Elapsed time</p>
								</div>
							</div>
						) : (
							<div className="text-center py-8">
								<Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<p className="text-muted-foreground mb-4">No active time tracking</p>
								<Button>
									<Play className="mr-2 h-4 w-4" />
									Start Timer
								</Button>
							</div>
						)}
					</div>
				</div>

				{/* Recent Time Entries */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Recent Time Entries</h3>
						<p className="text-sm text-muted-foreground">Your latest work sessions</p>
					</div>
					<div className="p-6 space-y-3">
						{timeEntries.slice(0, 5).map((entry) => (
							<div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border">
								<div className="flex items-center gap-3">
									{getTimeEntryStatusIcon(entry.status)}
									<div>
										<p className="font-medium text-sm">{entry.description}</p>
										<p className="text-xs text-muted-foreground">
											{new Date(entry.startTime).toLocaleDateString()}
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-sm font-semibold">
										{entry.duration ? `${Number(entry.duration).toFixed(1)}h` : 'Running'}
									</p>
									{entry.totalAmount && (
										<p className="text-xs text-muted-foreground">
											${Number(entry.totalAmount).toFixed(2)}
										</p>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Projects Section */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">Projects</h3>
							<p className="text-sm text-muted-foreground">Manage your freelance projects</p>
						</div>
						<div className="flex items-center gap-2">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search projects..."
									className="pl-10 w-64"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								New Project
							</Button>
						</div>
					</div>
				</div>
				<div className="p-6">
					{projects.length === 0 ? (
						<div className="text-center py-8">
							<Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground mb-4">No projects found. Create your first project to get started.</p>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Create Project
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							{projects.map((project) => (
								<div key={project.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
									<div className="flex items-center gap-4">
										<div className="flex items-center gap-2">
											<Badge variant={getStatusBadgeVariant(project.status)}>
												{project.status.replace('_', ' ')}
											</Badge>
											<Badge variant={getPriorityBadgeVariant(project.priority)}>
												{project.priority}
											</Badge>
										</div>
										<div>
											<p className="font-medium">{project.name}</p>
											<p className="text-sm text-muted-foreground">{project.description}</p>
											<div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
												<span>Progress: {Number(project.progress).toFixed(0)}%</span>
												<span>Hours: {Number(project.actualHours).toFixed(1)}/{project.estimatedHours || '∞'}</span>
												{project.hourlyRate && (
													<span>Rate: ${Number(project.hourlyRate).toFixed(0)}/hr</span>
												)}
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => toast.info('Viewing project details')}
										>
											View
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => toast.info('Editing project information')}
										>
											Edit
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Performance Overview */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Hours by Project */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Hours by Project</h3>
						<p className="text-sm text-muted-foreground">Time distribution across projects</p>
					</div>
					<div className="p-6 space-y-4">
						{timeStats.hoursByProject.length === 0 ? (
							<div className="text-center text-muted-foreground py-4">
								No time tracking data available
							</div>
						) : (
							timeStats.hoursByProject.slice(0, 5).map((project, index) => {
								const colors = ["bg-blue-600", "bg-green-600", "bg-purple-600", "bg-orange-600", "bg-red-600"];
								const percentage = timeStats.totalHours > 0 ? (project.hours / timeStats.totalHours) * 100 : 0;
								
								return (
									<div key={project.projectId}>
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm font-medium">{project.projectName}</span>
											<span className="text-sm text-muted-foreground">
												{project.hours.toFixed(1)}h ({percentage.toFixed(0)}%)
											</span>
										</div>
										<div className="h-2 bg-muted rounded-full overflow-hidden">
											<div 
												className={`h-full ${colors[index % colors.length]} rounded-full`}
												style={{ width: `${percentage}%` }}
											></div>
										</div>
										<p className="text-xs text-muted-foreground mt-1">${project.revenue.toFixed(2)} earned</p>
									</div>
								);
							})
						)}
					</div>
				</div>

				{/* Weekly Hours */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Weekly Hours</h3>
						<p className="text-sm text-muted-foreground">Hours tracked by week</p>
					</div>
					<div className="p-6 space-y-3">
						{timeStats.weeklyHours.length === 0 ? (
							<div className="text-center text-muted-foreground py-4">
								No weekly data available
							</div>
						) : (
							timeStats.weeklyHours.slice(-4).map((week) => (
								<div key={week.week} className="flex items-center justify-between">
									<span className="text-sm">Week {week.week}</span>
									<div className="flex items-center gap-4">
										<span className="text-sm text-muted-foreground">
											{week.billableHours.toFixed(1)}h billable
										</span>
										<span className="text-sm font-semibold">
											{week.hours.toFixed(1)}h total
										</span>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}