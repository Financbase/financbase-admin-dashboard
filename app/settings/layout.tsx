/**
 * Settings Layout
 * Provides tabbed navigation for all settings pages
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Shield, Bell, CreditCard, Users, Eye, Palette, Key } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Settings | Financbase',
	description: 'Manage your account settings and preferences',
};

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="container mx-auto py-6 space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Settings className="h-6 w-6" />
					<h1 className="text-3xl font-bold">Settings</h1>
				</div>
				<p className="text-muted-foreground">
					Manage your account settings and preferences
				</p>
			</div>

			{/* Navigation Tabs */}
			<div className="border-b">
				<div className="flex gap-4 overflow-x-auto pb-2">
					<SettingsTab href="/settings/profile" icon={<User className="h-4 w-4" />}>
						Profile
					</SettingsTab>
					<SettingsTab href="/settings/security" icon={<Shield className="h-4 w-4" />}>
						Security
					</SettingsTab>
					<SettingsTab href="/settings/notifications" icon={<Bell className="h-4 w-4" />}>
						Notifications
					</SettingsTab>
					<SettingsTab href="/settings/preferences" icon={<Palette className="h-4 w-4" />}>
						Preferences
					</SettingsTab>
					<SettingsTab href="/settings/privacy" icon={<Eye className="h-4 w-4" />}>
						Privacy
					</SettingsTab>
					<SettingsTab href="/settings/billing" icon={<CreditCard className="h-4 w-4" />}>
						Billing
					</SettingsTab>
					<SettingsTab href="/settings/team" icon={<Users className="h-4 w-4" />}>
						Team
					</SettingsTab>
					<SettingsTab href="/settings/roles" icon={<Key className="h-4 w-4" />}>
						Roles & Permissions
					</SettingsTab>
				</div>
			</div>

			{/* Content */}
			<div className="py-6">
				{children}
			</div>
		</div>
	);
}

function SettingsTab({ 
	href, 
	icon, 
	children 
}: { 
	href: string; 
	icon: React.ReactNode; 
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-accent whitespace-nowrap transition-colors"
		>
			{icon}
			{children}
		</Link>
	);
}
