/**
 * Profile Settings Page
 * Integrates with Clerk for user profile management and custom avatar upload
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { currentUser } from '@clerk/nextjs/server';
import { UserProfile } from '@clerk/nextjs';
import { AvatarUpload } from '@/components/core/ui/layout/avatar-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ProfileSettingsPage() {
	const user = await currentUser();

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold mb-2">Profile</h2>
				<p className="text-muted-foreground">
					Manage your personal information and preferences
				</p>
			</div>

			{/* Custom Avatar Upload Section */}
			<Card>
				<CardHeader>
					<CardTitle>Profile Picture</CardTitle>
					<CardDescription>
						Upload a custom avatar or manage your profile picture
					</CardDescription>
				</CardHeader>
				<CardContent>
					{user && (
						<AvatarUpload
							userName={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User'}
							currentAvatarUrl={user.imageUrl}
							onAvatarUpdate={(avatarUrl) => {
								// Here you could update the user's avatar in your database
								console.log('Avatar updated:', avatarUrl);
							}}
							size={120}
						/>
					)}
				</CardContent>
			</Card>

			{/* Clerk's built-in profile component */}
			<Card>
				<CardHeader>
					<CardTitle>Account Settings</CardTitle>
					<CardDescription>
						Manage your account details, security settings, and preferences
					</CardDescription>
				</CardHeader>
				<CardContent>
					<UserProfile
						appearance={{
							elements: {
								rootBox: 'w-full',
								card: 'shadow-none border',
							},
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
