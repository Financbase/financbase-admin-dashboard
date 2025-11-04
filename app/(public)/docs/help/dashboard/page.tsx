"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
	ArrowLeft,
	BarChart3,
	DollarSign,
	TrendingUp,
	FileText,
	Users,
	Settings,
	ArrowRight,
} from "lucide-react";

const dashboardSections = [
	{
		title: "Financial Overview",
		description: "View your total revenue, expenses, and profit at a glance",
		icon: DollarSign,
		color: "bg-green-500",
	},
	{
		title: "Analytics & Reports",
		description: "Generate insights and detailed reports on your finances",
		icon: BarChart3,
		color: "bg-blue-500",
	},
	{
		title: "Transactions",
		description: "Track and manage all your financial transactions",
		icon: FileText,
		color: "bg-purple-500",
	},
	{
		title: "Team Management",
		description: "Manage team members and their access permissions",
		icon: Users,
		color: "bg-orange-500",
	},
];

const features = [
	{
		title: "Real-time Updates",
		description: "See your financial data update in real-time",
		icon: TrendingUp,
	},
	{
		title: "Custom Dashboards",
		description: "Create custom views tailored to your needs",
		icon: Settings,
	},
	{
		title: "Export Data",
		description: "Export your data in various formats for analysis",
		icon: FileText,
	},
];

export default function DashboardHelpPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="border-b">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="sm" asChild>
							<Link href="/docs/help">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Help
							</Link>
						</Button>
						<div>
							<div className="flex items-center gap-2 mb-1">
								<BarChart3 className="h-5 w-5 text-primary" />
								<Badge variant="secondary" className="text-sm font-medium">
									Dashboard
								</Badge>
							</div>
							<h1 className="text-2xl font-bold">Dashboard Overview</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Overview */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">
							Understanding Your Dashboard
						</h2>
						<p className="text-muted-foreground mb-8">
							Your dashboard is the central hub for all your financial data and
							insights. Learn how to navigate and make the most of its features.
						</p>
					</section>

					{/* Dashboard Sections */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Dashboard Sections</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{dashboardSections.map((section, index) => (
								<Card key={index}>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<div
												className={`${section.color} text-white rounded-full p-2`}
											>
												<section.icon className="h-5 w-5" />
											</div>
											{section.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground text-sm">
											{section.description}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					{/* Features */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Key Features</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{features.map((feature, index) => (
								<Card key={index}>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<feature.icon className="h-5 w-5 text-primary" />
											{feature.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground text-sm">
											{feature.description}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					{/* Quick Actions */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Button asChild variant="outline" className="justify-start h-auto py-4">
								<Link href="/dashboard">
									<BarChart3 className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">Go to Dashboard</div>
										<div className="text-xs text-muted-foreground">
											Access your financial dashboard
										</div>
									</div>
									<ArrowRight className="h-4 w-4 ml-auto" />
								</Link>
							</Button>
							<Button asChild variant="outline" className="justify-start h-auto py-4">
								<Link href="/reports">
									<FileText className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">View Reports</div>
										<div className="text-xs text-muted-foreground">
											Generate and view financial reports
										</div>
									</div>
									<ArrowRight className="h-4 w-4 ml-auto" />
								</Link>
							</Button>
						</div>
					</section>

					{/* Related Articles */}
					<section>
						<h2 className="text-2xl font-semibold mb-6">Related Articles</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Card className="cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<Link
										href="/docs/help/reporting"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Reporting Guide</span>
										<ArrowRight className="h-4 w-4 text-muted-foreground" />
									</Link>
								</CardContent>
							</Card>
							<Card className="cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<Link
										href="/docs/help/account-setup"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Account Setup</span>
										<ArrowRight className="h-4 w-4 text-muted-foreground" />
									</Link>
								</CardContent>
							</Card>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}

