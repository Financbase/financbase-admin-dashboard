import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Download, Filter, CheckCircle, Clock, XCircle } from "lucide-react";

export default function PaymentsPage() {
	const payments = [
		{ id: "PAY-2024-001", date: "2024-10-21", client: "Acme Corporation", invoice: "INV-001", method: "Bank Transfer", amount: 5499.99, status: "completed", processor: "Stripe" },
		{ id: "PAY-2024-002", date: "2024-10-21", client: "TechStart Inc", invoice: "INV-023", method: "Credit Card", amount: 1250.00, status: "completed", processor: "Stripe" },
		{ id: "PAY-2024-003", date: "2024-10-20", client: "Global Industries", invoice: "INV-045", method: "Wire Transfer", amount: 8999.99, status: "pending", processor: "Manual" },
		{ id: "PAY-2024-004", date: "2024-10-20", client: "Tech Solutions Ltd", invoice: "INV-012", method: "ACH", amount: 2299.50, status: "completed", processor: "Plaid" },
		{ id: "PAY-2024-005", date: "2024-10-19", client: "Digital Dynamics", invoice: "INV-089", method: "PayPal", amount: 750.00, status: "completed", processor: "PayPal" },
		{ id: "PAY-2024-006", date: "2024-10-19", client: "Creative Studios", invoice: "INV-067", method: "Credit Card", amount: 3200.00, status: "failed", processor: "Stripe" },
		{ id: "PAY-2024-007", date: "2024-10-18", client: "Startup Labs", invoice: "INV-034", method: "Bank Transfer", amount: 1850.00, status: "completed", processor: "Stripe" },
		{ id: "PAY-2024-008", date: "2024-10-18", client: "Innovation Corp", invoice: "INV-078", method: "Credit Card", amount: 4500.00, status: "processing", processor: "Stripe" },
	];

	const completedPayments = payments.filter(p => p.status === 'completed');
	const totalCompleted = completedPayments.reduce((sum, p) => sum + p.amount, 0);
	const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'processing');
	const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
	const failedPayments = payments.filter(p => p.status === 'failed');

	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Payments</h1>
					<p className="text-muted-foreground">
						Track and manage all payment transactions
					</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Record Payment
				</Button>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
						<CheckCircle className="h-5 w-5 text-green-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold text-green-600">${totalCompleted.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{completedPayments.length} successful payments
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
						<Clock className="h-5 w-5 text-yellow-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold text-yellow-600">${totalPending.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{pendingPayments.length} awaiting processing
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Failed</h3>
						<XCircle className="h-5 w-5 text-red-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold text-red-600">{failedPayments.length}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Requires attention
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Success Rate</h3>
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold text-blue-600">
							{((completedPayments.length / payments.length) * 100).toFixed(1)}%
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Payment success rate
						</p>
					</div>
				</div>
			</div>

			{/* Payment Methods */}
			<div className="grid gap-6 lg:grid-cols-3">
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">By Payment Method</h3>
						<p className="text-sm text-muted-foreground">Distribution of payment types</p>
					</div>
					<div className="p-6 space-y-4">
						{[
							{ method: "Bank Transfer", count: 3, amount: 18549.99, color: "bg-blue-600" },
							{ method: "Credit Card", count: 3, amount: 8950.00, color: "bg-purple-600" },
							{ method: "ACH", count: 1, amount: 2299.50, color: "bg-green-600" },
							{ method: "PayPal", count: 1, amount: 750.00, color: "bg-orange-600" },
						].map((method) => (
							<div key={method.method}>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">{method.method}</span>
									<span className="text-sm text-muted-foreground">
										{method.count} ({((method.count / payments.length) * 100).toFixed(0)}%)
									</span>
								</div>
								<div className="h-2 bg-muted rounded-full overflow-hidden">
									<div 
										className={`h-full ${method.color} rounded-full`}
										style={{ width: `${(method.count / payments.length) * 100}%` }}
									></div>
								</div>
								<p className="text-xs text-muted-foreground mt-1">${method.amount.toLocaleString()}</p>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Recent Activity</h3>
						<p className="text-sm text-muted-foreground">Latest payment updates</p>
					</div>
					<div className="p-6 space-y-3">
						{payments.slice(0, 4).map((payment) => (
							<div key={payment.id} className="flex items-center justify-between border-b pb-3 last:border-0">
								<div>
									<p className="font-medium text-sm">{payment.client}</p>
									<p className="text-xs text-muted-foreground">{payment.id}</p>
								</div>
								<div className="text-right">
									<p className="font-semibold text-sm">${payment.amount.toLocaleString()}</p>
									<Badge 
										variant={
											payment.status === 'completed' ? 'default' : 
											payment.status === 'pending' || payment.status === 'processing' ? 'secondary' : 
											'destructive'
										}
										className="text-xs"
									>
										{payment.status}
									</Badge>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Payment Processors</h3>
						<p className="text-sm text-muted-foreground">Integration status</p>
					</div>
					<div className="p-6 space-y-3">
						{[
							{ processor: "Stripe", status: "active", count: 5 },
							{ processor: "Plaid", status: "active", count: 1 },
							{ processor: "PayPal", status: "active", count: 1 },
							{ processor: "Manual", status: "active", count: 1 },
						].map((proc) => (
							<div key={proc.processor} className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 rounded-full bg-green-500"></div>
									<span className="text-sm font-medium">{proc.processor}</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-xs text-muted-foreground">{proc.count} payments</span>
									<Badge variant="outline" className="text-xs">
										{proc.status}
									</Badge>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Payments Table */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">All Payments</h3>
							<p className="text-sm text-muted-foreground">Complete payment history</p>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">
								<Filter className="mr-2 h-4 w-4" />
								Filter
							</Button>
							<Button variant="outline" size="sm">
								<Download className="mr-2 h-4 w-4" />
								Export
							</Button>
						</div>
					</div>
					<div className="mt-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search payments..."
								className="pl-10"
							/>
						</div>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b bg-muted/50">
							<tr>
								<th className="text-left p-4 font-medium text-sm">Payment ID</th>
								<th className="text-left p-4 font-medium text-sm">Date</th>
								<th className="text-left p-4 font-medium text-sm">Client</th>
								<th className="text-left p-4 font-medium text-sm">Invoice</th>
								<th className="text-left p-4 font-medium text-sm">Method</th>
								<th className="text-left p-4 font-medium text-sm">Processor</th>
								<th className="text-right p-4 font-medium text-sm">Amount</th>
								<th className="text-left p-4 font-medium text-sm">Status</th>
								<th className="text-left p-4 font-medium text-sm">Actions</th>
							</tr>
						</thead>
						<tbody>
							{payments.map((payment) => (
								<tr key={payment.id} className="border-b hover:bg-muted/50 transition-colors">
									<td className="p-4 font-mono text-sm">{payment.id}</td>
									<td className="p-4 text-sm">{payment.date}</td>
									<td className="p-4 text-sm">{payment.client}</td>
									<td className="p-4 font-mono text-sm">{payment.invoice}</td>
									<td className="p-4 text-sm">{payment.method}</td>
									<td className="p-4 text-sm">{payment.processor}</td>
									<td className="p-4 text-sm text-right font-semibold">${payment.amount.toFixed(2)}</td>
									<td className="p-4">
										<Badge 
											variant={
												payment.status === 'completed' ? 'default' : 
												payment.status === 'pending' || payment.status === 'processing' ? 'secondary' : 
												'destructive'
											}
											className="text-xs"
										>
											{payment.status}
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
		</div>
	);
}

