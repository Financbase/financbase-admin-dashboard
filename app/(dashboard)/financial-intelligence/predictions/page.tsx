import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Calendar, Target, AlertTriangle } from "lucide-react";

export default function PredictionsPage() {
	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Financial Predictions</h1>
					<p className="text-muted-foreground">
						AI-powered forecasts and trend analysis
					</p>
				</div>
				<Button>
					<Calendar className="mr-2 h-4 w-4" />
					Custom Date Range
				</Button>
			</div>

			{/* Prediction Accuracy Score */}
			<div className="rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 p-8">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold">Prediction Accuracy</h2>
						<p className="text-muted-foreground mt-1">Based on last 90 days of data</p>
					</div>
					<div className="text-right">
						<div className="text-6xl font-bold text-green-600">94%</div>
						<p className="text-sm text-muted-foreground">Historical accuracy</p>
						<Badge variant="default" className="mt-2">Highly Reliable</Badge>
					</div>
				</div>
			</div>

			{/* Time-based Predictions */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Next 30 Days */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">Next 30 Days</h3>
							<Badge variant="secondary">92% confidence</Badge>
						</div>
					</div>
					<div className="p-6 space-y-6">
						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-muted-foreground">Revenue</span>
								<TrendingUp className="h-4 w-4 text-green-600" />
							</div>
							<p className="text-3xl font-bold text-green-600">$125,400</p>
							<p className="text-xs text-muted-foreground mt-1">+8.2% from this month</p>
						</div>

						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-muted-foreground">Expenses</span>
								<TrendingUp className="h-4 w-4 text-orange-600" />
							</div>
							<p className="text-3xl font-bold">$78,200</p>
							<p className="text-xs text-muted-foreground mt-1">+3.1% from this month</p>
						</div>

						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-muted-foreground">Net Profit</span>
								<TrendingUp className="h-4 w-4 text-blue-600" />
							</div>
							<p className="text-3xl font-bold text-blue-600">$47,200</p>
							<p className="text-xs text-muted-foreground mt-1">Margin: 37.6%</p>
						</div>

						<div className="pt-4 border-t">
							<h4 className="text-sm font-semibold mb-2">Key Predictions:</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>• 12 new client acquisitions expected</li>
								<li>• 3 invoices may be paid late</li>
								<li>• Marketing spend optimal</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Next Quarter */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">Next Quarter (Q1 2025)</h3>
							<Badge variant="secondary">85% confidence</Badge>
						</div>
					</div>
					<div className="p-6 space-y-6">
						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-muted-foreground">Revenue</span>
								<TrendingUp className="h-4 w-4 text-green-600" />
							</div>
							<p className="text-3xl font-bold text-green-600">$382,500</p>
							<p className="text-xs text-muted-foreground mt-1">+12.5% from Q4 2024</p>
						</div>

						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-muted-foreground">Expenses</span>
								<TrendingUp className="h-4 w-4 text-orange-600" />
							</div>
							<p className="text-3xl font-bold">$241,800</p>
							<p className="text-xs text-muted-foreground mt-1">+5.2% from Q4 2024</p>
						</div>

						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-muted-foreground">Net Profit</span>
								<TrendingUp className="h-4 w-4 text-blue-600" />
							</div>
							<p className="text-3xl font-bold text-blue-600">$140,700</p>
							<p className="text-xs text-muted-foreground mt-1">Margin: 36.8%</p>
						</div>

						<div className="pt-4 border-t">
							<h4 className="text-sm font-semibold mb-2">Quarterly Outlook:</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>• Strong seasonal demand</li>
								<li>• 35+ new clients projected</li>
								<li>• Recommend cost review</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Next Year */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">Full Year 2025</h3>
							<Badge variant="secondary">72% confidence</Badge>
						</div>
					</div>
					<div className="p-6 space-y-6">
						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-muted-foreground">Revenue</span>
								<TrendingUp className="h-4 w-4 text-green-600" />
							</div>
							<p className="text-3xl font-bold text-green-600">$1,580,000</p>
							<p className="text-xs text-muted-foreground mt-1">+15.8% YoY growth</p>
						</div>

						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-muted-foreground">Expenses</span>
								<TrendingUp className="h-4 w-4 text-orange-600" />
							</div>
							<p className="text-3xl font-bold">$982,000</p>
							<p className="text-xs text-muted-foreground mt-1">+8.5% YoY increase</p>
						</div>

						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm text-muted-foreground">Net Profit</span>
								<TrendingUp className="h-4 w-4 text-blue-600" />
							</div>
							<p className="text-3xl font-bold text-blue-600">$598,000</p>
							<p className="text-xs text-muted-foreground mt-1">Margin: 37.8%</p>
						</div>

						<div className="pt-4 border-t">
							<h4 className="text-sm font-semibold mb-2">Annual Forecast:</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>• 150+ new clients expected</li>
								<li>• Market expansion ready</li>
								<li>• Team growth recommended</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			{/* Detailed Predictions */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Revenue Predictions */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Revenue Breakdown Predictions</h3>
						<p className="text-sm text-muted-foreground">Next quarter forecast by source</p>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ source: "Recurring Revenue", predicted: 245000, current: 220000, growth: 11.4, color: "bg-green-600" },
							{ source: "New Client Revenue", predicted: 85000, current: 68000, growth: 25.0, color: "bg-blue-600" },
							{ source: "Upsells", predicted: 35000, current: 28000, growth: 25.0, color: "bg-purple-600" },
							{ source: "One-time Projects", predicted: 17500, current: 15000, growth: 16.7, color: "bg-orange-600" },
						].map((item) => (
							<div key={item.source}>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">{item.source}</span>
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">${item.predicted.toLocaleString()}</span>
										<Badge variant="secondary" className="text-xs">+{item.growth}%</Badge>
									</div>
								</div>
								<div className="h-2 bg-muted rounded-full overflow-hidden">
									<div 
										className={`h-full ${item.color} rounded-full`}
										style={{ width: `${(item.predicted / 400000) * 100}%` }}
									></div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Risk Predictions */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold">Risk Predictions</h3>
								<p className="text-sm text-muted-foreground">Potential challenges ahead</p>
							</div>
							<Badge variant="destructive">3 Risks Detected</Badge>
						</div>
					</div>
					<div className="p-6 space-y-3">
						{[
							{ risk: "Cash Flow Shortage", probability: "High", impact: "High", timeframe: "Q1 2025", desc: "Predicted shortfall of $15K in February" },
							{ risk: "Client Churn", probability: "Medium", impact: "Medium", timeframe: "Next 60 days", desc: "3 clients showing disengagement patterns" },
							{ risk: "Expense Overrun", probability: "Low", impact: "Medium", timeframe: "Q2 2025", desc: "Marketing costs may exceed budget by 12%" },
						].map((risk) => (
							<div key={risk.risk} className="p-4 rounded-lg border border-orange-200 bg-orange-50">
								<div className="flex items-start justify-between mb-2">
									<div className="flex items-start gap-2">
										<AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
										<div>
											<p className="font-semibold">{risk.risk}</p>
											<p className="text-xs text-muted-foreground mt-1">{risk.desc}</p>
										</div>
									</div>
								</div>
								<div className="flex items-center gap-4 mt-3 text-xs">
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground">Probability:</span>
										<Badge variant={risk.probability === 'High' ? 'destructive' : 'secondary'} className="text-xs">
											{risk.probability}
										</Badge>
									</div>
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground">Impact:</span>
										<Badge variant={risk.impact === 'High' ? 'destructive' : 'secondary'} className="text-xs">
											{risk.impact}
										</Badge>
									</div>
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground">Timeframe:</span>
										<span className="font-medium">{risk.timeframe}</span>
									</div>
								</div>
								<Button variant="outline" size="sm" className="w-full mt-3">
									View Mitigation Plan
								</Button>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Monthly Trend Predictions */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<h3 className="text-lg font-semibold">12-Month Revenue Prediction</h3>
					<p className="text-sm text-muted-foreground">AI forecast with confidence intervals</p>
				</div>
				<div className="p-6">
					<div className="space-y-3">
						{[
							{ month: "Nov 2024", predicted: 125400, low: 118000, high: 132000, confidence: 92 },
							{ month: "Dec 2024", predicted: 132500, low: 124000, high: 141000, confidence: 89 },
							{ month: "Jan 2025", predicted: 128000, low: 119000, high: 137000, confidence: 85 },
							{ month: "Feb 2025", predicted: 124500, low: 115000, high: 134000, confidence: 82 },
							{ month: "Mar 2025", predicted: 130000, low: 120000, high: 140000, confidence: 80 },
							{ month: "Apr 2025", predicted: 135000, low: 124000, high: 146000, confidence: 77 },
						].map((month) => (
							<div key={month.month}>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">{month.month}</span>
									<div className="flex items-center gap-3">
										<span className="text-xs text-muted-foreground">
											Range: ${(month.low/1000).toFixed(0)}K - ${(month.high/1000).toFixed(0)}K
										</span>
										<span className="text-sm font-bold">${(month.predicted/1000).toFixed(1)}K</span>
										<Badge variant="secondary" className="text-xs">{month.confidence}%</Badge>
									</div>
								</div>
								<div className="h-2 bg-muted rounded-full overflow-hidden">
									<div 
										className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
										style={{ width: `${(month.predicted / 150000) * 100}%` }}
									></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Prediction Methodology */}
			<div className="rounded-lg border bg-muted/30 p-6">
				<div className="flex items-start gap-3">
					<Target className="h-5 w-5 text-blue-600 mt-0.5" />
					<div>
						<h3 className="font-semibold mb-2">How We Generate Predictions</h3>
						<p className="text-sm text-muted-foreground">
							Our AI analyzes historical data, seasonal patterns, market trends, and client behavior to generate accurate predictions. 
							Confidence scores reflect data quality and historical accuracy. Predictions update automatically as new data becomes available.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

