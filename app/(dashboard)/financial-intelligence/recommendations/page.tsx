import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Target, DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

export default function RecommendationsPage() {
	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">AI Recommendations</h1>
					<p className="text-muted-foreground">
						Actionable insights to optimize your financial performance
					</p>
				</div>
				<Button>
					<Lightbulb className="mr-2 h-4 w-4" />
					Generate New Recommendations
				</Button>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Active Recommendations</h3>
						<Lightbulb className="h-5 w-5 text-blue-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">12</div>
						<p className="text-xs text-muted-foreground mt-1">
							Across all categories
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Potential Savings</h3>
						<DollarSign className="h-5 w-5 text-green-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold text-green-600">$4,890</div>
						<p className="text-xs text-muted-foreground mt-1">
							Per month if implemented
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Revenue Opportunities</h3>
						<TrendingUp className="h-5 w-5 text-purple-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold text-purple-600">$12,500</div>
						<p className="text-xs text-muted-foreground mt-1">
							Additional monthly revenue
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Implemented</h3>
						<CheckCircle className="h-5 w-5 text-orange-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">8</div>
						<p className="text-xs text-muted-foreground mt-1">
							Successfully applied
						</p>
					</div>
				</div>
			</div>

			{/* High Priority Recommendations */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">High Priority Recommendations</h3>
							<p className="text-sm text-muted-foreground">Take action on these first</p>
						</div>
						<Badge variant="destructive">4 High Priority</Badge>
					</div>
				</div>
				<div className="p-6 space-y-4">
					{[
						{
							id: "REC-001",
							title: "Increase Pricing by 8%",
							category: "Revenue Optimization",
							priority: "High",
							impact: "$12,500/month",
							effort: "Low",
							confidence: 95,
							description: "Market analysis shows your pricing is 12% below competitors for similar value. Customer satisfaction is high (4.8/5), indicating price sensitivity is low.",
							actions: ["Review competitor pricing", "Segment customers by value", "Implement tiered pricing", "Communicate value proposition"],
							timeline: "Implement over 3 months"
						},
						{
							id: "REC-002",
							title: "Negotiate Vendor Contracts",
							category: "Cost Reduction",
							priority: "High",
							impact: "$1,200/month",
							effort: "Medium",
							confidence: 88,
							description: "3 major vendors have not been renegotiated in 18+ months. Market rates have decreased 15% for similar services.",
							actions: ["Request quotes from alternatives", "Leverage volume discounts", "Bundle services", "Lock in annual contracts"],
							timeline: "Complete within 45 days"
						},
						{
							id: "REC-003",
							title: "Optimize Software Subscriptions",
							category: "Cost Reduction",
							priority: "High",
							impact: "$450/month",
							effort: "Low",
							confidence: 92,
							description: "Identified $450/month in duplicate or underutilized software. Usage analytics show 4 tools with <20% adoption.",
							actions: ["Audit all subscriptions", "Cancel unused tools", "Consolidate overlapping features", "Negotiate enterprise pricing"],
							timeline: "Implement within 2 weeks"
						},
						{
							id: "REC-004",
							title: "Adjust Payment Terms",
							category: "Cash Flow",
							priority: "High",
							impact: "15 days improvement",
							effort: "Medium",
							confidence: 85,
							description: "Current net-30 terms result in average 42-day payment cycles. Net-15 with early payment discounts could improve cash flow significantly.",
							actions: ["Offer 2% discount for net-10", "Update contract templates", "Communicate with clients", "Monitor adoption rate"],
							timeline: "Roll out over 60 days"
						},
					].map((rec) => (
						<div key={rec.id} className="p-6 rounded-lg border hover:shadow-md transition-shadow">
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-start gap-3">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
										<AlertCircle className="h-5 w-5" />
									</div>
									<div>
										<div className="flex items-center gap-2 mb-1">
											<h4 className="text-lg font-semibold">{rec.title}</h4>
											<Badge variant="destructive" className="text-xs">{rec.priority}</Badge>
										</div>
										<p className="text-sm text-muted-foreground">{rec.category} • {rec.id}</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-lg font-bold text-green-600">{rec.impact}</p>
									<p className="text-xs text-muted-foreground">Potential impact</p>
								</div>
							</div>

							<p className="text-sm mb-4">{rec.description}</p>

							<div className="grid grid-cols-3 gap-4 mb-4">
								<div className="p-3 rounded-lg bg-muted/50">
									<p className="text-xs text-muted-foreground">Effort Required</p>
									<p className="text-sm font-semibold mt-1">{rec.effort}</p>
								</div>
								<div className="p-3 rounded-lg bg-muted/50">
									<p className="text-xs text-muted-foreground">Confidence</p>
									<p className="text-sm font-semibold mt-1">{rec.confidence}%</p>
								</div>
								<div className="p-3 rounded-lg bg-muted/50">
									<p className="text-xs text-muted-foreground">Timeline</p>
									<p className="text-sm font-semibold mt-1">{rec.timeline}</p>
								</div>
							</div>

							<div className="mb-4">
								<p className="text-sm font-semibold mb-2">Recommended Actions:</p>
								<ul className="space-y-1">
									{rec.actions.map((action, i) => (
										<li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
											<span className="text-blue-600 mt-0.5">•</span>
											{action}
										</li>
									))}
								</ul>
							</div>

							<div className="flex items-center gap-2">
								<Button>Implement Now</Button>
								<Button variant="outline">View Details</Button>
								<Button variant="ghost">Dismiss</Button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Medium & Low Priority */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Medium Priority */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">Medium Priority</h3>
							<Badge variant="secondary">5 Recommendations</Badge>
						</div>
					</div>
					<div className="p-6 space-y-3">
						{[
							{ title: "Diversify Income Streams", impact: "Risk reduction", effort: "High" },
							{ title: "Automate Invoicing Process", impact: "$120/month", effort: "Medium" },
							{ title: "Review Insurance Coverage", impact: "$85/month", effort: "Low" },
							{ title: "Implement Budget Tracking", impact: "Better control", effort: "Medium" },
							{ title: "Update Financial Projections", impact: "Improved planning", effort: "Low" },
						].map((rec, i) => (
							<div key={i} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
								<div className="flex items-center justify-between mb-2">
									<p className="font-medium text-sm">{rec.title}</p>
									<Badge variant="outline" className="text-xs">{rec.effort}</Badge>
								</div>
								<div className="flex items-center justify-between">
									<p className="text-xs text-muted-foreground">Impact: {rec.impact}</p>
									<Button variant="ghost" size="sm">View</Button>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Low Priority */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">Low Priority</h3>
							<Badge variant="secondary">3 Recommendations</Badge>
						</div>
					</div>
					<div className="p-6 space-y-3">
						{[
							{ title: "Optimize Tax Strategy", impact: "$3,500/year", effort: "High" },
							{ title: "Review Bank Account Fees", impact: "$45/month", effort: "Low" },
							{ title: "Update Accounting Software", impact: "Efficiency gain", effort: "Medium" },
						].map((rec, i) => (
							<div key={i} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
								<div className="flex items-center justify-between mb-2">
									<p className="font-medium text-sm">{rec.title}</p>
									<Badge variant="outline" className="text-xs">{rec.effort}</Badge>
								</div>
								<div className="flex items-center justify-between">
									<p className="text-xs text-muted-foreground">Impact: {rec.impact}</p>
									<Button variant="ghost" size="sm">View</Button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Implementation History */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<h3 className="text-lg font-semibold">Recently Implemented</h3>
					<p className="text-sm text-muted-foreground">Recommendations you've acted on</p>
				</div>
				<div className="p-6">
					<div className="space-y-3">
						{[
							{ title: "Switch to Cloud Accounting", implemented: "2024-10-15", impact: "$200/month saved", result: "Success" },
							{ title: "Renegotiate Office Lease", implemented: "2024-10-01", impact: "$400/month saved", result: "Success" },
							{ title: "Automate Expense Reports", implemented: "2024-09-20", impact: "5 hours/week saved", result: "Success" },
						].map((item, i) => (
							<div key={i} className="flex items-center justify-between p-4 rounded-lg border">
								<div className="flex items-center gap-3">
									<CheckCircle className="h-5 w-5 text-green-600" />
									<div>
										<p className="font-medium text-sm">{item.title}</p>
										<p className="text-xs text-muted-foreground">Implemented on {item.implemented}</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-sm font-semibold text-green-600">{item.impact}</p>
									<Badge variant="default" className="text-xs mt-1">{item.result}</Badge>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

