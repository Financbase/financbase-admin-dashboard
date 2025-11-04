/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

/**
 * Expense Form Component
 * Create and edit expenses with receipt upload
 */

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
	Save, 
	X,
	Receipt
} from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useFormSubmission } from '@/hooks/use-form-submission';

interface ExpenseFormData {
	description: string;
	amount: number;
	currency: string;
	date: string;
	category: string;
	vendor?: string;
	paymentMethod?: string;
	receiptUrl?: string;
	receiptFileName?: string;
	taxDeductible: boolean;
	taxAmount: number;
	notes?: string;
	tags?: string[];
}

interface ExpenseFormProps {
	initialData?: Partial<ExpenseFormData>;
	expenseId?: number;
	onCancel?: () => void;
}

const expenseCategories = [
	'Office Supplies',
	'Travel',
	'Meals & Entertainment',
	'Software & Subscriptions',
	'Marketing & Advertising',
	'Professional Services',
	'Utilities',
	'Rent & Office Space',
	'Equipment',
	'Training & Education',
	'Insurance',
	'Other'
];

const paymentMethods = [
	'Credit Card',
	'Debit Card',
	'Bank Transfer',
	'Cash',
	'Check',
	'PayPal',
	'Other'
];

export function ExpenseForm({ initialData, expenseId, onCancel }: ExpenseFormProps) {
	const router = useRouter();
	const descriptionId = useId();
	const amountId = useId();
	const dateId = useId();
	const categoryId = useId();
	const vendorId = useId();
	const paymentMethodId = useId();
	const notesId = useId();
	const receiptId = useId();
	const taxDeductibleId = useId();
	const taxAmountId = useId();

	const [formData, setFormData] = useState<ExpenseFormData>({
		description: initialData?.description || '',
		amount: initialData?.amount || 0,
		currency: initialData?.currency || 'USD',
		date: initialData?.date || new Date().toISOString().split('T')[0],
		category: initialData?.category || '',
		vendor: initialData?.vendor || '',
		paymentMethod: initialData?.paymentMethod || '',
		receiptUrl: initialData?.receiptUrl || '',
		receiptFileName: initialData?.receiptFileName || '',
		taxDeductible: initialData?.taxDeductible ?? true,
		taxAmount: initialData?.taxAmount || 0,
		notes: initialData?.notes || '',
		tags: initialData?.tags || [],
	});

	// Form submission hook
	const { submit, isLoading, error } = useFormSubmission(
		async (data: ExpenseFormData) => {
			const url = expenseId ? `/api/expenses/${expenseId}` : '/api/expenses';
			const method = expenseId ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				headers: { 
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || `Failed to save expense: ${response.status} ${response.statusText}`);
			}

			return response.json();
		},
		{
			onSuccess: () => {
				router.push('/expenses');
			},
			successMessage: expenseId ? 'Expense updated successfully' : 'Expense created successfully',
			errorMessage: 'Failed to save expense',
		}
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.description || !formData.amount || !formData.category) {
			toast.error('Validation Error', 'Description, amount, and category are required');
			return;
		}

		if (formData.amount <= 0) {
			toast.error('Validation Error', 'Amount must be greater than 0');
			return;
		}

		try {
			await submit(formData);
		} catch {
			// Error handling is done in the hook
		}
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// In a real implementation, you would upload the file to a storage service
			// For now, we'll just store the file name
			setFormData({
				...formData,
				receiptFileName: file.name,
				receiptUrl: URL.createObjectURL(file), // Temporary URL for demo
			});
		}
	};

	return (
		<div className="space-y-6">
			{error && (
				<Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
					<CardContent className="pt-6">
						<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
					</CardContent>
				</Card>
			)}
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle>Expense Details</CardTitle>
						<CardDescription>Enter the expense information</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor={descriptionId}>Description *</Label>
								<Input
									id={descriptionId}
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									placeholder="What was this expense for?"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor={amountId}>Amount *</Label>
								<Input
									id={amountId}
									type="number"
									min="0"
									step="0.01"
									value={formData.amount}
									onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor={dateId}>Date *</Label>
								<Input
									id={dateId}
									type="date"
									value={formData.date}
									onChange={(e) => setFormData({ ...formData, date: e.target.value })}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor={categoryId}>Category *</Label>
								<Select
									value={formData.category}
									onValueChange={(value) => setFormData({ ...formData, category: value })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										{expenseCategories.map((category) => (
											<SelectItem key={category} value={category}>
												{category}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor={vendorId}>Vendor</Label>
								<Input
									id={vendorId}
									value={formData.vendor}
									onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
									placeholder="Where did you make this purchase?"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor={paymentMethodId}>Payment Method</Label>
								<Select
									value={formData.paymentMethod}
									onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select payment method" />
									</SelectTrigger>
									<SelectContent>
										{paymentMethods.map((method) => (
											<SelectItem key={method} value={method}>
												{method}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Receipt Upload */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Receipt className="h-5 w-5" />
							Receipt Upload
						</CardTitle>
						<CardDescription>Upload a receipt for this expense</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor={receiptId}>Receipt File</Label>
							<Input
								id={receiptId}
								type="file"
								accept="image/*,.pdf"
								onChange={handleFileUpload}
								className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
							/>
							{formData.receiptFileName && (
								<p className="text-sm text-green-600 dark:text-green-400">
									✓ {formData.receiptFileName}
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Tax Information */}
				<Card>
					<CardHeader>
						<CardTitle>Tax Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id={taxDeductibleId}
								checked={formData.taxDeductible}
								onChange={(e) => setFormData({ ...formData, taxDeductible: e.target.checked })}
								className="rounded"
							/>
							<Label htmlFor={taxDeductibleId}>This expense is tax deductible</Label>
						</div>
						{formData.taxDeductible && (
							<div className="space-y-2">
								<Label htmlFor={taxAmountId}>Tax Amount</Label>
								<Input
									id={taxAmountId}
									type="number"
									min="0"
									step="0.01"
									value={formData.taxAmount}
									onChange={(e) => setFormData({ ...formData, taxAmount: parseFloat(e.target.value) || 0 })}
								/>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Additional Information */}
				<Card>
					<CardHeader>
						<CardTitle>Additional Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor={notesId}>Notes</Label>
							<Textarea
								id={notesId}
								value={formData.notes}
								onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
								placeholder="Any additional notes about this expense"
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
						<Button
							type="submit"
							disabled={isLoading}
						>
							<Save className="h-4 w-4 mr-2" />
							{isLoading ? 'Saving...' : 'Save Expense'}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</div>
	);
}
