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
	HelpCircle,
	Search,
	BookOpen,
	MessageSquare,
	Video,
	Phone,
	Mail,
	Users,
	Clock,
	Star,
	ThumbsUp,
	Download,
	ExternalLink,
	ChevronRight,
	Lightbulb,
	AlertTriangle,
	CheckCircle,
	Settings,
	Receipt,
	BarChart3,
	Brain,
	CreditCard,
	Link,
	Eye,
	Bookmark,
	Share2
} from "lucide-react";

export const metadata: Metadata = {
	title: "Help & Support | Financbase",
	description: "Get help, access documentation, and connect with our support team",
};

const helpStats = [
	{
		name: "Support Tickets",
		value: "23",
		change: "-15%",
		changeType: "positive",
		icon: MessageSquare,
	},
	{
		name: "Avg Response Time",
		value: "2.4h",
		change: "-0.8h",
		changeType: "positive",
		icon: Clock,
	},
	{
		name: "Help Articles",
		value: "156",
		change: "+12",
		changeType: "positive",
		icon: BookOpen,
	},
	{
		name: "User Satisfaction",
		value: "4.8/5",
		change: "+0.2",
		changeType: "positive",
		icon: Star,
	},
];

const popularTopics = [
	{
		title: "Getting Started",
		description: "Learn the basics of using Financbase",
		articles: 12,
		icon: BookOpen,
		category: "basics",
	},
	{
		title: "Transaction Management",
		description: "Import, categorize, and manage transactions",
		articles: 18,
		icon: Receipt,
		category: "transactions",
	},
	{
		title: "Reporting & Analytics",
		description: "Create reports and analyze your data",
		articles: 15,
		icon: BarChart3,
		category: "reports",
	},
	{
		title: "AI Features",
		description: "Use AI for automation and insights",
		articles: 8,
		icon: Brain,
		category: "ai",
	},
	{
		title: "Billing & Pricing",
		description: "Manage your subscription and billing",
		articles: 6,
		icon: CreditCard,
		category: "billing",
	},
	{
		title: "API & Integrations",
		description: "Connect with other tools and services",
		articles: 10,
		icon: Link,
		category: "integrations",
	},
];

const recentArticles = [
	{
		title: "How to Set Up Multi-Company Support",
		category: "Setup",
		views: 234,
		helpful: 89,
		lastUpdated: "2025-01-15",
	},
	{
		title: "Understanding AI Categorization Accuracy",
		category: "AI Features",
		views: 456,
		helpful: 92,
		lastUpdated: "2025-01-12",
	},
	{
		title: "Exporting Data for Tax Preparation",
		category: "Reports",
		views: 189,
		helpful: 87,
		lastUpdated: "2025-01-10",
	},
	{
		title: "Troubleshooting Bank Connection Issues",
		category: "Integrations",
		views: 312,
		helpful: 94,
		lastUpdated: "2025-01-08",
	},
];

const supportOptions = [
	{
		title: "Live Chat",
		description: "Get instant help from our support team",
		available: "24/7",
		responseTime: "2 minutes",
		icon: MessageSquare,
		action: "Start Chat",
		primary: true,
	},
	{
		title: "Email Support",
		description: "Send us a detailed message",
		available: "Business hours",
		responseTime: "4 hours",
		icon: Mail,
		action: "Send Email",
		primary: false,
	},
	{
		title: "Phone Support",
		description: "Speak with a support specialist",
		available: "Mon-Fri 9AM-6PM EST",
		responseTime: "Immediate",
		icon: Phone,
		action: "Call Now",
		primary: false,
	},
	{
		title: "Video Tutorials",
		description: "Watch step-by-step guides",
		available: "On-demand",
		responseTime: "Instant",
		icon: Video,
		action: "Watch Videos",
		primary: false,
	},
];

const quickActions = [
	{
		title: "Contact Support",
		description: "Get help with your issue",
		icon: MessageSquare,
		action: "Open Ticket",
	},
	{
		title: "Browse Documentation",
		description: "Find detailed guides",
		icon: BookOpen,
		action: "View Docs",
	},
	{
		title: "Watch Tutorials",
		description: "Learn with video guides",
		icon: Video,
		action: "View Tutorials",
	},
	{
		title: "Community Forum",
		description: "Connect with other users",
		icon: Users,
		action: "Visit Forum",
	},
];

