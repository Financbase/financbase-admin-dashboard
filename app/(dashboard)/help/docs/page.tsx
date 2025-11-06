/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
	BookOpen,
	Search,
	Download,
	ExternalLink,
	ChevronRight,
	Clock,
	User,
	Star,
	ThumbsUp,
	FileText,
	Video,
	Code,
	Settings,
	Shield,
	Users,
	BarChart3,
	Brain,
	Workflow
} from "lucide-react";

export const metadata: Metadata = {
	title: "Documentation | Financbase",
	description: "Comprehensive guides, API documentation, and developer resources",
};

const docStats = [
	{
		name: "Documentation Pages",
		value: "156",
		change: "+12",
		changeType: "positive",
		icon: BookOpen,
	},
	{
		name: "API Endpoints",
		value: "89",
		change: "+8",
		changeType: "positive",
		icon: Code,
	},
	{
		name: "Video Tutorials",
		value: "34",
		change: "+5",
		changeType: "positive",
		icon: Video,
	},
	{
		name: "User Guides",
		value: "23",
		change: "+3",
		changeType: "positive",
		icon: FileText,
	},
];

const docCategories = [
	{
		name: "Getting Started",
		description: "Learn the basics of using Financbase",
		articles: 12,
		icon: BookOpen,
		color: "bg-blue-500",
		sections: ["Quick Start", "Account Setup", "First Transaction", "Dashboard Overview"],
	},
	{
		name: "API Documentation",
		description: "Complete API reference and integration guides",
		articles: 45,
		icon: Code,
		color: "bg-green-500",
		sections: ["Authentication", "Endpoints", "Webhooks", "SDKs"],
	},
	{
		name: "Advanced Features",
		description: "Deep dive into advanced functionality",
		articles: 28,
		icon: Settings,
		color: "bg-purple-500",
		sections: ["AI Features", "Automation", "Analytics", "Integrations"],
	},
	{
		name: "Business Management",
		description: "Manage your business operations effectively",
		articles: 31,
		icon: BarChart3,
		color: "bg-orange-500",
		sections: ["Financial Planning", "Team Management", "Reporting", "Compliance"],
	},
	{
		name: "Security & Compliance",
		description: "Security best practices and compliance guides",
		articles: 15,
		icon: Shield,
		color: "bg-red-500",
		sections: ["Data Security", "Access Control", "Audit Logs", "GDPR Compliance"],
	},
	{
		name: "Troubleshooting",
		description: "Solve common issues and get help",
		articles: 25,
		icon: Users,
		color: "bg-gray-500",
		sections: ["Common Issues", "Error Messages", "Performance", "Support"],
	},
];

const featuredGuides = [
	{
		title: "Complete Setup Guide",
		description: "Step-by-step guide to get started with Financbase",
		readTime: "15 min read",
		views: 1247,
		rating: 4.9,
		category: "Getting Started",
		updated: "2025-01-15",
		featured: true,
	},
	{
		title: "API Integration Guide",
		description: "Integrate Financbase with your existing systems",
		readTime: "25 min read",
		views: 892,
		rating: 4.8,
		category: "API Documentation",
		updated: "2025-01-12",
		featured: true,
	},
	{
		title: "Advanced Analytics",
		description: "Master advanced reporting and analytics features",
		readTime: "20 min read",
		views: 634,
		rating: 4.7,
		category: "Advanced Features",
		updated: "2025-01-10",
		featured: false,
	},
	{
		title: "Security Best Practices",
		description: "Ensure your data security and compliance",
		readTime: "18 min read",
		views: 445,
		rating: 4.9,
		category: "Security",
		updated: "2025-01-08",
		featured: false,
	},
];

const quickLinks = [
	{
		title: "API Reference",
		description: "Complete API documentation",
		icon: Code,
		href: "/docs/api",
	},
	{
		title: "Video Tutorials",
		description: "Step-by-step video guides",
		icon: Video,
		href: "/tutorials",
	},
	{
		title: "Community Forum",
		description: "Connect with other users",
		icon: Users,
		href: "/community",
	},
	{
		title: "Download SDK",
		description: "Development kits and tools",
		icon: Download,
		href: "/developers/sdk",
	},
	{
		title: "Status Page",
		description: "System status and updates",
		icon: Shield,
		href: "/status",
	},
	{
		title: "What's New",
		description: "Latest features and updates",
		icon: Star,
		href: "/updates",
	},
];

const popularArticles = [
	{
		title: "How to Import Transactions",
		views: 2341,
		helpful: 94,
		category: "Getting Started",
	},
	{
		title: "Understanding AI Categorization",
		views: 1823,
		helpful: 89,
		category: "AI Features",
	},
	{
		title: "Setting Up Multi-Company Support",
		views: 1456,
		helpful: 92,
		category: "Advanced Features",
	},
	{
		title: "Exporting Data for Tax Filing",
		views: 987,
		helpful: 87,
		category: "Business Management",
	},
	{
		title: "API Authentication Methods",
		views: 756,
		helpful: 95,
		category: "API Documentation",
	},
];

