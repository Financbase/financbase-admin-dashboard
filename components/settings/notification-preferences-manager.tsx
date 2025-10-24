/**
 * Notification Preferences Management Components
 * Reusable components for managing detailed notification settings
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface NotificationPreferences {
	id: string;
	userId: string;
	emailInvoices: boolean;
	emailPayments: boolean;
	emailReports: boolean;
	emailSecurity: boolean;
	emailUpdates: boolean;
	emailMarketing: boolean;
	pushInvoices: boolean;
	pushPayments: boolean;
	pushReports: boolean;
	pushSecurity: boolean;
	pushUpdates: boolean;
	inAppInvoices: boolean;
	inAppPayments: boolean;
	inAppReports: boolean;
	inAppSecurity: boolean;
	inAppUpdates: boolean;
	inAppComments: boolean;
	inAppMentions: boolean;
	quietHoursEnabled: boolean;
	quietHoursStart: string;
	quietHoursEnd: string;
	quietHoursTimezone: string;
	createdAt: string;
	updatedAt: string;
}

export function NotificationPreferencesManager() {
	const [preferences, setPreferences] = useState<Partial<NotificationPreferences>>({
		emailInvoices: true,
		emailPayments: true,
		emailReports: true,
		emailSecurity: true,
		emailUpdates: true,
		emailMarketing: false,
		pushInvoices: false,
		pushPayments: true,
		pushReports: false,
		pushSecurity: true,
		pushUpdates: false,
		inAppInvoices: true,
		inAppPayments: true,
		inAppReports: true,
		inAppSecurity: true,
		inAppUpdates: true,
		inAppComments: true,
		inAppMentions: true,
		quietHoursEnabled: false,
		quietHoursStart: '22:00',
		quietHoursEnd: '08:00',
		quietHoursTimezone: 'UTC',
	});

	const loadPreferences = useCallback(async () => {
		try {
			const response = await fetch('/api/settings/preferences/notifications');
			if (response.ok) {
				const data = await response.json();
				if (data.preferences) {
					setPreferences(data.preferences);
				} else {
					setPreferences(data.defaults);
				}
			}
		} catch (error) {
			console.error('Error loading notification preferences:', error);
			toast.error('Failed to load notification preferences');
		}
	}, []);

	useEffect(() => {
		loadPreferences();
	}, [loadPreferences]);

	const updatePreference = async (key: keyof NotificationPreferences, value: boolean | string) => {
		const updatedPreferences = { ...preferences, [key]: value };
		setPreferences(updatedPreferences);

		// Debounced save to avoid too many API calls
		setTimeout(async () => {
			try {
				const response = await fetch('/api/settings/preferences/notifications', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ [key]: value }),
				});

				if (response.ok) {
					const result = await response.json();
					setPreferences(result.preferences);
					toast.success('Notification preferences saved');
				} else {
					// Revert on error
					loadPreferences();
					toast.error('Failed to save notification preferences');
				}
			} catch (error) {
				// Revert on error
				loadPreferences();
				toast.error('Failed to save notification preferences');
			}
		}, 1000);
	};

	const getTimeOptions = () => {
		const options = [];
		for (let hour = 0; hour < 24; hour++) {
			for (let minute = 0; minute < 60; minute += 30) {
				const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
				options.push({ value: timeString, label: timeString });
			}
		}
		return options;
	};

	const getTimezoneOptions = () => [
		{ value: 'UTC', label: 'UTC' },
		{ value: 'America/New_York', label: 'Eastern Time (ET)' },
		{ value: 'America/Chicago', label: 'Central Time (CT)' },
		{ value: 'America/Denver', label: 'Mountain Time (MT)' },
		{ value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
		{ value: 'Europe/London', label: 'London (GMT/BST)' },
		{ value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
		{ value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
		{ value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
		{ value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
		{ value: 'Asia/Kolkata', label: 'India (IST)' },
		{ value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
		{ value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
	];

	if (loading) {
		return <div className="flex justify-center p-8">Loading notification preferences...</div>;
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Notification Preferences</h3>
				<p className="text-sm text-muted-foreground">
					Control how and when you receive notifications
				</p>
			</div>

			{/* Email Notifications */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						<CardTitle>Email Notifications</CardTitle>
					</div>
					<CardDescription>
						Configure which events trigger email notifications
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Invoices</Label>
								<div className="text-sm text-muted-foreground">
									New invoices, payments received, overdue notices
								</div>
							</div>
							<Switch
								checked={preferences.emailInvoices}
								onCheckedChange={(checked) => updatePreference('emailInvoices', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Payments</Label>
								<div className="text-sm text-muted-foreground">
									Payment confirmations, failed payments, refunds
								</div>
							</div>
							<Switch
								checked={preferences.emailPayments}
								onCheckedChange={(checked) => updatePreference('emailPayments', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Reports</Label>
								<div className="text-sm text-muted-foreground">
									Scheduled reports, analytics summaries
								</div>
							</div>
							<Switch
								checked={preferences.emailReports}
								onCheckedChange={(checked) => updatePreference('emailReports', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Security</Label>
								<div className="text-sm text-muted-foreground">
									Login alerts, security events, password changes
								</div>
							</div>
							<Switch
								checked={preferences.emailSecurity}
								onCheckedChange={(checked) => updatePreference('emailSecurity', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Product Updates</Label>
								<div className="text-sm text-muted-foreground">
									New features, improvements, maintenance notices
								</div>
							</div>
							<Switch
								checked={preferences.emailUpdates}
								onCheckedChange={(checked) => updatePreference('emailUpdates', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Marketing</Label>
								<div className="text-sm text-muted-foreground">
									Promotional emails, special offers, newsletters
								</div>
							</div>
							<Switch
								checked={preferences.emailMarketing}
								onCheckedChange={(checked) => updatePreference('emailMarketing', checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Push Notifications */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Smartphone className="h-5 w-5" />
						<CardTitle>Push Notifications</CardTitle>
					</div>
					<CardDescription>
						Configure browser push notification settings
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Invoices</Label>
								<div className="text-sm text-muted-foreground">
									Invoice-related notifications
								</div>
							</div>
							<Switch
								checked={preferences.pushInvoices}
								onCheckedChange={(checked) => updatePreference('pushInvoices', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Payments</Label>
								<div className="text-sm text-muted-foreground">
									Payment confirmations and alerts
								</div>
							</div>
							<Switch
								checked={preferences.pushPayments}
								onCheckedChange={(checked) => updatePreference('pushPayments', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Reports</Label>
								<div className="text-sm text-muted-foreground">
									Report generation and delivery
								</div>
							</div>
							<Switch
								checked={preferences.pushReports}
								onCheckedChange={(checked) => updatePreference('pushReports', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Security</Label>
								<div className="text-sm text-muted-foreground">
									Security alerts and login notifications
								</div>
							</div>
							<Switch
								checked={preferences.pushSecurity}
								onCheckedChange={(checked) => updatePreference('pushSecurity', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Product Updates</Label>
								<div className="text-sm text-muted-foreground">
									New features and system updates
								</div>
							</div>
							<Switch
								checked={preferences.pushUpdates}
								onCheckedChange={(checked) => updatePreference('pushUpdates', checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* In-App Notifications */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Monitor className="h-5 w-5" />
						<CardTitle>In-App Notifications</CardTitle>
					</div>
					<CardDescription>
						Configure notifications shown within the application
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Invoices</Label>
								<div className="text-sm text-muted-foreground">
									Invoice activity and updates
								</div>
							</div>
							<Switch
								checked={preferences.inAppInvoices}
								onCheckedChange={(checked) => updatePreference('inAppInvoices', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Payments</Label>
								<div className="text-sm text-muted-foreground">
									Payment transactions and status
								</div>
							</div>
							<Switch
								checked={preferences.inAppPayments}
								onCheckedChange={(checked) => updatePreference('inAppPayments', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Reports</Label>
								<div className="text-sm text-muted-foreground">
									Report generation and analytics
								</div>
							</div>
							<Switch
								checked={preferences.inAppReports}
								onCheckedChange={(checked) => updatePreference('inAppReports', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Security</Label>
								<div className="text-sm text-muted-foreground">
									Security events and alerts
								</div>
							</div>
							<Switch
								checked={preferences.inAppSecurity}
								onCheckedChange={(checked) => updatePreference('inAppSecurity', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Product Updates</Label>
								<div className="text-sm text-muted-foreground">
									Feature announcements and updates
								</div>
							</div>
							<Switch
								checked={preferences.inAppUpdates}
								onCheckedChange={(checked) => updatePreference('inAppUpdates', checked)}
							/>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Comments & Mentions</Label>
								<div className="text-sm text-muted-foreground">
									Comments on your content and @mentions
								</div>
							</div>
							<Switch
								checked={preferences.inAppComments}
								onCheckedChange={(checked) => updatePreference('inAppComments', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>@Mentions</Label>
								<div className="text-sm text-muted-foreground">
									Direct mentions and replies
								</div>
							</div>
							<Switch
								checked={preferences.inAppMentions}
								onCheckedChange={(checked) => updatePreference('inAppMentions', checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Quiet Hours */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Clock className="h-5 w-5" />
						<CardTitle>Quiet Hours</CardTitle>
					</div>
					<CardDescription>
						Set times when you don't want to receive notifications
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Enable Quiet Hours</Label>
							<div className="text-sm text-muted-foreground">
								Pause notifications during specified hours
							</div>
						</div>
						<Switch
							checked={preferences.quietHoursEnabled}
							onCheckedChange={(checked) => updatePreference('quietHoursEnabled', checked)}
						/>
					</div>

					{preferences.quietHoursEnabled && (
						<div className="grid grid-cols-3 gap-4">
							<div className="grid gap-2">
								<Label>Start Time</Label>
								<Select
									value={preferences.quietHoursStart}
									onValueChange={(value) => updatePreference('quietHoursStart', value)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{getTimeOptions().map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label>End Time</Label>
								<Select
									value={preferences.quietHoursEnd}
									onValueChange={(value) => updatePreference('quietHoursEnd', value)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{getTimeOptions().map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label>Timezone</Label>
								<Select
									value={preferences.quietHoursTimezone}
									onValueChange={(value) => updatePreference('quietHoursTimezone', value)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{getTimezoneOptions().map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Sound Settings */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						{preferences.notificationSounds ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
						<CardTitle>Sound Settings</CardTitle>
					</div>
					<CardDescription>
						Configure notification sounds and audio preferences
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Notification Sounds</Label>
							<div className="text-sm text-muted-foreground">
								Play sounds for in-app notifications
							</div>
						</div>
						<Switch
							checked={preferences.notificationSounds}
							onCheckedChange={(checked) => updatePreference('notificationSounds', checked)}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
