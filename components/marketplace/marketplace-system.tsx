"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Plus,
	Search,
	Filter,
	Download,
	Settings,
	Star,
	Users,
	DollarSign,
	Calendar,
	TrendingUp,
	Package,
	Plug,
	Zap,
	Shield,
	CheckCircle,
	AlertTriangle,
	Info,
	ExternalLink,
	GitBranch,
	Globe,
	Code,
	Database,
	Cloud,
	Lock,
	Unlock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Plugin {
	id: number;
	name: string;
	description: string;
	version: string;
	author: string;
	category: string;
	tags: string[];
	icon?: string;
	rating: number;
	reviewCount: number;
	installationCount: number;
	pricingModel: 'free' | 'freemium' | 'paid' | 'subscription';
	price?: number;
	isVerified: boolean;
	isFeatured: boolean;
	screenshots?: string[];
}

interface InstalledPlugin {
	id: number;
	pluginId: number;
	name: string;
	version: string;
	status: 'active' | 'inactive' | 'error' | 'updating';
	lastUsedAt?: string;
	usageCount: number;
	errorCount: number;
	configuration: Record<string, any>;
}

const PLUGIN_CATEGORIES = [
	{ value: 'finance', label: 'Finance & Accounting', icon: DollarSign },
	{ value: 'reporting', label: 'Reporting & Analytics', icon: TrendingUp },
	{ value: 'automation', label: 'Automation & Workflow', icon: Zap },
	{ value: 'integrations', label: 'Third-party Integrations', icon: Plug },
	{ value: 'productivity', label: 'Productivity Tools', icon: Package },
	{ value: 'security', label: 'Security & Compliance', icon: Shield },
];

const SAMPLE_PLUGINS: Plugin[] = [
	{
		id: 1,
		name: 'Stripe Integration',
		description: 'Accept payments directly through your invoices with Stripe payment processing.',
		version: '2.1.0',
		author: 'Financbase Team',
		category: 'integrations',
		tags: ['payments', 'stripe', 'billing'],
		rating: 4.8,
		reviewCount: 156,
		installationCount: 2847,
		pricingModel: 'free',
		isVerified: true,
		isFeatured: true,
	},
	{
		id: 2,
		name: 'Advanced Reporting',
		description: 'Generate detailed financial reports with custom dashboards and export options.',
		version: '1.5.2',
		author: 'DataViz Solutions',
		category: 'reporting',
		tags: ['reports', 'analytics', 'dashboard'],
		rating: 4.6,
		reviewCount: 89,
		installationCount: 1243,
		pricingModel: 'freemium',
		price: 29,
		isVerified: true,
		isFeatured: false,
	},
	{
		id: 3,
		name: 'Invoice Automation',
		description: 'Automatically send invoices, track payments, and follow up on overdue accounts.',
		version: '3.0.1',
		author: 'AutoFinance Inc',
		category: 'automation',
		tags: ['automation', 'invoices', 'reminders'],
		rating: 4.9,
		reviewCount: 203,
		installationCount: 3892,
		pricingModel: 'subscription',
		price: 19,
		isVerified: true,
		isFeatured: true,
	},
	{
		id: 4,
		name: 'Tax Calculator',
		description: 'Calculate taxes automatically based on your location and business type.',
		version: '1.2.3',
		author: 'TaxTech Pro',
		category: 'finance',
		tags: ['taxes', 'compliance', 'calculations'],
		rating: 4.4,
		reviewCount: 67,
		installationCount: 892,
		pricingModel: 'paid',
		price: 49,
		isVerified: false,
		isFeatured: false,
	},
];

const INSTALLED_PLUGINS: InstalledPlugin[] = [
	{
		id: 1,
		pluginId: 1,
		name: 'Stripe Integration',
		version: '2.1.0',
		status: 'active',
		lastUsedAt: '2024-11-15T10:30:00Z',
		usageCount: 245,
		errorCount: 2,
		configuration: { apiKey: 'sk_test_...' },
	},
	{
		id: 2,
		pluginId: 3,
		name: 'Invoice Automation',
		version: '3.0.1',
		status: 'active',
		lastUsedAt: '2024-11-15T09:15:00Z',
		usageCount: 189,
		errorCount: 0,
		configuration: { autoSend: true, reminderDays: 7 },
	},
];

