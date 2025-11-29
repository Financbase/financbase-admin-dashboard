/**
 * Organizations Page
 * Main page for organization management
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { OrganizationManagement } from '@/components/organizations/organization-management';

export default function OrganizationsPage() {
	return (
		<div className="container mx-auto py-6">
			<OrganizationManagement />
		</div>
	);
}

