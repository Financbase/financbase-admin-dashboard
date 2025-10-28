"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Plug,
	Activity,
	Users,
	TrendingUp,
	Settings,
	Plus,
	CheckCircle,
	AlertTriangle,
	Clock,
	Zap,
	Search,
	Filter,
	RefreshCw,
	Trash2,
	Edit,
	Eye,
	MoreHorizontal,
	Database,
	BookOpen,
	AlertCircle,
	XCircle,
	Loader2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MarketplaceSystem } from '@/components/marketplace/marketplace-system';
import { WebhookManagement } from '@/components/integrations/webhook-management';
import { DeveloperPortal } from '@/components/integrations/developer-portal';

interface Integration {
	id: string;
	name: string;
	description: string;
	category: string;
	status: 'active' | 'inactive' | 'error' | 'pending';
	lastSync?: string;
	logo: string;
	features: string[];
	connectionCount?: number;
	errorCount?: number;
	lastError?: string;
}

interface IntegrationStats {
	totalIntegrations: number;
	activeIntegrations: number;
	errorIntegrations: number;
	totalConnections: number;
	lastSyncTime: string;
	successRate: number;
}

const SAMPLE_INTEGRATIONS: Integration[] = [
	{
		id: 'stripe',
		name: 'Stripe',
		description: 'Payment processing and subscription management',
		category: 'Payments',
		status: 'active',
		lastSync: '2024-01-15T10:30:00Z',
		logo: '/integrations/stripe.svg',
		features: ['Payment Processing', 'Subscription Management', 'Webhooks'],
		connectionCount: 3,
		errorCount: 0
	},
	{
		id: 'slack',
		name: 'Slack',
		description: 'Team communication and notifications',
		category: 'Communication',
		status: 'active',
		lastSync: '2024-01-15T09:15:00Z',
		logo: '/integrations/slack.svg',
		features: ['Notifications', 'Team Collaboration', 'Bot Integration'],
		connectionCount: 1,
		errorCount: 0
	},
	{
		id: 'quickbooks',
		name: 'QuickBooks Online',
		description: 'Accounting and financial management',
		category: 'Accounting',
		status: 'error',
		lastSync: '2024-01-14T16:45:00Z',
		logo: '/integrations/quickbooks.svg',
		features: ['Invoice Sync', 'Expense Tracking', 'Financial Reports'],
		connectionCount: 1,
		errorCount: 3,
		lastError: 'Authentication expired'
	},
	{
		id: 'google-workspace',
		name: 'Google Workspace',
		description: 'Productivity and collaboration tools',
		category: 'Productivity',
		status: 'pending',
		lastSync: undefined,
		logo: '/integrations/google.svg',
		features: ['Calendar Sync', 'Drive Integration', 'Email Automation'],
		connectionCount: 0,
		errorCount: 0
	}
];

