import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, BarChart3, PieChart, ArrowUpRight } from "lucide-react";

export default function AnalyticsPage() {
	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
					<p className="text-muted-foreground">
						Deep insights into your financial performance and trends
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline">Last 30 Days</Button>
					<Button>Export Report</Button>
				</div>
			</div>

			{/* Key Performance Indicators */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Revenue Growth</h3>
						<TrendingUp className="h-4 w-4 text-green-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">12.5%</div>
						<p className="text-xs text-green-600 mt-1">+2.3% from last period</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Profit Margin</h3>
						<BarChart3 className="h-4 w-4 text-blue-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">37.2%</div>
						<p className="text-xs text-blue-600 mt-1">+1.8% from last period</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Avg Transaction</h3>
						<PieChart className="h-4 w-4 text-purple-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">$2,847</div>
						<p className="text-xs text-purple-600 mt-1">+5.2% from last period</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Client Retention</h3>
						<ArrowUpRight className="h-4 w-4 text-orange-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">94.8%</div>
						<p className="text-xs text-orange-600 mt-1">+0.5% from last period</p>
					</div>
				</div>
			</div>

			{/* Charts Row */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Revenue Trend */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Revenue Trend</h3>
						<p className="text-sm text-muted-foreground">Monthly revenue over the last 6 months</p>
					</div>
					<div className="p-6">
						<div className="space-y-4">
							{[
								{ month: "May", revenue: 98500, growth: 8.2 },
								{ month: "Jun", revenue: 105200, growth: 6.8 },
								{ month: "Jul", revenue: 112800, growth: 7.2 },
								{ month: "Aug", revenue: 118400, growth: 5.0 },
								{ month: "Sep", revenue: 121900, growth: 3.0 },
								{ month: "Oct", revenue: 124592, growth: 2.2 },
							].map((data) => (
								<div key={data.month}>
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium">{data.month}</span>
										<div className="flex items-center gap-2">
											<span className="text-sm font-bold">${(data.revenue / 1000).toFixed(1)}K</span>
											<Badge variant="secondary" className="text-xs">
												+{data.growth}%
											</Badge>
										</div>
									</div>
									<div className="h-2 bg-muted rounded-full overflow-hidden">
										<div 
											className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" 
											style={{ width: `${(data.revenue / 130000) * 100}%` }}
										></div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Top Categories */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Expense by Category</h3>
						<p className="text-sm text-muted-foreground">Distribution of expenses this month</p>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ category: "Payroll", amount: 35000, color: "bg-blue-600", percentage: 44.7 },
							{ category: "Marketing", amount: 12000, color: "bg-purple-600", percentage: 15.3 },
							{ category: "Operations", amount: 18000, color: "bg-green-600", percentage: 23.0 },
							{ category: "Software", amount: 8000, color: "bg-orange-600", percentage: 10.2 },
							{ category: "Other", amount: 5234, color: "bg-gray-600", percentage: 6.7 },
						].map((cat) => (
							<div key={cat.category}>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">{cat.category}</span>
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">${cat.amount.toLocaleString()}</span>
										<span className="text-sm font-medium">{cat.percentage}%</span>
									</div>
								</div>
								<div className="h-2 bg-muted rounded-full overflow-hidden">
									<div 
										className={`h-full ${cat.color} rounded-full`}
										style={{ width: `${cat.percentage}%` }}
									></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Performance Metrics */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Client Acquisition */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Client Acquisition</h3>
						<p className="text-sm text-muted-foreground">New clients by month</p>
					</div>
					<div className="p-6 space-y-3">
						{[
							{ month: "July", clients: 12, trend: "up" },
							{ month: "August", clients: 18, trend: "up" },
							{ month: "September", clients: 15, trend: "down" },
							{ month: "October", clients: 21, trend: "up" },
						].map((data) => (
							<div key={data.month} className="flex items-center justify-between">
								<span className="text-sm">{data.month}</span>
								<div className="flex items-center gap-2">
									<span className="text-sm font-semibold">{data.clients}</span>
									{data.trend === "up" ? (
										<TrendingUp className="h-4 w-4 text-green-600" />
									) : (
										<TrendingDown className="h-4 w-4 text-red-600" />
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Payment Success Rate */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Payment Success</h3>
						<p className="text-sm text-muted-foreground">Transaction success rate</p>
					</div>
					<div className="p-6 space-y-4">
						<div className="text-center">
							<div className="text-4xl font-bold text-green-600">96.8%</div>
							<p className="text-sm text-muted-foreground mt-1">Overall success rate</p>
						</div>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>Successful</span>
								<span className="font-medium text-green-600">1,242</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>Failed</span>
								<span className="font-medium text-red-600">41</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>Pending</span>
								<span className="font-medium text-yellow-600">23</span>
							</div>
						</div>
					</div>
				</div>

				{/* Average Response Time */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Invoice Turnaround</h3>
						<p className="text-sm text-muted-foreground">Average payment time</p>
					</div>
					<div className="p-6 space-y-4">
						<div className="text-center">
							<div className="text-4xl font-bold text-blue-600">12.5</div>
							<p className="text-sm text-muted-foreground mt-1">Days average</p>
						</div>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>0-7 days</span>
								<span className="font-medium">42%</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>8-14 days</span>
								<span className="font-medium">31%</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>15-30 days</span>
								<span className="font-medium">18%</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>30+ days</span>
								<span className="font-medium text-red-600">9%</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

