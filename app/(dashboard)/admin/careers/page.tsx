/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { CareersTable } from '@/components/admin/careers-table';
import { checkPermission, isManagerOrAbove } from '@/lib/auth/financbase-rbac';
import { FINANCIAL_PERMISSIONS } from '@/types/auth';
import { redirect } from 'next/navigation';

export default async function CareersAdminPage() {
	const hasPermission = await checkPermission(FINANCIAL_PERMISSIONS.CAREERS_MANAGE);
	const isManager = await isManagerOrAbove();
	
	if (!hasPermission && !isManager) {
		redirect('/dashboard');
	}

	return (
		<div className="container mx-auto py-6 max-w-7xl">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Careers Management</h1>
				<p className="text-muted-foreground mt-2">
					Manage job postings for the public careers page. Create, edit, and publish job openings.
				</p>
			</div>
			<CareersTable />
		</div>
	);
}

