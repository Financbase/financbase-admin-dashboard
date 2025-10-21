/**
 * Privacy Settings Page
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Database, Share2 } from 'lucide-react';

export default function PrivacySettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold mb-2">Privacy</h2>
				<p className="text-muted-foreground">
					Manage your privacy and data sharing preferences
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Eye className="h-5 w-5" />
						<CardTitle>Profile Visibility</CardTitle>
					</div>
					<CardDescription>
						Control who can see your profile information
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Profile visibility settings coming soon.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Database className="h-5 w-5" />
						<CardTitle>Data Collection</CardTitle>
					</div>
					<CardDescription>
						Manage how we collect and use your data
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Data collection preferences coming soon.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Share2 className="h-5 w-5" />
						<CardTitle>Third-Party Sharing</CardTitle>
					</div>
					<CardDescription>
						Control data sharing with third-party services
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Third-party sharing settings coming soon.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

