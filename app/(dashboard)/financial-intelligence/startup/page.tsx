import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, DollarSign, Zap, Target, Flame } from "lucide-react";

export default function StartupMetricsPage() {
	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Startup Metrics</h1>
					<p className="text-muted-foreground">
						Key performance indicators for early-stage and growth startups
					</p>
				</div>
				<Button>Export Report</Button>
			</div>

			{/* Key Startup Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-medium text-muted-foreground">Monthly Burn Rate</h3>
						<Flame className="h-5 w-5 text-orange-600" />
					</div>
					<div className="text-2xl font-bold">$45,000</div>
					<p className="text-xs text-muted-foreground mt-1">18 months runway</p>
					<div className="mt-2">
						<Badge variant="secondary">Healthy</Badge>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-medium text-muted-foreground">Monthly Recurring Revenue</h3>
						<DollarSign className="h-5 w-5 text-green-600" />
					</div>
					<div className="text-2xl font-bold text-green-600">$125,000</div>
					<p className="text-xs text-muted-foreground mt-1">+18% growth MoM</p>
					<div className="mt-2">
						<Badge variant="default">Growing</Badge>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-medium text-muted-foreground">Customer Acquisition Cost</h3>
						<Users className="h-5 w-5 text-blue-600" />
					</div>
					<div className="text-2xl font-bold">$850</div>
					<p className="text-xs text-muted-foreground mt-1">LTV: $4,200 (4.9x)</p>
					<div className="mt-2">
						<Badge variant="default">Excellent</Badge>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-medium text-muted-foreground">Churn Rate</h3>
						<TrendingUp className="h-5 w-5 text-purple-600" />
					</div>
					<div className="text-2xl font-bold">3.2%</div>
					<p className="text-xs text-muted-foreground mt-1">Down from 4.5%</p>
					<div className="mt-2">
						<Badge variant="default">Improving</Badge>
					</div>
				</div>
			</div>

			{/* Growth Metrics */}
			<div className="grid gap-6 lg:grid-cols-2">
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Growth Indicators</h3>
						<p className="text-sm text-muted-foreground">Key metrics tracking startup growth</p>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ metric: "Annual Recurring Revenue (ARR)", value: "$1.5M", change: "+45% YoY", status: "excellent" },
							{ metric: "Net Revenue Retention", value: "118%", change: "+8% from last quarter", status: "excellent" },
							{ metric: "Gross Margin", value: "75%", change: "Target: >70%", status: "excellent" },
							{ metric: "Sales Efficiency (Magic Number)", value: "0.9", change: "Healthy growth efficiency", status: "good" },
							{ metric: "Active Users (MAU)", value: "12,500", change: "+22% MoM", status: "excellent" },
						].map((item, i) => (
							<div key={i} className="flex items-center justify-between p-4 rounded-lg border">
								<div>
									<p className="font-medium text-sm">{item.metric}</p>
									<p className="text-xs text-muted-foreground mt-1">{item.change}</p>
								</div>
								<div className="text-right">
									<p className="text-lg font-bold">{item.value}</p>
									<Badge 
										variant={item.status === 'excellent' ? 'default' : 'secondary'} 
										className="text-xs mt-1"
									>
										{item.status}
									</Badge>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Unit Economics</h3>
						<p className="text-sm text-muted-foreground">Revenue and cost per customer</p>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ metric: "Customer Lifetime Value (LTV)", value: "$4,200", calculation: "Avg. $350/mo × 12 months", status: "Strong" },
							{ metric: "CAC Payback Period", value: "2.4 months", calculation: "Below 12 month target", status: "Excellent" },
							{ metric: "LTV:CAC Ratio", value: "4.9:1", calculation: "Well above 3:1 target", status: "Excellent" },
							{ metric: "Average Revenue Per User", value: "$350/mo", calculation: "+$45 from last year", status: "Growing" },
						].map((item, i) => (
							<div key={i} className="p-4 rounded-lg bg-muted/50">
								<div className="flex items-center justify-between mb-2">
									<p className="font-medium text-sm">{item.metric}</p>
									<Badge variant="outline" className="text-xs">{item.status}</Badge>
								</div>
								<p className="text-2xl font-bold mb-1">{item.value}</p>
								<p className="text-xs text-muted-foreground">{item.calculation}</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Funding & Runway */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<h3 className="text-lg font-semibold">Financial Position</h3>
					<p className="text-sm text-muted-foreground">Cash runway and funding status</p>
				</div>
				<div className="p-6">
					<div className="grid gap-6 md:grid-cols-3">
						<div className="space-y-4">
							<div>
								<h4 className="text-sm font-medium text-muted-foreground mb-2">Cash in Bank</h4>
								<p className="text-3xl font-bold">$810,000</p>
								<p className="text-xs text-muted-foreground mt-1">18 months runway at current burn</p>
							</div>
							<div className="h-2 bg-muted rounded-full overflow-hidden">
								<div className="h-full bg-green-600 rounded-full" style={{ width: '65%' }}></div>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<h4 className="text-sm font-medium text-muted-foreground mb-2">Total Funding Raised</h4>
								<p className="text-3xl font-bold">$2.5M</p>
								<p className="text-xs text-muted-foreground mt-1">Seed Round - Q2 2024</p>
							</div>
							<div className="flex gap-2">
								<Badge variant="outline">Pre-seed: $250K</Badge>
								<Badge variant="outline">Seed: $2.25M</Badge>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<h4 className="text-sm font-medium text-muted-foreground mb-2">Next Milestone</h4>
								<p className="text-3xl font-bold">$3M ARR</p>
								<p className="text-xs text-muted-foreground mt-1">Series A target - Q3 2025</p>
							</div>
							<Badge className="bg-gradient-to-r from-purple-500 to-blue-500">On Track</Badge>
						</div>
					</div>
				</div>
			</div>

			{/* Product Metrics */}
			<div className="grid gap-6 lg:grid-cols-2">
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Product Engagement</h3>
						<p className="text-sm text-muted-foreground">User activity and retention</p>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ metric: "Daily Active Users (DAU)", value: "4,200", change: "+15% MoM" },
							{ metric: "Weekly Active Users (WAU)", value: "8,900", change: "+12% MoM" },
							{ metric: "DAU/MAU Ratio", value: "34%", change: "Strong engagement" },
							{ metric: "Average Session Duration", value: "18 min", change: "+3 min from last month" },
							{ metric: "Feature Adoption Rate", value: "68%", change: "Core features well utilized" },
						].map((item, i) => (
							<div key={i} className="flex items-center justify-between p-3 rounded-lg border">
								<div>
									<p className="font-medium text-sm">{item.metric}</p>
									<p className="text-xs text-muted-foreground">{item.change}</p>
								</div>
								<p className="text-lg font-bold">{item.value}</p>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Sales & Marketing</h3>
						<p className="text-sm text-muted-foreground">Pipeline and conversion metrics</p>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ metric: "Lead Conversion Rate", value: "8.5%", change: "Industry avg: 5-7%" },
							{ metric: "Sales Cycle Length", value: "23 days", change: "Down from 31 days" },
							{ metric: "Win Rate", value: "42%", change: "Above 35% target" },
							{ metric: "Average Deal Size", value: "$4,200", change: "+$600 from last quarter" },
							{ metric: "Pipeline Value", value: "$450K", change: "Next 90 days" },
						].map((item, i) => (
							<div key={i} className="flex items-center justify-between p-3 rounded-lg border">
								<div>
									<p className="font-medium text-sm">{item.metric}</p>
									<p className="text-xs text-muted-foreground">{item.change}</p>
								</div>
								<p className="text-lg font-bold">{item.value}</p>
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
						<h4 className="font-semibold mb-2">Recommendations for Growth</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>• Your LTV:CAC ratio of 4.9:1 is excellent—consider increasing marketing spend to accelerate growth</li>
							<li>• 18-month runway provides good cushion; focus on achieving Series A milestones</li>
							<li>• Churn improvement is positive; continue investing in customer success to reach &lt;3%</li>
							<li>• DAU/MAU ratio of 34% indicates strong engagement; leverage this in investor pitches</li>
							<li>• Consider implementing annual contracts to improve cash flow and reduce CAC payback period</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

