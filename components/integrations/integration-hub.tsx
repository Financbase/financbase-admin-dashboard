"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Plug,
	Webhook,
	Key,
	Store,
	Activity,
	Users,
	TrendingUp,
	Settings,
	Plus,
	ExternalLink,
	CheckCircle,
	AlertTriangle,
	Clock,
	Zap
} from 'lucide-react';
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
}

const SAMPLE_INTEGRATIONS: Integration[] = [
	{
		id: 'stripe',
		name: 'Stripe',
		description: 'Accept payments and manage subscriptions',
		category: 'payments',
		status: 'active',
		lastSync: '2024-11-15T14:22:00Z',
		logo: '/logos/stripe.png',
		features: ['Payment Processing', 'Subscription Management', 'Webhook Support'],
	},
	{
		id: 'gusto',
		name: 'Gusto',
		description: 'HR and payroll management',
		category: 'hr',
		status: 'active',
		lastSync: '2024-11-15T13:45:00Z',
		logo: '/logos/gusto.png',
		features: ['Employee Management', 'Payroll Processing', 'Tax Compliance'],
	},
	{
		id: 'quickbooks',
		name: 'QuickBooks Online',
		description: 'Accounting and financial management',
		category: 'accounting',
		status: 'inactive',
		logo: '/logos/quickbooks.png',
		features: ['Invoice Sync', 'Expense Tracking', 'Financial Reports'],
	},
	{
		id: 'xero',
		name: 'Xero',
		description: 'Cloud accounting software',
		category: 'accounting',
		status: 'error',
		lastSync: '2024-11-15T12:00:00Z',
		logo: '/logos/xero.png',
		features: ['Bank Reconciliation', 'Invoice Management', 'Multi-currency'],
	},
	{
		id: 'paypal',
		name: 'PayPal',
		description: 'Online payment processing',
		category: 'payments',
		status: 'pending',
		logo: '/logos/paypal.png',
		features: ['Payment Gateway', 'Recurring Payments', 'Global Support'],
	},
];

