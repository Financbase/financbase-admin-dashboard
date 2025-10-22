import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp, TrendingDown, Shield, AlertCircle, CheckCircle2 } from "lucide-react";

export default function HealthScorePage() {
	const healthCategories = [
		{ name: "Cash Flow", score: 92, status: "Excellent", color: "text-green-600", bgColor: "bg-green-100" },
		{ name: "Profitability", score: 85, status: "Good", color: "text-green-600", bgColor: "bg-green-100" },
		{ name: "Liquidity", score: 78, status: "Good", color: "text-blue-600", bgColor: "bg-blue-100" },
		{ name: "Efficiency", score: 88, status: "Excellent", color: "text-green-600", bgColor: "bg-green-100" },
		{ name: "Growth", score: 82, status: "Good", color: "text-green-600", bgColor: "bg-green-100" },
		{ name: "Debt Management", score: 95, status: "Excellent", color: "text-green-600", bgColor: "bg-green-100" },
	];

	const overallScore = Math.round(healthCategories.reduce((sum, cat) => sum + cat.score, 0) / healthCategories.length);

	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Financial Health Score</h1>
					<p className="text-muted-foreground">
						Comprehensive assessment of your financial wellbeing
					</p>
				</div>
				<Button>
					<Activity className="mr-2 h-4 w-4" />
					View Full Report
				</Button>
			</div>

			{/* Overall Health Score */}
			<div className="rounded-lg border bg-gradient-to-r from-blue-50 via-green-50 to-emerald-50 p-8">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold">Overall Financial Health</h2>
						<p className="text-muted-foreground mt-1">Based on 6 key financial indicators</p>
						<div className="flex items-center gap-2 mt-4">
							<Badge variant="default" className="text-sm">Excellent</Badge>
							<span className="text-sm text-muted-foreground">• Better than 78% of similar businesses</span>
						</div>
					</div>
					<div className="text-center">
						<div className="relative inline-flex items-center justify-center">
							<svg className="w-40 h-40 transform -rotate-90">
								<circle
									cx="80"
									cy="80"
									r="70"
									stroke="currentColor"
									strokeWidth="12"
									fill="none"
									className="text-muted opacity-20"
								/>
								<circle
									cx="80"
									cy="80"
									r="70"
									stroke="currentColor"
									strokeWidth="12"
									fill="none"
									strokeDasharray={`${2 * Math.PI * 70}`}
									strokeDashoffset={`${2 * Math.PI * 70 * (1 - overallScore / 100)}`}
									className="text-green-600 transition-all duration-1000"
									strokeLinecap="round"
								/>
							</svg>
							<div className="absolute inset-0 flex items-center justify-center">
								<div>
									<div className="text-5xl font-bold text-green-600">{overallScore}</div>
									<p className="text-sm text-muted-foreground">out of 100</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Health Categories */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{healthCategories.map((category) => (
					<div key={category.name} className="rounded-lg border bg-card">
						<div className="p-6">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-semibold">{category.name}</h3>
								<div className={`flex h-10 w-10 items-center justify-center rounded-full ${category.bgColor}`}>
									<span className={`text-lg font-bold ${category.color}`}>{category.score}</span>
								</div>
							</div>
							<div className="mb-4">
								<div className="h-2 bg-muted rounded-full overflow-hidden">
									<div 
										className={`h-full ${category.score >= 85 ? 'bg-green-600' : category.score >= 70 ? 'bg-blue-600' : 'bg-yellow-600'} rounded-full transition-all duration-500`}
										style={{ width: `${category.score}%` }}
									></div>
								</div>
							</div>
							<div className="flex items-center justify-between">
								<Badge variant={category.score >= 85 ? 'default' : 'secondary'} className="text-xs">
									{category.status}
								</Badge>
								<Button variant="ghost" size="sm">View Details</Button>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Detailed Breakdown */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Strengths */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold">Financial Strengths</h3>
								<p className="text-sm text-muted-foreground">What you're doing well</p>
							</div>
							<CheckCircle2 className="h-6 w-6 text-green-600" />
						</div>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ 
								title: "Excellent Debt Management", 
								score: 95,
								description: "Your debt-to-equity ratio of 0.15 is exceptional. Low leverage provides financial flexibility.",
								trend: "up"
							},
							{ 
								title: "Strong Cash Flow", 
								score: 92,
								description: "Consistent positive cash flow with 3.2 months of reserves. Well above industry average.",
								trend: "up"
							},
							{ 
								title: "High Operating Efficiency", 
								score: 88,
								description: "Operating margin of 32% demonstrates excellent cost control and operational excellence.",
								trend: "up"
							},
							{ 
								title: "Solid Profit Margins", 
								score: 85,
								description: "Net profit margin of 37.2% is significantly above industry benchmark of 18%.",
								trend: "up"
							},
						].map((strength) => (
							<div key={strength.title} className="flex items-start gap-3 p-4 rounded-lg border border-green-200 bg-green-50">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-white mt-0.5">
									<TrendingUp className="h-4 w-4" />
								</div>
								<div className="flex-1">
									<div className="flex items-center justify-between mb-1">
										<p className="font-semibold">{strength.title}</p>
										<Badge variant="default" className="text-xs">{strength.score}/100</Badge>
									</div>
									<p className="text-sm text-muted-foreground">{strength.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Areas for Improvement */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold">Areas for Improvement</h3>
								<p className="text-sm text-muted-foreground">Opportunities to strengthen</p>
							</div>
							<AlertCircle className="h-6 w-6 text-orange-600" />
						</div>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ 
								title: "Liquidity Position", 
								score: 78,
								description: "Current ratio of 1.8 is good but could be improved. Consider building larger cash reserves.",
								improvement: "Target: 2.5+"
							},
							{ 
								title: "Revenue Growth Rate", 
								score: 82,
								description: "12.5% YoY growth is solid but below your 15% target. Market opportunities exist for expansion.",
								improvement: "Target: 15%"
							},
							{ 
								title: "Customer Concentration", 
								score: 75,
								description: "Top 3 clients represent 45% of revenue. Diversification would reduce risk.",
								improvement: "Target: <30%"
							},
							{ 
								title: "Accounts Receivable Days", 
								score: 72,
								description: "Average collection period of 42 days. Industry average is 30 days.",
								improvement: "Target: 30 days"
							},
						].map((area) => (
							<div key={area.title} className="flex items-start gap-3 p-4 rounded-lg border border-orange-200 bg-orange-50">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white mt-0.5">
									<TrendingDown className="h-4 w-4" />
								</div>
								<div className="flex-1">
									<div className="flex items-center justify-between mb-1">
										<p className="font-semibold">{area.title}</p>
										<Badge variant="secondary" className="text-xs">{area.score}/100</Badge>
									</div>
									<p className="text-sm text-muted-foreground mb-2">{area.description}</p>
									<p className="text-xs font-medium text-orange-700">{area.improvement}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Key Metrics */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<h3 className="text-lg font-semibold">Key Financial Metrics</h3>
					<p className="text-sm text-muted-foreground">Detailed breakdown of your health score</p>
				</div>
				<div className="p-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{[
							{ metric: "Current Ratio", value: "1.8:1", target: "2.0:1", status: "good" },
							{ metric: "Quick Ratio", value: "1.5:1", target: "1.0:1", status: "excellent" },
							{ metric: "Debt-to-Equity", value: "0.15", target: "<0.5", status: "excellent" },
							{ metric: "Operating Margin", value: "32%", target: "25%", status: "excellent" },
							{ metric: "Net Profit Margin", value: "37.2%", target: "20%", status: "excellent" },
							{ metric: "ROE", value: "28%", target: "15%", status: "excellent" },
							{ metric: "ROA", value: "18%", target: "10%", status: "excellent" },
							{ metric: "Working Capital", value: "$145K", target: ">$100K", status: "excellent" },
						].map((metric) => (
							<div key={metric.metric} className="p-4 rounded-lg border">
								<div className="flex items-center justify-between mb-2">
									<p className="text-sm font-medium">{metric.metric}</p>
									<Badge 
										variant={metric.status === 'excellent' ? 'default' : 'secondary'} 
										className="text-xs"
									>
										{metric.status}
									</Badge>
								</div>
								<p className="text-2xl font-bold">{metric.value}</p>
								<p className="text-xs text-muted-foreground mt-1">Target: {metric.target}</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Health Trend */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<h3 className="text-lg font-semibold">Health Score Trend</h3>
					<p className="text-sm text-muted-foreground">Your score over the last 6 months</p>
				</div>
				<div className="p-6">
					<div className="space-y-3">
						{[
							{ month: "May 2024", score: 79, change: "+2" },
							{ month: "Jun 2024", score: 81, change: "+2" },
							{ month: "Jul 2024", score: 82, change: "+1" },
							{ month: "Aug 2024", score: 84, change: "+2" },
							{ month: "Sep 2024", score: 85, change: "+1" },
							{ month: "Oct 2024", score: 87, change: "+2" },
						].map((month) => (
							<div key={month.month}>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">{month.month}</span>
									<div className="flex items-center gap-2">
										<Badge variant="secondary" className="text-xs">{month.change}</Badge>
										<span className="text-sm font-bold">{month.score}/100</span>
									</div>
								</div>
								<div className="h-2 bg-muted rounded-full overflow-hidden">
									<div 
										className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
										style={{ width: `${month.score}%` }}
									></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Action Plan */}
			<div className="rounded-lg border bg-muted/30 p-6">
				<div className="flex items-start gap-3">
					<Shield className="h-5 w-5 text-blue-600 mt-0.5" />
					<div>
						<h3 className="font-semibold mb-2">How to Maintain & Improve Your Score</h3>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>• Continue your strong debt management and avoid taking on unnecessary leverage</li>
							<li>• Build cash reserves to improve liquidity ratio from 1.8 to target of 2.5</li>
							<li>• Diversify client base to reduce concentration risk below 30%</li>
							<li>• Implement stricter payment terms to reduce AR days from 42 to 30</li>
							<li>• Maintain current profit margins while investing in growth initiatives</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

