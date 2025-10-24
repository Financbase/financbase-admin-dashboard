/**
 * Privacy Settings Management Components
 * Reusable components for managing privacy settings and data controls
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface PrivacySettings {
	id: string;
	userId: string;
	analyticsTracking: boolean;
	errorReporting: boolean;
	performanceMonitoring: boolean;
	usageStatistics: boolean;
	crashReports: boolean;
	shareWithPartners: boolean;
	shareForResearch: boolean;
	shareForMarketing: boolean;
	allowPersonalization: boolean;
	dataRetentionPeriod: '1year' | '2years' | '5years' | 'forever';
	autoDeleteInactive: boolean;
	downloadData: boolean;
	deleteAccount: boolean;
	allowThirdPartyIntegrations: boolean;
	requireConsentForNewIntegrations: boolean;
	createdAt: string;
	updatedAt: string;
}

export function PrivacySettingsManager() {
	const [settings, setSettings] = useState<Partial<PrivacySettings>>({
		analyticsTracking: true,
		errorReporting: true,
		performanceMonitoring: true,
		usageStatistics: false,
		crashReports: true,
		shareWithPartners: false,
		shareForResearch: false,
		shareForMarketing: false,
		allowPersonalization: true,
		dataRetentionPeriod: '5years',
		autoDeleteInactive: false,
		downloadData: true,
		deleteAccount: false,
		allowThirdPartyIntegrations: true,
		requireConsentForNewIntegrations: true,
	});

	const loadSettings = useCallback(async () => {
		try {
			const response = await fetch('/api/settings/preferences/privacy');
			if (response.ok) {
				const data = await response.json();
				if (data.settings) {
					setSettings(data.settings);
				} else {
					setSettings(data.defaults);
				}
			}
		} catch (error) {
			console.error('Error loading privacy settings:', error);
			toast.error('Failed to load privacy settings');
		}
	}, []);

	useEffect(() => {
		loadSettings();
	}, [loadSettings]);

	const updateSetting = async (key: keyof PrivacySettings, value: boolean | string) => {
		const updatedSettings = { ...settings, [key]: value };
		setSettings(updatedSettings);

		// Debounced save to avoid too many API calls
		setTimeout(async () => {
			try {
				const response = await fetch('/api/settings/preferences/privacy', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ [key]: value }),
				});

				if (response.ok) {
					const result = await response.json();
					setSettings(result.settings);
					toast.success('Privacy settings saved');
				} else {
					// Revert on error
					loadSettings();
					toast.error('Failed to save privacy settings');
				}
			} catch (error) {
				// Revert on error
				loadSettings();
				toast.error('Failed to save privacy settings');
			}
		}, 1000);
	};

	const exportData = async () => {
		setExportLoading(true);
		try {
			const response = await fetch('/api/settings/privacy/export', {
				method: 'POST',
			});

			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `financbase-data-export-${new Date().toISOString().split('T')[0]}.json`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
				toast.success('Data exported successfully');
			} else {
				toast.error('Failed to export data');
			}
		} catch (error) {
			console.error('Error exporting data:', error);
			toast.error('Failed to export data');
		} finally {
			setExportLoading(false);
		}
	};

	const deleteAccount = async () => {
		setDeleteLoading(true);
		try {
			const response = await fetch('/api/settings/privacy/delete-account', {
				method: 'POST',
			});

			if (response.ok) {
				toast.success('Account deletion request submitted');
				// In a real implementation, this would redirect to login or show a confirmation
			} else {
				toast.error('Failed to submit deletion request');
			}
		} catch (error) {
			console.error('Error deleting account:', error);
			toast.error('Failed to submit deletion request');
		} finally {
			setDeleteLoading(false);
		}
	};

	const getRetentionPeriodOptions = () => [
		{ value: '1year', label: '1 year' },
		{ value: '2years', label: '2 years' },
		{ value: '5years', label: '5 years' },
		{ value: 'forever', label: 'Forever' },
	];

	if (loading) {
		return <div className="flex justify-center p-8">Loading privacy settings...</div>;
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Privacy Settings</h3>
				<p className="text-sm text-muted-foreground">
					Control your data and privacy preferences
				</p>
			</div>

			{/* Data Collection */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Database className="h-5 w-5" />
						<CardTitle>Data Collection</CardTitle>
					</div>
					<CardDescription>
						Control what data we collect and how we use it
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Analytics Tracking</Label>
								<div className="text-sm text-muted-foreground">
									Help us improve the product with usage analytics
								</div>
							</div>
							<Switch
								checked={settings.analyticsTracking}
								onCheckedChange={(checked) => updateSetting('analyticsTracking', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Error Reporting</Label>
								<div className="text-sm text-muted-foreground">
									Automatically report errors to help fix issues
								</div>
							</div>
							<Switch
								checked={settings.errorReporting}
								onCheckedChange={(checked) => updateSetting('errorReporting', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Performance Monitoring</Label>
								<div className="text-sm text-muted-foreground">
									Collect performance data to optimize speed
								</div>
							</div>
							<Switch
								checked={settings.performanceMonitoring}
								onCheckedChange={(checked) => updateSetting('performanceMonitoring', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Usage Statistics</Label>
								<div className="text-sm text-muted-foreground">
									Share anonymous usage statistics
								</div>
							</div>
							<Switch
								checked={settings.usageStatistics}
								onCheckedChange={(checked) => updateSetting('usageStatistics', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Crash Reports</Label>
								<div className="text-sm text-muted-foreground">
									Send crash reports to prevent future issues
								</div>
							</div>
							<Switch
								checked={settings.crashReports}
								onCheckedChange={(checked) => updateSetting('crashReports', checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Data Sharing */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Eye className="h-5 w-5" />
						<CardTitle>Data Sharing</CardTitle>
					</div>
					<CardDescription>
						Control how your data is shared with third parties
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Share with Partners</Label>
								<div className="text-sm text-muted-foreground">
									Allow sharing data with trusted business partners
								</div>
							</div>
							<Switch
								checked={settings.shareWithPartners}
								onCheckedChange={(checked) => updateSetting('shareWithPartners', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Research Sharing</Label>
								<div className="text-sm text-muted-foreground">
									Share anonymized data for research purposes
								</div>
							</div>
							<Switch
								checked={settings.shareForResearch}
								onCheckedChange={(checked) => updateSetting('shareForResearch', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Marketing Communications</Label>
								<div className="text-sm text-muted-foreground">
									Allow sharing for marketing and promotions
								</div>
							</div>
							<Switch
								checked={settings.shareForMarketing}
								onCheckedChange={(checked) => updateSetting('shareForMarketing', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Personalization</Label>
								<div className="text-sm text-muted-foreground">
									Allow personalized recommendations and content
								</div>
							</div>
							<Switch
								checked={settings.allowPersonalization}
								onCheckedChange={(checked) => updateSetting('allowPersonalization', checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Data Retention */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						<CardTitle>Data Retention</CardTitle>
					</div>
					<CardDescription>
						Control how long we keep your data
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label>Data Retention Period</Label>
							<Select
								value={settings.dataRetentionPeriod}
								onValueChange={(value: '1year' | '2years' | '5years' | 'forever') => updateSetting('dataRetentionPeriod', value)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{getRetentionPeriodOptions().map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Auto-delete Inactive Accounts</Label>
								<div className="text-sm text-muted-foreground">
									Automatically delete accounts that have been inactive for 2+ years
								</div>
							</div>
							<Switch
								checked={settings.autoDeleteInactive}
								onCheckedChange={(checked) => updateSetting('autoDeleteInactive', checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Third-party Integrations */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						<CardTitle>Third-party Integrations</CardTitle>
					</div>
					<CardDescription>
						Control third-party app access and data sharing
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Allow Third-party Integrations</Label>
								<div className="text-sm text-muted-foreground">
									Allow connecting with external services and apps
								</div>
							</div>
							<Switch
								checked={settings.allowThirdPartyIntegrations}
								onCheckedChange={(checked) => updateSetting('allowThirdPartyIntegrations', checked)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Require Consent for New Integrations</Label>
								<div className="text-sm text-muted-foreground">
									Ask for permission before adding new integrations
								</div>
							</div>
							<Switch
								checked={settings.requireConsentForNewIntegrations}
								onCheckedChange={(checked) => updateSetting('requireConsentForNewIntegrations', checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Data Export & Deletion */}
			<Card>
				<CardHeader>
					<CardTitle>Your Data Rights</CardTitle>
					<CardDescription>
						Download your data or request account deletion
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Download My Data</Label>
								<div className="text-sm text-muted-foreground">
									Export all your data in JSON format
								</div>
							</div>
							<Button
								size="sm"
								variant="outline"
								onClick={exportData}
								disabled={exportLoading}
							>
								{exportLoading ? (
									<>Exporting...</>
								) : (
									<>
										<Download className="h-4 w-4 mr-2" />
										Export Data
									</>
								)}
							</Button>
						</div>

						<Separator />

						<div className="space-y-2">
							<Label className="text-red-600">Danger Zone</Label>
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label className="text-red-600">Delete Account</Label>
									<div className="text-sm text-muted-foreground">
										Permanently delete your account and all data
									</div>
								</div>
								<Button
									size="sm"
									variant="destructive"
									onClick={deleteAccount}
									disabled={deleteLoading}
								>
									{deleteLoading ? (
										<>Deleting...</>
									) : (
										<>
											<Trash2 className="h-4 w-4 mr-2" />
											Delete Account
										</>
									)}
								</Button>
							</div>
						</div>
					</div>

					<Alert>
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Privacy Notice</AlertTitle>
						<AlertDescription>
							Your privacy is important to us. We only collect data necessary to provide our services
							and comply with legal requirements. For more information, please review our Privacy Policy.
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		</div>
	);
}
