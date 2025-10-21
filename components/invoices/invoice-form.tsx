"use client";

/**
 * Invoice Form Component
 * Create and edit invoices with line items
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
	Plus, 
	Trash2, 
	Save, 
	Send, 
	X,
	Calculator
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

interface LineItem {
	id: string;
	description: string;
	quantity: number;
	unitPrice: number;
	total: number;
}

interface InvoiceFormData {
	clientName: string;
	clientEmail: string;
	clientAddress?: string;
	clientPhone?: string;
	issueDate: string;
	dueDate: string;
	items: LineItem[];
	taxRate: number;
	discountAmount: number;
	notes?: string;
	terms?: string;
	currency: string;
}

interface InvoiceFormProps {
	initialData?: Partial<InvoiceFormData>;
	invoiceId?: number;
	onCancel?: () => void;
}

export function InvoiceForm({ initialData, invoiceId, onCancel }: InvoiceFormProps) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState<InvoiceFormData>({
		clientName: initialData?.clientName || '',
		clientEmail: initialData?.clientEmail || '',
		clientAddress: initialData?.clientAddress || '',
		clientPhone: initialData?.clientPhone || '',
		issueDate: initialData?.issueDate || new Date().toISOString().split('T')[0],
		dueDate: initialData?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
		items: initialData?.items || [
			{
				id: nanoid(),
				description: '',
				quantity: 1,
				unitPrice: 0,
				total: 0,
			},
		],
		taxRate: initialData?.taxRate || 0,
		discountAmount: initialData?.discountAmount || 0,
		notes: initialData?.notes || '',
		terms: initialData?.terms || 'Payment due within 30 days',
		currency: initialData?.currency || 'USD',
	});

	// Calculate totals
	const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
	const taxAmount = (subtotal - formData.discountAmount) * (formData.taxRate / 100);
	const total = subtotal - formData.discountAmount + taxAmount;

	// Create/Update mutation
	const saveMutation = useMutation({
		mutationFn: async (data: InvoiceFormData) => {
			const url = invoiceId ? `/api/invoices/${invoiceId}` : '/api/invoices';
			const method = invoiceId ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error('Failed to save invoice');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['invoices'] });
			toast.success(invoiceId ? 'Invoice updated' : 'Invoice created');
			router.push('/invoices');
		},
		onError: () => {
			toast.error('Failed to save invoice');
		},
	});

	const handleAddItem = () => {
		setFormData({
			...formData,
			items: [
				...formData.items,
				{
					id: nanoid(),
					description: '',
					quantity: 1,
					unitPrice: 0,
					total: 0,
				},
			],
		});
	};

	const handleRemoveItem = (id: string) => {
		setFormData({
			...formData,
			items: formData.items.filter((item) => item.id !== id),
		});
	};

	const handleItemChange = (id: string, field: keyof LineItem, value: string | number) => {
		setFormData({
			...formData,
			items: formData.items.map((item) => {
				if (item.id === id) {
					const updated = { ...item, [field]: value };
					// Recalculate total
					if (field === 'quantity' || field === 'unitPrice') {
						updated.total = updated.quantity * updated.unitPrice;
					}
					return updated;
				}
				return item;
			}),
		});
	};

	const handleSubmit = (e: React.FormEvent, action: 'save' | 'send' = 'save') => {
		e.preventDefault();

		// Validation
		if (!formData.clientName || !formData.clientEmail) {
			toast.error('Client name and email are required');
			return;
		}

		if (formData.items.length === 0 || formData.items.every(item => !item.description)) {
			toast.error('At least one line item is required');
			return;
		}

		saveMutation.mutate(formData);
	};

	return (
		<form onSubmit={(e) => handleSubmit(e, 'save')} className="space-y-6">
			{/* Client Information */}
			<Card>
				<CardHeader>
					<CardTitle>Client Information</CardTitle>
					<CardDescription>Who is this invoice for?</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="clientName">Client Name *</Label>
							<Input
								id="clientName"
								value={formData.clientName}
								onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="clientEmail">Client Email *</Label>
							<Input
								id="clientEmail"
								type="email"
								value={formData.clientEmail}
								onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="clientPhone">Phone</Label>
							<Input
								id="clientPhone"
								value={formData.clientPhone}
								onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="clientAddress">Address</Label>
							<Input
								id="clientAddress"
								value={formData.clientAddress}
								onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Invoice Details */}
			<Card>
				<CardHeader>
					<CardTitle>Invoice Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label htmlFor="issueDate">Issue Date</Label>
							<Input
								id="issueDate"
								type="date"
								value={formData.issueDate}
								onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="dueDate">Due Date</Label>
							<Input
								id="dueDate"
								type="date"
								value={formData.dueDate}
								onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="currency">Currency</Label>
							<Select
								value={formData.currency}
								onValueChange={(value) => setFormData({ ...formData, currency: value })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="USD">USD ($)</SelectItem>
									<SelectItem value="EUR">EUR (€)</SelectItem>
									<SelectItem value="GBP">GBP (£)</SelectItem>
									<SelectItem value="CAD">CAD ($)</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Line Items */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Line Items</CardTitle>
							<CardDescription>Add items to this invoice</CardDescription>
						</div>
						<Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
							<Plus className="h-4 w-4 mr-2" />
							Add Item
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{formData.items.map((item, index) => (
						<div key={item.id} className="space-y-4">
							{index > 0 && <Separator />}
							<div className="grid grid-cols-12 gap-4 items-start">
								<div className="col-span-12 md:col-span-5 space-y-2">
									<Label>Description</Label>
									<Input
										value={item.description}
										onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
										placeholder="Item description"
									/>
								</div>
								<div className="col-span-4 md:col-span-2 space-y-2">
									<Label>Quantity</Label>
									<Input
										type="number"
										min="0"
										step="0.01"
										value={item.quantity}
										onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
									/>
								</div>
								<div className="col-span-4 md:col-span-2 space-y-2">
									<Label>Unit Price</Label>
									<Input
										type="number"
										min="0"
										step="0.01"
										value={item.unitPrice}
										onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
									/>
								</div>
								<div className="col-span-3 md:col-span-2 space-y-2">
									<Label>Total</Label>
									<div className="h-10 flex items-center font-semibold">
										${item.total.toFixed(2)}
									</div>
								</div>
								<div className="col-span-1 flex items-end justify-end">
									{formData.items.length > 1 && (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => handleRemoveItem(item.id)}
										>
											<Trash2 className="h-4 w-4 text-destructive" />
										</Button>
									)}
								</div>
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			{/* Calculations */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5" />
						Calculations
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="taxRate">Tax Rate (%)</Label>
							<Input
								id="taxRate"
								type="number"
								min="0"
								max="100"
								step="0.1"
								value={formData.taxRate}
								onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="discount">Discount Amount</Label>
							<Input
								id="discount"
								type="number"
								min="0"
								step="0.01"
								value={formData.discountAmount}
								onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
							/>
						</div>
					</div>

					<Separator />

					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Subtotal:</span>
							<span className="font-medium">${subtotal.toFixed(2)}</span>
						</div>
						{formData.discountAmount > 0 && (
							<div className="flex justify-between text-sm text-destructive">
								<span>Discount:</span>
								<span>-${formData.discountAmount.toFixed(2)}</span>
							</div>
						)}
						{formData.taxRate > 0 && (
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Tax ({formData.taxRate}%):</span>
								<span className="font-medium">${taxAmount.toFixed(2)}</span>
							</div>
						)}
						<Separator />
						<div className="flex justify-between text-lg font-bold">
							<span>Total:</span>
							<span>${total.toFixed(2)}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Additional Information */}
			<Card>
				<CardHeader>
					<CardTitle>Additional Information</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="notes">Notes</Label>
						<Textarea
							id="notes"
							value={formData.notes}
							onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
							placeholder="Any additional notes for the client"
							rows={3}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="terms">Terms & Conditions</Label>
						<Textarea
							id="terms"
							value={formData.terms}
							onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
							placeholder="Payment terms and conditions"
							rows={3}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Actions */}
			<Card>
				<CardFooter className="flex justify-between gap-4 pt-6">
					<Button
						type="button"
						variant="outline"
						onClick={onCancel || (() => router.back())}
					>
						<X className="h-4 w-4 mr-2" />
						Cancel
					</Button>
					<div className="flex gap-2">
						<Button
							type="submit"
							variant="outline"
							disabled={saveMutation.isPending}
						>
							<Save className="h-4 w-4 mr-2" />
							Save as Draft
						</Button>
						<Button
							type="button"
							onClick={(e) => handleSubmit(e, 'send')}
							disabled={saveMutation.isPending}
						>
							<Send className="h-4 w-4 mr-2" />
							Save & Send
						</Button>
					</div>
				</CardFooter>
			</Card>
		</form>
	);
}

