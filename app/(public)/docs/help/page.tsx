"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
	ArrowRight,
	BookOpen,
	HelpCircle,
	Search,
	Settings,
	Shield,
	Users,
	MessageSquare,
	Phone,
	Mail,
	ExternalLink,
	ChevronRight,
	AlertCircle,
	CheckCircle,
	Info,
	Lightbulb,
} from "lucide-react";

// Help categories data
const helpCategories = [
	{
		title: "Getting Started",
		description: "New to Financbase? Start here",
		icon: BookOpen,
		color: "bg-blue-500",
		articles: [
			{
				title: "Quick Start Guide",
				description: "Get up and running in 5 minutes",
				href: "/docs/help/getting-started",
				type: "guide",
				difficulty: "beginner",
			},
			{
				title: "Account Setup",
				description: "Configure your organization and users",
				href: "/docs/help/account-setup",
				type: "guide",
				difficulty: "beginner",
			},
			{
				title: "Dashboard Overview",
				description: "Understanding your financial dashboard",
				href: "/docs/help/dashboard",
				type: "guide",
				difficulty: "beginner",
			},
		],
	},
	{
		title: "Account & Billing",
		description: "Manage your subscription and payment",
		icon: Users,
		color: "bg-green-500",
		articles: [
			{
				title: "Subscription Plans",
				description: "Compare features and pricing",
				href: "/pricing",
				type: "info",
				difficulty: "beginner",
			},
			{
				title: "Billing & Invoices",
				description: "Manage payments and download receipts",
				href: "/docs/help/billing",
				type: "guide",
				difficulty: "intermediate",
			},
			{
				title: "Cancel Subscription",
				description: "How to cancel your account",
				href: "/docs/help/cancel",
				type: "guide",
				difficulty: "beginner",
			},
		],
	},
	{
		title: "API & Integration",
		description: "Connect with third-party services",
		icon: Settings,
		color: "bg-purple-500",
		articles: [
			{
				title: "API Overview",
				description: "Complete API reference and guides",
				href: "/docs/api",
				type: "reference",
				difficulty: "advanced",
			},
			{
				title: "Webhook Configuration",
				description: "Set up real-time notifications",
				href: "/docs/help/webhooks",
				type: "guide",
				difficulty: "advanced",
			},
			{
				title: "Third-party Integrations",
				description: "Connect with popular tools",
				href: "/docs/integrations",
				type: "guide",
				difficulty: "intermediate",
			},
		],
	},
	{
		title: "Security & Privacy",
		description: "Data protection and compliance",
		icon: Shield,
		color: "bg-red-500",
		articles: [
			{
				title: "Security Overview",
				description: "How we protect your data",
				href: "/docs/security",
				type: "info",
				difficulty: "beginner",
			},
			{
				title: "Data Privacy",
				description: "GDPR and privacy compliance",
				href: "/privacy",
				type: "info",
				difficulty: "intermediate",
			},
			{
				title: "Account Security",
				description: "Best practices for account protection",
				href: "/docs/help/security",
				type: "guide",
				difficulty: "intermediate",
			},
		],
	},
];

// FAQ data
const faqData = [
	{
		question: "How do I get started with Financbase?",
		answer: "Getting started is easy! Simply sign up for an account, complete the onboarding process, and you'll have access to your financial dashboard. We recommend starting with our Quick Start Guide for step-by-step instructions.",
		category: "Getting Started",
	},
	{
		question: "What payment methods do you accept?",
		answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise accounts. All payments are processed securely through Stripe.",
		category: "Billing",
	},
	{
		question: "Can I export my data?",
		answer: "Yes! You can export your financial data in multiple formats including CSV, Excel, and PDF. Go to Settings > Export Data to download your information anytime.",
		category: "Data",
	},
	{
		question: "How secure is my financial data?",
		answer: "We take security seriously. All data is encrypted in transit and at rest, we use SOC 2 compliant infrastructure, and follow industry best practices for data protection. Learn more in our Security Overview.",
		category: "Security",
	},
	{
		question: "Do you offer refunds?",
		answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team within 30 days for a full refund.",
		category: "Billing",
	},
	{
		question: "How do I contact support?",
		answer: "You can reach our support team through multiple channels: live chat (available 24/7), email support, or by creating a support ticket. Premium subscribers get priority support.",
		category: "Support",
	},
];

// Support options
const supportOptions = [
	{
		title: "Live Chat",
		description: "Get instant help from our support team",
		icon: MessageSquare,
		action: "Start Chat",
		available: "24/7",
		priority: "high",
	},
	{
		title: "Email Support",
		description: "Send us a detailed message",
		icon: Mail,
		action: "Send Email",
		available: "Business hours",
		priority: "medium",
	},
	{
		title: "Phone Support",
		description: "Speak directly with our experts",
		icon: Phone,
		action: "Call Now",
		available: "Business hours",
		priority: "high",
	},
	{
		title: "Community Forum",
		description: "Connect with other Financbase users",
		icon: Users,
		action: "Visit Forum",
		available: "Always",
		priority: "low",
	},
];

