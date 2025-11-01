import { RBACManagementDashboard } from '@/components/auth/rbac-management';
import { checkPermission } from '@/lib/auth/financbase-rbac';
import { FINANCIAL_PERMISSIONS } from '@/types/auth';
import { redirect } from 'next/navigation';

export default async function RBACAdminPage() {
	const hasPermission = await checkPermission(FINANCIAL_PERMISSIONS.ROLES_MANAGE);
	if (!hasPermission) {
		redirect('/settings');
	}

	return (
		<div className="container mx-auto py-6 max-w-7xl">
			<RBACManagementDashboard />
		</div>
	);
}
