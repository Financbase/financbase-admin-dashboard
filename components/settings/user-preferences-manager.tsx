/**
 * User Preferences Management Components
 * Reusable components for managing user preferences, notifications, and privacy settings
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Palette, Globe, Calendar, BarChart3, Bell, Shield, Monitor, Moon, Sun, Laptop } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UserPreferences {
	id: string;
	userId: string;
	theme: 'light' | 'dark' | 'system';
	sidebarCollapsed: boolean;
	compactMode: boolean;
	highContrast: boolean;
	fontSize: 'small' | 'medium' | 'large';
	language: string;
	timezone: string;
	dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD MMM YYYY';
	timeFormat: '12h' | '24h';
	currency: string;
	numberFormat: string;
	defaultDashboard: string;
	chartsEnabled: boolean;
	analyticsEnabled: boolean;
	autoRefresh: boolean;
	refreshInterval: '30s' | '1m' | '5m' | '15m' | '30m';
	emailNotifications: boolean;
	pushNotifications: boolean;
	desktopNotifications: boolean;
	notificationSounds: boolean;
	weeklyDigest: boolean;
	monthlyReport: boolean;
	analyticsTracking: boolean;
	errorReporting: boolean;
	usageStats: boolean;
	marketingEmails: boolean;
	dataExport: boolean;
	betaFeatures: boolean;
	experimentalFeatures: boolean;
	developerMode: boolean;
	apiAccess: boolean;
	customPreferences: Record<string, any>;
	createdAt: string;
	updatedAt: string;
}

interface PreferencesData {
	preferences: UserPreferences | null;
	defaults: Partial<UserPreferences>;
}

export function UserPreferencesManager() {
	const [data, setData] = useState<PreferencesData | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
		theme: 'system',
		language: 'en',
		timezone: 'UTC',
		dateFormat: 'MM/DD/YYYY',
		timeFormat: '12h',
		currency: 'USD',
		numberFormat: '1,234.56',
		sidebarCollapsed: false,
		compactMode: false,
		highContrast: false,
		fontSize: 'medium',
		defaultDashboard: 'overview',
		chartsEnabled: true,
		analyticsEnabled: true,
		autoRefresh: true,
		refreshInterval: '5m',
		emailNotifications: true,
		pushNotifications: true,
		desktopNotifications: false,
		notificationSounds: true,
		weeklyDigest: true,
		monthlyReport: true,
		analyticsTracking: true,
		errorReporting: true,
		usageStats: false,
		marketingEmails: false,
		dataExport: true,
		betaFeatures: false,
		experimentalFeatures: false,
		developerMode: false,
		apiAccess: false,
		customPreferences: {},
	});

	const loadPreferences = useCallback(async () => {
		try {
			const response = await fetch('/api/settings/preferences');
			if (response.ok) {
				const data = await response.json();
				setData(data);
				if (data.preferences) {
					setPreferences(data.preferences);
				} else {
					setPreferences(data.defaults);
				}
			}
		} catch (error) {
			console.error('Error loading preferences:', error);
			toast.error('Failed to load preferences');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadPreferences();
	}, [loadPreferences]);

	const updatePreference = async (key: keyof UserPreferences, value: any) => {
		const updatedPreferences = { ...preferences, [key]: value };
		setPreferences(updatedPreferences);

		// Debounced save to avoid too many API calls
		setTimeout(async () => {
			try {
				const response = await fetch('/api/settings/preferences', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ [key]: value }),
				});

				if (response.ok) {
					const result = await response.json();
					setPreferences(result.preferences);
					toast.success('Preferences saved');
				} else {
					// Revert on error
					loadPreferences();
					toast.error('Failed to save preferences');
				}
			} catch (error) {
				// Revert on error
				loadPreferences();
				toast.error('Failed to save preferences');
			}
		}, 1000);
	};

	const getThemeIcon = (theme: string) => {
		switch (theme) {
			case 'light':
				return <Sun className="h-4 w-4" />;
			case 'dark':
				return <Moon className="h-4 w-4" />;
			default:
				return <Monitor className="h-4 w-4" />;
		}
	};

	const getThemeOptions = () => [
		{ value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
		{ value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
		{ value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
	];

	const getLanguageOptions = () => [
		{ value: 'en', label: 'English' },
		{ value: 'es', label: 'Español' },
		{ value: 'fr', label: 'Français' },
		{ value: 'de', label: 'Deutsch' },
		{ value: 'it', label: 'Italiano' },
		{ value: 'pt', label: 'Português' },
		{ value: 'ja', label: '日本語' },
		{ value: 'ko', label: '한국어' },
		{ value: 'zh', label: '中文' },
	];

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

	const getDateFormatOptions = () => [
		{ value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
		{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK)' },
		{ value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
		{ value: 'DD MMM YYYY', label: 'DD MMM YYYY' },
	];

	const getTimeFormatOptions = () => [
		{ value: '12h', label: '12 Hour (AM/PM)' },
		{ value: '24h', label: '24 Hour' },
	];

	const getCurrencyOptions = () => [
		{ value: 'USD', label: 'USD ($)' },
		{ value: 'EUR', label: 'EUR (€)' },
		{ value: 'GBP', label: 'GBP (£)' },
		{ value: 'JPY', label: 'JPY (¥)' },
		{ value: 'CAD', label: 'CAD (C$)' },
		{ value: 'AUD', label: 'AUD (A$)' },
		{ value: 'CHF', label: 'CHF (CHF)' },
		{ value: 'CNY', label: 'CNY (¥)' },
		{ value: 'INR', label: 'INR (₹)' },
		{ value: 'BRL', label: 'BRL (R$)' },
	];

	const getRefreshIntervalOptions = () => [
		{ value: '30s', label: '30 seconds' },
		{ value: '1m', label: '1 minute' },
		{ value: '5m', label: '5 minutes' },
		{ value: '15m', label: '15 minutes' },
		{ value: '30m', label: '30 minutes' },
	];

	if (loading) {
		return <div className="flex justify-center p-8">Loading preferences...</div>;
	}

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Preferences</h3>
				<p className="text-sm text-muted-foreground">
					Customize your Financbase experience
				</p>
			</div>

			{/* Appearance */}
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
				<CardContent className="space-y-6">
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label>Theme</Label>
							<Select
								value={preferences.theme}
								onValueChange={(value: 'light' | 'dark' | 'system') => updatePreference('theme', value)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{getThemeOptions().map((option) => (
										<SelectItem key={option.value} value={option.value}>
											<div className="flex items-center gap-2">
												{option.icon}
												{option.label}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Compact Mode</Label>
									<div className="text-sm text-muted-foreground">
										Reduce spacing and padding
									</div>
								</div>
								<Switch
									checked={preferences.compactMode}
									onCheckedChange={(checked) => updatePreference('compactMode', checked)}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>High Contrast</Label>
									<div className="text-sm text-muted-foreground">
										Increase contrast for better visibility
									</div>
								</div>
								<Switch
									checked={preferences.highContrast}
									onCheckedChange={(checked) => updatePreference('highContrast', checked)}
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label>Font Size</Label>
							<Select
								value={preferences.fontSize}
								onValueChange={(value: 'small' | 'medium' | 'large') => updatePreference('fontSize', value)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="small">Small</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="large">Large</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Language & Region */}
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
				<CardContent className="space-y-6">
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label>Language</Label>
							<Select
								value={preferences.language}
								onValueChange={(value) => updatePreference('language', value)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{getLanguageOptions().map((option) => (
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
								value={preferences.timezone}
								onValueChange={(value) => updatePreference('timezone', value)}
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

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label>Date Format</Label>
								<Select
									value={preferences.dateFormat}
									onValueChange={(value: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD MMM YYYY') => updatePreference('dateFormat', value)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{getDateFormatOptions().map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label>Time Format</Label>
								<Select
									value={preferences.timeFormat}
									onValueChange={(value: '12h' | '24h') => updatePreference('timeFormat', value)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{getTimeFormatOptions().map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label>Currency</Label>
								<Select
									value={preferences.currency}
									onValueChange={(value) => updatePreference('currency', value)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{getCurrencyOptions().map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label>Number Format</Label>
								<Select
									value={preferences.numberFormat}
									onValueChange={(value) => updatePreference('numberFormat', value)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="1,234.56">1,234.56 (US)</SelectItem>
										<SelectItem value="1.234,56">1.234,56 (European)</SelectItem>
										<SelectItem value="1 234.56">1 234.56 (Swiss)</SelectItem>
										<SelectItem value="1'234.56">1'234.56 (Swiss Alt)</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Dashboard */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5" />
						<CardTitle>Dashboard</CardTitle>
					</div>
					<CardDescription>
						Configure dashboard and data display preferences
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label>Default Dashboard</Label>
							<Select
								value={preferences.defaultDashboard}
								onValueChange={(value) => updatePreference('defaultDashboard', value)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="overview">Overview</SelectItem>
									<SelectItem value="financial">Financial Summary</SelectItem>
									<SelectItem value="analytics">Analytics</SelectItem>
									<SelectItem value="reports">Reports</SelectItem>
									<SelectItem value="transactions">Transactions</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Charts & Visualizations</Label>
									<div className="text-sm text-muted-foreground">
										Show charts and graphs
									</div>
								</div>
								<Switch
									checked={preferences.chartsEnabled}
									onCheckedChange={(checked) => updatePreference('chartsEnabled', checked)}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Analytics</Label>
									<div className="text-sm text-muted-foreground">
										Show analytics and insights
									</div>
								</div>
								<Switch
									checked={preferences.analyticsEnabled}
									onCheckedChange={(checked) => updatePreference('analyticsEnabled', checked)}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Auto Refresh</Label>
									<div className="text-sm text-muted-foreground">
										Automatically refresh data
									</div>
								</div>
								<Switch
									checked={preferences.autoRefresh}
									onCheckedChange={(checked) => updatePreference('autoRefresh', checked)}
								/>
							</div>

							<div className="grid gap-2">
								<Label>Refresh Interval</Label>
								<Select
									value={preferences.refreshInterval}
									onValueChange={(value: '30s' | '1m' | '5m' | '15m' | '30m') => updatePreference('refreshInterval', value)}
									disabled={!preferences.autoRefresh}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{getRefreshIntervalOptions().map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Notifications */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						<CardTitle>Notifications</CardTitle>
					</div>
					<CardDescription>
						Configure how and when you receive notifications
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Email Notifications</Label>
									<div className="text-sm text-muted-foreground">
										Receive notifications via email
									</div>
								</div>
								<Switch
									checked={preferences.emailNotifications}
									onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Push Notifications</Label>
									<div className="text-sm text-muted-foreground">
										Browser push notifications
									</div>
								</div>
								<Switch
									checked={preferences.pushNotifications}
									onCheckedChange={(checked) => updatePreference('pushNotifications', checked)}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Desktop Notifications</Label>
									<div className="text-sm text-muted-foreground">
										System desktop notifications
									</div>
								</div>
								<Switch
									checked={preferences.desktopNotifications}
									onCheckedChange={(checked) => updatePreference('desktopNotifications', checked)}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Notification Sounds</Label>
									<div className="text-sm text-muted-foreground">
										Play sounds for notifications
									</div>
								</div>
								<Switch
									checked={preferences.notificationSounds}
									onCheckedChange={(checked) => updatePreference('notificationSounds', checked)}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Weekly Digest</Label>
									<div className="text-sm text-muted-foreground">
										Weekly summary email
									</div>
								</div>
								<Switch
									checked={preferences.weeklyDigest}
									onCheckedChange={(checked) => updatePreference('weeklyDigest', checked)}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Monthly Report</Label>
									<div className="text-sm text-muted-foreground">
										Monthly performance report
									</div>
								</div>
								<Switch
									checked={preferences.monthlyReport}
									onCheckedChange={(checked) => updatePreference('monthlyReport', checked)}
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Privacy & Data */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						<CardTitle>Privacy & Data</CardTitle>
					</div>
					<CardDescription>
						Control your data and privacy settings
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Analytics Tracking</Label>
									<div className="text-sm text-muted-foreground">
										Help improve the product
									</div>
								</div>
								<Switch
									checked={preferences.analyticsTracking}
									onCheckedChange={(checked) => updatePreference('analyticsTracking', checked)}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Error Reporting</Label>
									<div className="text-sm text-muted-foreground">
										Automatically report errors
									</div>
								</div>
								<Switch
									checked={preferences.errorReporting}
									onCheckedChange={(checked) => updatePreference('errorReporting', checked)}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Usage Statistics</Label>
									<div className="text-sm text-muted-foreground">
										Share anonymous usage data
									</div>
								</div>
								<Switch
									checked={preferences.usageStats}
									onCheckedChange={(checked) => updatePreference('usageStats', checked)}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Marketing Emails</Label>
									<div className="text-sm text-muted-foreground">
										Receive promotional emails
									</div>
								</div>
								<Switch
									checked={preferences.marketingEmails}
									onCheckedChange={(checked) => updatePreference('marketingEmails', checked)}
								/>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Data Export</Label>
								<div className="text-sm text-muted-foreground">
									Allow data export and portability
								</div>
							</div>
							<Switch
								checked={preferences.dataExport}
								onCheckedChange={(checked) => updatePreference('dataExport', checked)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Advanced Features */}
			<Card>
				<CardHeader>
					<CardTitle>Advanced Features</CardTitle>
					<CardDescription>
						Access experimental and beta features
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Beta Features</Label>
									<div className="text-sm text-muted-foreground">
										Access features in beta testing
									</div>
								</div>
								<Switch
									checked={preferences.betaFeatures}
									onCheckedChange={(checked) => updatePreference('betaFeatures', checked)}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Experimental Features</Label>
									<div className="text-sm text-muted-foreground">
										Access experimental features
									</div>
								</div>
								<Switch
									checked={preferences.experimentalFeatures}
									onCheckedChange={(checked) => updatePreference('experimentalFeatures', checked)}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Developer Mode</Label>
									<div className="text-sm text-muted-foreground">
										Access developer tools
									</div>
								</div>
								<Switch
									checked={preferences.developerMode}
									onCheckedChange={(checked) => updatePreference('developerMode', checked)}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>API Access</Label>
									<div className="text-sm text-muted-foreground">
										Enable API access for integrations
									</div>
								</div>
								<Switch
									checked={preferences.apiAccess}
									onCheckedChange={(checked) => updatePreference('apiAccess', checked)}
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