export default function HelpPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto text-center">
						<div className="flex items-center justify-center gap-2 mb-4">
							<HelpCircle className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								Help Center
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							How can we help you today?
						</h1>
						<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
							Find answers to common questions, browse our guides, or get in touch
							with our support team.
						</p>

						{/* Search Form */}
						<form
							className="relative max-w-2xl mx-auto"
							action="/docs/help"
							method="GET"
						>
							<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
							<Input
								type="text"
								name="search"
								placeholder="Search for help..."
								className="pl-12 pr-4 py-3 text-lg"
							/>
							<Button
								type="submit"
								className="absolute right-2 top-1/2 transform -translate-y-1/2"
							>
								Search
							</Button>
						</form>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
					<Tabs defaultValue="categories" className="space-y-8">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="categories">Browse Topics</TabsTrigger>
							<TabsTrigger value="faq">FAQ</TabsTrigger>
							<TabsTrigger value="support">Contact Support</TabsTrigger>
						</TabsList>

						{/* Categories Tab */}
						<TabsContent value="categories" className="space-y-8">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
								{helpCategories.map((category) => (
									<Card
										key={category.title}
										className="group hover:shadow-lg transition-all duration-200"
									>
										<CardHeader>
											<div className="flex items-center gap-3 mb-2">
												<div
													className={`p-2 rounded-lg ${category.color} text-white`}
												>
													<category.icon className="h-5 w-5" />
												</div>
												<h3 className="text-xl font-semibold">
													{category.title}
												</h3>
											</div>
											<p className="text-muted-foreground">
												{category.description}
											</p>
										</CardHeader>
										<CardContent>
											<div className="space-y-3">
												{category.articles.map((article) => (
													<Link
														key={article.title}
														href={article.href}
														className="block"
													>
														<div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
															<div className="flex-1">
																<div className="flex items-center gap-2 mb-1">
																	<h4 className="font-medium group-hover:text-primary transition-colors">
																		{article.title}
																	</h4>
																	<Badge
																		variant={
																			article.difficulty === "beginner"
																				? "default"
																				: article.difficulty === "intermediate"
																				? "secondary"
																				: "outline"
																		}
																		className="text-xs"
																	>
																		{article.difficulty}
																	</Badge>
																</div>
																<p className="text-sm text-muted-foreground">
																	{article.description}
																</p>
															</div>
															<ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
														</div>
													</Link>
												))}
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</TabsContent>

						{/* FAQ Tab */}
						<TabsContent value="faq" className="space-y-8">
							<div className="max-w-4xl mx-auto">
								<h2 className="text-2xl font-semibold mb-6 text-center">
									Frequently Asked Questions
								</h2>
								<div className="space-y-4">
									{faqData.map((faq, index) => (
										<Card key={index}>
											<CardHeader>
												<div className="flex items-start gap-3">
													<HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
													<div className="flex-1">
														<h3 className="font-semibold mb-2">
															{faq.question}
														</h3>
														<Badge variant="outline" className="text-xs">
															{faq.category}
														</Badge>
													</div>
												</div>
											</CardHeader>
											<CardContent>
												<p className="text-muted-foreground">
													{faq.answer}
												</p>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						</TabsContent>

						{/* Support Tab */}
						<TabsContent value="support" className="space-y-8">
							<div className="max-w-4xl mx-auto">
								<h2 className="text-2xl font-semibold mb-6 text-center">
									Get Help from Our Team
								</h2>
								<p className="text-muted-foreground text-center mb-8">
									Choose the support option that works best for you. Our team is
									here to help!
								</p>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{supportOptions.map((option) => (
										<Card
											key={option.title}
											className="group hover:shadow-md transition-all duration-200"
										>
											<CardContent className="p-6">
												<div className="flex items-start gap-4">
													<div className="p-3 rounded-lg bg-primary/10 text-primary">
														<option.icon className="h-6 w-6" />
													</div>
													<div className="flex-1">
														<div className="flex items-center justify-between mb-2">
															<h3 className="font-semibold">
																{option.title}
															</h3>
															<Badge
																variant={
																	option.priority === "high"
																		? "default"
																		: "secondary"
																}
																className="text-xs"
															>
																{option.available}
															</Badge>
														</div>
														<p className="text-sm text-muted-foreground mb-4">
															{option.description}
														</p>
														<Button
															asChild
															size="sm"
															className="group-hover:bg-primary/90"
														>
															<Link href="/support">
																{option.action}
																<ExternalLink className="h-3 w-3 ml-1" />
															</Link>
														</Button>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						</TabsContent>
					</Tabs>

					{/* Status Indicators */}
					<div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
							<CardContent className="p-6 text-center">
								<CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
								<h3 className="font-semibold text-green-800 dark:text-green-200">
									System Status
								</h3>
								<p className="text-sm text-green-600 dark:text-green-300">
									All systems operational
								</p>
							</CardContent>
						</Card>

						<Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
							<CardContent className="p-6 text-center">
								<Info className="h-8 w-8 text-blue-600 mx-auto mb-2" />
								<h3 className="font-semibold text-blue-800 dark:text-blue-200">
									Response Time
								</h3>
								<p className="text-sm text-blue-600 dark:text-blue-300">
									Average: &lt; 2 hours
								</p>
							</CardContent>
						</Card>

						<Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
							<CardContent className="p-6 text-center">
								<Lightbulb className="h-8 w-8 text-purple-600 mx-auto mb-2" />
								<h3 className="font-semibold text-purple-800 dark:text-purple-200">
									Self-Service
								</h3>
								<p className="text-sm text-purple-600 dark:text-purple-300">
									24/7 resource access
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
