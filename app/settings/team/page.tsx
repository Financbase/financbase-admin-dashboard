/**
 * Team Settings Page
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
import { Users, UserPlus, UserMinus } from 'lucide-react';
import { OrganizationProfile } from '@clerk/nextjs';

export default function TeamSettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold mb-2">Team</h2>
				<p className="text-muted-foreground">
					Manage team members and organization settings
				</p>
			</div>

			{/* Use Clerk's built-in organization profile component */}
			<OrganizationProfile
				appearance={{
					elements: {
						rootBox: 'w-full',
						card: 'shadow-none border',
					},
				}}
			/>
		</div>
	);
}

