/**
 * Budget List Component
 * Displays list of budgets with filtering and actions
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BudgetCard } from './budget-card';
import { BudgetForm } from './budget-form';
import { BudgetDetailsDialog } from './budget-details-dialog';
import { Plus, Trash2 } from 'lucide-react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

export function BudgetList() {
	const queryClient = useQueryClient();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
	const [selectedBudget, setSelectedBudget] = useState<any>(null);
	const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);

	// Fetch budgets
	const { data: budgetsResponse, isLoading } = useQuery({
		queryKey: ['budgets'],
		queryFn: async () => {
			const response = await fetch('/api/budgets');
			if (!response.ok) {
				throw new Error('Failed to fetch budgets');
			}
			return response.json();
		},
	});

	const budgets = budgetsResponse?.data || [];

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(`/api/budgets/${id}`, {
				method: 'DELETE',
			});
			if (!response.ok) {
				throw new Error('Failed to delete budget');
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['budgets'] });
			queryClient.invalidateQueries({ queryKey: ['budget-summary'] });
			queryClient.invalidateQueries({ queryKey: ['budget-alerts'] });
			setDeleteDialogOpen(false);
			setSelectedBudget(null);
			toast({
				title: 'Success',
				description: 'Budget deleted successfully',
			});
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to delete budget',
				variant: 'destructive',
			});
		},
	});

	const handleEdit = (id: number) => {
		const budget = budgets.find((b: any) => b.id === id);
		if (budget) {
			setSelectedBudget(budget);
			setEditDialogOpen(true);
		}
	};

	const handleDelete = (id: number) => {
		const budget = budgets.find((b: any) => b.id === id);
		if (budget) {
			setSelectedBudget(budget);
			setDeleteDialogOpen(true);
		}
	};

	const handleViewDetails = (id: number) => {
		setSelectedBudgetId(id);
		setDetailsDialogOpen(true);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Budgets</h2>
					<p className="text-muted-foreground">Manage your budget categories and track spending</p>
				</div>
				<Button onClick={() => setCreateDialogOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Create Budget
				</Button>
			</div>

			{budgets.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<p className="text-muted-foreground mb-4">No budgets created yet</p>
						<Button onClick={() => setCreateDialogOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Create Your First Budget
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2">
					{budgets.map((budget: any) => (
						<BudgetCard
							key={budget.id}
							budget={budget}
							onViewDetails={handleViewDetails}
							onEdit={handleEdit}
						/>
					))}
				</div>
			)}

			<BudgetForm
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				onSuccess={() => {
					queryClient.invalidateQueries({ queryKey: ['budgets'] });
					queryClient.invalidateQueries({ queryKey: ['budget-summary'] });
					queryClient.invalidateQueries({ queryKey: ['budget-alerts'] });
				}}
			/>

			<BudgetForm
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				budget={selectedBudget}
				onSuccess={() => {
					queryClient.invalidateQueries({ queryKey: ['budgets'] });
					queryClient.invalidateQueries({ queryKey: ['budget-summary'] });
					queryClient.invalidateQueries({ queryKey: ['budget-alerts'] });
					setSelectedBudget(null);
				}}
			/>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Budget</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{selectedBudget?.name}"? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => selectedBudget && deleteMutation.mutate(selectedBudget.id)}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<BudgetDetailsDialog
				budgetId={selectedBudgetId}
				open={detailsDialogOpen}
				onOpenChange={setDetailsDialogOpen}
				onEdit={handleEdit}
			/>
		</div>
	);
}