export default function DocsPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
					<p className="text-muted-foreground">
						Comprehensive guides, API documentation, and developer resources
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Search className="h-4 w-4 mr-2" />
						Search Docs
					</Button>
					<Button>
						<Download className="h-4 w-4 mr-2" />
						Download All
					</Button>
				</div>
			</div>

			{/* Documentation Stats */}
			<div className="grid gap-4 md:grid-cols-4">
				{docStats.map((stat, index) => (
					<Card key={stat.name}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
							<stat.icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
								{stat.change} from last month
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Quick Links */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Links</CardTitle>
					<CardDescription>
						Popular resources and frequently accessed documentation
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
						{quickLinks.map((link, index) => (
							<div key={link.title} className="p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors">
								<div className="flex items-center gap-2 mb-2">
									<link.icon className="h-5 w-5" />
									<h4 className="font-medium">{link.title}</h4>
								</div>
								<p className="text-sm text-muted-foreground mb-3">{link.description}</p>
								<Button variant="outline" size="sm" className="w-full">
									<ExternalLink className="h-3 w-3 mr-1" />
									Visit
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Documentation Categories */}
			<Card>
				<CardHeader>
					<CardTitle>Documentation Categories</CardTitle>
					<CardDescription>
						Explore documentation by topic and area of interest
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{docCategories.map((category, index) => (
							<Card key={category.name} className="cursor-pointer hover:shadow-md transition-shadow">
								<CardHeader className="pb-3">
									<div className="flex items-center gap-2">
										<div className={`w-3 h-3 rounded-full ${category.color}`} />
										<category.icon className="h-5 w-5" />
										<CardTitle className="text-lg">{category.name}</CardTitle>
									</div>
									<CardDescription>{category.description}</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Articles</span>
										<span className="font-medium">{category.articles}</span>
									</div>
									<div className="space-y-1">
										{category.sections.map((section, sectionIndex) => (
											<div key={sectionIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
												<ChevronRight className="h-3 w-3" />
												{section}
											</div>
										))}
									</div>
									<Button variant="outline" size="sm" className="w-full">
										Explore Category
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Featured Guides */}
			<Tabs defaultValue="featured" className="space-y-4">
				<TabsList>
					<TabsTrigger value="featured">Featured Guides</TabsTrigger>
					<TabsTrigger value="popular">Popular Articles</TabsTrigger>
					<TabsTrigger value="recent">Recently Updated</TabsTrigger>
					<TabsTrigger value="api">API Documentation</TabsTrigger>
				</TabsList>

				<TabsContent value="featured" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Featured Guides</CardTitle>
							<CardDescription>
								Most important and frequently accessed documentation
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{featuredGuides.map((guide, index) => (
									<div key={guide.title} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{guide.title}</h4>
												{guide.featured && <Badge>Featured</Badge>}
												<Badge variant="outline">{guide.category}</Badge>
											</div>
											<p className="text-sm text-muted-foreground">{guide.description}</p>
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<div className="flex items-center gap-1">
													<Clock className="h-3 w-3" />
													{guide.readTime}
												</div>
												<div className="flex items-center gap-1">
													<User className="h-3 w-3" />
													{guide.views} views
												</div>
												<div className="flex items-center gap-1">
													<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
													{guide.rating}
												</div>
												<div className="flex items-center gap-1">
													<Clock className="h-3 w-3" />
													Updated {guide.updated}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button variant="outline" size="sm">
												<BookOpen className="h-3 w-3 mr-1" />
												Read
											</Button>
											<Button variant="outline" size="sm">
												<Download className="h-3 w-3 mr-1" />
												Download
											</Button>
											<Button variant="outline" size="sm">
												<ExternalLink className="h-3 w-3" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="popular" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Popular Articles</CardTitle>
							<CardDescription>
								Most viewed and helpful documentation
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{popularArticles.map((article, index) => (
									<div key={article.title} className="flex items-center justify-between p-3 border rounded-lg">
										<div className="space-y-1">
											<h4 className="font-medium">{article.title}</h4>
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Badge variant="outline">{article.category}</Badge>
												<div className="flex items-center gap-1">
													<User className="h-3 w-3" />
													{article.views} views
												</div>
												<div className="flex items-center gap-1">
													<ThumbsUp className="h-3 w-3" />
													{article.helpful}% helpful
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button variant="outline" size="sm">
												<Eye className="h-3 w-3 mr-1" />
												Read
											</Button>
											<Button variant="outline" size="sm">
												<Bookmark className="h-3 w-3 mr-1" />
												Save
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="recent" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Recently Updated</CardTitle>
							<CardDescription>
								Latest updates and new documentation
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="text-center py-8 text-muted-foreground">
									<BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<h3 className="font-medium mb-2">Recently Updated Articles</h3>
									<p className="text-sm mb-4">
										Latest documentation updates and new guides
									</p>
									<Button variant="outline">
										<BookOpen className="h-4 w-4 mr-2" />
										View Recent Updates
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="api" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>API Documentation</CardTitle>
							<CardDescription>
								Complete API reference and integration guides
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2">
									<div className="p-4 border rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<Code className="h-5 w-5" />
											<h4 className="font-medium">REST API Reference</h4>
										</div>
										<p className="text-sm text-muted-foreground mb-3">
											Complete REST API documentation with examples
										</p>
										<Button size="sm" className="w-full">
											View API Docs
										</Button>
									</div>
									<div className="p-4 border rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<Settings className="h-5 w-5" />
											<h4 className="font-medium">Webhook Guide</h4>
										</div>
										<p className="text-sm text-muted-foreground mb-3">
											Set up webhooks for real-time data sync
										</p>
										<Button size="sm" className="w-full" variant="outline">
											View Guide
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
