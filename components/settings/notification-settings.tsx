/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

/**
 * Notification Settings Component
 * Allows users to configure their notification preferences
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Smartphone, MessageSquare, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface NotificationPreferences {
	// Email notifications
	emailInvoices: boolean;
	emailExpenses: boolean;
	emailReports: boolean;
	emailAlerts: boolean;
	emailWeeklySummary: boolean;
	emailMonthlySummary: boolean;
	
	// Push notifications
	pushRealtime: boolean;
	pushDaily: boolean;
	pushWeekly: boolean;
	
	// In-app notifications
	inAppInvoices: boolean;
	inAppExpenses: boolean;
	inAppAlerts: boolean;
	
	// Third-party integrations
	slackEnabled: boolean;
	slackWebhook?: string;
}

export function NotificationSettings() {
	const queryClient = useQueryClient();
	const [hasChanges, setHasChanges] = useState(false);

	// Fetch preferences
	const { data: preferences, isLoading } = useQuery({
		queryKey: ['notification-preferences'],
		queryFn: async () => {
			const response = await fetch('/api/settings/notifications');
			if (!response.ok) throw new Error('Failed to fetch preferences');
			return response.json();
		},
	});

	const [formData, setFormData] = useState<NotificationPreferences>(preferences || {
		emailInvoices: true,
		emailExpenses: true,
		emailReports: true,
		emailAlerts: true,
		emailWeeklySummary: true,
		emailMonthlySummary: true,
		pushRealtime: false,
		pushDaily: true,
		pushWeekly: false,
		inAppInvoices: true,
		inAppExpenses: true,
		inAppAlerts: true,
		slackEnabled: false,
		slackWebhook: '',
	});

	// Update form data when preferences load
	useEffect(() => {
		if (preferences) {
			setFormData(preferences);
			setHasChanges(false);
		}
	}, [preferences]);

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: async (data: NotificationPreferences) => {
			const response = await fetch('/api/settings/notifications', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});
			if (!response.ok) throw new Error('Failed to update preferences');
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
			toast.success('Notification preferences updated successfully');
			setHasChanges(false);
		},
		onError: () => {
			toast.error('Failed to update notification preferences');
		},
	});

	const handleToggle = (key: keyof NotificationPreferences) => {
		setFormData((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
		setHasChanges(true);
	};

	const handleInputChange = (key: keyof NotificationPreferences, value: string) => {
		setFormData((prev) => ({
			...prev,
			[key]: value,
		}));
		setHasChanges(true);
	};

	const handleSave = () => {
		updateMutation.mutate(formData);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Email Notifications */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						<CardTitle>Email Notifications</CardTitle>
					</div>
					<CardDescription>
						Manage which emails you receive from Financbase
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<SettingToggle
						label="Invoice Updates"
						description="Get notified when invoices are created, paid, or overdue"
						checked={formData.emailInvoices}
						onToggle={() => handleToggle('emailInvoices')}
					/>
					<Separator />
					<SettingToggle
						label="Expense Updates"
						description="Get notified when expenses are submitted or approved"
						checked={formData.emailExpenses}
						onToggle={() => handleToggle('emailExpenses')}
					/>
					<Separator />
					<SettingToggle
						label="Report Notifications"
						description="Get notified when reports are generated"
						checked={formData.emailReports}
						onToggle={() => handleToggle('emailReports')}
					/>
					<Separator />
					<SettingToggle
						label="Alert Notifications"
						description="Get notified about important alerts and warnings"
						checked={formData.emailAlerts}
						onToggle={() => handleToggle('emailAlerts')}
					/>
					<Separator />
					<SettingToggle
						label="Weekly Summary"
						description="Receive a weekly summary of your financial activity"
						checked={formData.emailWeeklySummary}
						onToggle={() => handleToggle('emailWeeklySummary')}
					/>
					<Separator />
					<SettingToggle
						label="Monthly Summary"
						description="Receive a monthly summary of your financial activity"
						checked={formData.emailMonthlySummary}
						onToggle={() => handleToggle('emailMonthlySummary')}
					/>
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
						Manage push notifications on your devices
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<SettingToggle
						label="Real-time Notifications"
						description="Get instant notifications for important updates"
						checked={formData.pushRealtime}
						onToggle={() => handleToggle('pushRealtime')}
					/>
					<Separator />
					<SettingToggle
						label="Daily Digest"
						description="Receive a daily summary of your activity"
						checked={formData.pushDaily}
						onToggle={() => handleToggle('pushDaily')}
					/>
					<Separator />
					<SettingToggle
						label="Weekly Digest"
						description="Receive a weekly summary of your activity"
						checked={formData.pushWeekly}
						onToggle={() => handleToggle('pushWeekly')}
					/>
				</CardContent>
			</Card>

			{/* In-App Notifications */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						<CardTitle>In-App Notifications</CardTitle>
					</div>
					<CardDescription>
						Manage notifications shown within the application
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<SettingToggle
						label="Invoice Notifications"
						description="Show in-app notifications for invoice updates"
						checked={formData.inAppInvoices}
						onToggle={() => handleToggle('inAppInvoices')}
					/>
					<Separator />
					<SettingToggle
						label="Expense Notifications"
						description="Show in-app notifications for expense updates"
						checked={formData.inAppExpenses}
						onToggle={() => handleToggle('inAppExpenses')}
					/>
					<Separator />
					<SettingToggle
						label="Alert Notifications"
						description="Show in-app notifications for alerts"
						checked={formData.inAppAlerts}
						onToggle={() => handleToggle('inAppAlerts')}
					/>
				</CardContent>
			</Card>

			{/* Slack Integration */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						<CardTitle>Slack Integration</CardTitle>
					</div>
					<CardDescription>
						Send notifications to your Slack workspace
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<SettingToggle
						label="Enable Slack Notifications"
						description="Send important notifications to Slack"
						checked={formData.slackEnabled}
						onToggle={() => handleToggle('slackEnabled')}
					/>
					
					{formData.slackEnabled && (
						<>
							<Separator />
							<div className="space-y-2">
								<Label htmlFor="slack-webhook">Slack Webhook URL</Label>
								<Input
									id="slack-webhook"
									type="url"
									placeholder="https://hooks.slack.com/services/..."
									value={formData.slackWebhook || ''}
									onChange={(e) => handleInputChange('slackWebhook', e.target.value)}
								/>
								<p className="text-sm text-muted-foreground">
									Enter your Slack webhook URL to receive notifications
								</p>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* Save Button */}
			{hasChanges && (
				<div className="flex items-center justify-end gap-4 sticky bottom-4 bg-background p-4 border rounded-lg shadow-lg">
					<p className="text-sm text-muted-foreground">
						You have unsaved changes
					</p>
					<Button 
						onClick={handleSave}
						disabled={updateMutation.isPending}
					>
						{updateMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</>
						) : (
							<>
								<Save className="mr-2 h-4 w-4" />
								Save Changes
							</>
						)}
					</Button>
				</div>
			)}
		</div>
	);
}

interface SettingToggleProps {
	label: string;
	description: string;
	checked: boolean;
	onToggle: () => void;
}

function SettingToggle({ label, description, checked, onToggle }: SettingToggleProps) {
	return (
		<div className="flex items-center justify-between">
			<div className="space-y-0.5 flex-1">
				<Label className="text-base">{label}</Label>
				<p className="text-sm text-muted-foreground">
					{description}
				</p>
			</div>
			<Switch checked={checked} onCheckedChange={onToggle} />
		</div>
	);
}

