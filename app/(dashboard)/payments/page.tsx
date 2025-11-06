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
import { Search, Plus, Download, Filter, CheckCircle, Clock, XCircle, Loader2, CreditCard, Building, DollarSign, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface PaymentMethod {
	id: string;
	userId: string;
	accountId?: string;
	paymentMethodType: 'stripe' | 'paypal' | 'square' | 'bank_transfer' | 'check' | 'cash' | 'other';
	name: string;
	description?: string;
	status: 'active' | 'inactive' | 'suspended' | 'failed';
	isDefault: boolean;
	processingFee?: string;
	fixedFee?: string;
	currency: string;
	isTestMode: boolean;
	lastUsedAt?: string;
	createdAt: string;
	updatedAt: string;
}

interface Payment {
	id: string;
	userId: string;
	paymentMethodId: string;
	invoiceId?: string;
	paymentType: 'invoice_payment' | 'refund' | 'chargeback' | 'adjustment' | 'transfer';
	amount: string;
	currency: string;
	processingFee: string;
	netAmount: string;
	description?: string;
	reference?: string;
	status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
	processedAt?: string;
	failedAt?: string;
	refundedAt?: string;
	failureReason?: string;
	failureCode?: string;
	refundAmount: string;
	refundReason?: string;
	createdAt: string;
	updatedAt: string;
}

interface PaymentStats {
	totalPayments: number;
	totalAmount: number;
	successfulPayments: number;
	failedPayments: number;
	averagePaymentAmount: number;
	paymentMethodsCount: number;
	recentPayments: Array<{
		id: string;
		amount: number;
		status: string;
		paymentMethodName: string;
		createdAt: string;
	}>;
	paymentsByMethod: Array<{
		paymentMethodType: string;
		count: number;
		totalAmount: number;
	}>;
	monthlyTrend: Array<{
		month: string;
		payments: number;
		amount: number;
	}>;
}

export default function PaymentsPage() {
	const [searchQuery, setSearchQuery] = useState("");

	// Fetch payment methods
	const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = useQuery({
		queryKey: ['payment-methods'],
		queryFn: async () => {
			const response = await fetch('/api/payment-methods');
			if (!response.ok) throw new Error('Failed to fetch payment methods');
			return response.json();
		},
	});

	// Fetch payments data
	const { data: paymentsData, isLoading: paymentsLoading, error: paymentsError } = useQuery({
		queryKey: ['payments', searchQuery],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (searchQuery) params.append('search', searchQuery);

			const response = await fetch(`/api/payments?${params.toString()}`);
			if (!response.ok) throw new Error('Failed to fetch payments');
			return response.json();
		},
	});

	// Fetch payment stats
	const { data: statsData, isLoading: statsLoading } = useQuery({
		queryKey: ['payment-stats'],
		queryFn: async () => {
			const response = await fetch('/api/payments/stats');
			if (!response.ok) throw new Error('Failed to fetch payment stats');
			return response.json();
		},
	});

	const paymentMethods: PaymentMethod[] = paymentMethodsData?.paymentMethods || [];
	const payments: Payment[] = paymentsData?.payments || [];
	const stats: PaymentStats = statsData?.stats || {
		totalPayments: 0,
		totalAmount: 0,
		successfulPayments: 0,
		failedPayments: 0,
		averagePaymentAmount: 0,
		paymentMethodsCount: 0,
		recentPayments: [],
		paymentsByMethod: [],
		monthlyTrend: [],
	};

	const getPaymentMethodIcon = (type: string) => {
		switch (type) {
			case 'stripe':
				return <CreditCard className="h-4 w-4" />;
			case 'paypal':
			case 'square':
				return <Building className="h-4 w-4" />;
			case 'bank_transfer':
				return <Building className="h-4 w-4" />;
			default:
				return <DollarSign className="h-4 w-4" />;
		}
	};

	const getPaymentMethodColor = (type: string) => {
		switch (type) {
			case 'stripe':
				return 'bg-purple-100 text-purple-800';
			case 'paypal':
				return 'bg-blue-100 text-blue-800';
			case 'square':
				return 'bg-green-100 text-green-800';
			case 'bank_transfer':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'completed':
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case 'failed':
				return <XCircle className="h-4 w-4 text-red-600" />;
			case 'processing':
			case 'pending':
				return <Clock className="h-4 w-4 text-yellow-600" />;
			default:
				return <Clock className="h-4 w-4 text-gray-600" />;
		}
	};

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case 'completed':
				return 'default';
			case 'failed':
				return 'destructive';
			case 'processing':
			case 'pending':
				return 'secondary';
			case 'refunded':
				return 'outline';
			default:
				return 'secondary';
		}
	};

	if (paymentMethodsLoading || paymentsLoading || statsLoading) {
		return (
			<div className="space-y-8 p-8">
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}

	if (paymentsError) {
		return (
			<div className="space-y-8 p-8">
				<div className="text-center text-red-600">
					Error loading payments: {paymentsError.message}
				</div>
			</div>
		);
	}

	const completedPayments = payments.filter(p => p.status === 'completed');
	const totalCompleted = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
	const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'processing');
	const totalPending = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
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
							{payments.length > 0 ? ((completedPayments.length / payments.length) * 100).toFixed(1) : 0}%
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
						<h3 className="text-lg font-semibold">Payment Methods</h3>
						<p className="text-sm text-muted-foreground">Available payment options</p>
					</div>
					<div className="p-6 space-y-3">
						{paymentMethods.length === 0 ? (
							<div className="text-center text-muted-foreground py-4">
								No payment methods configured
							</div>
						) : (
							paymentMethods.map((method) => (
								<div key={method.id} className="flex items-center justify-between p-3 rounded-lg border">
									<div className="flex items-center gap-3">
										{getPaymentMethodIcon(method.paymentMethodType)}
										<div>
											<p className="font-medium text-sm">{method.name}</p>
											<p className="text-xs text-muted-foreground">
												{method.paymentMethodType.replace('_', ' ')}
												{method.isDefault && ' • Default'}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Badge className={`text-xs ${getPaymentMethodColor(method.paymentMethodType)}`}>
											{method.status}
										</Badge>
										{method.isTestMode && (
											<Badge variant="outline" className="text-xs">Test</Badge>
										)}
									</div>
								</div>
							))
						)}
					</div>
				</div>

				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">By Payment Method</h3>
						<p className="text-sm text-muted-foreground">Distribution of payment types</p>
					</div>
					<div className="p-6 space-y-4">
						{stats.paymentsByMethod.length === 0 ? (
							<div className="text-center text-muted-foreground py-4">
								No payment data available
							</div>
						) : (
							stats.paymentsByMethod.map((method, index) => {
								const colors = ["bg-blue-600", "bg-purple-600", "bg-green-600", "bg-orange-600"];
								const percentage = stats.totalPayments > 0 ? (method.count / stats.totalPayments) * 100 : 0;
								
								return (
									<div key={method.paymentMethodType}>
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm font-medium">{method.paymentMethodType.replace('_', ' ')}</span>
											<span className="text-sm text-muted-foreground">
												{method.count} ({percentage.toFixed(0)}%)
											</span>
										</div>
										<div className="h-2 bg-muted rounded-full overflow-hidden">
											<div 
												className={`h-full ${colors[index % colors.length]} rounded-full`}
												style={{ width: `${percentage}%` }}
											></div>
										</div>
										<p className="text-xs text-muted-foreground mt-1">${method.totalAmount.toLocaleString()}</p>
									</div>
								);
							})
						)}
					</div>
				</div>

				<div className="rounded-lg border bg-card">
					<div className="p-6 border-b">
						<h3 className="text-lg font-semibold">Recent Activity</h3>
						<p className="text-sm text-muted-foreground">Latest payment updates</p>
					</div>
					<div className="p-6 space-y-3">
						{stats.recentPayments.length === 0 ? (
							<div className="text-center text-muted-foreground py-4">
								No recent payments
							</div>
						) : (
							stats.recentPayments.slice(0, 4).map((payment) => (
								<div key={payment.id} className="flex items-center justify-between border-b pb-3 last:border-0">
									<div>
										<p className="font-medium text-sm">{payment.paymentMethodName}</p>
										<p className="text-xs text-muted-foreground">{payment.id}</p>
									</div>
									<div className="text-right">
										<p className="font-semibold text-sm">${payment.amount.toLocaleString()}</p>
										<Badge 
											variant={getStatusBadgeVariant(payment.status)}
											className="text-xs"
										>
											{payment.status}
										</Badge>
									</div>
								</div>
							))
						)}
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
							<Button variant="outline" size="sm">
								<RefreshCw className="mr-2 h-4 w-4" />
								Sync
							</Button>
						</div>
					</div>
					<div className="mt-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search payments..."
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
								<th className="text-left p-4 font-medium text-sm">Payment ID</th>
								<th className="text-left p-4 font-medium text-sm">Date</th>
								<th className="text-left p-4 font-medium text-sm">Type</th>
								<th className="text-left p-4 font-medium text-sm">Description</th>
								<th className="text-left p-4 font-medium text-sm">Method</th>
								<th className="text-right p-4 font-medium text-sm">Amount</th>
								<th className="text-right p-4 font-medium text-sm">Fee</th>
								<th className="text-left p-4 font-medium text-sm">Status</th>
								<th className="text-left p-4 font-medium text-sm">Actions</th>
							</tr>
						</thead>
						<tbody>
							{payments.length === 0 ? (
								<tr>
									<td colSpan={9} className="text-center py-8 text-muted-foreground">
										No payments found. Record your first payment to get started.
									</td>
								</tr>
							) : (
								payments.map((payment) => (
									<tr key={payment.id} className="border-b hover:bg-muted/50 transition-colors">
										<td className="p-4 font-mono text-sm">{payment.id}</td>
										<td className="p-4 text-sm">{new Date(payment.createdAt).toLocaleDateString()}</td>
										<td className="p-4 text-sm">{payment.paymentType.replace('_', ' ')}</td>
										<td className="p-4 text-sm">{payment.description || 'N/A'}</td>
										<td className="p-4 text-sm">
											{paymentMethods.find(m => m.id === payment.paymentMethodId)?.name || 'Unknown'}
										</td>
										<td className="p-4 text-sm text-right font-semibold">${Number(payment.amount).toFixed(2)}</td>
										<td className="p-4 text-sm text-right text-muted-foreground">${Number(payment.processingFee).toFixed(2)}</td>
										<td className="p-4">
											<div className="flex items-center gap-2">
												{getStatusIcon(payment.status)}
												<Badge 
													variant={getStatusBadgeVariant(payment.status)}
													className="text-xs"
												>
													{payment.status}
												</Badge>
											</div>
										</td>
										<td className="p-4">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => toast.info('Viewing payment details')}
											>
												View
											</Button>
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