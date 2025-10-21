import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Building2, CreditCard, Wallet } from "lucide-react";

export default function AccountsPage() {
	const accounts = [
		{ id: "ACC-001", name: "Business Checking", type: "Checking", institution: "Chase Bank", accountNumber: "****4532", balance: 124592.45, status: "active", lastSync: "2024-10-21" },
		{ id: "ACC-002", name: "Business Savings", type: "Savings", institution: "Chase Bank", accountNumber: "****7891", balance: 85000.00, status: "active", lastSync: "2024-10-21" },
		{ id: "ACC-003", name: "Business Credit Card", type: "Credit", institution: "American Express", accountNumber: "****3002", balance: -12450.00, status: "active", lastSync: "2024-10-21" },
		{ id: "ACC-004", name: "Merchant Account", type: "Merchant", institution: "Stripe", accountNumber: "****8765", balance: 45231.89, status: "active", lastSync: "2024-10-21" },
		{ id: "ACC-005", name: "Payroll Account", type: "Checking", institution: "Wells Fargo", accountNumber: "****2103", balance: 67500.00, status: "active", lastSync: "2024-10-20" },
		{ id: "ACC-006", name: "Investment Account", type: "Investment", institution: "Vanguard", accountNumber: "****9421", balance: 250000.00, status: "active", lastSync: "2024-10-20" },
	];

	const totalAssets = accounts.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0);
	const totalLiabilities = Math.abs(accounts.filter(a => a.balance < 0).reduce((sum, a) => sum + a.balance, 0));
	const netWorth = totalAssets - totalLiabilities;

	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
					<p className="text-muted-foreground">
						Manage your financial accounts and view balances
					</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Connect Account
				</Button>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Total Assets</h3>
						<Wallet className="h-5 w-5 text-green-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold text-green-600">${totalAssets.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Across {accounts.filter(a => a.balance > 0).length} accounts
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Liabilities</h3>
						<CreditCard className="h-5 w-5 text-red-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold text-red-600">${totalLiabilities.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Outstanding balances
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Net Worth</h3>
						<Building2 className="h-5 w-5 text-blue-600" />
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold text-blue-600">${netWorth.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Assets minus liabilities
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Active Accounts</h3>
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{accounts.filter(a => a.status === 'active').length}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Connected and synced
						</p>
					</div>
				</div>
			</div>

			{/* Accounts by Type */}
			<div className="grid gap-6 lg:grid-cols-3">
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Banking Accounts</h3>
						<p className="text-sm text-muted-foreground">Checking & Savings</p>
					</div>
					<div className="p-6 space-y-3">
						{accounts.filter(a => a.type === 'Checking' || a.type === 'Savings').map((acc) => (
							<div key={acc.id} className="flex items-center justify-between">
								<div>
									<p className="font-medium text-sm">{acc.name}</p>
									<p className="text-xs text-muted-foreground">{acc.accountNumber}</p>
								</div>
								<div className="text-right">
									<p className="font-semibold">${acc.balance.toLocaleString()}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Credit Accounts</h3>
						<p className="text-sm text-muted-foreground">Cards & Lines of Credit</p>
					</div>
					<div className="p-6 space-y-3">
						{accounts.filter(a => a.type === 'Credit').map((acc) => (
							<div key={acc.id} className="flex items-center justify-between">
								<div>
									<p className="font-medium text-sm">{acc.name}</p>
									<p className="text-xs text-muted-foreground">{acc.accountNumber}</p>
								</div>
								<div className="text-right">
									<p className="font-semibold text-red-600">${Math.abs(acc.balance).toLocaleString()}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Other Accounts</h3>
						<p className="text-sm text-muted-foreground">Investments & Merchant</p>
					</div>
					<div className="p-6 space-y-3">
						{accounts.filter(a => a.type === 'Investment' || a.type === 'Merchant').map((acc) => (
							<div key={acc.id} className="flex items-center justify-between">
								<div>
									<p className="font-medium text-sm">{acc.name}</p>
									<p className="text-xs text-muted-foreground">{acc.accountNumber}</p>
								</div>
								<div className="text-right">
									<p className="font-semibold">${acc.balance.toLocaleString()}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* All Accounts Table */}
			<div className="rounded-lg border bg-card">
				<div className="p-6 border-b">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">All Accounts</h3>
							<p className="text-sm text-muted-foreground">Complete list of connected accounts</p>
						</div>
						<Button variant="outline" size="sm">
							Sync All
						</Button>
					</div>
					<div className="mt-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search accounts..."
								className="pl-10"
							/>
						</div>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="border-b bg-muted/50">
							<tr>
								<th className="text-left p-4 font-medium text-sm">Account</th>
								<th className="text-left p-4 font-medium text-sm">Type</th>
								<th className="text-left p-4 font-medium text-sm">Institution</th>
								<th className="text-left p-4 font-medium text-sm">Account Number</th>
								<th className="text-right p-4 font-medium text-sm">Balance</th>
								<th className="text-left p-4 font-medium text-sm">Last Synced</th>
								<th className="text-left p-4 font-medium text-sm">Status</th>
								<th className="text-left p-4 font-medium text-sm">Actions</th>
							</tr>
						</thead>
						<tbody>
							{accounts.map((account) => (
								<tr key={account.id} className="border-b hover:bg-muted/50 transition-colors">
									<td className="p-4 font-medium">{account.name}</td>
									<td className="p-4 text-sm">{account.type}</td>
									<td className="p-4 text-sm">{account.institution}</td>
									<td className="p-4 font-mono text-sm">{account.accountNumber}</td>
									<td className={`p-4 text-sm text-right font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
										${Math.abs(account.balance).toLocaleString()}
									</td>
									<td className="p-4 text-sm">{account.lastSync}</td>
									<td className="p-4">
										<Badge variant={account.status === 'active' ? 'default' : 'secondary'} className="text-xs">
											{account.status}
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