export default function HelpPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
					<p className="text-muted-foreground">
						Get help, access documentation, and connect with our support team
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Search className="h-4 w-4 mr-2" />
						Search Help
					</Button>
					<Button>
						<MessageSquare className="h-4 w-4 mr-2" />
						Contact Support
					</Button>
				</div>
			</div>

			{/* Support Stats */}
			<div className="grid gap-4 md:grid-cols-4">
				{helpStats.map((stat, index) => (
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

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
					<CardDescription>
						Common help resources and support options
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{quickActions.map((action, index) => (
							<div key={action.title} className="p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors">
								<div className="flex items-center gap-2 mb-2">
									<action.icon className="h-5 w-5" />
									<h4 className="font-medium">{action.title}</h4>
								</div>
								<p className="text-sm text-muted-foreground mb-3">{action.description}</p>
								<Button size="sm" className="w-full">
									{action.action}
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Support Options */}
			<Card>
				<CardHeader>
					<CardTitle>Get Support</CardTitle>
					<CardDescription>
						Choose how you'd like to get help
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						{supportOptions.map((option, index) => (
							<div key={option.title} className={`p-4 border rounded-lg ${option.primary ? 'border-primary bg-primary/5' : ''}`}>
								<div className="flex items-center gap-3 mb-3">
									<option.icon className={`h-5 w-5 ${option.primary ? 'text-primary' : ''}`} />
									<h4 className="font-medium">{option.title}</h4>
									{option.primary && <Badge>Recommended</Badge>}
								</div>
								<p className="text-sm text-muted-foreground mb-2">{option.description}</p>
								<div className="space-y-1 text-sm">
									<div className="flex items-center gap-2">
										<Clock className="h-3 w-3" />
										<span>Available: {option.available}</span>
									</div>
									<div className="flex items-center gap-2">
										<span>Response: {option.responseTime}</span>
									</div>
								</div>
								<Button className={`w-full mt-3 ${option.primary ? '' : 'variant-outline'}`}>
									{option.action}
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Help Content */}
			<Tabs defaultValue="topics" className="space-y-4">
				<TabsList>
					<TabsTrigger value="topics">Help Topics</TabsTrigger>
					<TabsTrigger value="articles">Popular Articles</TabsTrigger>
					<TabsTrigger value="tutorials">Tutorials</TabsTrigger>
					<TabsTrigger value="community">Community</TabsTrigger>
				</TabsList>

				<TabsContent value="topics" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Popular Help Topics</CardTitle>
							<CardDescription>
								Find answers to commonly asked questions
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{popularTopics.map((topic, index) => (
									<div key={topic.title} className="p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors">
										<div className="flex items-center gap-2 mb-2">
											<topic.icon className="h-5 w-5" />
											<h4 className="font-medium">{topic.title}</h4>
											<Badge variant="secondary">{topic.articles} articles</Badge>
										</div>
										<p className="text-sm text-muted-foreground mb-3">{topic.description}</p>
										<Button variant="outline" size="sm" className="w-full">
											View Articles
											<ChevronRight className="h-3 w-3 ml-1" />
										</Button>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="articles" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Popular Articles</CardTitle>
							<CardDescription>
								Most viewed and helpful articles
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recentArticles.map((article, index) => (
									<div key={article.title} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{article.title}</h4>
												<Badge variant="outline">{article.category}</Badge>
											</div>
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<div className="flex items-center gap-1">
													<Eye className="h-3 w-3" />
													{article.views} views
												</div>
												<div className="flex items-center gap-1">
													<ThumbsUp className="h-3 w-3" />
													{article.helpful}% helpful
												</div>
												<div className="flex items-center gap-1">
													<Clock className="h-3 w-3" />
													Updated {article.lastUpdated}
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
											<Button variant="outline" size="sm">
												<Share2 className="h-3 w-3" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="tutorials" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Video Tutorials</CardTitle>
							<CardDescription>
								Step-by-step video guides to help you get started
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="text-center py-8 text-muted-foreground">
									<Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<h3 className="font-medium mb-2">Video Tutorial Library</h3>
									<p className="text-sm mb-4">
										Comprehensive video tutorials covering all features and use cases
									</p>
									<Button variant="outline">
										<Video className="h-4 w-4 mr-2" />
										Browse Tutorials
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="community" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Community Forum</CardTitle>
							<CardDescription>
								Connect with other users and share knowledge
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="text-center py-8 text-muted-foreground">
									<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<h3 className="font-medium mb-2">Community Forum</h3>
									<p className="text-sm mb-4">
										Join discussions, ask questions, and share tips with other Financbase users
									</p>
									<Button variant="outline">
										<Users className="h-4 w-4 mr-2" />
										Visit Community
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
