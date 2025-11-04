/**
 * Invoice Detail Page
 * View and manage individual invoice
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { InvoiceView } from '@/components/invoices/invoice-view';

interface InvoicePageProps {
	params: {
		id: string;
	};
}

export default async function InvoicePage({ params }: InvoicePageProps) {
	const { userId } = await auth();

	if (!userId) {
		notFound();
	}

	const invoiceId = parseInt(params.id);

	if (isNaN(invoiceId)) {
		notFound();
	}

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Invoice Details</h1>
				<p className="text-muted-foreground">
					View and manage invoice #{params.id}
				</p>
			</div>

			<InvoiceView invoiceId={invoiceId} />
		</div>
	);
}
