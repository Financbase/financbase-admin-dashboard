"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
	Settings,
	Video,
	Globe,
	Calendar,
	Clock,
	Users,
	Shield,
	Key,
	RefreshCw,
	AlertTriangle,
	CheckCircle,
	ExternalLink,
	Copy,
	Trash2,
	Plus,
	Zap
} from 'lucide-react';
import { ZoomService } from '@/lib/services/integrations/zoom-service';
import { GoogleMeetService } from '@/lib/services/integrations/google-meet-service';
import { cn } from '@/lib/utils';

interface IntegrationConfig {
	id: number;
	provider: 'zoom' | 'google_meet' | 'teams';
	name: string;
	isActive: boolean;
	isDefault: boolean;
	accessToken?: string;
	refreshToken?: string;
	providerAccountId?: string;
}

interface MeetingSettings {
	defaultProvider: 'zoom' | 'google_meet' | 'teams';
	defaultDuration: number;
	autoRecording: boolean;
	waitingRoom: boolean;
	muteOnEntry: boolean;
	timezone: string;
	emailReminders: boolean;
	reminderMinutes: number[];
}

const TIMEZONES = [
	{ value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
	{ value: 'America/New_York', label: 'Eastern Time (ET)' },
	{ value: 'America/Chicago', label: 'Central Time (CT)' },
	{ value: 'America/Denver', label: 'Mountain Time (MT)' },
	{ value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
	{ value: 'Europe/London', label: 'London (GMT)' },
	{ value: 'Europe/Paris', label: 'Paris (CET)' },
	{ value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
	{ value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
	{ value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
];

export function VideoMeetingSettings() {
	const [showZoomDialog, setShowZoomDialog] = useState(false);
	const [showGoogleDialog, setShowGoogleDialog] = useState(false);
	const [zoomConfig, setZoomConfig] = useState({
		clientId: '',
		clientSecret: '',
		redirectUri: '',
	});
	const [googleConfig, setGoogleConfig] = useState({
		clientId: '',
		clientSecret: '',
		redirectUri: '',
	});

	const queryClient = useQueryClient();

	// Fetch integrations
	const { data: integrations = [] } = useQuery({
		queryKey: ['video-integrations'],
		queryFn: async () => {
			const response = await fetch('/api/video-conferencing/integrations');
			return response.json();
		},
	});

	// Fetch settings
	const { data: settings } = useQuery({
		queryKey: ['video-settings'],
		queryFn: async () => {
			const response = await fetch('/api/video-conferencing/settings');
			return response.json();
		},
	});

	// Update settings mutation
	const updateSettingsMutation = useMutation({
		mutationFn: async (settingsData: Partial<MeetingSettings>) => {
			const response = await fetch('/api/video-conferencing/settings', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(settingsData),
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['video-settings']);
		},
	});

	// Connect Zoom mutation
	const connectZoomMutation = useMutation({
		mutationFn: async (config: typeof zoomConfig) => {
			// Generate OAuth URL
			const params = new URLSearchParams({
				response_type: 'code',
				client_id: config.clientId,
				redirect_uri: config.redirectUri,
				scope: 'meeting:write meeting:read user:read',
			});

			const authUrl = `https://zoom.us/oauth/authorize?${params.toString()}`;

			// In a real implementation, you'd redirect to this URL
			// For now, we'll simulate the OAuth flow
			window.open(authUrl, '_blank');

			return { authUrl };
		},
	});

	// Connect Google mutation
	const connectGoogleMutation = useMutation({
		mutationFn: async (config: typeof googleConfig) => {
			// Generate OAuth URL
			const params = new URLSearchParams({
				response_type: 'code',
				client_id: config.clientId,
				redirect_uri: config.redirectUri,
				scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar',
				access_type: 'offline',
				prompt: 'consent',
			});

			const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

			// In a real implementation, you'd redirect to this URL
			window.open(authUrl, '_blank');

			return { authUrl };
		},
	});

	// Delete integration mutation
	const deleteIntegrationMutation = useMutation({
		mutationFn: async (integrationId: number) => {
			const response = await fetch(`/api/video-conferencing/integrations/${integrationId}`, {
				method: 'DELETE',
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['video-integrations']);
		},
	});

	const handleZoomConnect = () => {
		if (!zoomConfig.clientId || !zoomConfig.redirectUri) return;
		connectZoomMutation.mutate(zoomConfig);
	};

	const handleGoogleConnect = () => {
		if (!googleConfig.clientId || !googleConfig.redirectUri) return;
		connectGoogleMutation.mutate(googleConfig);
	};

	const getProviderIcon = (provider: string) => {
		switch (provider) {
			case 'zoom':
				return <Video className="h-5 w-5" />;
			case 'google_meet':
				return <Globe className="h-5 w-5" />;
			default:
				return <Video className="h-5 w-5" />;
		}
	};

	const getProviderColor = (provider: string) => {
		switch (provider) {
			case 'zoom':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'google_meet':
				return 'bg-green-100 text-green-800 border-green-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Video Conferencing Settings</h2>
					<p className="text-muted-foreground">
						Configure Zoom, Google Meet, and other video conferencing integrations
					</p>
				</div>
				<Button variant="outline">
					<RefreshCw className="mr-2 h-4 w-4" />
					Refresh Status
				</Button>
			</div>

			{/* Integration Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Zoom Integration */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<Video className="mr-2 h-5 w-5 text-blue-600" />
							Zoom Integration
						</CardTitle>
						<CardDescription>
							Connect your Zoom account for seamless meeting scheduling
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className={cn(
									"w-2 h-2 rounded-full",
									ZoomService.hasIntegration() ? "bg-green-500" : "bg-red-500"
								)}></div>
								<span className="text-sm">
									{ZoomService.hasIntegration() ? 'Connected' : 'Not connected'}
								</span>
							</div>
							<Badge className={cn("text-xs", getProviderColor('zoom'))}>
								{integrations.find(i => i.provider === 'zoom')?.isActive ? 'Active' : 'Inactive'}
							</Badge>
						</div>

						{ZoomService.hasIntegration() ? (
							<div className="space-y-3">
								<div className="p-3 bg-green-50 border border-green-200 rounded-lg">
									<div className="flex items-center gap-2 mb-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span className="text-sm font-medium text-green-800">Connected Successfully</span>
									</div>
									<p className="text-xs text-green-700">
										Your Zoom account is connected and ready to use
									</p>
								</div>

								<div className="flex gap-2">
									<Button variant="outline" className="flex-1">
										<Settings className="mr-2 h-4 w-4" />
										Configure
									</Button>
									<Button
										variant="outline"
										onClick={() => ZoomService.revokeAccess()}
										className="text-red-600 hover:text-red-700"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
									<div className="flex items-center gap-2 mb-2">
										<AlertTriangle className="h-4 w-4 text-yellow-600" />
										<span className="text-sm font-medium text-yellow-800">Not Connected</span>
									</div>
									<p className="text-xs text-yellow-700">
										Connect your Zoom account to schedule meetings directly from Financbase
									</p>
								</div>

								<Button onClick={() => setShowZoomDialog(true)} className="w-full">
									<Video className="mr-2 h-4 w-4" />
									Connect Zoom
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Google Meet Integration */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<Globe className="mr-2 h-5 w-5 text-green-600" />
							Google Meet Integration
						</CardTitle>
						<CardDescription>
							Connect Google Workspace for calendar and meeting integration
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className={cn(
									"w-2 h-2 rounded-full",
									GoogleMeetService.hasIntegration() ? "bg-green-500" : "bg-red-500"
								)}></div>
								<span className="text-sm">
									{GoogleMeetService.hasIntegration() ? 'Connected' : 'Not connected'}
								</span>
							</div>
							<Badge className={cn("text-xs", getProviderColor('google_meet'))}>
								{integrations.find(i => i.provider === 'google_meet')?.isActive ? 'Active' : 'Inactive'}
							</Badge>
						</div>

						{GoogleMeetService.hasIntegration() ? (
							<div className="space-y-3">
								<div className="p-3 bg-green-50 border border-green-200 rounded-lg">
									<div className="flex items-center gap-2 mb-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span className="text-sm font-medium text-green-800">Connected Successfully</span>
									</div>
									<p className="text-xs text-green-700">
										Your Google Workspace account is connected
									</p>
								</div>

								<div className="flex gap-2">
									<Button variant="outline" className="flex-1">
										<Calendar className="mr-2 h-4 w-4" />
										Configure Calendar
									</Button>
									<Button
										variant="outline"
										onClick={() => GoogleMeetService.revokeAccess()}
										className="text-red-600 hover:text-red-700"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
									<div className="flex items-center gap-2 mb-2">
										<AlertTriangle className="h-4 w-4 text-yellow-600" />
										<span className="text-sm font-medium text-yellow-800">Not Connected</span>
									</div>
									<p className="text-xs text-yellow-700">
										Connect your Google Workspace account for Google Meet integration
									</p>
								</div>

								<Button onClick={() => setShowGoogleDialog(true)} className="w-full">
									<Globe className="mr-2 h-4 w-4" />
									Connect Google
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Meeting Defaults */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Settings className="mr-2 h-5 w-5" />
						Meeting Defaults
					</CardTitle>
					<CardDescription>
						Set default settings for all your video meetings
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Provider Settings */}
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="defaultProvider">Default Provider</Label>
								<Select
									value={settings?.defaultProvider || 'zoom'}
									onValueChange={(value: 'zoom' | 'google_meet' | 'teams') =>
										updateSettingsMutation.mutate({ defaultProvider: value })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="zoom">
											<div className="flex items-center gap-2">
												<Video className="h-4 w-4" />
												Zoom
											</div>
										</SelectItem>
										<SelectItem value="google_meet">
											<div className="flex items-center gap-2">
												<Globe className="h-4 w-4" />
												Google Meet
											</div>
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="defaultDuration">Default Duration</Label>
								<Select
									value={settings?.defaultDuration?.toString() || '60'}
									onValueChange={(value) =>
										updateSettingsMutation.mutate({ defaultDuration: parseInt(value) })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="15">15 minutes</SelectItem>
										<SelectItem value="30">30 minutes</SelectItem>
										<SelectItem value="45">45 minutes</SelectItem>
										<SelectItem value="60">1 hour</SelectItem>
										<SelectItem value="90">1.5 hours</SelectItem>
										<SelectItem value="120">2 hours</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="defaultTimezone">Default Timezone</Label>
								<Select
									value={settings?.timezone || 'UTC'}
									onValueChange={(value) =>
										updateSettingsMutation.mutate({ timezone: value })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{TIMEZONES.map((tz) => (
											<SelectItem key={tz.value} value={tz.value}>
												{tz.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Meeting Features */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor="autoRecording">Auto Recording</Label>
									<p className="text-xs text-muted-foreground">Automatically record meetings</p>
								</div>
								<Switch
									checked={settings?.autoRecording || false}
									onCheckedChange={(checked) =>
										updateSettingsMutation.mutate({ autoRecording: checked })
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor="waitingRoom">Waiting Room</Label>
									<p className="text-xs text-muted-foreground">Participants wait before joining</p>
								</div>
								<Switch
									checked={settings?.waitingRoom || false}
									onCheckedChange={(checked) =>
										updateSettingsMutation.mutate({ waitingRoom: checked })
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor="muteOnEntry">Mute on Entry</Label>
									<p className="text-xs text-muted-foreground">Mute participants when they join</p>
								</div>
								<Switch
									checked={settings?.muteOnEntry || false}
									onCheckedChange={(checked) =>
										updateSettingsMutation.mutate({ muteOnEntry: checked })
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor="emailReminders">Email Reminders</Label>
									<p className="text-xs text-muted-foreground">Send email reminders to attendees</p>
								</div>
								<Switch
									checked={settings?.emailReminders || false}
									onCheckedChange={(checked) =>
										updateSettingsMutation.mutate({ emailReminders: checked })
									}
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Zoom Configuration Dialog */}
			<Dialog open={showZoomDialog} onOpenChange={setShowZoomDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center">
							<Video className="mr-2 h-5 w-5 text-blue-600" />
							Connect Zoom Account
						</DialogTitle>
						<DialogDescription>
							Configure your Zoom integration to schedule meetings directly from Financbase
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
							<h4 className="font-medium text-blue-800 mb-2">Setup Instructions</h4>
							<ol className="text-sm text-blue-700 space-y-1">
								<li>1. Go to the Zoom Marketplace</li>
								<li>2. Create a new app or use existing credentials</li>
								<li>3. Configure OAuth settings</li>
								<li>4. Set the redirect URI to your domain</li>
							</ol>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="zoomClientId">Client ID</Label>
								<Input
									id="zoomClientId"
									placeholder="Your Zoom Client ID"
									value={zoomConfig.clientId}
									onChange={(e) => setZoomConfig(prev => ({ ...prev, clientId: e.target.value }))}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="zoomRedirectUri">Redirect URI</Label>
								<Input
									id="zoomRedirectUri"
									placeholder="https://yourdomain.com/api/zoom/callback"
									value={zoomConfig.redirectUri}
									onChange={(e) => setZoomConfig(prev => ({ ...prev, redirectUri: e.target.value }))}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="zoomClientSecret">Client Secret</Label>
							<Input
								id="zoomClientSecret"
								type="password"
								placeholder="Your Zoom Client Secret"
								value={zoomConfig.clientSecret}
								onChange={(e) => setZoomConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
							/>
						</div>

						<div className="flex gap-2">
							<Button
								className="flex-1"
								onClick={handleZoomConnect}
								disabled={!zoomConfig.clientId || !zoomConfig.redirectUri}
							>
								<ExternalLink className="mr-2 h-4 w-4" />
								Connect to Zoom
							</Button>
							<Button variant="outline" className="flex-1">
								Help & Documentation
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Google Configuration Dialog */}
			<Dialog open={showGoogleDialog} onOpenChange={setShowGoogleDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center">
							<Globe className="mr-2 h-5 w-5 text-green-600" />
							Connect Google Workspace
						</DialogTitle>
						<DialogDescription>
							Configure Google Workspace integration for Calendar and Google Meet
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
							<h4 className="font-medium text-green-800 mb-2">Setup Instructions</h4>
							<ol className="text-sm text-green-700 space-y-1">
								<li>1. Go to Google Cloud Console</li>
								<li>2. Create or select a project</li>
								<li>3. Enable Google Calendar API</li>
								<li>4. Create OAuth 2.0 credentials</li>
								<li>5. Set authorized redirect URIs</li>
							</ol>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="googleClientId">Client ID</Label>
								<Input
									id="googleClientId"
									placeholder="Your Google Client ID"
									value={googleConfig.clientId}
									onChange={(e) => setGoogleConfig(prev => ({ ...prev, clientId: e.target.value }))}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="googleRedirectUri">Redirect URI</Label>
								<Input
									id="googleRedirectUri"
									placeholder="https://yourdomain.com/api/google/callback"
									value={googleConfig.redirectUri}
									onChange={(e) => setGoogleConfig(prev => ({ ...prev, redirectUri: e.target.value }))}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="googleClientSecret">Client Secret</Label>
							<Input
								id="googleClientSecret"
								type="password"
								placeholder="Your Google Client Secret"
								value={googleConfig.clientSecret}
								onChange={(e) => setGoogleConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
							/>
						</div>

						<div className="flex gap-2">
							<Button
								className="flex-1"
								onClick={handleGoogleConnect}
								disabled={!googleConfig.clientId || !googleConfig.redirectUri}
							>
								<ExternalLink className="mr-2 h-4 w-4" />
								Connect to Google
							</Button>
							<Button variant="outline" className="flex-1">
								Google Cloud Setup
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
