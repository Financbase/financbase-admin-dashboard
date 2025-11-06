/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
	Store,
	Package,
	Code,
	Settings,
	TrendingUp,
	Star,
	Download,
	Users,
	Plus,
	Search,
	Filter,
	Shield,
	Zap,
	Database,
	Building2,
	Video,
	CreditCard,
	FileText,
	Home,
	Briefcase,
	Brain,
	Globe,
	Activity,
	CheckCircle,
	AlertTriangle,
	Clock,
	RefreshCw,
	Play,
	Pause,
	Trash2,
	Eye,
	Github,
	ExternalLink,
	BookOpen,
	Key,
	Webhook,
	BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Enhanced Plugin Interface
interface Plugin {
	id: number;
	name: string;
	slug: string;
	description: string;
	longDescription: string;
	category: string;
	icon: React.ReactNode;
	color: string;
	isActive: boolean;
	isOfficial: boolean;
	isVerified: boolean;
	isBeta: boolean;
	isPopular: boolean;
	version: string;
	author: {
		name: string;
		avatar?: string;
		verified: boolean;
	};
	features: string[];
	setupSteps: string[];
	permissions: string[];
	apiEndpoints: string[];
	webhooks: string[];
	documentationUrl: string;
	supportUrl: string;
	githubUrl?: string;
	pricing: {
		free: boolean;
		price?: number;
		tiers?: string[];
	};
	metrics: {
		installs: number;
		rating: number;
		reviews: number;
		lastUpdated: string;
		compatibility: string;
	};
	tags: string[];
	screenshots: string[];
	reviews: {
		user: string;
		rating: number;
		comment: string;
		date: string;
	}[];
}

// Enhanced Integration Interface (from integrations page)
interface Integration {
	id: number;
	name: string;
	slug: string;
	description: string;
	longDescription: string;
	category: string;
	icon: React.ReactNode;
	color: string;
	isActive: boolean;
	isOfficial: boolean;
	isBeta: boolean;
	isPopular: boolean;
	version: string;
	features: string[];
	setupSteps: string[];
	webhooks: string[];
	apiEndpoints: string[];
	documentationUrl: string;
	supportUrl: string;
	pricing?: {
		free: boolean;
		tiers: string[];
	};
	metrics: {
		activeUsers: number;
		syncSuccess: number;
		avgSetupTime: string;
	};
	tags: string[];
}

// Marketplace Categories
const marketplaceCategories = [
	{ id: "integrations", name: "Integrations", icon: <Database className="h-4 w-4" />, count: 13 },
	{ id: "plugins", name: "Plugins", icon: <Package className="h-4 w-4" />, count: 150 },
	{ id: "templates", name: "Templates", icon: <FileText className="h-4 w-4" />, count: 75 },
	{ id: "themes", name: "Themes", icon: <BarChart3 className="h-4 w-4" />, count: 25 },
	{ id: "widgets", name: "Widgets", icon: <BarChart3 className="h-4 w-4" />, count: 45 },
	{ id: "automations", name: "Automations", icon: <Zap className="h-4 w-4" />, count: 60 },
];

