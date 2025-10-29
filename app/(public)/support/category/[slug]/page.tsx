"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, CreditCard, Shield, Settings, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const categoryData: Record<string, {
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	articles: Array<{
		title: string;
		description: string;
		href: string;
		difficulty?: "beginner" | "intermediate" | "advanced";
	}>;
}> = {
	"getting-started": {
		title: "Getting Started",
		description: "New to Financbase? Start here with our comprehensive guides",
		icon: BookOpen,
		articles: [
			{
				title: "Quick Start Guide",
				description: "Get up and running with Financbase in 5 minutes",
				href: "/docs/help/getting-started",
				difficulty: "beginner",
			},
			{
				title: "Account Setup",
				description: "Learn how to configure your organization and user settings",
				href: "/docs/help/account-setup",
				difficulty: "beginner",
			},
			{
				title: "Dashboard Overview",
				description: "Understand your financial dashboard and key features",
				href: "/docs/help/dashboard",
				difficulty: "beginner",
			},
			{
				title: "First Steps",
				description: "Essential first steps after creating your account",
				href: "/docs/first-steps",
				difficulty: "beginner",
			},
		],
	},
	"account-billing": {
		title: "Account & Billing",
		description: "Manage your account, subscription, and payment settings",
		icon: CreditCard,
		articles: [
			{
				title: "Subscription Plans",
				description: "Compare features and pricing across different plans",
				href: "/pricing",
				difficulty: "beginner",
			},
			{
				title: "Billing & Invoices",
				description: "Manage payments, view invoices, and update payment methods",
				href: "/docs/help/billing",
				difficulty: "intermediate",
			},
			{
				title: "Update Payment Method",
				description: "How to change or update your payment information",
				href: "/docs/help/payment",
				difficulty: "beginner",
			},
		],
	},
	"security-privacy": {
		title: "Security & Privacy",
		description: "Keep your data safe and secure with best practices",
		icon: Shield,
		articles: [
			{
				title: "Security Best Practices",
				description: "Learn how to secure your account and data",
				href: "/docs/help/security",
				difficulty: "beginner",
			},
			{
				title: "Two-Factor Authentication",
				description: "Set up 2FA to add an extra layer of security",
				href: "/docs/help/2fa",
				difficulty: "beginner",
			},
			{
				title: "Privacy Policy",
				description: "Understand how we protect and handle your data",
				href: "/privacy",
				difficulty: "beginner",
			},
			{
				title: "Data Encryption",
				description: "Learn about our encryption and security measures",
				href: "/docs/security",
				difficulty: "intermediate",
			},
		],
	},
	"api-integrations": {
		title: "API & Integrations",
		description: "Connect Financbase with your favorite tools and services",
		icon: Settings,
		articles: [
			{
				title: "API Overview",
				description: "Introduction to the Financbase API",
				href: "/docs/api",
				difficulty: "intermediate",
			},
			{
				title: "API Authentication",
				description: "Learn how to authenticate with our API",
				href: "/docs/api/auth",
				difficulty: "intermediate",
			},
			{
				title: "Webhooks Guide",
				description: "Set up and configure webhooks for real-time updates",
				href: "/docs/api/webhooks",
				difficulty: "advanced",
			},
			{
				title: "Integration Setup",
				description: "Connect with QuickBooks, Stripe, and other services",
				href: "/docs/integrations",
				difficulty: "intermediate",
			},
		],
	},
	"troubleshooting": {
		title: "Troubleshooting",
		description: "Fix common issues and resolve errors",
		icon: AlertCircle,
		articles: [
			{
				title: "Common Issues",
				description: "Solutions for frequently encountered problems",
				href: "/docs/help/issues",
				difficulty: "beginner",
			},
			{
				title: "Payment Issues",
				description: "Troubleshoot payment and billing problems",
				href: "/docs/help/payment-issues",
				difficulty: "beginner",
			},
			{
				title: "Import Errors",
				description: "Fix data import and synchronization errors",
				href: "/docs/help/import-errors",
				difficulty: "intermediate",
			},
			{
				title: "Performance Issues",
				description: "Optimize performance and resolve slowdowns",
				href: "/docs/help/performance",
				difficulty: "advanced",
			},
		],
	},
	"advanced-features": {
		title: "Advanced Features",
		description: "Unlock the full potential of Financbase",
		icon: Zap,
		articles: [
			{
				title: "Custom Workflows",
				description: "Create and automate custom business workflows",
				href: "/docs/help/workflows",
				difficulty: "advanced",
			},
			{
				title: "Advanced Reporting",
				description: "Build custom reports and analytics dashboards",
				href: "/docs/help/reporting",
				difficulty: "advanced",
			},
			{
				title: "Multi-Tenant Setup",
				description: "Configure multi-tenant organizations",
				href: "/docs/multi-tenant",
				difficulty: "advanced",
			},
			{
				title: "Best Practices",
				description: "Expert tips and best practices for power users",
				href: "/docs/help/best-practices",
				difficulty: "advanced",
			},
		],
	},
};

export default function SupportCategoryPage() {
	const params = useParams();
	const router = useRouter();
	const slug = params.slug as string;
	const category = categoryData[slug];

	if (!category) {
		return (
			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-2xl mx-auto text-center">
						<h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
						<p className="text-muted-foreground mb-8">
							The category you're looking for doesn't exist.
						</p>
						<Button asChild>
							<Link href="/support">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Support
							</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	const Icon = category.icon;

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<div className="mb-8">
						<Button
							variant="ghost"
							onClick={() => router.back()}
							className="mb-4"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>
						<div className="flex items-start gap-4">
							<div className="p-3 rounded-lg bg-primary/10 text-primary">
								<Icon className="h-8 w-8" />
							</div>
							<div>
								<h1 className="text-4xl font-bold mb-2">{category.title}</h1>
								<p className="text-xl text-muted-foreground">{category.description}</p>
							</div>
						</div>
					</div>

					{/* Articles Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{category.articles.map((article) => (
							<Card
								key={article.href}
								className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
							>
								<CardContent className="p-6">
									<Link href={article.href} className="block">
										<div className="flex items-start justify-between mb-3">
											<h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
												{article.title}
											</h3>
										</div>
										<p className="text-sm text-muted-foreground mb-4">
											{article.description}
										</p>
										<div className="flex items-center justify-between">
											{article.difficulty && (
												<Badge
													variant="secondary"
													className={
														article.difficulty === "beginner"
															? "bg-green-500/10 text-green-700 dark:text-green-400"
															: article.difficulty === "intermediate"
															? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
															: "bg-red-500/10 text-red-700 dark:text-red-400"
													}
												>
													{article.difficulty}
												</Badge>
											)}
											<span className="text-sm text-primary group-hover:underline">
												Read article →
											</span>
										</div>
									</Link>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

