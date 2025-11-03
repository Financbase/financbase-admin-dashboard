import { FeatureFlagsTable } from '@/components/admin/feature-flags-table';
import { checkPermission } from '@/lib/auth/financbase-rbac';
import { FINANCIAL_PERMISSIONS } from '@/types/auth';
import { redirect } from 'next/navigation';

export default async function FeatureFlagsAdminPage() {
	const hasPermission = await checkPermission(FINANCIAL_PERMISSIONS.ROLES_MANAGE);
	if (!hasPermission) {
		redirect('/settings');
	}

	return (
		<div className="container mx-auto py-6 max-w-7xl">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Feature Flags Management</h1>
				<p className="text-muted-foreground mt-2">
					Manage system-wide feature flags to enable or disable features with rollout and targeting support.
				</p>
			</div>
			<FeatureFlagsTable />
		</div>
	);
}

