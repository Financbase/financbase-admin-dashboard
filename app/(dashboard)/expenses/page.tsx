/**
 * Expenses Page
 * Main page for expense management
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { ExpenseList } from '@/components/expenses/expense-list';

export default function ExpensesPage() {
	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Expenses</h1>
				<p className="text-muted-foreground">
					Track and manage your business expenses
				</p>
			</div>

			<ExpenseList />
		</div>
	);
}
