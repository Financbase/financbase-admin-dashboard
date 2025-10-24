/**
 * Security Settings Page
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { ApiKeyManager } from '@/components/settings/api-key-manager';
import { SessionManager } from '@/components/settings/session-manager';

export default function SecuritySettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold mb-2">Security</h2>
				<p className="text-muted-foreground">
					Manage your security settings and authentication methods
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						<CardTitle>Two-Factor Authentication</CardTitle>
					</div>
					<CardDescription>
						Add an extra layer of security to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Configure two-factor authentication through your Clerk account settings.
					</p>
				</CardContent>
			</Card>

			<ApiKeyManager />

			<SessionManager />
		</div>
	);
}

