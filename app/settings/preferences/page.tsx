/**
 * User Preferences Settings Page
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Bell, Shield } from 'lucide-react';
import { UserPreferencesManager } from '@/components/settings/user-preferences-manager';
import { NotificationPreferencesManager } from '@/components/settings/notification-preferences-manager';
import { PrivacySettingsManager } from '@/components/settings/privacy-settings-manager';

export default function PreferencesSettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold mb-2">Preferences</h2>
				<p className="text-muted-foreground">
					Customize your Financbase experience
				</p>
			</div>

			<Tabs defaultValue="general" className="space-y-4">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="general" className="flex items-center gap-2">
						<Palette className="h-4 w-4" />
						General
					</TabsTrigger>
					<TabsTrigger value="notifications" className="flex items-center gap-2">
						<Bell className="h-4 w-4" />
						Notifications
					</TabsTrigger>
					<TabsTrigger value="privacy" className="flex items-center gap-2">
						<Shield className="h-4 w-4" />
						Privacy
					</TabsTrigger>
				</TabsList>

				<TabsContent value="general" className="space-y-4">
					<UserPreferencesManager />
				</TabsContent>

				<TabsContent value="notifications" className="space-y-4">
					<NotificationPreferencesManager />
				</TabsContent>

				<TabsContent value="privacy" className="space-y-4">
					<PrivacySettingsManager />
				</TabsContent>
			</Tabs>
		</div>
	);
}

