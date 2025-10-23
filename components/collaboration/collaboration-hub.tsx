"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
	Building2,
	Users,
	Plus,
	Settings,
	Shield,
	BarChart3,
	Calendar,
	FileText,
	MessageSquare,
	CheckCircle,
	Clock,
	AlertTriangle,
	Star,
	Activity,
	TrendingUp,
	UserPlus,
	Briefcase,
	Target,
	ArrowRight,
	MoreVertical
} from 'lucide-react';
import { WorkspaceManagementDashboard } from './workspace-management';
import { ApprovalWorkflowManager } from './approval-workflows';
import { ClientManagement } from './client-management';
import { CommentSystem } from './comment-system';
import { ChatInterface } from './chat-interface';
import { cn } from '@/lib/utils';

export function CollaborationHub() {
	const [activeTab, setActiveTab] = useState('overview');

	// Mock data for demonstration
	const overviewStats = {
		totalWorkspaces: 3,
		activeClients: 24,
		pendingApprovals: 8,
		teamMembers: 12,
		monthlyRevenue: 45600,
		avgResponseTime: 4.2,
	};

	const recentActivity = [
		{
			id: '1',
			type: 'client_added',
			title: 'New client onboarded',
			description: 'Sarah Johnson joined as a monthly client',
			user: 'John Doe',
			userAvatar: '',
			timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
			entity: 'Client Management',
		},
		{
			id: '2',
			type: 'approval_requested',
			title: 'Expense approval requested',
			description: '$2,500 office equipment purchase',
			user: 'Mike Wilson',
			userAvatar: '',
			timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
			entity: 'Approval Workflows',
		},
		{
			id: '3',
			type: 'document_shared',
			title: 'Financial report shared',
			description: 'Q3 2024 financial summary with client',
			user: 'Lisa Chen',
			userAvatar: '',
			timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
			entity: 'Document Collaboration',
		},
		{
			id: '4',
			type: 'workspace_created',
			title: 'New workspace created',
			description: 'Enterprise client workspace setup',
			user: 'David Kim',
			userAvatar: '',
			timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
			entity: 'Workspace Management',
		},
	];

	const upcomingDeadlines = [
		{
			id: '1',
			title: 'Tax filing deadline',
			client: 'Acme Corporation',
			dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
			priority: 'high',
			type: 'tax_filing',
		},
		{
			id: '2',
			title: 'Quarterly review meeting',
			client: 'TechStart Inc',
			dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
			priority: 'medium',
			type: 'meeting',
		},
		{
			id: '3',
			title: 'Invoice approval',
			client: 'Global Services Ltd',
			dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
			priority: 'medium',
			type: 'approval',
		},
	];

	const getActivityIcon = (type: string) => {
		switch (type) {
			case 'client_added':
				return <UserPlus className="h-4 w-4 text-green-600" />;
			case 'approval_requested':
				return <CheckCircle className="h-4 w-4 text-blue-600" />;
			case 'document_shared':
				return <FileText className="h-4 w-4 text-purple-600" />;
			case 'workspace_created':
				return <Building2 className="h-4 w-4 text-orange-600" />;
			default:
				return <Activity className="h-4 w-4 text-gray-600" />;
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'high':
				return 'bg-red-100 text-red-800';
			case 'medium':
				return 'bg-yellow-100 text-yellow-800';
			case 'low':
				return 'bg-green-100 text-green-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getDeadlineColor = (dueDate: Date) => {
		const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
		if (daysUntilDue <= 1) return 'text-red-600';
		if (daysUntilDue <= 3) return 'text-orange-600';
		return 'text-green-600';
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Collaboration Hub</h1>
					<p className="text-muted-foreground">
						Manage workspaces, clients, approvals, and team collaboration
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Settings className="mr-2 h-4 w-4" />
						Settings
					</Button>
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						New Workspace
					</Button>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Building2 className="h-4 w-4 text-blue-600" />
							<div>
								<p className="text-sm text-muted-foreground">Workspaces</p>
								<p className="text-xl font-bold">{overviewStats.totalWorkspaces}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-green-600" />
							<div>
								<p className="text-sm text-muted-foreground">Active Clients</p>
								<p className="text-xl font-bold">{overviewStats.activeClients}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<CheckCircle className="h-4 w-4 text-purple-600" />
							<div>
								<p className="text-sm text-muted-foreground">Pending Approvals</p>
								<p className="text-xl font-bold">{overviewStats.pendingApprovals}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<BarChart3 className="h-4 w-4 text-orange-600" />
							<div>
								<p className="text-sm text-muted-foreground">Monthly Revenue</p>
								<p className="text-xl font-bold">${overviewStats.monthlyRevenue.toLocaleString()}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="workspaces">Workspaces</TabsTrigger>
					<TabsTrigger value="clients">Clients</TabsTrigger>
					<TabsTrigger value="approvals">Approvals</TabsTrigger>
					<TabsTrigger value="chat">Chat</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Recent Activity */}
						<div className="lg:col-span-2">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center">
										<Activity className="mr-2 h-5 w-5" />
										Recent Activity
									</CardTitle>
									<CardDescription>
										Latest updates from your workspaces
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{recentActivity.map((activity) => (
											<div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
												<div className="flex-shrink-0">
													{getActivityIcon(activity.type)}
												</div>
												<div className="flex-1 min-w-0">
													<p className="font-medium text-sm">{activity.title}</p>
													<p className="text-sm text-muted-foreground mb-1">
														{activity.description}
													</p>
													<div className="flex items-center gap-2 text-xs text-muted-foreground">
														<span>by {activity.user}</span>
														<span>•</span>
														<span>{activity.timestamp.toLocaleTimeString()}</span>
														<Badge variant="outline" className="text-xs">
															{activity.entity}
														</Badge>
													</div>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Sidebar */}
						<div className="space-y-4">
							{/* Upcoming Deadlines */}
							<Card>
								<CardHeader>
									<CardTitle className="text-sm">Upcoming Deadlines</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{upcomingDeadlines.map((deadline) => (
											<div key={deadline.id} className="flex items-center gap-3">
												<div className={cn(
													"w-2 h-2 rounded-full",
													deadline.priority === 'high' ? 'bg-red-500' :
													deadline.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
												)}></div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">{deadline.title}</p>
													<p className="text-xs text-muted-foreground truncate">{deadline.client}</p>
													<p className={cn(
														"text-xs",
														getDeadlineColor(deadline.dueDate)
													)}>
														{deadline.dueDate.toLocaleDateString()}
													</p>
												</div>
											<Badge className={getPriorityColor(deadline.priority)}>
												{deadline.priority}
											</Badge>
										</div>
									))}
									</div>
								</CardContent>
							</Card>

							{/* Team Performance */}
							<Card>
								<CardHeader>
									<CardTitle className="text-sm">Team Performance</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<span className="text-sm">Response Time</span>
											<span className="text-sm font-medium">{overviewStats.avgResponseTime}h</span>
										</div>
										<Progress value={85} className="h-2" />

										<div className="flex items-center justify-between">
											<span className="text-sm">Client Satisfaction</span>
											<span className="text-sm font-medium">4.8/5</span>
										</div>
										<Progress value={96} className="h-2" />

										<div className="flex items-center justify-between">
											<span className="text-sm">Task Completion</span>
											<span className="text-sm font-medium">92%</span>
										</div>
										<Progress value={92} className="h-2" />
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</TabsContent>

				{/* Workspaces Tab */}
				<TabsContent value="workspaces">
					<WorkspaceManagementDashboard />
				</TabsContent>

				{/* Clients Tab */}
				<TabsContent value="clients">
					<ClientManagement workspaceId="workspace-1" />
				</TabsContent>

				{/* Approvals Tab */}
				<TabsContent value="approvals">
					<ApprovalWorkflowManager workspaceId="workspace-1" />
				</TabsContent>

				{/* Chat Tab */}
				<TabsContent value="chat">
					<ChatInterface />
				</TabsContent>
			</Tabs>
		</div>
	);
}
