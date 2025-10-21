import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, DollarSign, CreditCard, FileText } from "lucide-react";

export default function UnifiedDashboardPage() {
	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<div className="flex items-center gap-2 mb-2">
						<h1 className="text-3xl font-bold tracking-tight">Unified Dashboard</h1>
						<Badge variant="secondary" className="bg-blue-100 text-blue-800">New</Badge>
					</div>
					<p className="text-muted-foreground">
						All-in-one view of your financial operations and key metrics
					</p>
				</div>
			</div>

			{/* Key Metrics Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between space-x-4">
						<div className="flex items-center space-x-2">
							<DollarSign className="h-5 w-5 text-green-600" />
							<h3 className="text-sm font-medium">Total Revenue</h3>
						</div>
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">$124,592</div>
						<p className="text-xs text-muted-foreground mt-1">
							<span className="text-green-600">↑ 12.5%</span> from last month
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between space-x-4">
						<div className="flex items-center space-x-2">
							<CreditCard className="h-5 w-5 text-blue-600" />
							<h3 className="text-sm font-medium">Transactions</h3>
						</div>
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">1,284</div>
						<p className="text-xs text-muted-foreground mt-1">
							<span className="text-blue-600">↑ 8.2%</span> from last month
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between space-x-4">
						<div className="flex items-center space-x-2">
							<Users className="h-5 w-5 text-purple-600" />
							<h3 className="text-sm font-medium">Active Clients</h3>
						</div>
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">156</div>
						<p className="text-xs text-muted-foreground mt-1">
							<span className="text-purple-600">↑ 5.1%</span> from last month
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between space-x-4">
						<div className="flex items-center space-x-2">
							<FileText className="h-5 w-5 text-orange-600" />
							<h3 className="text-sm font-medium">Pending Items</h3>
						</div>
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">23</div>
						<p className="text-xs text-muted-foreground mt-1">
							<span className="text-orange-600">Requires attention</span>
						</p>
					</div>
				</div>
			</div>

			{/* Two Column Layout */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Recent Transactions */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Recent Transactions</h3>
						<p className="text-sm text-muted-foreground">Your latest financial activity</p>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ id: "TXN-001", desc: "Payment from Acme Corp", amount: "+$5,499.99", status: "completed", time: "2 hours ago" },
							{ id: "TXN-002", desc: "Office Supplies", amount: "-$245.00", status: "completed", time: "5 hours ago" },
							{ id: "TXN-003", desc: "Software Subscription", amount: "-$899.99", status: "pending", time: "1 day ago" },
							{ id: "TXN-004", desc: "Payment from Tech Solutions", amount: "+$2,299.50", status: "completed", time: "2 days ago" },
						].map((txn) => (
							<div key={txn.id} className="flex items-center justify-between border-b pb-4 last:border-0">
								<div>
									<p className="font-medium">{txn.desc}</p>
									<div className="flex items-center gap-2 mt-1">
										<p className="text-xs text-muted-foreground">{txn.id}</p>
										<span className="text-xs">•</span>
										<p className="text-xs text-muted-foreground">{txn.time}</p>
									</div>
								</div>
								<div className="text-right">
									<p className={`font-semibold ${txn.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
										{txn.amount}
									</p>
									<Badge variant={txn.status === 'completed' ? 'default' : 'secondary'} className="text-xs mt-1">
										{txn.status}
									</Badge>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Quick Stats */}
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Performance Overview</h3>
						<p className="text-sm text-muted-foreground">Key performance indicators</p>
					</div>
					<div className="p-6 space-y-6">
						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium">Revenue Target</span>
								<span className="text-sm text-muted-foreground">84% complete</span>
							</div>
							<div className="h-2 bg-muted rounded-full overflow-hidden">
								<div className="h-full bg-green-600 rounded-full" style={{ width: '84%' }}></div>
							</div>
							<p className="text-xs text-muted-foreground mt-1">$124,592 of $150,000 goal</p>
						</div>

						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium">Client Acquisition</span>
								<span className="text-sm text-muted-foreground">78% complete</span>
							</div>
							<div className="h-2 bg-muted rounded-full overflow-hidden">
								<div className="h-full bg-blue-600 rounded-full" style={{ width: '78%' }}></div>
							</div>
							<p className="text-xs text-muted-foreground mt-1">156 of 200 clients target</p>
						</div>

						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium">Expense Management</span>
								<span className="text-sm text-muted-foreground">65% of budget</span>
							</div>
							<div className="h-2 bg-muted rounded-full overflow-hidden">
								<div className="h-full bg-orange-500 rounded-full" style={{ width: '65%' }}></div>
							</div>
							<p className="text-xs text-muted-foreground mt-1">$78,234 of $120,000 budget</p>
						</div>

						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium">Invoice Collection</span>
								<span className="text-sm text-muted-foreground">92% collected</span>
							</div>
							<div className="h-2 bg-muted rounded-full overflow-hidden">
								<div className="h-full bg-purple-600 rounded-full" style={{ width: '92%' }}></div>
							</div>
							<p className="text-xs text-muted-foreground mt-1">$45,231 of $49,000 invoiced</p>
						</div>
					</div>
				</div>
			</div>

			{/* Action Items */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<h3 className="text-lg font-semibold">Action Items</h3>
					<p className="text-sm text-muted-foreground">Tasks requiring your attention</p>
				</div>
				<div className="p-6">
					<div className="space-y-3">
						<div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
							<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 mt-0.5">
								<span className="text-xs font-bold">!</span>
							</div>
							<div className="flex-1">
								<p className="font-medium">3 invoices overdue</p>
								<p className="text-sm text-muted-foreground">Total amount: $12,340.00</p>
							</div>
							<button className="text-sm text-primary hover:underline">Review</button>
						</div>

						<div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
							<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 mt-0.5">
								<span className="text-xs font-bold">!</span>
							</div>
							<div className="flex-1">
								<p className="font-medium">5 expenses awaiting approval</p>
								<p className="text-sm text-muted-foreground">Total amount: $2,145.00</p>
							</div>
							<button className="text-sm text-primary hover:underline">Approve</button>
						</div>

						<div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
							<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 mt-0.5">
								<span className="text-xs font-bold">i</span>
							</div>
							<div className="flex-1">
								<p className="font-medium">Monthly report ready</p>
								<p className="text-sm text-muted-foreground">October 2025 financial summary</p>
							</div>
							<button className="text-sm text-primary hover:underline">View</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

