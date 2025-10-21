/**
 * Profile Settings Page
 * Integrates with Clerk for user profile management
 */

import { UserProfile } from '@clerk/nextjs';

export default function ProfileSettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold mb-2">Profile</h2>
				<p className="text-muted-foreground">
					Manage your personal information and preferences
				</p>
			</div>

			{/* Use Clerk's built-in profile component */}
			<UserProfile
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
