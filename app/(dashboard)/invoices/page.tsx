/**
 * Invoices Page
 * Main page for invoice management
 */

import { InvoiceList } from '@/components/invoices/invoice-list';

export default function InvoicesPage() {
	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Invoices</h1>
				<p className="text-muted-foreground">
					Create, manage, and track your invoices
				</p>
			</div>

			<InvoiceList />
		</div>
	);
}
