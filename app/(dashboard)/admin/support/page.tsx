/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { SupportTicketsAdminTable } from '@/components/admin/support-tickets-table';
import { SupportAnalytics } from '@/components/admin/support-analytics';
import { checkPermission } from '@/lib/auth/financbase-rbac';
import { FINANCIAL_PERMISSIONS } from '@/types/auth';
import { redirect } from 'next/navigation';

export default async function AdminSupportPage() {
	const hasPermission = await checkPermission(FINANCIAL_PERMISSIONS.SUPPORT_TICKETS_MANAGE);
	if (!hasPermission) {
		redirect('/settings');
	}

	return (
		<div className="container mx-auto py-6 max-w-7xl">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Support Tickets Management</h1>
				<p className="text-muted-foreground mt-2">
					Manage all support tickets, assign agents, update status, and view analytics.
				</p>
			</div>
			<SupportAnalytics />
			<div className="mt-6">
				<SupportTicketsAdminTable />
			</div>
		</div>
	);
}

