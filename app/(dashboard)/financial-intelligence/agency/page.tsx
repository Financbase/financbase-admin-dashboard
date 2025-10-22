import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Clock, TrendingUp, Briefcase, Target } from "lucide-react";

export default function AgencyMetricsPage() {
	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Agency Metrics</h1>
					<p className="text-muted-foreground">
						Essential KPIs for creative agencies, consultancies, and service businesses
					</p>
				</div>
				<Button>Export Report</Button>
			</div>

			{/* Key Agency Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-medium text-muted-foreground">Utilization Rate</h3>
						<Clock className="h-5 w-5 text-blue-600" />
					</div>
					<div className="text-2xl font-bold">78%</div>
					<p className="text-xs text-muted-foreground mt-1">Target: 75-85%</p>
					<div className="mt-2">
						<Badge variant="default">Optimal</Badge>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-medium text-muted-foreground">Average Project Value</h3>
						<DollarSign className="h-5 w-5 text-green-600" />
					</div>
					<div className="text-2xl font-bold text-green-600">$18,500</div>
					<p className="text-xs text-muted-foreground mt-1">+12% from last quarter</p>
					<div className="mt-2">
						<Badge variant="default">Growing</Badge>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-medium text-muted-foreground">Client Retention</h3>
						<Users className="h-5 w-5 text-purple-600" />
					</div>
					<div className="text-2xl font-bold">92%</div>
					<p className="text-xs text-muted-foreground mt-1">Excellent retention</p>
					<div className="mt-2">
						<Badge variant="default">Excellent</Badge>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-medium text-muted-foreground">Gross Profit Margin</h3>
						<TrendingUp className="h-5 w-5 text-orange-600" />
					</div>
					<div className="text-2xl font-bold">52%</div>
					<p className="text-xs text-muted-foreground mt-1">Industry avg: 50%</p>
					<div className="mt-2">
						<Badge variant="secondary">Above Average</Badge>
					</div>
				</div>
			</div>

			{/* Team & Resource Metrics */}
			<div className="grid gap-6 lg:grid-cols-2">
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Team Performance</h3>
						<p className="text-sm text-muted-foreground">Resource utilization and productivity</p>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ metric: "Total Billable Hours", value: "1,240", change: "This month", percentage: 78 },
							{ metric: "Non-Billable Hours", value: "340", change: "Internal work", percentage: 22 },
							{ metric: "Average Hourly Rate", value: "$150", change: "Blended rate", percentage: 100 },
							{ metric: "Revenue Per Employee", value: "$125K", change: "Annual projection", percentage: 85 },
							{ metric: "Capacity Forecast", value: "92%", change: "Next 30 days", percentage: 92 },
						].map((item, i) => (
							<div key={i}>
								<div className="flex items-center justify-between mb-2">
									<div>
										<p className="font-medium text-sm">{item.metric}</p>
										<p className="text-xs text-muted-foreground">{item.change}</p>
									</div>
									<p className="text-lg font-bold">{item.value}</p>
								</div>
								<div className="h-2 bg-muted rounded-full overflow-hidden">
									<div 
										className="h-full bg-blue-600 rounded-full"
										style={{ width: `${item.percentage}%` }}
									></div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Financial Health</h3>
						<p className="text-sm text-muted-foreground">Revenue and profitability metrics</p>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ metric: "Monthly Recurring Revenue", value: "$95K", status: "Strong" },
							{ metric: "Project Revenue (One-time)", value: "$45K", status: "Healthy" },
							{ metric: "Net Profit Margin", value: "24%", status: "Excellent" },
							{ metric: "Operating Expenses Ratio", value: "28%", status: "Good" },
							{ metric: "Days Sales Outstanding", value: "32 days", status: "Target Met" },
						].map((item, i) => (
							<div key={i} className="flex items-center justify-between p-4 rounded-lg border">
								<div>
									<p className="font-medium text-sm">{item.metric}</p>
									<Badge variant="outline" className="text-xs mt-1">{item.status}</Badge>
								</div>
								<p className="text-lg font-bold">{item.value}</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Project Pipeline */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<h3 className="text-lg font-semibold">Project Pipeline</h3>
					<p className="text-sm text-muted-foreground">Active and upcoming projects</p>
				</div>
				<div className="p-6">
					<div className="grid gap-6 md:grid-cols-4">
						<div>
							<h4 className="text-sm font-medium text-muted-foreground mb-2">Proposals Out</h4>
							<p className="text-3xl font-bold">8</p>
							<p className="text-xs text-muted-foreground mt-1">Total value: $185K</p>
							<div className="mt-3">
								<div className="h-2 bg-muted rounded-full overflow-hidden">
									<div className="h-full bg-yellow-600 rounded-full" style={{ width: '45%' }}></div>
								</div>
							</div>
						</div>

						<div>
							<h4 className="text-sm font-medium text-muted-foreground mb-2">Active Projects</h4>
							<p className="text-3xl font-bold text-blue-600">12</p>
							<p className="text-xs text-muted-foreground mt-1">Total value: $285K</p>
							<div className="mt-3">
								<div className="h-2 bg-muted rounded-full overflow-hidden">
									<div className="h-full bg-blue-600 rounded-full" style={{ width: '78%' }}></div>
								</div>
							</div>
						</div>

						<div>
							<h4 className="text-sm font-medium text-muted-foreground mb-2">In Delivery</h4>
							<p className="text-3xl font-bold">9</p>
							<p className="text-xs text-muted-foreground mt-1">On schedule: 8/9</p>
							<div className="mt-3">
								<div className="h-2 bg-muted rounded-full overflow-hidden">
									<div className="h-full bg-green-600 rounded-full" style={{ width: '89%' }}></div>
								</div>
							</div>
						</div>

						<div>
							<h4 className="text-sm font-medium text-muted-foreground mb-2">Completed (30d)</h4>
							<p className="text-3xl font-bold text-green-600">15</p>
							<p className="text-xs text-muted-foreground mt-1">Revenue: $198K</p>
							<div className="mt-3">
								<div className="h-2 bg-muted rounded-full overflow-hidden">
									<div className="h-full bg-green-600 rounded-full" style={{ width: '100%' }}></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Client Metrics */}
			<div className="grid gap-6 lg:grid-cols-2">
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Client Analysis</h3>
						<p className="text-sm text-muted-foreground">Customer value and segmentation</p>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ segment: "Enterprise Clients", count: "8", revenue: "$45K/mo", percentage: 47 },
							{ segment: "Mid-Market", count: "15", revenue: "$32K/mo", percentage: 34 },
							{ segment: "Small Business", count: "22", revenue: "$18K/mo", percentage: 19 },
						].map((item, i) => (
							<div key={i} className="p-4 rounded-lg border">
								<div className="flex items-center justify-between mb-3">
									<div>
										<p className="font-semibold">{item.segment}</p>
										<p className="text-sm text-muted-foreground">{item.count} active clients</p>
									</div>
									<p className="text-lg font-bold text-green-600">{item.revenue}</p>
								</div>
								<div className="flex items-center gap-3">
									<div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
										<div 
											className="h-full bg-green-600 rounded-full"
											style={{ width: `${item.percentage}%` }}
										></div>
									</div>
									<span className="text-sm font-medium">{item.percentage}%</span>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Service Line Performance</h3>
						<p className="text-sm text-muted-foreground">Revenue by service offering</p>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ service: "Brand Strategy", revenue: "$48K", margin: "65%", growth: "+15%" },
							{ service: "Web Development", revenue: "$42K", margin: "48%", growth: "+8%" },
							{ service: "Content Creation", revenue: "$28K", margin: "72%", growth: "+22%" },
							{ service: "Marketing Campaigns", revenue: "$22K", margin: "52%", growth: "+12%" },
						].map((item, i) => (
							<div key={i} className="flex items-center justify-between p-4 rounded-lg border">
								<div>
									<p className="font-semibold text-sm">{item.service}</p>
									<div className="flex items-center gap-3 mt-1">
										<span className="text-xs text-muted-foreground">Margin: {item.margin}</span>
										<Badge variant="outline" className="text-xs">{item.growth}</Badge>
									</div>
								</div>
								<p className="text-lg font-bold">{item.revenue}</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Quality & Efficiency */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<h3 className="text-lg font-semibold">Project Delivery Metrics</h3>
					<p className="text-sm text-muted-foreground">Quality and efficiency indicators</p>
				</div>
				<div className="p-6">
					<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
						{[
							{ metric: "On-Time Delivery", value: "89%", target: "Target: 90%" },
							{ metric: "Client Satisfaction", value: "4.7/5", target: "Excellent rating" },
							{ metric: "Project Profitability", value: "42%", target: "Above 35% target" },
							{ metric: "Scope Creep Rate", value: "12%", target: "Below 15% target" },
							{ metric: "Revision Requests", value: "1.8 avg", target: "Industry: 2.5" },
						].map((item, i) => (
							<div key={i} className="p-4 rounded-lg bg-muted/50 text-center">
								<p className="text-sm text-muted-foreground mb-2">{item.metric}</p>
								<p className="text-2xl font-bold mb-1">{item.value}</p>
								<p className="text-xs text-muted-foreground">{item.target}</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Recommendations */}
			<div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
				<div className="flex items-start gap-3">
					<Target className="h-5 w-5 text-blue-600 mt-0.5" />
					<div>
						<h4 className="font-semibold mb-2">Agency Growth Recommendations</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>• Utilization rate of 78% is optimal—maintain current capacity planning strategies</li>
							<li>• 92% client retention is exceptional—leverage testimonials for new business development</li>
							<li>• Average project value grew 12%—continue to move upmarket and package premium services</li>
							<li>• Content creation has highest margin (72%)—consider expanding this service line</li>
							<li>• Days Sales Outstanding at 32 days is good—aim for 30 days with stricter payment terms</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

