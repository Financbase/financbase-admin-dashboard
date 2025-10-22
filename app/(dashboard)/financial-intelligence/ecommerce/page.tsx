import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, DollarSign, TrendingUp, Package, Users, Target } from "lucide-react";

export default function EcommerceMetricsPage() {
	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">E-commerce Metrics</h1>
					<p className="text-muted-foreground">
						Critical KPIs for online stores and digital commerce businesses
					</p>
				</div>
				<Button>Export Report</Button>
			</div>

			{/* Key E-commerce Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-medium text-muted-foreground">Conversion Rate</h3>
						<TrendingUp className="h-5 w-5 text-green-600" />
					</div>
					<div className="text-2xl font-bold text-green-600">3.8%</div>
					<p className="text-xs text-muted-foreground mt-1">Industry avg: 2-3%</p>
					<div className="mt-2">
						<Badge variant="default">Above Average</Badge>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-medium text-muted-foreground">Average Order Value</h3>
						<DollarSign className="h-5 w-5 text-blue-600" />
					</div>
					<div className="text-2xl font-bold">$127</div>
					<p className="text-xs text-muted-foreground mt-1">+$12 from last month</p>
					<div className="mt-2">
						<Badge variant="default">Growing</Badge>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-medium text-muted-foreground">Cart Abandonment Rate</h3>
						<ShoppingCart className="h-5 w-5 text-orange-600" />
					</div>
					<div className="text-2xl font-bold">68%</div>
					<p className="text-xs text-muted-foreground mt-1">Recovery: $18K/mo</p>
					<div className="mt-2">
						<Badge variant="secondary">Average</Badge>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-medium text-muted-foreground">Customer LTV</h3>
						<Users className="h-5 w-5 text-purple-600" />
					</div>
					<div className="text-2xl font-bold">$485</div>
					<p className="text-xs text-muted-foreground mt-1">2.4 purchases avg</p>
					<div className="mt-2">
						<Badge variant="default">Good</Badge>
					</div>
				</div>
			</div>

			{/* Sales Performance */}
			<div className="grid gap-6 lg:grid-cols-2">
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Revenue Breakdown</h3>
						<p className="text-sm text-muted-foreground">Sales by channel and category</p>
					</div>
					<div className="p-6 space-y-4">
						<div>
							<h4 className="text-sm font-semibold mb-3">By Channel</h4>
							{[
								{ channel: "Direct Website", revenue: "$125K", percentage: 52, growth: "+15%" },
								{ channel: "Mobile App", revenue: "$72K", percentage: 30, growth: "+28%" },
								{ channel: "Marketplace (Amazon)", revenue: "$28K", percentage: 12, growth: "+8%" },
								{ channel: "Social Commerce", revenue: "$15K", percentage: 6, growth: "+42%" },
							].map((item, i) => (
								<div key={i} className="mb-4">
									<div className="flex items-center justify-between mb-2">
										<div>
											<p className="font-medium text-sm">{item.channel}</p>
											<div className="flex items-center gap-2 mt-1">
												<span className="text-xs text-muted-foreground">{item.revenue}</span>
												<Badge variant="outline" className="text-xs">{item.growth}</Badge>
											</div>
										</div>
										<span className="font-semibold">{item.percentage}%</span>
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
				</div>

				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Product Performance</h3>
						<p className="text-sm text-muted-foreground">Top categories and products</p>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ category: "Electronics", revenue: "$95K", units: "1,240", margin: "28%" },
							{ category: "Apparel", revenue: "$68K", units: "2,850", margin: "45%" },
							{ category: "Home & Garden", revenue: "$42K", units: "890", margin: "38%" },
							{ category: "Beauty & Personal", revenue: "$35K", units: "1,650", margin: "52%" },
						].map((item, i) => (
							<div key={i} className="flex items-center justify-between p-4 rounded-lg border">
								<div>
									<p className="font-semibold text-sm">{item.category}</p>
									<div className="flex items-center gap-3 mt-1">
										<span className="text-xs text-muted-foreground">{item.units} units</span>
										<span className="text-xs text-muted-foreground">• Margin: {item.margin}</span>
									</div>
								</div>
								<p className="text-lg font-bold">{item.revenue}</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Customer Acquisition */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<h3 className="text-lg font-semibold">Customer Acquisition & Retention</h3>
					<p className="text-sm text-muted-foreground">Marketing and customer metrics</p>
				</div>
				<div className="p-6">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
						{[
							{ metric: "CAC", value: "$45", change: "Down from $52", status: "Improving" },
							{ metric: "LTV:CAC Ratio", value: "10.8:1", change: "Excellent", status: "Strong" },
							{ metric: "Repeat Purchase Rate", value: "32%", change: "Industry: 25-30%", status: "Above Avg" },
							{ metric: "Customer Churn", value: "5.2%", change: "Monthly rate", status: "Good" },
							{ metric: "Referral Rate", value: "12%", change: "New customers", status: "Healthy" },
						].map((item, i) => (
							<div key={i} className="p-4 rounded-lg bg-muted/50">
								<p className="text-xs text-muted-foreground mb-2">{item.metric}</p>
								<p className="text-xl font-bold mb-1">{item.value}</p>
								<p className="text-xs text-muted-foreground mb-2">{item.change}</p>
								<Badge variant="outline" className="text-xs">{item.status}</Badge>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Operations & Fulfillment */}
			<div className="grid gap-6 lg:grid-cols-2">
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Inventory & Fulfillment</h3>
						<p className="text-sm text-muted-foreground">Stock and shipping metrics</p>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ metric: "Inventory Turnover Rate", value: "6.2x", target: "Target: 5-7x", status: "Optimal" },
							{ metric: "Stock Out Rate", value: "2.8%", target: "Below 5% target", status: "Excellent" },
							{ metric: "Average Fulfillment Time", value: "1.8 days", target: "Industry: 2-3 days", status: "Fast" },
							{ metric: "Return Rate", value: "8.5%", target: "Industry avg: 10%", status: "Good" },
							{ metric: "Shipping Cost Ratio", value: "6.2%", target: "Of total revenue", status: "Efficient" },
						].map((item, i) => (
							<div key={i} className="flex items-center justify-between p-3 rounded-lg border">
								<div>
									<p className="font-medium text-sm">{item.metric}</p>
									<p className="text-xs text-muted-foreground mt-1">{item.target}</p>
								</div>
								<div className="text-right">
									<p className="text-lg font-bold">{item.value}</p>
									<Badge variant="outline" className="text-xs mt-1">{item.status}</Badge>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Website Performance</h3>
						<p className="text-sm text-muted-foreground">Traffic and engagement metrics</p>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ metric: "Monthly Visitors", value: "124K", change: "+18% MoM" },
							{ metric: "Bounce Rate", value: "42%", change: "Below 50% benchmark" },
							{ metric: "Pages Per Session", value: "4.2", change: "Strong engagement" },
							{ metric: "Average Session Duration", value: "3:45", change: "3 min 45 sec" },
							{ metric: "Mobile Traffic", value: "68%", change: "Desktop: 32%" },
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

			{/* Marketing ROI */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<h3 className="text-lg font-semibold">Marketing Channel Performance</h3>
					<p className="text-sm text-muted-foreground">ROI and attribution by channel</p>
				</div>
				<div className="p-6">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{[
							{ channel: "Paid Search (Google)", spend: "$12K", revenue: "$68K", roas: "5.7x", conversions: 852 },
							{ channel: "Social Ads (Meta)", spend: "$8K", revenue: "$42K", roas: "5.2x", conversions: 584 },
							{ channel: "Email Marketing", spend: "$2K", revenue: "$35K", roas: "17.5x", conversions: 445 },
							{ channel: "Influencer Partnerships", spend: "$5K", revenue: "$22K", roas: "4.4x", conversions: 298 },
						].map((item, i) => (
							<div key={i} className="p-4 rounded-lg border">
								<p className="font-semibold text-sm mb-3">{item.channel}</p>
								<div className="space-y-2">
									<div className="flex justify-between text-xs">
										<span className="text-muted-foreground">Spend:</span>
										<span className="font-medium">{item.spend}</span>
									</div>
									<div className="flex justify-between text-xs">
										<span className="text-muted-foreground">Revenue:</span>
										<span className="font-medium text-green-600">{item.revenue}</span>
									</div>
									<div className="flex justify-between text-xs">
										<span className="text-muted-foreground">ROAS:</span>
										<Badge variant="default" className="text-xs">{item.roas}</Badge>
									</div>
									<div className="flex justify-between text-xs">
										<span className="text-muted-foreground">Conversions:</span>
										<span className="font-medium">{item.conversions}</span>
									</div>
								</div>
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
						<h4 className="font-semibold mb-2">E-commerce Optimization Recommendations</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>• Conversion rate of 3.8% is excellent—focus on maintaining this through A/B testing</li>
							<li>• Email marketing has exceptional 17.5x ROAS—increase investment in this channel</li>
							<li>• Mobile traffic is 68%—ensure mobile experience is fully optimized for conversion</li>
							<li>• Cart abandonment at 68% has high recovery potential—implement automated email sequences</li>
							<li>• Beauty & Personal category has 52% margin—consider expanding this product line</li>
							<li>• LTV:CAC ratio of 10.8:1 is outstanding—you can afford to scale customer acquisition</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

