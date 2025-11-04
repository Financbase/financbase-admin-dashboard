/**
 * Roles & Permissions Settings Page
 * Requires admin access
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Shield, Users } from 'lucide-react';
import { isAdmin } from '@/lib/auth/financbase-rbac';
import { redirect } from 'next/navigation';
// import { headers } from 'next/headers'; // Temporarily disabled

export default async function RolesSettingsPage() {
	// Get headers (required in Next.js 15 for dynamic APIs)
	// const headersList = await headers();
	
	// Check if user is admin
	const userIsAdmin = await isAdmin();
	
	if (!userIsAdmin) {
		redirect('/settings');
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold mb-2">Roles & Permissions</h2>
				<p className="text-muted-foreground">
					Manage user roles and access permissions
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						<CardTitle>Role Management</CardTitle>
					</div>
					<CardDescription>
						Create and manage custom roles for your organization
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Role management dashboard coming soon.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Key className="h-5 w-5" />
						<CardTitle>Permission Matrix</CardTitle>
					</div>
					<CardDescription>
						Configure fine-grained permissions for each role
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Permission configuration coming soon.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						<CardTitle>Role Assignments</CardTitle>
					</div>
					<CardDescription>
						View and manage role assignments for team members
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Role assignment interface coming soon.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

