/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
	MoreVertical,
	Search,
	Filter,
	Clock,
	CheckCircle,
	AlertTriangle,
	Star
} from 'lucide-react';
import { Workspace, WorkspaceMember, Client, PracticeMetrics } from '@/types/auth';
import { workspaceService } from '@/lib/services/workspace-service';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function WorkspaceManagementDashboard() {
	const { user } = useUser();
	const { toast } = useToast();
	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
	const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
	const [clients, setClients] = useState<Client[]>([]);
	const [practiceMetrics, setPracticeMetrics] = useState<PracticeMetrics | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('overview');

	// Modal states
	const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
	const [showInviteMember, setShowInviteMember] = useState(false);
	const [showAddClient, setShowAddClient] = useState(false);

	// Form states
	const [newWorkspace, setNewWorkspace] = useState({
		name: '',
		description: '',
		type: 'accounting_firm' as Workspace['type'],
	});

	const [newMember, setNewMember] = useState({
		email: '',
		role: 'accountant' as WorkspaceMember['role'],
	});

	const [newClient, setNewClient] = useState({
		name: '',
		email: '',
		company: '',
		engagementType: 'monthly' as Client['engagementType'],
	});

	useEffect(() => {
		loadWorkspaces();
	}, []);

	const loadWorkspaces = async () => {
		try {
			setLoading(true);
			const userWorkspaces = await workspaceService.getWorkspaces();
			setWorkspaces(userWorkspaces);

			if (userWorkspaces.length > 0) {
				setSelectedWorkspace(userWorkspaces[0]);
				await loadWorkspaceDetails(userWorkspaces[0].id);
			}
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to load workspaces',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	const loadWorkspaceDetails = async (workspaceId: string) => {
		try {
			const [members, workspaceClients, metrics] = await Promise.all([
				workspaceService.getWorkspaceMembers(workspaceId),
				workspaceService.getClients(workspaceId),
				workspaceService.getPracticeMetrics(workspaceId),
			]);

			setWorkspaceMembers(members);
			setClients(workspaceClients);
			setPracticeMetrics(metrics);
		} catch (error) {
			console.error('Error loading workspace details:', error);
		}
	};

	const handleCreateWorkspace = async () => {
		if (!user?.id) {
			toast({
				title: 'Error',
				description: 'User not authenticated',
				variant: 'destructive',
			});
			return;
		}

		// Get organizationId from user metadata
		const metadata = user.publicMetadata as { organizationId?: string };
		const organizationId = metadata?.organizationId || user.organizationMemberships?.[0]?.organization?.id;

		if (!organizationId) {
			toast({
				title: 'Error',
				description: 'Organization ID not found. Please ensure you are part of an organization.',
				variant: 'destructive',
			});
			return;
		}

		try {
			const workspace = await workspaceService.createWorkspace({
				...newWorkspace,
				organizationId,
				ownerId: user.id,
				members: [],
				settings: {
					allowClientInvites: true,
					requireApprovalForExpenses: true,
					autoCategorizeTransactions: true,
					defaultCurrency: 'USD',
					fiscalYearStart: 1,
					timezone: 'America/New_York',
					features: {
						documentCollaboration: true,
						approvalWorkflows: true,
						clientPortal: true,
						auditTrail: true,
					},
				},
			});

			setWorkspaces(prev => [...prev, workspace]);
			setSelectedWorkspace(workspace);
			setShowCreateWorkspace(false);
			setNewWorkspace({ name: '', description: '', type: 'accounting_firm' });

			toast({
				title: 'Success',
				description: 'Workspace created successfully',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to create workspace',
				variant: 'destructive',
			});
		}
	};

	const handleInviteMember = async () => {
		if (!selectedWorkspace) return;

		if (!newMember.email) {
			toast({
				title: 'Error',
				description: 'Email is required to invite a member',
				variant: 'destructive',
			});
			return;
		}

		// Get default permissions for the role
		const { DEFAULT_ROLES } = await import('@/types/auth');
		const defaultPermissions = DEFAULT_ROLES[newMember.role] || [];

		try {
			// First, try to resolve user by email
			// The backend API endpoint should handle email-to-userId lookup
			// If user doesn't exist, it should create an invitation
			const lookupResponse = await fetch(`/api/admin/users/lookup?email=${encodeURIComponent(newMember.email)}`);
			
			let userId: string;
			if (lookupResponse.ok) {
				const userData = await lookupResponse.json();
				userId = userData.id;
			} else {
				// If user lookup fails, we'll need the backend to create an invitation
				// For now, show an error
				toast({
					title: 'Error',
					description: 'User not found. User must be registered first.',
					variant: 'destructive',
				});
				return;
			}

			await workspaceService.addWorkspaceMember(selectedWorkspace.id, {
				userId,
				role: newMember.role,
				permissions: defaultPermissions,
				isActive: true,
			});

			await loadWorkspaceDetails(selectedWorkspace.id);
			setShowInviteMember(false);
			setNewMember({ email: '', role: 'accountant' });

			toast({
				title: 'Success',
				description: 'Member invited successfully',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to invite member',
				variant: 'destructive',
			});
		}
	};

	const handleAddClient = async () => {
		if (!selectedWorkspace) return;

		try {
			await workspaceService.createClient({
				...newClient,
				workspaceId: selectedWorkspace.id,
				phone: '',
				status: 'active',
			});

			await loadWorkspaceDetails(selectedWorkspace.id);
			setShowAddClient(false);
			setNewClient({ name: '', email: '', company: '', engagementType: 'monthly' });

			toast({
				title: 'Success',
				description: 'Client added successfully',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to add client',
				variant: 'destructive',
			});
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-center">
					<Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<p className="text-muted-foreground">Loading workspaces...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Workspace Management</h2>
					<p className="text-muted-foreground">
						Manage your accounting practice and client workspaces
					</p>
				</div>
				<Button onClick={() => setShowCreateWorkspace(true)}>
					<Plus className="mr-2 h-4 w-4" />
					New Workspace
				</Button>
			</div>

			{/* Workspace Selector */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center gap-4">
						<Select
							value={selectedWorkspace?.id || ''}
							onValueChange={(workspaceId) => {
								const workspace = workspaces.find(w => w.id === workspaceId);
								if (workspace) {
									setSelectedWorkspace(workspace);
									loadWorkspaceDetails(workspaceId);
								}
							}}
						>
							<SelectTrigger className="w-64">
								<SelectValue placeholder="Select workspace" />
							</SelectTrigger>
							<SelectContent>
								{workspaces.map((workspace) => (
									<SelectItem key={workspace.id} value={workspace.id}>
										{workspace.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{selectedWorkspace && (
							<Badge variant={selectedWorkspace.type === 'accounting_firm' ? 'default' : 'secondary'}>
								{selectedWorkspace.type.replace('_', ' ')}
							</Badge>
						)}
					</div>
				</CardContent>
			</Card>

			{selectedWorkspace && (
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="members">Members</TabsTrigger>
						<TabsTrigger value="clients">Clients</TabsTrigger>
						<TabsTrigger value="settings">Settings</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent value="overview" className="space-y-6">
						{/* Practice Metrics */}
						{practiceMetrics && (
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								<Card>
									<CardContent className="p-4">
										<div className="flex items-center gap-2">
											<Users className="h-4 w-4 text-blue-600" />
											<div>
												<p className="text-sm text-muted-foreground">Total Clients</p>
												<p className="text-xl font-bold">{practiceMetrics.totalClients}</p>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardContent className="p-4">
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-green-600" />
											<div>
												<p className="text-sm text-muted-foreground">Active Clients</p>
												<p className="text-xl font-bold">{practiceMetrics.activeClients}</p>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardContent className="p-4">
										<div className="flex items-center gap-2">
											<BarChart3 className="h-4 w-4 text-purple-600" />
											<div>
												<p className="text-sm text-muted-foreground">Monthly Revenue</p>
												<p className="text-xl font-bold">${practiceMetrics.monthlyRevenue.toLocaleString()}</p>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardContent className="p-4">
										<div className="flex items-center gap-2">
											<AlertTriangle className="h-4 w-4 text-orange-600" />
											<div>
												<p className="text-sm text-muted-foreground">Pending Approvals</p>
												<p className="text-xl font-bold">{practiceMetrics.pendingApprovals}</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						)}

						{/* Quick Actions */}
						<Card>
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
								<CardDescription>
									Common tasks for managing your practice
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<Button variant="outline" onClick={() => setShowInviteMember(true)}>
										<Users className="mr-2 h-4 w-4" />
										Invite Member
									</Button>
									<Button variant="outline" onClick={() => setShowAddClient(true)}>
										<Plus className="mr-2 h-4 w-4" />
										Add Client
									</Button>
									<Button variant="outline">
										<FileText className="mr-2 h-4 w-4" />
										New Document
									</Button>
									<Button variant="outline">
										<MessageSquare className="mr-2 h-4 w-4" />
										Start Discussion
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* Recent Activity */}
						<Card>
							<CardHeader>
								<CardTitle>Recent Activity</CardTitle>
								<CardDescription>
									Latest updates from your workspace
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{/* Mock recent activity */}
									<div className="flex items-center gap-3 p-3 border rounded-lg">
										<Avatar className="w-8 h-8">
											<AvatarFallback>JD</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<p className="text-sm font-medium">John Doe invited a new client</p>
											<p className="text-xs text-muted-foreground">2 hours ago</p>
										</div>
									</div>
									<div className="flex items-center gap-3 p-3 border rounded-lg">
										<Avatar className="w-8 h-8">
											<AvatarFallback>SW</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<p className="text-sm font-medium">Sarah Wilson approved an expense</p>
											<p className="text-xs text-muted-foreground">4 hours ago</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Members Tab */}
					<TabsContent value="members">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>Team Members</span>
									<Button onClick={() => setShowInviteMember(true)}>
										<Plus className="mr-2 h-4 w-4" />
										Invite Member
									</Button>
								</CardTitle>
								<CardDescription>
									Manage team members and their permissions
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{workspaceMembers.map((member) => (
										<div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
											<div className="flex items-center gap-3">
												<Avatar>
													<AvatarFallback>
														{member.userId.slice(0, 2).toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium">{member.userId}</p>
													<div className="flex items-center gap-2">
														<Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
															{member.role}
														</Badge>
														<span className="text-xs text-muted-foreground">
															{member.permissions.length} permissions
														</span>
													</div>
												</div>
											</div>
											<Button variant="ghost" size="sm">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Clients Tab */}
					<TabsContent value="clients">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>Clients</span>
									<Button onClick={() => setShowAddClient(true)}>
										<Plus className="mr-2 h-4 w-4" />
										Add Client
									</Button>
								</CardTitle>
								<CardDescription>
									Manage your client relationships
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{clients.map((client) => (
										<div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
											<div className="flex items-center gap-3">
												<Avatar>
													<AvatarFallback>
														{client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium">{client.name}</p>
													<div className="flex items-center gap-2">
														<p className="text-sm text-muted-foreground">{client.email}</p>
														<Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
															{client.status}
														</Badge>
														<Badge variant="outline">
															{client.engagementType}
														</Badge>
													</div>
													{client.company && (
														<p className="text-xs text-muted-foreground">{client.company}</p>
													)}
												</div>
											</div>
											<Button variant="ghost" size="sm">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Settings Tab */}
					<TabsContent value="settings">
						<Card>
							<CardHeader>
								<CardTitle>Workspace Settings</CardTitle>
								<CardDescription>
									Configure workspace preferences and features
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-6">
									{/* Basic Settings */}
									<div className="space-y-4">
										<h4 className="font-medium">Basic Settings</h4>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="workspaceName">Workspace Name</Label>
												<Input
													id="workspaceName"
													value={selectedWorkspace.name}
													onChange={(e) => setSelectedWorkspace(prev => prev ? { ...prev, name: e.target.value } : null)}
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="workspaceType">Type</Label>
												<Select value={selectedWorkspace.type} onValueChange={(value: Workspace['type']) => setSelectedWorkspace(prev => prev ? { ...prev, type: value } : null)}>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="accounting_firm">Accounting Firm</SelectItem>
														<SelectItem value="client_workspace">Client Workspace</SelectItem>
														<SelectItem value="practice_group">Practice Group</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor="workspaceDescription">Description</Label>
											<Textarea
												id="workspaceDescription"
												value={selectedWorkspace.description || ''}
												onChange={(e) => setSelectedWorkspace(prev => prev ? { ...prev, description: e.target.value } : null)}
											/>
										</div>
									</div>

									{/* Feature Settings */}
									<div className="space-y-4">
										<h4 className="font-medium">Features</h4>
										<div className="space-y-3">
											{selectedWorkspace.settings.features && Object.entries(selectedWorkspace.settings.features).map(([feature, enabled]) => (
												<div key={feature} className="flex items-center justify-between">
													<div>
														<p className="font-medium capitalize">{feature.replace(/([A-Z])/g, ' $1')}</p>
														<p className="text-sm text-muted-foreground">
															{feature === 'documentCollaboration' && 'Enable real-time document collaboration'}
															{feature === 'approvalWorkflows' && 'Require approvals for expenses and invoices'}
															{feature === 'clientPortal' && 'Provide clients with secure portal access'}
															{feature === 'auditTrail' && 'Track all changes for compliance'}
														</p>
													</div>
													<Switch
														checked={enabled}
														onCheckedChange={(checked) => setSelectedWorkspace(prev => prev ? {
															...prev,
															settings: {
																...prev.settings,
																features: {
																	...prev.settings.features,
																	[feature]: checked,
																},
															},
														} : null)}
													/>
												</div>
											))}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			)}

			{/* Create Workspace Modal */}
			<Dialog open={showCreateWorkspace} onOpenChange={setShowCreateWorkspace}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Workspace</DialogTitle>
						<DialogDescription>
							Set up a new workspace for your accounting practice or client
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="workspaceName">Workspace Name</Label>
							<Input
								id="workspaceName"
								value={newWorkspace.name}
								onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
								placeholder="My Accounting Firm"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="workspaceDescription">Description</Label>
							<Textarea
								id="workspaceDescription"
								value={newWorkspace.description}
								onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
								placeholder="Brief description of the workspace"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="workspaceType">Type</Label>
							<Select value={newWorkspace.type} onValueChange={(value: Workspace['type']) => setNewWorkspace(prev => ({ ...prev, type: value }))}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="accounting_firm">Accounting Firm</SelectItem>
									<SelectItem value="client_workspace">Client Workspace</SelectItem>
									<SelectItem value="practice_group">Practice Group</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setShowCreateWorkspace(false)}>
								Cancel
							</Button>
							<Button onClick={handleCreateWorkspace} disabled={!newWorkspace.name}>
								Create Workspace
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Invite Member Modal */}
			<Dialog open={showInviteMember} onOpenChange={setShowInviteMember}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Invite Team Member</DialogTitle>
						<DialogDescription>
							Invite a new member to join this workspace
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="memberEmail">Email Address</Label>
							<Input
								id="memberEmail"
								type="email"
								value={newMember.email}
								onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
								placeholder="colleague@company.com"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="memberRole">Role</Label>
							<Select value={newMember.role} onValueChange={(value: WorkspaceMember['role']) => setNewMember(prev => ({ ...prev, role: value }))}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="accountant">Accountant</SelectItem>
									<SelectItem value="manager">Manager</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
									<SelectItem value="client">Client</SelectItem>
									<SelectItem value="viewer">Viewer</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setShowInviteMember(false)}>
								Cancel
							</Button>
							<Button onClick={handleInviteMember} disabled={!newMember.email}>
								Send Invitation
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Add Client Modal */}
			<Dialog open={showAddClient} onOpenChange={setShowAddClient}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add New Client</DialogTitle>
						<DialogDescription>
							Add a new client to this workspace
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="clientName">Client Name</Label>
							<Input
								id="clientName"
								value={newClient.name}
								onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
								placeholder="John Smith"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="clientEmail">Email Address</Label>
							<Input
								id="clientEmail"
								type="email"
								value={newClient.email}
								onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
								placeholder="john@company.com"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="clientCompany">Company</Label>
							<Input
								id="clientCompany"
								value={newClient.company}
								onChange={(e) => setNewClient(prev => ({ ...prev, company: e.target.value }))}
								placeholder="Acme Corporation"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="engagementType">Engagement Type</Label>
							<Select value={newClient.engagementType} onValueChange={(value: Client['engagementType']) => setNewClient(prev => ({ ...prev, engagementType: value }))}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="monthly">Monthly</SelectItem>
									<SelectItem value="quarterly">Quarterly</SelectItem>
									<SelectItem value="annual">Annual</SelectItem>
									<SelectItem value="project">Project</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setShowAddClient(false)}>
								Cancel
							</Button>
							<Button onClick={handleAddClient} disabled={!newClient.name || !newClient.email}>
								Add Client
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
