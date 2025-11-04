"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
	ArrowLeft,
	FileText,
	Download,
	BarChart3,
	Calendar,
	Filter,
	ArrowRight,
} from "lucide-react";

const reportTypes = [
	{
		title: "Financial Reports",
		description: "Revenue, expenses, profit & loss statements",
		icon: BarChart3,
	},
	{
		title: "Transaction Reports",
		description: "Detailed transaction history and summaries",
		icon: FileText,
	},
	{
		title: "Custom Reports",
		description: "Create reports tailored to your needs",
		icon: Filter,
	},
];

const reportFeatures = [
	{
		title: "Export Options",
		description: "Export reports in PDF, CSV, or Excel formats",
		icon: Download,
	},
	{
		title: "Date Range Selection",
		description: "Generate reports for specific time periods",
		icon: Calendar,
	},
	{
		title: "Custom Filters",
		description: "Filter data by category, account, or other criteria",
		icon: Filter,
	},
];

export default function ReportingHelpPage() {
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
								<FileText className="h-5 w-5 text-primary" />
								<Badge variant="secondary" className="text-sm font-medium">
									Advanced Features
								</Badge>
							</div>
							<h1 className="text-2xl font-bold">Reporting</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Overview */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">
							Generating Reports
						</h2>
						<p className="text-muted-foreground mb-8">
							Learn how to create, customize, and export financial reports to
							gain insights into your business performance.
						</p>
					</section>

					{/* Report Types */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Report Types</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{reportTypes.map((type, index) => (
								<Card key={index}>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<type.icon className="h-5 w-5 text-primary" />
											{type.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground text-sm">
											{type.description}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					{/* Features */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Report Features</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{reportFeatures.map((feature, index) => (
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
								<Link href="/reports">
									<FileText className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">Generate Report</div>
										<div className="text-xs text-muted-foreground">
											Create a new financial report
										</div>
									</div>
									<ArrowRight className="h-4 w-4 ml-auto" />
								</Link>
							</Button>
							<Button asChild variant="outline" className="justify-start h-auto py-4">
								<Link href="/dashboard">
									<BarChart3 className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">View Analytics</div>
										<div className="text-xs text-muted-foreground">
											Access your dashboard analytics
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
										href="/docs/help/dashboard"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Dashboard Overview</span>
										<ArrowRight className="h-4 w-4 text-muted-foreground" />
									</Link>
								</CardContent>
							</Card>
							<Card className="cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<Link
										href="/docs/help/workflows"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Workflows</span>
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

