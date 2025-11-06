/**
 * Budget Form Component
 * Create and edit budget form with validation
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface BudgetFormData {
	name: string;
	category: string;
	description?: string;
	budgetedAmount: number;
	periodType: 'monthly' | 'yearly';
	startDate: string;
	endDate: string;
	alertThresholds: number[];
	status: 'active' | 'archived' | 'paused';
}

interface BudgetFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	budget?: BudgetFormData & { id: number };
	onSuccess?: () => void;
}

const defaultCategories = [
	'Marketing',
	'Operations',
	'Development',
	'Office Expenses',
	'Travel',
	'Equipment',
	'Software',
	'Training',
	'Other',
];

export function BudgetForm({ open, onOpenChange, budget, onSuccess }: BudgetFormProps) {
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState<BudgetFormData>({
		name: budget?.name || '',
		category: budget?.category || '',
		description: budget?.description || '',
		budgetedAmount: budget?.budgetedAmount || 0,
		periodType: budget?.periodType || 'monthly',
		startDate: budget?.startDate || new Date().toISOString().split('T')[0],
		endDate: budget?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
		alertThresholds: budget?.alertThresholds || [80, 90, 100],
		status: budget?.status || 'active',
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const url = budget ? `/api/budgets/${budget.id}` : '/api/budgets';
			const method = budget ? 'PATCH' : 'POST';

			// Convert dates to ISO strings
			const payload = {
				...formData,
				startDate: new Date(formData.startDate).toISOString(),
				endDate: new Date(formData.endDate).toISOString(),
			};

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to save budget');
			}

			toast({
				title: 'Success',
				description: budget ? 'Budget updated successfully' : 'Budget created successfully',
			});

			onOpenChange(false);
			onSuccess?.();
		} catch (error) {
			toast({
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to save budget',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{budget ? 'Edit Budget' : 'Create Budget'}</DialogTitle>
					<DialogDescription>
						{budget ? 'Update your budget details' : 'Create a new budget to track spending'}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Budget Name *</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								required
								placeholder="e.g., Marketing Q1 2025"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="category">Category *</Label>
							<Select
								value={formData.category}
								onValueChange={(value) => setFormData({ ...formData, category: value })}
								required
							>
								<SelectTrigger>
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									{defaultCategories.map((cat) => (
										<SelectItem key={cat} value={cat}>
											{cat}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								placeholder="Optional budget description"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="budgetedAmount">Budgeted Amount *</Label>
							<Input
								id="budgetedAmount"
								type="number"
								step="0.01"
								min="0"
								value={formData.budgetedAmount}
								onChange={(e) => setFormData({ ...formData, budgetedAmount: parseFloat(e.target.value) || 0 })}
								required
								placeholder="0.00"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="periodType">Period Type *</Label>
							<Select
								value={formData.periodType}
								onValueChange={(value: 'monthly' | 'yearly') => setFormData({ ...formData, periodType: value })}
								required
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="monthly">Monthly</SelectItem>
									<SelectItem value="yearly">Yearly</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="startDate">Start Date *</Label>
								<Input
									id="startDate"
									type="date"
									value={formData.startDate}
									onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
									required
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="endDate">End Date *</Label>
								<Input
									id="endDate"
									type="date"
									value={formData.endDate}
									onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
									required
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="status">Status</Label>
							<Select
								value={formData.status}
								onValueChange={(value: 'active' | 'archived' | 'paused') => setFormData({ ...formData, status: value })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="paused">Paused</SelectItem>
									<SelectItem value="archived">Archived</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? 'Saving...' : budget ? 'Update Budget' : 'Create Budget'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

