/**
 * New Invoice Page
 * Create a new invoice
 */

import { InvoiceForm } from '@/components/invoices/invoice-form';

export default function NewInvoicePage() {
	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Create Invoice</h1>
				<p className="text-muted-foreground">
					Create a new invoice for your client
				</p>
			</div>

			<InvoiceForm />
		</div>
	);
}

