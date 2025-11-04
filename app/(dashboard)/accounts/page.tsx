/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Building2, CreditCard, Wallet, Loader2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface Account {
	id: string;
	accountName: string;
	accountType: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan' | 'other';
	bankName?: string;
	lastFourDigits?: string;
	currency: string;
	currentBalance: string;
	availableBalance: string;
	creditLimit?: string;
	status: 'active' | 'inactive' | 'closed' | 'suspended';
	isPrimary: boolean;
	isReconciled: boolean;
	lastReconciledAt?: string;
	lastSyncAt?: string;
	createdAt: string;
	updatedAt: string;
}

interface AccountStats {
	totalAccounts: number;
	activeAccounts: number;
	totalBalance: number;
	totalCreditLimit: number;
	availableCredit: number;
	accountsByType: Array<{
		type: string;
		count: number;
		totalBalance: number;
	}>;
	recentActivity: Array<{
		accountId: string;
		accountName: string;
		transactionCount: number;
		totalAmount: number;
		lastActivity: string;
	}>;
}

interface ReconciliationResult {
	accountId: string;
	accountName: string;
	bookBalance: number;
	bankBalance: number;
	difference: number;
	lastReconciled: string | null;
	needsReconciliation: boolean;
	unreconciledTransactions: number;
}

