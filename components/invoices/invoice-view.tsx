"use client";

/**
 * Invoice View Component
 * Displays detailed invoice information with actions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	Edit,
	Send,
	Download,
	Trash2,
	ArrowLeft,
	Calendar,
	MapPin,
	Phone,
	Mail,
	Calculator
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface InvoiceViewProps {
	invoiceId: number;
}

interface Invoice {
	id: number;
	invoiceNumber: string;
	clientName: string;
	clientEmail: string;
	clientAddress?: string;
	clientPhone?: string;
	currency: string;
	subtotal: number;
	taxRate: number;
	taxAmount: number;
	discountAmount: number;
	total: number;
	status: string;
	issueDate: string;
	dueDate: string;
	paidDate?: string;
	sentDate?: string;
	amountPaid: number;
	paymentMethod?: string;
	paymentReference?: string;
	notes?: string;
	terms?: string;
	footer?: string;
	items: Array<{
		id: string;
		description: string;
		quantity: number;
		unitPrice: number;
		taxRate?: number;
		total: number;
	}>;
	createdAt: string;
	updatedAt: string;
}

export function InvoiceView({ invoiceId }: InvoiceViewProps) {
	const router = useRouter();
	const queryClient = useQueryClient();

	// Fetch invoice data
	const { data: invoice, isLoading } = useQuery<Invoice>({
		queryKey: ['invoice', invoiceId],
		queryFn: async () => {
			const response = await fetch(`/api/invoices/${invoiceId}`);
			if (!response.ok) {
				throw new Error('Failed to fetch invoice');
			}
			return response.json();
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch(`/api/invoices/${invoiceId}`, {
				method: 'DELETE',
			});
			if (!response.ok) {
				throw new Error('Failed to delete invoice');
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['invoices'] });
			toast.success('Invoice deleted');
			router.push('/invoices');
		},
		onError: () => {
			toast.error('Failed to delete invoice');
		},
	});

	// Send mutation
	const sendMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch(`/api/invoices/${invoiceId}/send`, {
				method: 'POST',
			});
			if (!response.ok) {
				throw new Error('Failed to send invoice');
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
			toast.success('Invoice sent to client');
		},
		onError: () => {
			toast.error('Failed to send invoice');
		},
	});

	const getStatusBadge = (status: string) => {
		const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
			draft: { variant: 'secondary', label: 'Draft' },
			sent: { variant: 'default', label: 'Sent' },
			viewed: { variant: 'default', label: 'Viewed' },
			partial: { variant: 'outline', label: 'Partial' },
			paid: { variant: 'default', label: 'Paid' },
			overdue: { variant: 'destructive', label: 'Overdue' },
			cancelled: { variant: 'secondary', label: 'Cancelled' },
		};

		const config = variants[status] || { variant: 'secondary', label: status };
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div className="space-y-1">
						<div className="h-8 w-48 bg-muted animate-pulse rounded" />
						<div className="h-4 w-32 bg-muted animate-pulse rounded" />
					</div>
				</div>
				<div className="grid gap-6">
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardContent className="p-6">
								<div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
								<div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (!invoice) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">Invoice not found</p>
				<Button className="mt-4" onClick={() => router.push('/invoices')}>
					Back to Invoices
				</Button>
			</div>
		);
	}

	const subtotal = parseFloat(invoice.subtotal);
	const taxAmount = parseFloat(invoice.taxAmount);
	const discountAmount = parseFloat(invoice.discountAmount);
	const total = parseFloat(invoice.total);
	const amountPaid = parseFloat(invoice.amountPaid);
	const remaining = total - amountPaid;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div className="space-y-1">
						<h1 className="text-2xl font-bold">Invoice {invoice.invoiceNumber}</h1>
						<div className="flex items-center gap-2 text-muted-foreground">
							<Calendar className="h-4 w-4" />
							<span>Created {formatDistanceToNow(new Date(invoice.createdAt), { addSuffix: true })}</span>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{getStatusBadge(invoice.status)}
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => router.push(`/invoices/${invoiceId}/edit`)}
						>
							<Edit className="h-4 w-4 mr-2" />
							Edit
						</Button>
						{invoice.status === 'draft' && (
							<Button
								size="sm"
								onClick={() => sendMutation.mutate()}
								disabled={sendMutation.isPending}
							>
								<Send className="h-4 w-4 mr-2" />
								Send
							</Button>
						)}
						<Button variant="outline" size="sm">
							<Download className="h-4 w-4 mr-2" />
							Download PDF
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								if (confirm('Are you sure you want to delete this invoice?')) {
									deleteMutation.mutate();
								}
							}}
							disabled={deleteMutation.isPending}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Invoice Details */}
				<div className="lg:col-span-2 space-y-6">
					{/* Client Information */}
					<Card>
						<CardHeader>
							<CardTitle>Client Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<h3 className="font-semibold text-lg">{invoice.clientName}</h3>
									{invoice.clientEmail && (
										<div className="flex items-center gap-2 text-muted-foreground mt-1">
											<Mail className="h-4 w-4" />
											<span>{invoice.clientEmail}</span>
										</div>
									)}
									{invoice.clientPhone && (
										<div className="flex items-center gap-2 text-muted-foreground mt-1">
											<Phone className="h-4 w-4" />
											<span>{invoice.clientPhone}</span>
										</div>
									)}
								</div>
								{invoice.clientAddress && (
									<div className="flex items-start gap-2">
										<MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
										<span className="text-muted-foreground">{invoice.clientAddress}</span>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Line Items */}
					<Card>
						<CardHeader>
							<CardTitle>Line Items</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{invoice.items.map((item, index) => (
									<div key={item.id || index} className="grid grid-cols-12 gap-4 py-3 border-b last:border-b-0">
										<div className="col-span-6">
											<div className="font-medium">{item.description}</div>
										</div>
										<div className="col-span-2 text-center">
											<div className="text-muted-foreground">Qty</div>
											<div>{item.quantity}</div>
										</div>
										<div className="col-span-2 text-right">
											<div className="text-muted-foreground">Unit Price</div>
											<div>${item.unitPrice.toFixed(2)}</div>
										</div>
										<div className="col-span-2 text-right">
											<div className="text-muted-foreground">Total</div>
											<div className="font-semibold">${item.total.toFixed(2)}</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Notes and Terms */}
					{(invoice.notes || invoice.terms) && (
						<Card>
							<CardHeader>
								<CardTitle>Additional Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{invoice.notes && (
									<div>
										<h4 className="font-medium mb-2">Notes</h4>
										<p className="text-muted-foreground">{invoice.notes}</p>
									</div>
								)}
								{invoice.terms && (
									<div>
										<h4 className="font-medium mb-2">Terms & Conditions</h4>
										<p className="text-muted-foreground">{invoice.terms}</p>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Invoice Summary */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calculator className="h-5 w-5" />
								Invoice Summary
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Subtotal:</span>
									<span>${subtotal.toFixed(2)}</span>
								</div>
								{discountAmount > 0 && (
									<div className="flex justify-between text-sm text-destructive">
										<span>Discount:</span>
										<span>-${discountAmount.toFixed(2)}</span>
									</div>
								)}
								{taxAmount > 0 && (
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">
											Tax ({parseFloat(invoice.taxRate)}%):
										</span>
										<span>${taxAmount.toFixed(2)}</span>
									</div>
								)}
								<Separator />
								<div className="flex justify-between text-lg font-bold">
									<span>Total:</span>
									<span>${total.toFixed(2)}</span>
								</div>
								{amountPaid > 0 && (
									<>
										<Separator />
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Paid:</span>
											<span className="text-green-600">${amountPaid.toFixed(2)}</span>
										</div>
										<div className="flex justify-between text-lg font-semibold">
											<span>Remaining:</span>
											<span className={remaining > 0 ? 'text-orange-600' : 'text-green-600'}>
												${remaining.toFixed(2)}
											</span>
										</div>
									</>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Payment Information */}
					{amountPaid > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Payment Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Amount Paid:</span>
									<span>${amountPaid.toFixed(2)}</span>
								</div>
								{invoice.paymentMethod && (
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Method:</span>
										<span>{invoice.paymentMethod}</span>
									</div>
								)}
								{invoice.paymentReference && (
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Reference:</span>
										<span>{invoice.paymentReference}</span>
									</div>
								)}
								{invoice.paidDate && (
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Paid Date:</span>
										<span>{new Date(invoice.paidDate).toLocaleDateString()}</span>
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Important Dates */}
					<Card>
						<CardHeader>
							<CardTitle>Important Dates</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Issue Date:</span>
								<span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Due Date:</span>
								<span className={new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' ? 'text-destructive font-medium' : ''}>
									{new Date(invoice.dueDate).toLocaleDateString()}
								</span>
							</div>
							{invoice.sentDate && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Sent Date:</span>
									<span>{new Date(invoice.sentDate).toLocaleDateString()}</span>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
