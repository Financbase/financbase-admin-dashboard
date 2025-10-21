/**
 * User Preferences Settings Page
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Globe, Calendar } from 'lucide-react';

export default function PreferencesSettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold mb-2">Preferences</h2>
				<p className="text-muted-foreground">
					Customize your Financbase experience
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Palette className="h-5 w-5" />
						<CardTitle>Appearance</CardTitle>
					</div>
					<CardDescription>
						Customize the look and feel of the application
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Theme and appearance settings coming soon.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Globe className="h-5 w-5" />
						<CardTitle>Language & Region</CardTitle>
					</div>
					<CardDescription>
						Set your preferred language and regional settings
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Localization settings coming soon.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						<CardTitle>Date & Time</CardTitle>
					</div>
					<CardDescription>
						Configure date and time display preferences
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Date and time preferences coming soon.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

