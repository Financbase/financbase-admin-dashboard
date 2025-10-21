import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter, Plus } from "lucide-react";

export default function TransactionsPage() {
	const transactions = [
		{ id: "TXN-2024-001", date: "2024-10-21", description: "Payment from Acme Corporation", category: "Income", amount: 5499.99, status: "completed", type: "credit", method: "Bank Transfer" },
		{ id: "TXN-2024-002", date: "2024-10-21", description: "Office Supplies - Staples", category: "Office", amount: 245.00, status: "completed", type: "debit", method: "Credit Card" },
		{ id: "TXN-2024-003", date: "2024-10-20", description: "Software Subscription - Adobe", category: "Software", amount: 899.99, status: "pending", type: "debit", method: "ACH" },
		{ id: "TXN-2024-004", date: "2024-10-20", description: "Payment from Tech Solutions Ltd", category: "Income", amount: 2299.50, status: "completed", type: "credit", method: "Wire Transfer" },
		{ id: "TXN-2024-005", date: "2024-10-19", description: "Cloud Hosting - AWS", category: "Utilities", amount: 150.00, status: "completed", type: "debit", method: "Credit Card" },
		{ id: "TXN-2024-006", date: "2024-10-19", description: "Marketing Campaign - Google Ads", category: "Marketing", amount: 1250.00, status: "completed", type: "debit", method: "Credit Card" },
		{ id: "TXN-2024-007", date: "2024-10-18", description: "Payment from Global Industries", category: "Income", amount: 8999.99, status: "failed", type: "credit", method: "Bank Transfer" },
		{ id: "TXN-2024-008", date: "2024-10-18", description: "Payroll - October", category: "Payroll", amount: 35000.00, status: "completed", type: "debit", method: "ACH" },
	];

	const totalCredit = transactions.filter(t => t.type === 'credit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
	const totalDebit = transactions.filter(t => t.type === 'debit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
	const netFlow = totalCredit - totalDebit;

	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
					<p className="text-muted-foreground">
						Complete history of all financial transactions
					</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					New Transaction
				</Button>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Total Inflow</h3>
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold text-green-600">${totalCredit.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">
							From {transactions.filter(t => t.type === 'credit').length} transactions
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Total Outflow</h3>
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold text-red-600">${totalDebit.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">
							From {transactions.filter(t => t.type === 'debit').length} transactions
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Net Cash Flow</h3>
					</div>
					<div className="mt-3">
						<div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
							${netFlow.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground mt-1">This period</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{transactions.filter(t => t.status === 'pending').length}</div>
						<p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
					</div>
				</div>
			</div>

			{/* Transactions Table */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">All Transactions</h3>
							<p className="text-sm text-muted-foreground">Complete transaction history</p>
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
								placeholder="Search transactions..."
								className="pl-10"
							/>
						</div>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b bg-muted/50">
							<tr>
								<th className="text-left p-4 font-medium text-sm">Transaction ID</th>
								<th className="text-left p-4 font-medium text-sm">Date</th>
								<th className="text-left p-4 font-medium text-sm">Description</th>
								<th className="text-left p-4 font-medium text-sm">Category</th>
								<th className="text-left p-4 font-medium text-sm">Method</th>
								<th className="text-right p-4 font-medium text-sm">Amount</th>
								<th className="text-left p-4 font-medium text-sm">Status</th>
								<th className="text-left p-4 font-medium text-sm">Actions</th>
							</tr>
						</thead>
						<tbody>
							{transactions.map((txn) => (
								<tr key={txn.id} className="border-b hover:bg-muted/50 transition-colors">
									<td className="p-4 font-mono text-sm">{txn.id}</td>
									<td className="p-4 text-sm">{txn.date}</td>
									<td className="p-4 text-sm">{txn.description}</td>
									<td className="p-4 text-sm">{txn.category}</td>
									<td className="p-4 text-sm">{txn.method}</td>
									<td className={`p-4 text-sm text-right font-semibold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
										{txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}
									</td>
									<td className="p-4">
										<Badge 
											variant={
												txn.status === 'completed' ? 'default' : 
												txn.status === 'pending' ? 'secondary' : 
												'destructive'
											}
											className="text-xs"
										>
											{txn.status}
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

