/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ArrowRight,
	BarChart3,
	DollarSign,
	LayoutDashboard,
	Settings,
	TrendingUp,
	Users,
	Wallet,
	Target,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-2 mb-4">
							<LayoutDashboard className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								Dashboard Guide
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Understanding the{" "}
							<span className="text-primary">Financbase Dashboard</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							Navigate and utilize the powerful features of your financial management dashboard.
						</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
					{/* Main Sections */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Dashboard Overview</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
											<BarChart3 className="h-5 w-5" />
										</div>
										<CardTitle className="text-lg">Analytics</CardTitle>
									</div>
									<p className="text-sm text-muted-foreground">
										View comprehensive financial analytics and insights.
									</p>
								</CardHeader>
								<CardContent>
									<Button variant="outline" size="sm" className="w-full" asChild>
										<Link href="/products/analytics">
											Explore Analytics
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-lg bg-green-500/10 text-green-600">
											<DollarSign className="h-5 w-5" />
										</div>
										<CardTitle className="text-lg">Transactions</CardTitle>
									</div>
									<p className="text-sm text-muted-foreground">
										Manage and track all financial transactions.
									</p>
								</CardHeader>
								<CardContent>
									<Button variant="outline" size="sm" className="w-full" asChild>
										<Link href="/docs/dashboard">
											Learn More
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
											<Wallet className="h-5 w-5" />
										</div>
										<CardTitle className="text-lg">Accounts</CardTitle>
									</div>
									<p className="text-sm text-muted-foreground">
										Manage bank accounts and financial connections.
									</p>
								</CardHeader>
								<CardContent>
									<Button variant="outline" size="sm" className="w-full" asChild>
										<Link href="/docs">
											Learn More
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
											<Users className="h-5 w-5" />
										</div>
										<CardTitle className="text-lg">Team</CardTitle>
									</div>
									<p className="text-sm text-muted-foreground">
										Manage team members and access permissions.
									</p>
								</CardHeader>
								<CardContent>
									<Button variant="outline" size="sm" className="w-full" asChild>
										<Link href="/docs">
											Learn More
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Key Metrics */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Key Metrics Dashboard</h2>
						<Card>
							<CardContent className="p-8">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
									<div className="text-center">
										<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/10 text-blue-600 mb-4 mx-auto">
											<TrendingUp className="h-6 w-6" />
										</div>
										<h3 className="font-semibold mb-2">Revenue Tracking</h3>
										<p className="text-sm text-muted-foreground">
											Monitor income streams and growth trends across all accounts.
										</p>
									</div>

									<div className="text-center">
										<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-500/10 text-green-600 mb-4 mx-auto">
											<Target className="h-6 w-6" />
										</div>
										<h3 className="font-semibold mb-2">Goal Monitoring</h3>
										<p className="text-sm text-muted-foreground">
											Track progress toward financial targets and budget goals.
										</p>
									</div>

									<div className="text-center">
										<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-500/10 text-purple-600 mb-4 mx-auto">
											<Settings className="h-6 w-6" />
										</div>
										<h3 className="font-semibold mb-2">System Health</h3>
										<p className="text-sm text-muted-foreground">
											Monitor system performance and data synchronization status.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</section>

					{/* Getting Started */}
					<section className="mb-16">
						<Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
							<CardContent className="p-8 text-center">
								<h3 className="text-2xl font-semibold mb-4">Ready to Explore Your Dashboard?</h3>
								<p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
									Access your personalized dashboard to start managing your financial data and insights.
								</p>
								<Button asChild>
									<Link href="/auth/sign-up">
										<LayoutDashboard className="h-4 w-4 mr-2" />
										Get Started Free
									</Link>
								</Button>
							</CardContent>
						</Card>
					</section>
				</div>
			</div>
		</div>
	);
}
