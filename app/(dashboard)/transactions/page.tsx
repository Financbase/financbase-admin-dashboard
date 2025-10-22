"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface Transaction {
	id: string;
	transactionNumber: string;
	type: 'credit' | 'debit';
	amount: string;
	currency: string;
	description: string;
	category: string;
	status: 'pending' | 'completed' | 'failed' | 'cancelled';
	paymentMethod?: string;
	referenceId?: string;
	referenceType?: string;
	accountId?: string;
	transactionDate: string;
	processedAt?: string;
	notes?: string;
	metadata?: string;
	createdAt: string;
	updatedAt: string;
}

interface TransactionStats {
	totalTransactions: number;
	totalInflow: number;
	totalOutflow: number;
	netFlow: number;
	pendingTransactions: number;
	completedTransactions: number;
	categoryBreakdown: Array<{
		category: string;
		amount: number;
		count: number;
	}>;
	monthlyTrend: Array<{
		month: string;
		inflow: number;
		outflow: number;
		net: number;
	}>;
}

export default function TransactionsPage() {
	const [searchQuery, setSearchQuery] = useState("");

	// Fetch transactions data
	const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useQuery({
		queryKey: ['transactions', searchQuery],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (searchQuery) params.append('search', searchQuery);
			
			const response = await fetch(`/api/transactions?${params.toString()}`);
			if (!response.ok) throw new Error('Failed to fetch transactions');
			return response.json();
		},
	});

	// Fetch transaction stats
	const { data: statsData, isLoading: statsLoading } = useQuery({
		queryKey: ['transaction-stats'],
		queryFn: async () => {
			const response = await fetch('/api/transactions/stats');
			if (!response.ok) throw new Error('Failed to fetch transaction stats');
			return response.json();
		},
	});

	const transactions: Transaction[] = transactionsData?.transactions || [];
	const stats: TransactionStats = statsData?.stats || {
		totalTransactions: 0,
		totalInflow: 0,
		totalOutflow: 0,
		netFlow: 0,
		pendingTransactions: 0,
		completedTransactions: 0,
		categoryBreakdown: [],
		monthlyTrend: [],
	};

	if (transactionsLoading || statsLoading) {
		return (
			<div className="space-y-8 p-8">
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}

	if (transactionsError) {
		return (
			<div className="space-y-8 p-8">
				<div className="text-center text-red-600">
					Error loading transactions: {transactionsError.message}
				</div>
			</div>
		);
	}

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
						<div className="text-2xl font-bold text-green-600">${stats.totalInflow.toLocaleString()}</div>
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
						<div className="text-2xl font-bold text-red-600">${stats.totalOutflow.toLocaleString()}</div>
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
						<div className={`text-2xl font-bold ${stats.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
							${stats.netFlow.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground mt-1">This period</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
					</div>
					<div className="mt-3">
						<div className="text-2xl font-bold">{stats.pendingTransactions}</div>
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
							{transactions.length === 0 ? (
								<tr>
									<td colSpan={8} className="text-center py-8 text-muted-foreground">
										No transactions found. Create your first transaction to get started.
									</td>
								</tr>
							) : (
								transactions.map((txn) => (
									<tr key={txn.id} className="border-b hover:bg-muted/50 transition-colors">
										<td className="p-4 font-mono text-sm">{txn.transactionNumber}</td>
										<td className="p-4 text-sm">{new Date(txn.transactionDate).toLocaleDateString()}</td>
										<td className="p-4 text-sm">{txn.description}</td>
										<td className="p-4 text-sm">{txn.category}</td>
										<td className="p-4 text-sm">{txn.paymentMethod || 'N/A'}</td>
										<td className={`p-4 text-sm text-right font-semibold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
											{txn.type === 'credit' ? '+' : '-'}${Number(txn.amount).toFixed(2)}
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
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

