import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, TrendingUp, Eye, MousePointer, DollarSign } from "lucide-react";

export default function AdboardPage() {
	const campaigns = [
		{ id: "AD-001", name: "Q4 Product Launch", platform: "Google Ads", status: "active", budget: 5000, spent: 3420, impressions: 145000, clicks: 4230, ctr: 2.92, conversions: 127, roas: 3.2 },
		{ id: "AD-002", name: "Brand Awareness Campaign", platform: "Facebook Ads", status: "active", budget: 3000, spent: 2890, impressions: 89000, clicks: 2670, ctr: 3.00, conversions: 85, roas: 2.8 },
		{ id: "AD-003", name: "Retargeting Campaign", platform: "LinkedIn Ads", status: "active", budget: 2000, spent: 1650, impressions: 32000, clicks: 960, ctr: 3.00, conversions: 48, roas: 4.1 },
		{ id: "AD-004", name: "Holiday Special", platform: "Instagram Ads", status: "paused", budget: 4000, spent: 1200, impressions: 56000, clicks: 1680, ctr: 3.00, conversions: 42, roas: 2.5 },
		{ id: "AD-005", name: "Email Newsletter Promo", platform: "Google Ads", status: "active", budget: 1500, spent: 890, impressions: 28000, clicks: 840, ctr: 3.00, conversions: 31, roas: 3.5 },
	];

	const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
	const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
	const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
	const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
	const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
	const avgCTR = ((totalClicks / totalImpressions) * 100).toFixed(2);
	const avgROAS = (campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length).toFixed(1);

	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Adboard</h1>
					<p className="text-muted-foreground">
						Campaign management and advertising analytics
					</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					New Campaign
				</Button>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Total Budget</h3>
						<DollarSign className="h-5 w-5 text-green-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">
							${totalSpent.toLocaleString()} spent ({((totalSpent/totalBudget)*100).toFixed(1)}%)
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Impressions</h3>
						<Eye className="h-5 w-5 text-blue-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{(totalImpressions / 1000).toFixed(1)}K</div>
						<p className="text-xs text-muted-foreground mt-1">
							Total reach across campaigns
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Click-Through Rate</h3>
						<MousePointer className="h-5 w-5 text-purple-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{avgCTR}%</div>
						<p className="text-xs text-muted-foreground mt-1">
							{totalClicks.toLocaleString()} total clicks
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">ROAS</h3>
						<TrendingUp className="h-5 w-5 text-orange-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{avgROAS}x</div>
						<p className="text-xs text-muted-foreground mt-1">
							Return on ad spend
						</p>
					</div>
				</div>
			</div>

			{/* Campaigns Table */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">All Campaigns</h3>
							<p className="text-sm text-muted-foreground">Manage your advertising campaigns</p>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">Filter</Button>
							<Button variant="outline" size="sm">Export</Button>
						</div>
					</div>
					<div className="mt-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search campaigns..."
								className="pl-10"
							/>
						</div>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b bg-muted/50">
							<tr>
								<th className="text-left p-4 font-medium text-sm">Campaign ID</th>
								<th className="text-left p-4 font-medium text-sm">Name</th>
								<th className="text-left p-4 font-medium text-sm">Platform</th>
								<th className="text-right p-4 font-medium text-sm">Budget</th>
								<th className="text-right p-4 font-medium text-sm">Spent</th>
								<th className="text-right p-4 font-medium text-sm">Impressions</th>
								<th className="text-right p-4 font-medium text-sm">Clicks</th>
								<th className="text-right p-4 font-medium text-sm">CTR</th>
								<th className="text-right p-4 font-medium text-sm">Conversions</th>
								<th className="text-right p-4 font-medium text-sm">ROAS</th>
								<th className="text-left p-4 font-medium text-sm">Status</th>
								<th className="text-left p-4 font-medium text-sm">Actions</th>
							</tr>
						</thead>
						<tbody>
							{campaigns.map((campaign) => (
								<tr key={campaign.id} className="border-b hover:bg-muted/50 transition-colors">
									<td className="p-4 font-mono text-sm">{campaign.id}</td>
									<td className="p-4 font-medium">{campaign.name}</td>
									<td className="p-4 text-sm">{campaign.platform}</td>
									<td className="p-4 text-sm text-right">${campaign.budget.toLocaleString()}</td>
									<td className="p-4 text-sm text-right">${campaign.spent.toLocaleString()}</td>
									<td className="p-4 text-sm text-right">{campaign.impressions.toLocaleString()}</td>
									<td className="p-4 text-sm text-right">{campaign.clicks.toLocaleString()}</td>
									<td className="p-4 text-sm text-right">{campaign.ctr.toFixed(2)}%</td>
									<td className="p-4 text-sm text-right font-semibold text-green-600">{campaign.conversions}</td>
									<td className="p-4 text-sm text-right font-semibold">{campaign.roas.toFixed(1)}x</td>
									<td className="p-4">
										<Badge 
											variant={
												campaign.status === 'active' ? 'default' : 
												campaign.status === 'paused' ? 'secondary' : 
												'outline'
											}
											className="text-xs"
										>
											{campaign.status}
										</Badge>
									</td>
									<td className="p-4">
										<Button variant="ghost" size="sm">View</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Performance Insights */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Top Performers */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Top Performing Campaigns</h3>
						<p className="text-sm text-muted-foreground">By ROAS</p>
					</div>
					<div className="p-6 space-y-3">
						{campaigns
							.sort((a, b) => b.roas - a.roas)
							.slice(0, 3)
							.map((campaign, index) => (
								<div key={campaign.id} className="flex items-center justify-between p-4 rounded-lg border">
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
											{index + 1}
										</div>
										<div>
											<p className="font-medium text-sm">{campaign.name}</p>
											<p className="text-xs text-muted-foreground">{campaign.platform}</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-semibold text-green-600">{campaign.roas.toFixed(1)}x</p>
										<p className="text-xs text-muted-foreground">{campaign.conversions} conversions</p>
									</div>
								</div>
							))}
					</div>
				</div>

				{/* Platform Distribution */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Budget by Platform</h3>
						<p className="text-sm text-muted-foreground">Ad spend distribution</p>
					</div>
					<div className="p-6 space-y-4">
						{Object.entries(
							campaigns.reduce((acc, c) => {
								acc[c.platform] = (acc[c.platform] || 0) + c.spent;
								return acc;
							}, {} as Record<string, number>)
						)
							.sort(([,a], [,b]) => b - a)
							.map(([platform, spent]) => {
								const percentage = ((spent / totalSpent) * 100).toFixed(1);
								return (
									<div key={platform}>
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm font-medium">{platform}</span>
											<div className="flex items-center gap-2">
												<span className="text-sm text-muted-foreground">${spent.toLocaleString()}</span>
												<span className="text-sm font-medium">{percentage}%</span>
											</div>
										</div>
										<div className="h-2 bg-muted rounded-full overflow-hidden">
											<div 
												className="h-full bg-blue-600 rounded-full"
												style={{ width: `${percentage}%` }}
											></div>
										</div>
									</div>
								);
							})}
					</div>
				</div>
			</div>
		</div>
	);
}

