import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ArrowRight,
	BarChart3,
	TrendingUp,
	Target,
	Users,
	DollarSign,
	Calendar,
	Settings,
} from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b bg-gradient-to-br from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-16">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-2 mb-4">
							<BarChart3 className="h-6 w-6 text-primary" />
							<Badge variant="secondary" className="text-sm font-medium">
								Analytics
							</Badge>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
							Financial Analytics &{" "}
							<span className="text-primary">Insights</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							Track performance, identify trends, and make data-driven financial decisions.
						</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-16">
				<div className="max-w-6xl mx-auto">
					{/* Analytics Features */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Analytics Features</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
											<TrendingUp className="h-5 w-5" />
										</div>
										<CardTitle className="text-lg">Revenue Tracking</CardTitle>
									</div>
									<p className="text-sm text-muted-foreground">
										Monitor income streams and growth trends across all accounts.
									</p>
								</CardHeader>
								<CardContent>
									<Button variant="outline" size="sm" className="w-full" asChild>
										<Link href="/dashboard/analytics">
											View Revenue Analytics
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-lg bg-green-500/10 text-green-600">
											<Target className="h-5 w-5" />
										</div>
										<CardTitle className="text-lg">Goal Monitoring</CardTitle>
									</div>
									<p className="text-sm text-muted-foreground">
										Track progress toward financial targets and budget goals.
									</p>
								</CardHeader>
								<CardContent>
									<Button variant="outline" size="sm" className="w-full" asChild>
										<Link href="/dashboard/analytics">
											Set Goals
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							<Card className="group hover:shadow-md transition-all duration-200">
								<CardHeader>
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
											<DollarSign className="h-5 w-5" />
										</div>
										<CardTitle className="text-lg">Expense Analysis</CardTitle>
									</div>
									<p className="text-sm text-muted-foreground">
										Categorize and analyze spending patterns and trends.
									</p>
								</CardHeader>
								<CardContent>
									<Button variant="outline" size="sm" className="w-full" asChild>
										<Link href="/dashboard/analytics">
											Analyze Expenses
											<ArrowRight className="h-4 w-4 ml-2" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Analytics Types */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Analytics Types</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<BarChart3 className="h-5 w-5 text-blue-600" />
										Real-time Analytics
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Get live updates on your financial metrics as transactions occur.
									</p>
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 rounded-full bg-green-500"></div>
											<span className="text-sm">Live transaction updates</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 rounded-full bg-green-500"></div>
											<span className="text-sm">Real-time balance monitoring</span>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Calendar className="h-5 w-5 text-green-600" />
										Historical Analytics
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										Analyze trends and patterns over time periods.
									</p>
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 rounded-full bg-blue-500"></div>
											<span className="text-sm">Monthly and yearly comparisons</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 rounded-full bg-blue-500"></div>
											<span className="text-sm">Trend analysis and forecasting</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</section>

					{/* Key Metrics */}
					<section className="mb-16">
						<h2 className="text-3xl font-semibold mb-6">Key Metrics</h2>
						<Card>
							<CardContent className="p-8">
								<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
									<div className="text-center">
										<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/10 text-blue-600 mb-4 mx-auto">
											<DollarSign className="h-6 w-6" />
										</div>
										<h3 className="font-semibold mb-2">Total Revenue</h3>
										<p className="text-sm text-muted-foreground">
											Combined income from all accounts
										</p>
									</div>

									<div className="text-center">
										<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-500/10 text-green-600 mb-4 mx-auto">
											<TrendingUp className="h-6 w-6" />
										</div>
										<h3 className="font-semibold mb-2">Growth Rate</h3>
										<p className="text-sm text-muted-foreground">
											Month-over-month growth percentage
										</p>
									</div>

									<div className="text-center">
										<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-500/10 text-purple-600 mb-4 mx-auto">
											<Target className="h-6 w-6" />
										</div>
										<h3 className="font-semibold mb-2">Goal Progress</h3>
										<p className="text-sm text-muted-foreground">
											Progress toward financial targets
										</p>
									</div>

									<div className="text-center">
										<div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-500/10 text-orange-600 mb-4 mx-auto">
											<Users className="h-6 w-6" />
										</div>
										<h3 className="font-semibold mb-2">Active Accounts</h3>
										<p className="text-sm text-muted-foreground">
											Number of connected financial accounts
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
								<h3 className="text-2xl font-semibold mb-4">Ready to Explore Analytics?</h3>
								<p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
									Access your personalized analytics dashboard to start tracking your financial performance.
								</p>
								<Button asChild>
									<Link href="/dashboard/analytics">
										<BarChart3 className="h-4 w-4 mr-2" />
										Open Analytics
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