export default function AccountsPage() {
	const [searchQuery, setSearchQuery] = useState("");

	// Fetch accounts data
	const { data: accountsData, isLoading: accountsLoading, error: accountsError } = useQuery({
		queryKey: ['accounts', searchQuery],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (searchQuery) params.append('search', searchQuery);

			const response = await fetch(`/api/accounts?${params.toString()}`);
			if (!response.ok) throw new Error('Failed to fetch accounts');
			return response.json();
		},
	});

	// Fetch account stats
	const { data: statsData, isLoading: statsLoading } = useQuery({
		queryKey: ['account-stats'],
		queryFn: async () => {
			const response = await fetch('/api/accounts/stats');
			if (!response.ok) throw new Error('Failed to fetch account stats');
			return response.json();
		},
	});

	// Fetch reconciliation status
	const { data: reconciliationData, isLoading: reconciliationLoading } = useQuery({
		queryKey: ['account-reconciliation'],
		queryFn: async () => {
			const response = await fetch('/api/accounts/reconcile');
			if (!response.ok) throw new Error('Failed to fetch reconciliation status');
			return response.json();
		},
	});

	const accounts: Account[] = accountsData?.accounts || [];
	const stats: AccountStats = statsData?.stats || {
		totalAccounts: 0,
		activeAccounts: 0,
		totalBalance: 0,
		totalCreditLimit: 0,
		availableCredit: 0,
		accountsByType: [],
		recentActivity: [],
	};

	const reconciliationStatus: ReconciliationResult[] = reconciliationData?.reconciliationStatus || [];

	const getAccountTypeIcon = (type: string) => {
		switch (type) {
			case 'checking':
			case 'savings':
				return <Building2 className="h-4 w-4" />;
			case 'credit_card':
				return <CreditCard className="h-4 w-4" />;
			default:
				return <Wallet className="h-4 w-4" />;
		}
	};

	const getAccountTypeColor = (type: string) => {
		switch (type) {
			case 'checking':
				return 'bg-blue-100 text-blue-800';
			case 'savings':
				return 'bg-green-100 text-green-800';
			case 'credit_card':
				return 'bg-purple-100 text-purple-800';
			case 'investment':
				return 'bg-yellow-100 text-yellow-800';
			case 'loan':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case 'active':
				return 'default';
			case 'inactive':
				return 'secondary';
			case 'closed':
				return 'destructive';
			case 'suspended':
				return 'destructive';
			default:
				return 'secondary';
		}
	};

	if (accountsLoading || statsLoading || reconciliationLoading) {
		return (
			<div className="space-y-8 p-8">
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}

	if (accountsError) {
		return (
			<div className="space-y-8 p-8">
				<div className="text-center text-red-600">
					Error loading accounts: {accountsError.message}
				</div>
			</div>
		);
	}

	const totalAssets = accounts
		.filter(a => Number(a.currentBalance) > 0)
		.reduce((sum, a) => sum + Number(a.currentBalance), 0);
	
	const totalLiabilities = Math.abs(accounts
		.filter(a => Number(a.currentBalance) < 0)
		.reduce((sum, a) => sum + Number(a.currentBalance), 0));
	
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
							Across {accounts.filter(a => Number(a.currentBalance) > 0).length} accounts
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
						<div className="text-2xl font-bold">{stats.activeAccounts}</div>
						<p className="text-xs text-muted-foreground mt-1">
							Connected and synced
						</p>
					</div>
				</div>
			</div>

			{/* Reconciliation Status */}
			{reconciliationStatus.length > 0 && (
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Reconciliation Status</h3>
						<p className="text-sm text-muted-foreground">Account reconciliation overview</p>
					</div>
					<div className="p-6 space-y-3">
						{reconciliationStatus.map((status) => (
							<div key={status.accountId} className="flex items-center justify-between p-4 rounded-lg border">
								<div className="flex items-center gap-3">
									{status.needsReconciliation ? (
										<AlertCircle className="h-5 w-5 text-yellow-600" />
									) : (
										<CheckCircle className="h-5 w-5 text-green-600" />
									)}
									<div>
										<p className="font-medium">{status.accountName}</p>
										<p className="text-sm text-muted-foreground">
											Book: ${status.bookBalance.toLocaleString()} | 
											Bank: ${status.bankBalance.toLocaleString()}
											{status.difference > 0 && (
												<span className="text-yellow-600 ml-2">
													(Diff: ${status.difference.toLocaleString()})
												</span>
											)}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Badge variant={status.needsReconciliation ? 'destructive' : 'default'}>
										{status.needsReconciliation ? 'Needs Reconciliation' : 'Reconciled'}
									</Badge>
									<Button variant="outline" size="sm">
										Reconcile
									</Button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Accounts by Type */}
			<div className="grid gap-6 lg:grid-cols-3">
				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Banking Accounts</h3>
						<p className="text-sm text-muted-foreground">Checking & Savings</p>
					</div>
					<div className="p-6 space-y-3">
						{accounts.filter(a => a.accountType === 'checking' || a.accountType === 'savings').map((acc) => (
							<div key={acc.id} className="flex items-center justify-between">
								<div>
									<p className="font-medium text-sm">{acc.accountName}</p>
									<p className="text-xs text-muted-foreground">
										{acc.lastFourDigits ? `****${acc.lastFourDigits}` : acc.bankName}
									</p>
								</div>
								<div className="text-right">
									<p className="font-semibold">${Number(acc.currentBalance).toLocaleString()}</p>
									{acc.isPrimary && (
										<Badge variant="outline" className="text-xs">Primary</Badge>
									)}
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
						{accounts.filter(a => a.accountType === 'credit_card').map((acc) => (
							<div key={acc.id} className="flex items-center justify-between">
								<div>
									<p className="font-medium text-sm">{acc.accountName}</p>
									<p className="text-xs text-muted-foreground">
										{acc.lastFourDigits ? `****${acc.lastFourDigits}` : acc.bankName}
									</p>
								</div>
								<div className="text-right">
									<p className="font-semibold text-red-600">${Math.abs(Number(acc.currentBalance)).toLocaleString()}</p>
									{acc.creditLimit && (
										<p className="text-xs text-muted-foreground">
											Limit: ${Number(acc.creditLimit).toLocaleString()}
										</p>
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Other Accounts</h3>
						<p className="text-sm text-muted-foreground">Investments & Loans</p>
					</div>
					<div className="p-6 space-y-3">
						{accounts.filter(a => a.accountType === 'investment' || a.accountType === 'loan' || a.accountType === 'other').map((acc) => (
							<div key={acc.id} className="flex items-center justify-between">
								<div>
									<p className="font-medium text-sm">{acc.accountName}</p>
									<p className="text-xs text-muted-foreground">
										{acc.lastFourDigits ? `****${acc.lastFourDigits}` : acc.bankName}
									</p>
								</div>
								<div className="text-right">
									<p className="font-semibold">${Number(acc.currentBalance).toLocaleString()}</p>
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
							<RefreshCw className="mr-2 h-4 w-4" />
							Sync All
						</Button>
					</div>
					<div className="mt-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search accounts..."
								className="pl-10"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
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
							{accounts.length === 0 ? (
								<tr>
									<td colSpan={8} className="text-center py-8 text-muted-foreground">
										No accounts found. Connect your first account to get started.
									</td>
								</tr>
							) : (
								accounts.map((account) => (
									<tr key={account.id} className="border-b hover:bg-muted/50 transition-colors">
										<td className="p-4">
											<div className="flex items-center gap-2">
												{getAccountTypeIcon(account.accountType)}
												<div>
													<p className="font-medium">{account.accountName}</p>
													{account.isPrimary && (
														<Badge variant="outline" className="text-xs">Primary</Badge>
													)}
												</div>
											</div>
										</td>
										<td className="p-4">
											<Badge className={`text-xs ${getAccountTypeColor(account.accountType)}`}>
												{account.accountType.replace('_', ' ')}
											</Badge>
										</td>
										<td className="p-4 text-sm">{account.bankName || 'N/A'}</td>
										<td className="p-4 font-mono text-sm">
											{account.lastFourDigits ? `****${account.lastFourDigits}` : 'N/A'}
										</td>
										<td className={`p-4 text-sm text-right font-semibold ${Number(account.currentBalance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
											${Math.abs(Number(account.currentBalance)).toLocaleString()}
										</td>
										<td className="p-4 text-sm">
											{account.lastSyncAt ? new Date(account.lastSyncAt).toLocaleDateString() : 'Never'}
										</td>
										<td className="p-4">
											<Badge variant={getStatusBadgeVariant(account.status)} className="text-xs">
												{account.status}
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