export function IntegrationHub() {
	const [activeTab, setActiveTab] = useState('overview');

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'inactive':
				return 'bg-gray-100 text-gray-800 border-gray-200';
			case 'error':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'active':
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case 'error':
				return <AlertTriangle className="h-4 w-4 text-red-600" />;
			case 'pending':
				return <Clock className="h-4 w-4 text-yellow-600" />;
			default:
				return <Activity className="h-4 w-4 text-gray-600" />;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Integration Hub</h2>
					<p className="text-muted-foreground">
						Connect your favorite tools and extend Financbase capabilities
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Settings className="mr-2 h-4 w-4" />
						Integration Settings
					</Button>
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Add Integration
					</Button>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Plug className="h-4 w-4 text-blue-600" />
							<div>
								<p className="text-sm text-muted-foreground">Active Integrations</p>
								<p className="text-xl font-bold">
									{SAMPLE_INTEGRATIONS.filter(i => i.status === 'active').length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Store className="h-4 w-4 text-green-600" />
							<div>
								<p className="text-sm text-muted-foreground">Marketplace Apps</p>
								<p className="text-xl font-bold">24</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Webhook className="h-4 w-4 text-purple-600" />
							<div>
								<p className="text-sm text-muted-foreground">Webhook Events</p>
								<p className="text-xl font-bold">1,247</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Key className="h-4 w-4 text-orange-600" />
							<div>
								<p className="text-sm text-muted-foreground">API Requests</p>
								<p className="text-xl font-bold">45.2K</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="integrations">Partner Integrations</TabsTrigger>
					<TabsTrigger value="marketplace">Plugin Marketplace</TabsTrigger>
					<TabsTrigger value="webhooks">Webhooks</TabsTrigger>
					<TabsTrigger value="developer">Developer Portal</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-6 md:grid-cols-2">
						{/* Active Integrations */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Plug className="mr-2 h-5 w-5" />
									Active Integrations
								</CardTitle>
								<CardDescription>
									Your connected partner services
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{SAMPLE_INTEGRATIONS.filter(i => i.status === 'active').map((integration) => (
										<div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
													<Plug className="h-4 w-4 text-primary" />
												</div>
												<div>
													<p className="font-medium">{integration.name}</p>
													<p className="text-sm text-muted-foreground">
														{integration.lastSync && `Last sync: ${new Date(integration.lastSync).toLocaleDateString()}`}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Badge className={getStatusColor(integration.status)}>
													{getStatusIcon(integration.status)}
													<span className="ml-1">{integration.status}</span>
												</Badge>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Available Integrations */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Plus className="mr-2 h-5 w-5" />
									Available Integrations
								</CardTitle>
								<CardDescription>
									Connect new services to extend functionality
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{SAMPLE_INTEGRATIONS.filter(i => i.status !== 'active').map((integration) => (
										<div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg opacity-75">
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
													<Plug className="h-4 w-4 text-gray-400" />
												</div>
												<div>
													<p className="font-medium">{integration.name}</p>
													<p className="text-sm text-muted-foreground">
														{integration.features.slice(0, 2).join(', ')}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Badge className={getStatusColor(integration.status)}>
													{getStatusIcon(integration.status)}
													<span className="ml-1">{integration.status}</span>
												</Badge>
												<Button size="sm" variant="outline">
													Connect
												</Button>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Recent Activity */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Activity className="mr-2 h-5 w-5" />
								Recent Activity
							</CardTitle>
							<CardDescription>
								Latest integration events and updates
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center gap-4 p-3 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
									<div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
										<CheckCircle className="h-4 w-4 text-green-600" />
									</div>
									<div className="flex-1">
										<p className="font-medium">Stripe payment processed</p>
										<p className="text-sm text-muted-foreground">Payment of $299.99 received via invoice INV-2024-001</p>
									</div>
									<p className="text-sm text-muted-foreground">2 minutes ago</p>
								</div>

								<div className="flex items-center gap-4 p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
									<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
										<Users className="h-4 w-4 text-blue-600" />
									</div>
									<div className="flex-1">
										<p className="font-medium">Gusto employee sync completed</p>
										<p className="text-sm text-muted-foreground">5 employees synced successfully</p>
									</div>
									<p className="text-sm text-muted-foreground">15 minutes ago</p>
								</div>

								<div className="flex items-center gap-4 p-3 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
									<div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
										<AlertTriangle className="h-4 w-4 text-red-600" />
									</div>
									<div className="flex-1">
										<p className="font-medium">QuickBooks sync failed</p>
										<p className="text-sm text-muted-foreground">Authentication token expired, please reconnect</p>
									</div>
									<p className="text-sm text-muted-foreground">1 hour ago</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Partner Integrations Tab */}
				<TabsContent value="integrations" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Plug className="mr-2 h-5 w-5" />
								Partner Integrations
							</CardTitle>
							<CardDescription>
								Connect with popular business tools and services
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{SAMPLE_INTEGRATIONS.map((integration) => (
									<Card key={integration.id} className="cursor-pointer hover:shadow-md transition-shadow">
										<CardContent className="p-4">
											<div className="flex items-start gap-3">
												<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
													<Plug className="h-6 w-6 text-primary" />
												</div>
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<h3 className="font-medium">{integration.name}</h3>
														<Badge className={cn("text-xs", getStatusColor(integration.status))}>
															{getStatusIcon(integration.status)}
															<span className="ml-1">{integration.status}</span>
														</Badge>
													</div>
													<p className="text-sm text-muted-foreground mb-2">
														{integration.description}
													</p>
													<div className="flex flex-wrap gap-1 mb-3">
														{integration.features.slice(0, 2).map((feature) => (
															<Badge key={feature} variant="outline" className="text-xs">
																{feature}
															</Badge>
														))}
													</div>
													<div className="flex gap-2">
														{integration.status === 'active' ? (
															<Button size="sm" variant="outline" className="flex-1">
																<Settings className="mr-2 h-4 w-4" />
																Configure
															</Button>
														) : (
															<Button size="sm" className="flex-1">
																Connect
															</Button>
														)}
														<Button size="sm" variant="outline">
															<ExternalLink className="h-4 w-4" />
														</Button>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
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
			</Tabs>
		</div>
	);
}
