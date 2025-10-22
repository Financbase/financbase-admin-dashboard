/**
 * Expenses Page
 * Main page for expense management
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