export default function IntegrationsPage() {
	const [activeTab, setActiveTab] = useState('overview');
	const [integrations, setIntegrations] = useState<Integration[]>(SAMPLE_INTEGRATIONS);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [categoryFilter, setCategoryFilter] = useState('all');

	const [stats] = useState<IntegrationStats>({
		totalIntegrations: 4,
		activeIntegrations: 2,
		errorIntegrations: 1,
		totalConnections: 5,
		lastSyncTime: '2024-01-15T10:30:00Z',
		successRate: 95.2
	});

	// Simulate loading integrations from API
	useEffect(() => {
		const loadIntegrations = async () => {
			setLoading(true);
			setError(null);
			try {
				// Simulate API call
				await new Promise(resolve => setTimeout(resolve, 1000));
				setIntegrations(SAMPLE_INTEGRATIONS);
			} catch (err) {
				setError('Failed to load integrations. Please try again.');
				console.error('Error loading integrations:', err);
			} finally {
				setLoading(false);
			}
		};

		loadIntegrations();
	}, []);

	const handleSyncIntegration = async (integrationId: string) => {
		setLoading(true);
		try {
			// Simulate sync API call
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			// Update integration status
			setIntegrations(prev => prev.map(integration => 
				integration.id === integrationId 
					? { ...integration, status: 'active', lastSync: new Date().toISOString() }
					: integration
			));
		} catch (err) {
			setError(`Failed to sync ${integrationId}. Please try again.`);
			console.error('Error syncing integration:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteIntegration = async (integrationId: string) => {
		if (!confirm('Are you sure you want to delete this integration?')) return;
		
		setLoading(true);
		try {
			// Simulate delete API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			setIntegrations(prev => prev.filter(integration => integration.id !== integrationId));
		} catch (err) {
			setError(`Failed to delete integration. Please try again.`);
			console.error('Error deleting integration:', err);
		} finally {
			setLoading(false);
		}
	};

	const filteredIntegrations = integrations.filter(integration => {
		const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
							  integration.description.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus = statusFilter === 'all' || integration.status === statusFilter;
		const matchesCategory = categoryFilter === 'all' || integration.category.toLowerCase() === categoryFilter.toLowerCase();
		
		return matchesSearch && matchesStatus && matchesCategory;
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active': return 'bg-green-100 text-green-800';
			case 'inactive': return 'bg-gray-100 text-gray-800';
			case 'error': return 'bg-red-100 text-red-800';
			case 'pending': return 'bg-yellow-100 text-yellow-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'active': return CheckCircle;
			case 'inactive': return XCircle;
			case 'error': return AlertTriangle;
			case 'pending': return Clock;
			default: return AlertCircle;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Plug className="h-8 w-8" />
						Integrations Hub
					</h1>
					<p className="text-muted-foreground">
						Connect and manage your third-party integrations
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<BookOpen className="mr-2 h-4 w-4" />
						Documentation
					</Button>
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Add Integration
					</Button>
				</div>
			</div>

			{/* Error Alert */}
			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Plug className="h-4 w-4 text-blue-600" />
							<div>
								<p className="text-sm text-muted-foreground">Total Integrations</p>
								<p className="text-xl font-bold">{stats.totalIntegrations}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<CheckCircle className="h-4 w-4 text-green-600" />
							<div>
								<p className="text-sm text-muted-foreground">Active</p>
								<p className="text-xl font-bold">{stats.activeIntegrations}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Database className="h-4 w-4 text-purple-600" />
							<div>
								<p className="text-sm text-muted-foreground">Connections</p>
								<p className="text-xl font-bold">{stats.totalConnections}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<TrendingUp className="h-4 w-4 text-orange-600" />
							<div>
								<p className="text-sm text-muted-foreground">Success Rate</p>
								<p className="text-xl font-bold">{stats.successRate}%</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Content */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="marketplace">Marketplace</TabsTrigger>
					<TabsTrigger value="webhooks">Webhooks</TabsTrigger>
					<TabsTrigger value="developer">Developer Portal</TabsTrigger>
					<TabsTrigger value="settings">Settings</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-4">
					{/* Filters */}
					<Card>
						<CardHeader>
							<CardTitle>Integration Management</CardTitle>
							<CardDescription>
								Manage your connected integrations and monitor their status
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-4 mb-6">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
									<Input
										placeholder="Search integrations..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10"
									/>
								</div>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-40">
										<SelectValue placeholder="Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Status</SelectItem>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="inactive">Inactive</SelectItem>
										<SelectItem value="error">Error</SelectItem>
										<SelectItem value="pending">Pending</SelectItem>
									</SelectContent>
								</Select>
								<Select value={categoryFilter} onValueChange={setCategoryFilter}>
									<SelectTrigger className="w-40">
										<SelectValue placeholder="Category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Categories</SelectItem>
										<SelectItem value="payments">Payments</SelectItem>
										<SelectItem value="communication">Communication</SelectItem>
										<SelectItem value="accounting">Accounting</SelectItem>
										<SelectItem value="productivity">Productivity</SelectItem>
									</SelectContent>
								</Select>
								<Button variant="outline" size="sm" disabled={loading}>
									<Filter className="h-4 w-4 mr-2" />
									More Filters
								</Button>
							</div>

							{/* Integrations List */}
							<div className="space-y-4">
								{loading ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="h-6 w-6 animate-spin mr-2" />
										<span>Loading integrations...</span>
									</div>
								) : (
									filteredIntegrations.map((integration) => {
										const StatusIcon = getStatusIcon(integration.status);
										return (
											<Card key={integration.id} className="hover:shadow-md transition-shadow">
												<CardContent className="p-6">
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-4">
															<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
																<Plug className="h-6 w-6 text-primary" />
															</div>
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<h3 className="font-semibold text-lg">{integration.name}</h3>
																	<Badge className={getStatusColor(integration.status)}>
																		<StatusIcon className="h-3 w-3 mr-1" />
																		{integration.status}
																	</Badge>
																</div>
																<p className="text-sm text-muted-foreground mb-2">{integration.description}</p>
																<div className="flex items-center gap-4 text-sm text-muted-foreground">
																	<span className="flex items-center gap-1">
																		<Database className="h-4 w-4" />
																		{integration.connectionCount} connections
																	</span>
																	{integration.lastSync && (
																		<span className="flex items-center gap-1">
																			<Clock className="h-4 w-4" />
																			Last sync: {new Date(integration.lastSync).toLocaleString()}
																		</span>
																	)}
																	{integration.errorCount && integration.errorCount > 0 && (
																		<span className="flex items-center gap-1 text-red-600">
																			<AlertTriangle className="h-4 w-4" />
																			{integration.errorCount} errors
																		</span>
																	)}
																</div>
																{integration.lastError && (
																	<Alert variant="destructive" className="mt-2">
																		<AlertTriangle className="h-4 w-4" />
																		<AlertDescription>{integration.lastError}</AlertDescription>
																	</Alert>
																)}
															</div>
														</div>
														<div className="flex items-center gap-2">
															<Button
																variant="outline"
																size="sm"
																onClick={() => handleSyncIntegration(integration.id)}
																disabled={loading}
															>
																<RefreshCw className="h-4 w-4 mr-2" />
																Sync
															</Button>
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button variant="ghost" size="sm">
																		<MoreHorizontal className="h-4 w-4" />
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align="end">
																	<DropdownMenuItem>
																		<Eye className="h-4 w-4 mr-2" />
																		View Details
																	</DropdownMenuItem>
																	<DropdownMenuItem>
																		<Edit className="h-4 w-4 mr-2" />
																		Configure
																	</DropdownMenuItem>
																	<DropdownMenuItem>
																		<Settings className="h-4 w-4 mr-2" />
																		Settings
																	</DropdownMenuItem>
																	<DropdownMenuItem 
																		className="text-red-600"
																		onClick={() => handleDeleteIntegration(integration.id)}
																	>
																		<Trash2 className="h-4 w-4 mr-2" />
																		Delete
																	</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</div>
													</div>
												</CardContent>
											</Card>
										);
									})
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Marketplace Tab */}
				<TabsContent value="marketplace">
					<MarketplaceSystem />
				</TabsContent>

				{/* Webhooks Tab */}
				<TabsContent value="webhooks">
					<WebhookManagement />
				</TabsContent>

				{/* Developer Portal Tab */}
				<TabsContent value="developer">
					<DeveloperPortal />
				</TabsContent>

				{/* Settings Tab */}
				<TabsContent value="settings" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Integration Settings</CardTitle>
							<CardDescription>
								Configure global settings for your integrations
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="flex items-center justify-between">
								<div>
									<h4 className="font-medium">Auto-sync Enabled</h4>
									<p className="text-sm text-muted-foreground">
										Automatically sync data from integrations
									</p>
								</div>
								<Button variant="outline" size="sm">
									<Settings className="h-4 w-4 mr-2" />
									Configure
								</Button>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<h4 className="font-medium">Error Notifications</h4>
									<p className="text-sm text-muted-foreground">
										Receive notifications when integrations fail
									</p>
								</div>
								<Button variant="outline" size="sm">
									<Settings className="h-4 w-4 mr-2" />
									Configure
								</Button>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<h4 className="font-medium">Data Retention</h4>
									<p className="text-sm text-muted-foreground">
										Configure how long to keep integration data
									</p>
								</div>
								<Button variant="outline" size="sm">
									<Settings className="h-4 w-4 mr-2" />
									Configure
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
