/**
 * Payment Methods Management Components
 * Reusable components for managing payment methods and billing history
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


'use client';

import { useState, useEffect, useCallback, useId } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Plus, Trash2, Star, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface PaymentMethod {
	id: string;
	type: string;
	stripePaymentMethodId: string;
	last4: string;
	brand: string;
	expiryMonth: number;
	expiryYear: number;
	isDefault: boolean;
	status: 'active' | 'inactive' | 'expired' | 'failed';
	createdAt: string;
	updatedAt: string;
}

interface BillingRecord {
	id: string;
	amount: number;
	currency: string;
	status: 'pending' | 'paid' | 'failed' | 'overdue' | 'cancelled' | 'refunded';
	description: string;
	invoiceUrl: string | null;
	stripeInvoiceId: string | null;
	paymentMethod: string | null;
	billedAt: string | null;
	createdAt: string;
}

export function PaymentMethodsManager() {
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
	const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const cardNumberId = useId();
	const expiryId = useId();
	const cvcId = useId();
	const zipCodeId = useId();

	const [newCard, setNewCard] = useState({
		number: '',
		expiry: '',
		cvc: '',
		zipCode: '',
	});

	const loadData = useCallback(async () => {
		try {
			// Load payment methods
			const paymentResponse = await fetch('/api/settings/billing/payment-methods');
			if (paymentResponse.ok) {
				const paymentData = await paymentResponse.json();
				setPaymentMethods(paymentData.paymentMethods);
			}

			// Load billing history
			const historyResponse = await fetch('/api/settings/billing/history');
			if (historyResponse.ok) {
				const historyData = await historyResponse.json();
				setBillingHistory(historyData.history);
			}
		} catch (error) {
			logger.error('Error loading payment data:', error);
			toast.error('Failed to load payment information');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const addPaymentMethod = async () => {
		try {
			// In a real implementation, this would integrate with Stripe Elements
			// For now, we'll simulate adding a payment method
			const response = await fetch('/api/settings/billing/payment-methods', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: 'card',
					stripePaymentMethodId: `pm_${Date.now()}`, // Mock Stripe payment method ID
					last4: newCard.number.slice(-4),
					brand: 'visa', // Would be determined by Stripe
					expiryMonth: parseInt(newCard.expiry.split('/')[0]),
					expiryYear: parseInt(newCard.expiry.split('/')[1]),
					isDefault: paymentMethods.length === 0, // First card becomes default
					metadata: { zipCode: newCard.zipCode },
				}),
			});

			if (response.ok) {
				setAddDialogOpen(false);
				setNewCard({ number: '', expiry: '', cvc: '', zipCode: '' });
				loadData();
				toast.success('Payment method added successfully');
			} else {
				const error = await response.json();
				toast.error(error.error || 'Failed to add payment method');
			}
		} catch (error) {
			logger.error('Error adding payment method:', error);
			toast.error('Failed to add payment method');
		}
	};

	const deletePaymentMethod = async (paymentMethodId: string) => {
		// In a real implementation, this would call Stripe to detach the payment method
		try {
			await fetch(`/api/settings/billing/payment-methods/${paymentMethodId}`, {
				method: 'DELETE',
			});
			loadData();
			toast.success('Payment method removed successfully');
		} catch (error) {
			logger.error('Error removing payment method:', error);
			toast.error('Failed to remove payment method');
		}
	};

	const formatCurrency = (amount: number, currency: string = 'USD') => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency,
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const getStatusBadge = (status: string) => {
		const variants = {
			active: 'default',
			paid: 'default',
			pending: 'secondary',
			failed: 'destructive',
			overdue: 'destructive',
			cancelled: 'outline',
			refunded: 'outline',
			inactive: 'outline',
			expired: 'outline',
		} as const;

		return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
	};

	const getBrandIcon = (brand: string) => {
		// In a real implementation, you'd use actual card brand icons
		// For now, return a generic credit card icon with brand info
		return <CreditCard className="h-4 w-4" />;
	};

	if (loading) {
		return <div className="flex justify-center p-8">Loading payment methods...</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h3 className="text-lg font-medium">Payment Methods</h3>
					<p className="text-sm text-muted-foreground">
						Manage your payment methods and billing history
					</p>
				</div>
				<Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add Payment Method
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Add Payment Method</DialogTitle>
							<DialogDescription>
								Add a new credit or debit card to your account.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor={cardNumberId}>Card Number</Label>
								<Input
									id={cardNumberId}
									placeholder="1234 5678 9012 3456"
									value={newCard.number}
									onChange={(e) => setNewCard({ ...newCard, number: e.target.value.replace(/\s/g, '') })}
									maxLength={19}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label htmlFor={expiryId}>Expiry Date</Label>
									<Input
										id={expiryId}
										placeholder="MM/YY"
										value={newCard.expiry}
										onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
										maxLength={5}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor={cvcId}>CVC</Label>
									<Input
										id={cvcId}
										placeholder="123"
										value={newCard.cvc}
										onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })}
										maxLength={4}
									/>
								</div>
							</div>
							<div className="grid gap-2">
								<Label htmlFor={zipCodeId}>ZIP Code</Label>
								<Input
									id={zipCodeId}
									placeholder="12345"
									value={newCard.zipCode}
									onChange={(e) => setNewCard({ ...newCard, zipCode: e.target.value })}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
								Cancel
							</Button>
							<Button type="button" onClick={addPaymentMethod}>
								Add Card
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{paymentMethods.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-8">
						<CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium mb-2">No payment methods</h3>
						<p className="text-muted-foreground mb-4">
							Add a payment method to enable subscription billing.
						</p>
						<Button onClick={() => setAddDialogOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Add Payment Method
						</Button>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>Your Payment Methods</CardTitle>
						<CardDescription>
							Manage your saved payment methods
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{paymentMethods.map((method) => (
								<div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
									<div className="flex items-center gap-3">
										{getBrandIcon(method.brand)}
										<div>
											<div className="flex items-center gap-2">
												<span className="font-medium">
													{method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} ending in {method.last4}
												</span>
												{method.isDefault && (
													<Badge variant="default" className="text-xs">
														<Star className="h-3 w-3 mr-1" />
														Default
													</Badge>
												)}
											</div>
											<div className="text-sm text-muted-foreground">
												Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										{getStatusBadge(method.status)}
										{!method.isDefault && (
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button size="sm" variant="outline">
														<Trash2 className="h-4 w-4" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
														<AlertDialogDescription>
															Are you sure you want to remove this payment method? This action cannot be undone.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction onClick={() => deletePaymentMethod(method.id)}>
															Remove
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Billing History</CardTitle>
					<CardDescription>
						View your past invoices and payments
					</CardDescription>
				</CardHeader>
				<CardContent>
					{billingHistory.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8">
							<DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-medium mb-2">No billing history</h3>
							<p className="text-muted-foreground">
								Your billing history will appear here once you have a paid subscription.
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Payment Method</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{billingHistory.map((record) => (
									<TableRow key={record.id}>
										<TableCell>
											<div className="flex items-center gap-2">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												{record.billedAt ? formatDate(record.billedAt) : formatDate(record.createdAt)}
											</div>
										</TableCell>
										<TableCell>
											<div>
												<div className="font-medium">{record.description}</div>
												{record.stripeInvoiceId && (
													<div className="text-sm text-muted-foreground">
														Invoice: {record.stripeInvoiceId}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell className="font-medium">
											{formatCurrency(record.amount, record.currency)}
										</TableCell>
										<TableCell>{getStatusBadge(record.status)}</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{record.paymentMethod || 'N/A'}
										</TableCell>
										<TableCell>
											{record.invoiceUrl && (
												<Button size="sm" variant="outline" asChild>
													<a 
														href={(() => {
															// Security: Sanitize URL to prevent XSS
															try {
																const url = new URL(record.invoiceUrl, window.location.origin);
																// Only allow http/https URLs
																if (url.protocol === 'http:' || url.protocol === 'https:') {
																	return url.href;
																}
																return '#';
															} catch {
																return '#';
															}
														})()} 
														target="_blank" 
														rel="noopener noreferrer"
													>
														View Invoice
													</a>
												</Button>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