export function MarketplaceSystem() {
	const [searchTerm, setSearchTerm] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<string>('all');
	const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
	const [showInstallDialog, setShowInstallDialog] = useState(false);
	const [showPluginDetails, setShowPluginDetails] = useState(false);

	const queryClient = useQueryClient();

	// Fetch available plugins
	const { data: availablePlugins = SAMPLE_PLUGINS } = useQuery({
		queryKey: ['marketplace-plugins', searchTerm, categoryFilter],
		queryFn: async () => {
			// In real implementation, fetch from API
			let filtered = SAMPLE_PLUGINS;

			if (searchTerm) {
				filtered = filtered.filter(plugin =>
					plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
					plugin.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
				);
			}

			if (categoryFilter !== 'all') {
				filtered = filtered.filter(plugin => plugin.category === categoryFilter);
			}

			return filtered;
		},
	});

	// Fetch installed plugins
	const { data: installedPlugins = INSTALLED_PLUGINS } = useQuery({
		queryKey: ['installed-plugins'],
		queryFn: async () => {
			// In real implementation, fetch from API
			return INSTALLED_PLUGINS;
		},
	});

	// Install plugin mutation
	const installPluginMutation = useMutation({
		mutationFn: async (pluginId: number) => {
			const response = await fetch(`/api/marketplace/plugins/${pluginId}/install`, {
				method: 'POST',
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['installed-plugins']);
			setShowInstallDialog(false);
		},
	});

	// Uninstall plugin mutation
	const uninstallPluginMutation = useMutation({
		mutationFn: async (installationId: number) => {
			const response = await fetch(`/api/marketplace/plugins/uninstall/${installationId}`, {
				method: 'DELETE',
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['installed-plugins']);
		},
	});

	const getPricingBadge = (plugin: Plugin) => {
		switch (plugin.pricingModel) {
			case 'free':
				return <Badge className="bg-green-100 text-green-800">Free</Badge>;
			case 'freemium':
				return <Badge className="bg-blue-100 text-blue-800">Freemium</Badge>;
			case 'paid':
				return <Badge className="bg-orange-100 text-orange-800">Paid</Badge>;
			case 'subscription':
				return <Badge className="bg-purple-100 text-purple-800">Subscription</Badge>;
			default:
				return <Badge variant="outline">Unknown</Badge>;
		}
	};

	const getCategoryIcon = (category: string) => {
		const categoryInfo = PLUGIN_CATEGORIES.find(cat => cat.value === category);
		return categoryInfo ? categoryInfo.icon : Package;
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'inactive':
				return 'bg-gray-100 text-gray-800 border-gray-200';
			case 'error':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'updating':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Plugin Marketplace</h2>
					<p className="text-muted-foreground">
						Discover and install plugins to extend your Financbase experience
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Settings className="mr-2 h-4 w-4" />
						Manage Plugins
					</Button>
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Submit Plugin
					</Button>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Package className="h-4 w-4 text-blue-600" />
							<div>
								<p className="text-sm text-muted-foreground">Available Plugins</p>
								<p className="text-xl font-bold">{availablePlugins.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<CheckCircle className="h-4 w-4 text-green-600" />
							<div>
								<p className="text-sm text-muted-foreground">Installed</p>
								<p className="text-xl font-bold">{installedPlugins.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Star className="h-4 w-4 text-yellow-600" />
							<div>
								<p className="text-sm text-muted-foreground">Top Rated</p>
								<p className="text-xl font-bold">
									{Math.round(availablePlugins.reduce((sum, p) => sum + p.rating, 0) / availablePlugins.length * 10) / 10}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-purple-600" />
							<div>
								<p className="text-sm text-muted-foreground">Total Installs</p>
								<p className="text-xl font-bold">
									{availablePlugins.reduce((sum, p) => sum + p.installationCount, 0).toLocaleString()}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="discover" className="space-y-4">
				<TabsList>
					<TabsTrigger value="discover">Discover Plugins</TabsTrigger>
					<TabsTrigger value="installed">Installed ({installedPlugins.length})</TabsTrigger>
					<TabsTrigger value="my-plugins">My Plugins</TabsTrigger>
				</TabsList>

				{/* Discover Tab */}
				<TabsContent value="discover" className="space-y-4">
					{/* Filters */}
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-4">
								<div className="flex-1">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Search plugins..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-10"
										/>
									</div>
								</div>

								<Select value={categoryFilter} onValueChange={setCategoryFilter}>
									<SelectTrigger className="w-48">
										<SelectValue placeholder="All Categories" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Categories</SelectItem>
										{PLUGIN_CATEGORIES.map((category) => (
											<SelectItem key={category.value} value={category.value}>
												<div className="flex items-center gap-2">
													<category.icon className="h-4 w-4" />
													{category.label}
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								<Button variant="outline">
									<Filter className="mr-2 h-4 w-4" />
									More Filters
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Featured Plugins */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Star className="mr-2 h-5 w-5 text-yellow-500" />
								Featured Plugins
							</CardTitle>
							<CardDescription>
								Popular and highly-rated plugins from our community
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{availablePlugins.filter(p => p.isFeatured).map((plugin) => (
									<Card key={plugin.id} className="cursor-pointer hover:shadow-md transition-shadow">
										<CardContent className="p-4">
											<div className="flex items-start gap-3">
												<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
													<getCategoryIcon category={plugin.category} className="h-6 w-6 text-primary" />
												</div>
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<h3 className="font-medium">{plugin.name}</h3>
														{getPricingBadge(plugin)}
														{plugin.isVerified && (
															<CheckCircle className="h-4 w-4 text-green-600" />
														)}
													</div>
													<p className="text-sm text-muted-foreground mb-2">
														{plugin.description}
													</p>
													<div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
														<div className="flex items-center gap-1">
															<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
															<span>{plugin.rating}</span>
														</div>
														<span>{plugin.installationCount} installs</span>
													</div>
													<Button
														size="sm"
														className="w-full"
														onClick={() => {
															setSelectedPlugin(plugin);
															setShowInstallDialog(true);
														}}
													>
														{plugin.pricingModel === 'free' ? 'Install Free' : 'View Details'}
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>

					{/* All Plugins */}
					<Card>
						<CardHeader>
							<CardTitle>All Plugins</CardTitle>
							<CardDescription>
								Browse all available plugins in the marketplace
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{availablePlugins.map((plugin) => (
									<Card key={plugin.id} className="cursor-pointer hover:shadow-md transition-shadow">
										<CardContent className="p-4">
											<div className="flex items-start gap-3">
												<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
													<getCategoryIcon category={plugin.category} className="h-6 w-6 text-primary" />
												</div>
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<h3 className="font-medium">{plugin.name}</h3>
														{getPricingBadge(plugin)}
														{plugin.isVerified && (
															<CheckCircle className="h-4 w-4 text-green-600" />
														)}
													</div>
													<p className="text-sm text-muted-foreground mb-2 line-clamp-2">
														{plugin.description}
													</p>
													<div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
														<div className="flex items-center gap-1">
															<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
															<span>{plugin.rating}</span>
															<span>({plugin.reviewCount})</span>
														</div>
														<span>{plugin.installationCount} installs</span>
													</div>
													<div className="flex gap-2">
														<Button
															size="sm"
															className="flex-1"
															onClick={() => {
																setSelectedPlugin(plugin);
																setShowPluginDetails(true);
															}}
														>
															View Details
														</Button>
														<Button
															variant="outline"
															size="sm"
															onClick={() => {
																setSelectedPlugin(plugin);
																setShowInstallDialog(true);
															}}
														>
															Install
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

				{/* Installed Tab */}
				<TabsContent value="installed" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Package className="mr-2 h-5 w-5" />
								Installed Plugins ({installedPlugins.length})
							</CardTitle>
							<CardDescription>
								Manage your installed plugins and their configurations
							</CardDescription>
						</CardHeader>
						<CardContent>
							{installedPlugins.length === 0 ? (
								<div className="text-center py-8">
									<Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">No plugins installed yet</p>
									<Button className="mt-4" onClick={() => setSelectedTab('discover')}>
										Browse Marketplace
									</Button>
								</div>
							) : (
								<div className="space-y-4">
									{installedPlugins.map((plugin) => (
										<div key={plugin.id} className="flex items-center justify-between p-4 border rounded-lg">
											<div className="flex items-center gap-4">
												<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
													<Package className="h-5 w-5 text-primary" />
												</div>
												<div>
													<p className="font-medium">{plugin.name}</p>
													<p className="text-sm text-muted-foreground">
														Version {plugin.version} • Used {plugin.usageCount} times
													</p>
												</div>
											</div>

											<div className="flex items-center gap-4">
												<div className="text-right">
													<Badge className={cn("text-xs", getStatusColor(plugin.status))}>
														{plugin.status}
													</Badge>
													{plugin.errorCount > 0 && (
														<p className="text-xs text-red-600 mt-1">
															{plugin.errorCount} errors
														</p>
													)}
												</div>

												<div className="flex items-center gap-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => {/* Configure plugin */}}
													>
														<Settings className="h-4 w-4" />
													</Button>

													<Button
														variant="ghost"
														size="sm"
														onClick={() => uninstallPluginMutation.mutate(plugin.id)}
														disabled={uninstallPluginMutation.isPending}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* My Plugins Tab */}
				<TabsContent value="my-plugins" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<GitBranch className="mr-2 h-5 w-5" />
								My Submitted Plugins
							</CardTitle>
							<CardDescription>
								Manage plugins you've submitted to the marketplace
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-center py-8">
								<Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<p className="text-muted-foreground">You haven't submitted any plugins yet</p>
								<Button className="mt-4">
									<Plus className="mr-2 h-4 w-4" />
									Submit Your First Plugin
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Plugin Details Dialog */}
			{selectedPlugin && (
				<Dialog open={showPluginDetails} onOpenChange={setShowPluginDetails}>
					<DialogContent className="max-w-4xl">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-3">
								<getCategoryIcon category={selectedPlugin.category} className="h-6 w-6 text-primary" />
								{selectedPlugin.name}
								<div className="flex gap-2 ml-auto">
									{getPricingBadge(selectedPlugin)}
									{selectedPlugin.isVerified && (
										<Badge className="bg-green-100 text-green-800">
											<CheckCircle className="mr-1 h-3 w-3" />
											Verified
										</Badge>
									)}
								</div>
							</DialogTitle>
							<DialogDescription>
								{selectedPlugin.description}
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-6">
							{/* Plugin Stats */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="text-center">
									<p className="text-2xl font-bold">{selectedPlugin.rating}</p>
									<p className="text-sm text-muted-foreground">Rating</p>
								</div>
								<div className="text-center">
									<p className="text-2xl font-bold">{selectedPlugin.reviewCount}</p>
									<p className="text-sm text-muted-foreground">Reviews</p>
								</div>
								<div className="text-center">
									<p className="text-2xl font-bold">{selectedPlugin.installationCount}</p>
									<p className="text-sm text-muted-foreground">Installs</p>
								</div>
								<div className="text-center">
									<p className="text-2xl font-bold">{selectedPlugin.version}</p>
									<p className="text-sm text-muted-foreground">Latest Version</p>
								</div>
							</div>

							{/* Tags */}
							<div>
								<p className="font-medium mb-2">Tags</p>
								<div className="flex flex-wrap gap-2">
									{selectedPlugin.tags.map((tag) => (
										<Badge key={tag} variant="outline">
											{tag}
										</Badge>
									))}
								</div>
							</div>

							{/* Pricing */}
							{selectedPlugin.pricingModel !== 'free' && (
								<div>
									<p className="font-medium mb-2">Pricing</p>
									<div className="flex items-center gap-4">
										<div className="text-2xl font-bold">
											${selectedPlugin.price}
											<span className="text-sm font-normal text-muted-foreground">
												/{selectedPlugin.pricingModel === 'subscription' ? 'month' : 'one-time'}
											</span>
										</div>
										{selectedPlugin.pricingModel === 'freemium' && (
											<Badge className="bg-blue-100 text-blue-800">Free Tier Available</Badge>
										)}
									</div>
								</div>
							)}

							{/* Actions */}
							<div className="flex gap-2">
								<Button
									className="flex-1"
									onClick={() => {
										setShowPluginDetails(false);
										setShowInstallDialog(true);
									}}
								>
									{selectedPlugin.pricingModel === 'free' ? 'Install Free' : 'Get Started'}
								</Button>
								<Button variant="outline" className="flex-1">
									<ExternalLink className="mr-2 h-4 w-4" />
									Visit Website
								</Button>
								<Button variant="outline">
									<Star className="mr-2 h-4 w-4" />
									Add Review
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}

			{/* Install Plugin Dialog */}
			{selectedPlugin && (
				<Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Install {selectedPlugin.name}</DialogTitle>
							<DialogDescription>
								Configure and install this plugin to your Financbase instance
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							{/* Plugin Info */}
							<div className="p-4 border rounded-lg">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
										<getCategoryIcon category={selectedPlugin.category} className="h-6 w-6 text-primary" />
									</div>
									<div>
										<p className="font-medium">{selectedPlugin.name}</p>
										<p className="text-sm text-muted-foreground">
											by {selectedPlugin.author} • Version {selectedPlugin.version}
										</p>
									</div>
								</div>
							</div>

							{/* Configuration */}
							{selectedPlugin.pricingModel !== 'free' && (
								<div className="space-y-4">
									<h4 className="font-medium">Subscription Details</h4>
									<div className="p-4 border rounded-lg">
										<div className="flex items-center justify-between">
											<div>
												<p className="font-medium">{selectedPlugin.name}</p>
												<p className="text-sm text-muted-foreground">
													{selectedPlugin.pricingModel === 'subscription' ? 'Monthly subscription' : 'One-time purchase'}
												</p>
											</div>
											<div className="text-right">
												<p className="text-xl font-bold">${selectedPlugin.price}</p>
												<p className="text-sm text-muted-foreground">
													{selectedPlugin.pricingModel === 'subscription' ? 'per month' : 'one-time'}
												</p>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Permissions */}
							<div className="space-y-4">
								<h4 className="font-medium">Required Permissions</h4>
								<div className="space-y-2">
									<div className="flex items-center gap-2 p-2 border rounded">
										<Shield className="h-4 w-4 text-green-600" />
										<span className="text-sm">Read access to invoice data</span>
									</div>
									<div className="flex items-center gap-2 p-2 border rounded">
										<Shield className="h-4 w-4 text-blue-600" />
										<span className="text-sm">Write access to expense records</span>
									</div>
									<div className="flex items-center gap-2 p-2 border rounded">
										<Shield className="h-4 w-4 text-purple-600" />
										<span className="text-sm">Access to external API endpoints</span>
									</div>
								</div>
							</div>

							{/* Terms */}
							<div className="space-y-4">
								<h4 className="font-medium">Terms & Conditions</h4>
								<div className="p-4 border rounded-lg bg-muted/50">
									<p className="text-sm">
										By installing this plugin, you agree to:
									</p>
									<ul className="text-sm mt-2 space-y-1">
										<li>• Grant the plugin access to your specified data</li>
										<li>• Allow the plugin to make API calls on your behalf</li>
										<li>• Accept responsibility for the plugin's actions</li>
										<li>• Follow the plugin's usage guidelines</li>
									</ul>
								</div>
							</div>

							{/* Actions */}
							<div className="flex gap-2">
								<Button
									className="flex-1"
									onClick={() => installPluginMutation.mutate(selectedPlugin.id)}
									disabled={installPluginMutation.isPending}
								>
									{installPluginMutation.isPending ? 'Installing...' : 'Install Plugin'}
								</Button>
								<Button variant="outline" className="flex-1">
									Cancel
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
