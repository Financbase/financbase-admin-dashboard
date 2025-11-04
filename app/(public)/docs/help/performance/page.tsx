"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
	ArrowLeft,
	Zap,
	TrendingUp,
	RefreshCw,
	CheckCircle,
	ArrowRight,
} from "lucide-react";

const optimizationTips = [
	{
		title: "Clear Browser Cache",
		description: "Clear your browser cache to improve loading speed",
		icon: RefreshCw,
	},
	{
		title: "Close Unused Tabs",
		description: "Close browser tabs you're not using to free up memory",
		icon: Zap,
	},
	{
		title: "Check Internet Connection",
		description: "Ensure you have a stable internet connection",
		icon: TrendingUp,
	},
	{
		title: "Update Browser",
		description: "Use the latest version of your browser",
		icon: CheckCircle,
	},
];

const performanceIssues = [
	{
		title: "Slow Loading",
		description: "Pages are loading slowly",
		solutions: [
			"Clear your browser cache and cookies",
			"Check your internet connection speed",
			"Close other applications using bandwidth",
			"Try using a different browser",
		],
	},
	{
		title: "Timeout Errors",
		description: "Operations are timing out",
		solutions: [
			"Check your internet connection stability",
			"Reduce the size of data you're processing",
			"Try again during off-peak hours",
			"Contact support if issues persist",
		],
	},
	{
		title: "Dashboard Lag",
		description: "Dashboard is slow or unresponsive",
		solutions: [
			"Reduce the date range for data loading",
			"Clear browser cache",
			"Disable browser extensions",
			"Refresh the page",
		],
	},
];

const bestPractices = [
	"Use filters to limit data displayed",
	"Export large datasets instead of viewing in browser",
	"Schedule reports during off-peak hours",
	"Keep your browser updated",
];

export default function PerformanceHelpPage() {
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
								<Zap className="h-5 w-5 text-primary" />
								<Badge variant="secondary" className="text-sm font-medium">
									Performance
								</Badge>
							</div>
							<h1 className="text-2xl font-bold">Performance Optimization</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					{/* Overview */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">
							Optimizing Performance
						</h2>
						<p className="text-muted-foreground mb-8">
							Learn how to improve the performance of Financbase and resolve
							common performance issues.
						</p>
					</section>

					{/* Optimization Tips */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Quick Optimization Tips</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{optimizationTips.map((tip, index) => (
								<Card key={index}>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<tip.icon className="h-5 w-5 text-primary" />
											{tip.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground text-sm">
											{tip.description}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					{/* Performance Issues */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Common Performance Issues</h2>
						<div className="space-y-6">
							{performanceIssues.map((issue, index) => (
								<Card key={index}>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Zap className="h-5 w-5 text-orange-600" />
											{issue.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground mb-4">
											{issue.description}
										</p>
										<div>
											<p className="font-semibold mb-2">Solutions:</p>
											<ul className="space-y-2">
												{issue.solutions.map((solution, solIndex) => (
													<li
														key={solIndex}
														className="flex items-start gap-2 text-sm text-muted-foreground"
													>
														<CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
														<span>{solution}</span>
													</li>
												))}
											</ul>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</section>

					{/* Best Practices */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Best Practices</h2>
						<Card>
							<CardContent className="p-6">
								<ul className="space-y-3">
									{bestPractices.map((practice, index) => (
										<li
											key={index}
											className="flex items-start gap-3 text-muted-foreground"
										>
											<CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
											<span>{practice}</span>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					</section>

					{/* Quick Actions */}
					<section className="mb-16">
						<h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Button asChild variant="outline" className="justify-start h-auto py-4">
								<Link href="/dashboard">
									<RefreshCw className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">Refresh Dashboard</div>
										<div className="text-xs text-muted-foreground">
											Reload your dashboard
										</div>
									</div>
									<ArrowRight className="h-4 w-4 ml-auto" />
								</Link>
							</Button>
							<Button asChild variant="outline" className="justify-start h-auto py-4">
								<Link href="/support">
									<Zap className="h-4 w-4 mr-2" />
									<div className="text-left">
										<div className="font-semibold">Contact Support</div>
										<div className="text-xs text-muted-foreground">
											Get performance help
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
										href="/docs/help/import-errors"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Import Errors</span>
										<ArrowRight className="h-4 w-4 text-muted-foreground" />
									</Link>
								</CardContent>
							</Card>
							<Card className="cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<Link
										href="/docs/help/issues"
										className="flex items-center justify-between"
									>
										<span className="font-medium">Common Issues</span>
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