// Sample Plugin Data (based on plugin SDK)
const availablePlugins: Plugin[] = [
	{
		id: 1,
		name: "Advanced Invoice Customizer",
		slug: "invoice-customizer",
		description: "Customize invoice templates with advanced styling and branding options",
		longDescription: "Professional invoice customization plugin with drag-and-drop template builder, custom branding, and advanced styling options. Perfect for agencies and consultants.",
		category: "plugins",
		icon: <FileText className="h-6 w-6" />,
		color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
		isActive: false,
		isOfficial: false,
		isVerified: true,
		isBeta: false,
		isPopular: true,
		version: "2.1.0",
		author: {
			name: "DesignStudio Pro",
			avatar: "/avatars/design-studio.png",
			verified: true,
		},
		features: [
			"Drag-and-drop builder",
			"Custom branding",
			"Advanced styling",
			"Template library",
			"Export options",
			"Multi-language support"
		],
		setupSteps: [
			"Install plugin",
			"Configure branding",
			"Select template",
			"Customize styling",
			"Test invoice generation"
		],
		permissions: ["invoice:read", "invoice:write", "template:manage"],
		apiEndpoints: ["/api/plugins/invoice-customizer/templates"],
		webhooks: ["invoice.generated", "template.updated"],
		documentationUrl: "https://docs.financbase.com/plugins/invoice-customizer",
		supportUrl: "https://support.designstudio.com",
		githubUrl: "https://github.com/designstudio/invoice-customizer",
		pricing: {
			free: false,
			price: 29,
			tiers: ["Basic", "Professional", "Enterprise"]
		},
		metrics: {
			installs: 12500,
			rating: 4.8,
			reviews: 234,
			lastUpdated: "2024-01-15",
			compatibility: "Financbase 2.0+"
		},
		tags: ["invoices", "design", "branding", "templates", "popular"],
		screenshots: ["/screenshots/invoice-customizer-1.png", "/screenshots/invoice-customizer-2.png"],
		reviews: [
			{
				user: "Sarah Johnson",
				rating: 5,
				comment: "Amazing customization options! Our invoices look so professional now.",
				date: "2024-01-10"
			}
		]
	},
	{
		id: 2,
		name: "AI Client Insights",
		slug: "ai-client-insights",
		description: "AI-powered client behavior analysis and insights",
		longDescription: "Advanced AI plugin that analyzes client behavior patterns, predicts churn risk, and provides actionable insights for client management.",
		category: "plugins",
		icon: <Brain className="h-6 w-6" />,
		color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
		isActive: false,
		isOfficial: false,
		isVerified: true,
		isBeta: true,
		isPopular: false,
		version: "1.0.0",
		author: {
			name: "AI Analytics Co",
			avatar: "/avatars/ai-analytics.png",
			verified: true,
		},
		features: [
			"Client behavior analysis",
			"Churn prediction",
			"Engagement scoring",
			"Automated insights",
			"Custom reports",
			"Real-time alerts"
		],
		setupSteps: [
			"Install and activate",
			"Configure data sources",
			"Set up AI models",
			"Define insights preferences",
			"Review initial analysis"
		],
		permissions: ["client:read", "analytics:read", "insights:write"],
		apiEndpoints: ["/api/plugins/ai-insights/analyze", "/api/plugins/ai-insights/predict"],
		webhooks: ["client.engagement", "insight.generated", "risk.alert"],
		documentationUrl: "https://docs.ai-analytics.co/financbase",
		supportUrl: "https://support.ai-analytics.co",
		githubUrl: "https://github.com/ai-analytics/client-insights",
		pricing: {
			free: true,
			tiers: ["Free", "Professional", "Enterprise"]
		},
		metrics: {
			installs: 3200,
			rating: 4.6,
			reviews: 89,
			lastUpdated: "2024-01-20",
			compatibility: "Financbase 2.1+"
		},
		tags: ["ai", "insights", "client-management", "predictive", "beta"],
		screenshots: ["/screenshots/ai-insights-1.png", "/screenshots/ai-insights-2.png"],
		reviews: []
	}
];

// Integration data (subset for marketplace display)
const availableIntegrations: Integration[] = [
	{
		id: 1,
		name: "QuickBooks Online",
		slug: "quickbooks",
		description: "Sync your financial data with QuickBooks Online",
		longDescription: "Comprehensive integration with QuickBooks Online for seamless financial data synchronization.",
		category: "integrations",
		icon: <FileText className="h-6 w-6" />,
		color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
		isActive: true,
		isOfficial: true,
		isBeta: false,
		isPopular: true,
		version: "2.1.0",
		features: ["Real-time sync", "Multi-company support", "Custom mapping"],
		setupSteps: ["Connect QuickBooks account", "Configure sync settings"],
		webhooks: ["invoice.created", "payment.received"],
		apiEndpoints: ["/api/quickbooks/sync"],
		documentationUrl: "https://docs.financbase.com/integrations/quickbooks",
		supportUrl: "https://support.financbase.com/quickbooks",
		pricing: {
			free: true,
			tiers: ["Starter", "Professional", "Enterprise"]
		},
		metrics: {
			activeUsers: 15420,
			syncSuccess: 99.2,
			avgSetupTime: "5 minutes"
		},
		tags: ["accounting", "finance", "sync", "popular"]
	}
];

