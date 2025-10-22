/**
 * Invoice Edit Page
 * Edit existing invoice
 */

import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { InvoiceForm } from '@/components/invoices/invoice-form';

interface InvoiceEditPageProps {
	params: {
		id: string;
	};
}

export default async function InvoiceEditPage({ params }: InvoiceEditPageProps) {
	const { userId } = await auth();

	if (!userId) {
		notFound();
	}

	const invoiceId = parseInt(params.id);

	if (isNaN(invoiceId)) {
		notFound();
	}

	// Fetch invoice data for editing
	const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010'}/api/invoices/${invoiceId}`, {
		headers: {
			'x-user-id': userId,
		},
	});

	if (!response.ok) {
		notFound();
	}

	const invoice = await response.json();

	// Transform invoice data for form
	const formData = {
		clientName: invoice.clientName,
		clientEmail: invoice.clientEmail,
		clientAddress: invoice.clientAddress,
		clientPhone: invoice.clientPhone,
		issueDate: new Date(invoice.issueDate).toISOString().split('T')[0],
		dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
		items: invoice.items.map((item: any) => ({
			id: item.id || `item-${Date.now()}-${Math.random()}`,
			description: item.description,
			quantity: item.quantity,
			unitPrice: item.unitPrice,
			total: item.total,
		})),
		taxRate: parseFloat(invoice.taxRate),
		discountAmount: parseFloat(invoice.discountAmount),
		notes: invoice.notes,
		terms: invoice.terms,
		currency: invoice.currency,
	};

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Edit Invoice</h1>
				<p className="text-muted-foreground">
					Edit invoice {invoice.invoiceNumber}
				</p>
			</div>

			<InvoiceForm
				initialData={formData}
				invoiceId={invoiceId}
			/>
		</div>
	);
}
