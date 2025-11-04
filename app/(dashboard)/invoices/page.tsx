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
 * Invoices Page
 * Main page for invoice management
 */

import { InvoiceList } from '@/components/invoices/invoice-list';

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic';

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