export default function EnhancedMarketplacePage() {
	const [activeTab, setActiveTab] = useState("browse");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState("popular");
	const [itemType, setItemType] = useState<"all" | "integrations" | "plugins" | "templates">("all");

	// Filter and sort items
	const filteredItems = useMemo(() => {
		let items: (Plugin | Integration)[] = [];

		// Add plugins and integrations based on type filter
		if (itemType === "all" || itemType === "plugins") {
			items = [...items, ...availablePlugins];
		}
		if (itemType === "all" || itemType === "integrations") {
			items = [...items, ...availableIntegrations];
		}

		// Filter by search term
		if (searchTerm) {
			items = items.filter(item =>
				item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
			);
		}

		// Filter by category
		if (selectedCategory !== "all") {
			items = items.filter(item => item.category === selectedCategory);
		}

		// Sort items
		switch (sortBy) {
			case "popular":
				items.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
				break;
			case "name":
				items.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case "rating":
				if (itemType === "plugins" || itemType === "all") {
					items.sort((a, b) => (b as Plugin).metrics.rating - (a as Plugin).metrics.rating);
				}
				break;
			case "installs":
				if (itemType === "plugins" || itemType === "all") {
					items.sort((a, b) => (b as Plugin).metrics.installs - (a as Plugin).metrics.installs);
				}
				break;
			case "newest":
				items.sort((a, b) => b.version.localeCompare(a.version));
				break;
		}

		return items;
	}, [searchTerm, selectedCategory, sortBy, itemType]);

	const handleInstall = (item: Plugin | Integration) => {
		// Handle installation logic
		console.log("Installing:", item.name);
	};

	const handleViewDetails = (item: Plugin | Integration) => {
		// Handle view details
		console.log("Viewing details:", item.name);
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Enhanced Header */}
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
								<Store className="h-8 w-8 text-primary" />
								Plugin & Integration Marketplace
							</h1>
							<p className="text-muted-foreground mt-1">
								Discover 200+ plugins, integrations, and templates to extend your Financbase experience
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">
								<Code className="h-4 w-4 mr-2" />
								Developer Portal
							</Button>
							<Button size="sm">
								<Plus className="h-4 w-4 mr-2" />
								Submit Plugin
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-6">
				{/* Category Overview */}
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
					{marketplaceCategories.map((category) => (
						<Card
							key={category.id}
							className={cn(
								"cursor-pointer hover:shadow-md transition-all duration-200",
								selectedCategory === category.id && "ring-2 ring-primary"
							)}
							onClick={() => setSelectedCategory(category.id)}
						>
							<CardContent className="p-4 text-center">
								<div className="flex flex-col items-center gap-2">
									<div className="p-2 rounded-lg bg-muted">
										{category.icon}
									</div>
									<div>
										<p className="text-sm font-medium">{category.name}</p>
										<p className="text-xs text-muted-foreground">{category.count} items</p>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Search and Filters */}
				<div className="flex flex-col sm:flex-row gap-4 mb-6">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search marketplace..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Select value={itemType} onValueChange={(value: any) => setItemType(value)}>
						<SelectTrigger className="w-48">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Items</SelectItem>
							<SelectItem value="integrations">Integrations</SelectItem>
							<SelectItem value="plugins">Plugins</SelectItem>
							<SelectItem value="templates">Templates</SelectItem>
						</SelectContent>
					</Select>
					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger className="w-48">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="popular">Most Popular</SelectItem>
							<SelectItem value="name">Name</SelectItem>
							<SelectItem value="rating">Highest Rated</SelectItem>
							<SelectItem value="installs">Most Installed</SelectItem>
							<SelectItem value="newest">Newest</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Main Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-5">
						<TabsTrigger value="browse">Browse</TabsTrigger>
						<TabsTrigger value="installed">Installed</TabsTrigger>
						<TabsTrigger value="developer">Developer</TabsTrigger>
						<TabsTrigger value="analytics">Analytics</TabsTrigger>
						<TabsTrigger value="support">Support</TabsTrigger>
					</TabsList>

					{/* Browse Tab */}
					<TabsContent value="browse" className="space-y-6">
						{/* Item Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<AnimatePresence>
								{filteredItems.map((item, index) => (
									<motion.div
										key={`${item.category}-${item.id}`}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.2, delay: index * 0.1 }}
									>
										<MarketplaceCard
											item={item}
											onInstall={() => handleInstall(item)}
											onViewDetails={() => handleViewDetails(item)}
										/>
									</motion.div>
								))}
							</AnimatePresence>
						</div>

						{/* Marketplace Stats */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
							<Card>
								<CardContent className="p-4">
									<div className="flex items-center gap-2">
										<Package className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="text-2xl font-bold">200+</p>
											<p className="text-sm text-muted-foreground">Available Items</p>
										</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4">
									<div className="flex items-center gap-2">
										<Users className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="text-2xl font-bold">50K+</p>
											<p className="text-sm text-muted-foreground">Active Users</p>
										</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4">
									<div className="flex items-center gap-2">
										<Star className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="text-2xl font-bold">4.8</p>
											<p className="text-sm text-muted-foreground">Avg Rating</p>
										</div>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-4">
									<div className="flex items-center gap-2">
										<Shield className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="text-2xl font-bold">100%</p>
											<p className="text-sm text-muted-foreground">Verified</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* Installed Tab */}
					<TabsContent value="installed" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Installed Plugins & Integrations</CardTitle>
								<CardDescription>
									Manage your active plugins and integrations
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{availablePlugins.filter(p => p.isActive).map((plugin) => (
										<div key={plugin.id} className="flex items-center justify-between p-4 border rounded-lg">
											<div className="flex items-center gap-3">
												<div className={cn("p-2 rounded-lg", plugin.color.replace("text-", "bg-").replace("800", "100"))}>
													{plugin.icon}
												</div>
												<div>
													<h4 className="font-medium">{plugin.name}</h4>
													<p className="text-sm text-muted-foreground">v{plugin.version} • {plugin.author.name}</p>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Badge variant="outline" className="text-xs">
													<Activity className="h-3 w-3 mr-1" />
													Active
												</Badge>
												<Button variant="outline" size="sm">
													<Settings className="h-4 w-4 mr-2" />
													Configure
												</Button>
											</div>
										</div>
									))}
									{availablePlugins.filter(p => p.isActive).length === 0 && (
										<div className="text-center py-8 text-muted-foreground">
											<Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
											<h3 className="text-lg font-semibold mb-2">No plugins installed</h3>
											<p>Browse the marketplace to find plugins that enhance your workflow</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Developer Tab */}
					<TabsContent value="developer" className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Code className="h-5 w-5" />
										Plugin SDK
									</CardTitle>
									<CardDescription>
										Build custom plugins for Financbase
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<Button variant="outline" className="w-full justify-start">
											<BookOpen className="h-4 w-4 mr-2" />
											Documentation
										</Button>
										<Button variant="outline" className="w-full justify-start">
											<Github className="h-4 w-4 mr-2" />
											GitHub Repository
										</Button>
										<Button variant="outline" className="w-full justify-start">
											<Key className="h-4 w-4 mr-2" />
											API Reference
										</Button>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Webhook className="h-4 w-4" />
										Webhook Testing
									</CardTitle>
									<CardDescription>
										Test and debug webhook integrations
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<Button variant="outline" className="w-full justify-start">
											<Play className="h-4 w-4 mr-2" />
											Send Test Webhook
										</Button>
										<Button variant="outline" className="w-full justify-start">
											<Eye className="h-4 w-4 mr-2" />
											Webhook Logs
										</Button>
										<Button variant="outline" className="w-full justify-start">
											<RefreshCw className="h-4 w-4 mr-2" />
											Retry Failed
										</Button>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Package className="h-4 w-4" />
										Your Plugins
									</CardTitle>
									<CardDescription>
										Manage plugins you've developed
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<Button className="w-full justify-start">
											<Plus className="h-4 w-4 mr-2" />
											Submit New Plugin
										</Button>
										<Button variant="outline" className="w-full justify-start">
											<BarChart3 className="h-4 w-4 mr-2" />
											Plugin Analytics
										</Button>
										<Button variant="outline" className="w-full justify-start">
											<Users className="h-4 w-4 mr-2" />
											Support Requests
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* Analytics Tab */}
					<TabsContent value="analytics" className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<Card>
								<CardHeader>
									<CardTitle>Marketplace Performance</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex justify-between">
											<span>Total Downloads</span>
											<span className="font-medium">2.5M+</span>
										</div>
										<div className="flex justify-between">
											<span>Active Installations</span>
											<span className="font-medium">150K+</span>
										</div>
										<div className="flex justify-between">
											<span>Avg Rating</span>
											<span className="font-medium">4.8/5</span>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Popular Categories</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span>Plugins</span>
											<span className="font-medium">45%</span>
										</div>
										<div className="flex justify-between">
											<span>Integrations</span>
											<span className="font-medium">35%</span>
										</div>
										<div className="flex justify-between">
											<span>Templates</span>
											<span className="font-medium">20%</span>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Developer Stats</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex justify-between">
											<span>Verified Developers</span>
											<span className="font-medium">250+</span>
										</div>
										<div className="flex justify-between">
											<span>SDK Downloads</span>
											<span className="font-medium">10K+</span>
										</div>
										<div className="flex justify-between">
											<span>API Calls</span>
											<span className="font-medium">1M+/day</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* Support Tab */}
					<TabsContent value="support" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Plugin & Integration Support</CardTitle>
								<CardDescription>
									Get help with marketplace items and development
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<h4 className="font-medium mb-3">For Users</h4>
										<div className="space-y-2">
											<Button variant="outline" className="w-full justify-start">
												<BookOpen className="h-4 w-4 mr-2" />
												User Documentation
											</Button>
											<Button variant="outline" className="w-full justify-start">
												<Users className="h-4 w-4 mr-2" />
												Community Forum
											</Button>
											<Button variant="outline" className="w-full justify-start">
												<Activity className="h-4 w-4 mr-2" />
												Support Tickets
											</Button>
										</div>
									</div>
									<div>
										<h4 className="font-medium mb-3">For Developers</h4>
										<div className="space-y-2">
											<Button variant="outline" className="w-full justify-start">
												<Code className="h-4 w-4 mr-2" />
												Developer Docs
											</Button>
											<Button variant="outline" className="w-full justify-start">
												<Github className="h-4 w-4 mr-2" />
												GitHub Issues
											</Button>
											<Button variant="outline" className="w-full justify-start">
												<Webhook className="h-4 w-4 mr-2" />
												API Support
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

// Enhanced Marketplace Card Component
interface MarketplaceCardProps {
	item: Plugin | Integration;
	onInstall: () => void;
	onViewDetails: () => void;
}

function MarketplaceCard({ item, onInstall, onViewDetails }: MarketplaceCardProps) {
	const isPlugin = "author" in item;
	const plugin = item as Plugin;

	return (
		<Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div className={cn("p-2 rounded-lg", item.color.replace("text-", "bg-").replace("800", "100").replace("300", "900"))}>
							{item.icon}
						</div>
						<div>
							<CardTitle className="text-lg flex items-center gap-2">
								{item.name}
								{item.isPopular && (
									<Badge variant="secondary" className="text-xs">
										<Star className="h-3 w-3 mr-1" />
										Popular
									</Badge>
								)}
								{isPlugin && plugin.isBeta && (
									<Badge variant="outline" className="text-xs">
										Beta
									</Badge>
								)}
								{isPlugin && plugin.author.verified && (
									<Badge variant="outline" className="text-xs">
										<CheckCircle className="h-3 w-3 mr-1" />
										Verified
									</Badge>
								)}
							</CardTitle>
							<CardDescription className="text-sm">
								{item.description}
							</CardDescription>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Features */}
				<div>
					<h4 className="text-sm font-medium mb-2">Key Features</h4>
					<div className="flex flex-wrap gap-1">
						{item.features.slice(0, 3).map((feature) => (
							<Badge key={feature} variant="outline" className="text-xs">
								{feature}
							</Badge>
						))}
						{item.features.length > 3 && (
							<Badge variant="outline" className="text-xs">
								+{item.features.length - 3} more
							</Badge>
						)}
					</div>
				</div>

				{/* Metrics */}
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					{isPlugin ? (
						<>
							<div className="flex items-center gap-1">
								<Users className="h-4 w-4" />
								{plugin.metrics.installs.toLocaleString()} installs
							</div>
							<div className="flex items-center gap-1">
								<Star className="h-4 w-4 text-yellow-500" />
								{plugin.metrics.rating.toFixed(1)} ({plugin.metrics.reviews})
							</div>
						</>
					) : (
						<>
							<div className="flex items-center gap-1">
								<Users className="h-4 w-4" />
								{(item as Integration).metrics.activeUsers.toLocaleString()} users
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle className="h-4 w-4 text-green-600" />
								{(item as Integration).metrics.syncSuccess}% success
							</div>
						</>
					)}
				</div>

				{/* Pricing */}
				{isPlugin && plugin.pricing && (
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{plugin.pricing.free ? (
								<Badge className="text-xs">Free</Badge>
							) : (
								<div className="flex items-center gap-1">
									<span className="text-lg font-bold">${plugin.pricing.price}</span>
									<span className="text-sm text-muted-foreground">/month</span>
								</div>
							)}
						</div>
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							<Clock className="h-3 w-3" />
							Updated {new Date(plugin.metrics.lastUpdated).toLocaleDateString()}
						</div>
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex gap-2">
					<Button onClick={onInstall} className="flex-1" disabled={!item.isActive}>
						{item.isActive ? (
							<>
								<Plus className="h-4 w-4 mr-2" />
								{isPlugin ? "Install" : "Connect"}
							</>
						) : (
							<>
								<Clock className="h-4 w-4 mr-2" />
								{isPlugin ? "Not Available" : "Unavailable"}
							</>
						)}
					</Button>
					<Button variant="outline" onClick={onViewDetails}>
						<Eye className="h-4 w-4" />
					</Button>
					{isPlugin && plugin.githubUrl && (
						<Button variant="outline" asChild>
							<a href={plugin.githubUrl} target="_blank" rel="noopener noreferrer">
								<Github className="h-4 w-4" />
							</a>
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
