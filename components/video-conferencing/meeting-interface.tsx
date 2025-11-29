/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
	Calendar,
	Clock,
	Users,
	Video,
	Phone,
	Settings,
	Plus,
	Play,
	Square,
	Mic,
	MicOff,
	VideoOff,
	Video as VideoIcon,
	Monitor,
	Share2,
	MessageSquare,
	MoreVertical,
	Copy,
	ExternalLink,
	Download,
	Edit,
	Trash2,
	RefreshCw,
	CheckCircle,
	AlertTriangle,
	Info,
	Globe,
	Lock,
	Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { ZoomService } from '@/lib/services/integrations/zoom-service';
import { GoogleMeetService } from '@/lib/services/integrations/google-meet-service';
import { AdvancedMeetingInterface } from './advanced-meeting-interface';
import { logger } from '@/lib/logger';

interface Meeting {
	id: string;
	title: string;
	description?: string;
	scheduledFor: string;
	duration: number;
	provider: 'zoom' | 'google_meet' | 'teams';
	joinUrl?: string;
	meetingId?: string;
	participants: Array<{
		id: string;
		name: string;
		email: string;
		avatar?: string;
		status: 'invited' | 'accepted' | 'declined' | 'tentative';
	}>;
	status: 'scheduled' | 'active' | 'ended' | 'cancelled';
	createdBy: string;
	recordings?: Array<{
		id: string;
		url: string;
		downloadUrl?: string;
	}>;
}

interface MeetingSettings {
	defaultProvider: 'zoom' | 'google_meet' | 'teams';
	defaultDuration: number;
	autoRecording: boolean;
	waitingRoom: boolean;
	muteOnEntry: boolean;
	timezone: string;
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

export function VideoMeetingInterface() {
	const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showSettingsDialog, setShowSettingsDialog] = useState(false);
	const [newMeeting, setNewMeeting] = useState({
		title: '',
		description: '',
		scheduledFor: '',
		duration: 60,
		provider: 'zoom' as 'zoom' | 'google_meet' | 'teams',
		attendees: '',
		timezone: 'UTC',
	});

	const queryClient = useQueryClient();

	// Fetch meetings
	const { data: meetings = [], isLoading } = useQuery({
		queryKey: ['video-meetings'],
		queryFn: async () => {
			const response = await fetch('/api/video-conferencing/meetings');
			return response.json();
		},
	});

	// Fetch settings
	const { data: settings } = useQuery({
		queryKey: ['video-conferencing-settings'],
		queryFn: async () => {
			const response = await fetch('/api/video-conferencing/settings');
			return response.json();
		},
	});

	// Create meeting mutation
	const createMeetingMutation = useMutation({
		mutationFn: async (meetingData: any) => {
			const response = await fetch('/api/video-conferencing/meetings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(meetingData),
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['video-meetings'] });
			setShowCreateDialog(false);
			setNewMeeting({
				title: '',
				description: '',
				scheduledFor: '',
				duration: 60,
				provider: 'zoom',
				attendees: '',
				timezone: 'UTC',
			});
		},
	});

	// Join meeting mutation
	const joinMeetingMutation = useMutation({
		mutationFn: async (meetingId: string) => {
			const response = await fetch(`/api/video-conferencing/meetings/${meetingId}/join`, {
				method: 'POST',
			});
			return response.json();
		},
	});

	const handleCreateMeeting = () => {
		if (!newMeeting.title.trim() || !newMeeting.scheduledFor) return;

		const attendees = newMeeting.attendees
			.split(',')
			.map(email => email.trim())
			.filter(email => email)
			.map(email => ({ email }));

		createMeetingMutation.mutate({
			...newMeeting,
			attendees,
		});
	};

	const handleJoinMeeting = (meeting: Meeting) => {
		if (meeting.joinUrl) {
			window.open(meeting.joinUrl, '_blank');
		} else {
			joinMeetingMutation.mutate(meeting.id);
		}
	};

	const getProviderIcon = (provider: string) => {
		switch (provider) {
			case 'zoom':
				return <Video className="h-4 w-4" />;
			case 'google_meet':
				return <Globe className="h-4 w-4" />;
			default:
				return <Video className="h-4 w-4" />;
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

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'scheduled':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'active':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'ended':
				return 'bg-gray-100 text-gray-800 border-gray-200';
			case 'cancelled':
				return 'bg-red-100 text-red-800 border-red-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Video Meetings</h2>
					<p className="text-muted-foreground">
						Schedule and manage video conferences with advanced collaboration features
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Settings className="mr-2 h-4 w-4" />
						Settings
					</Button>
					<Button onClick={() => setShowCreateDialog(true)}>
						<Plus className="mr-2 h-4 w-4" />
						New Meeting
					</Button>
				</div>
			</div>

			<Tabs defaultValue="meetings" className="space-y-6">
				<TabsList>
					<TabsTrigger value="meetings">Meetings</TabsTrigger>
					<TabsTrigger value="advanced">Advanced Controls</TabsTrigger>
					<TabsTrigger value="settings">Settings</TabsTrigger>
				</TabsList>

				<TabsContent value="meetings">
					{/* Integration Status */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Zap className="mr-2 h-5 w-5" />
								Integration Status
							</CardTitle>
							<CardDescription>
								Configure your video conferencing providers
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Zoom Integration */}
								<div className="flex items-center justify-between p-4 border rounded-lg">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
											<Video className="h-5 w-5 text-blue-600" />
										</div>
										<div>
											<p className="font-medium">Zoom</p>
											<p className="text-sm text-muted-foreground">
												{ZoomService.hasIntegration() ? 'Connected' : 'Not connected'}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<div className={cn(
											"w-2 h-2 rounded-full",
											ZoomService.hasIntegration() ? "bg-green-500" : "bg-red-500"
										)}></div>
										<Button
											size="sm"
											variant={ZoomService.hasIntegration() ? "outline" : "default"}
										>
											{ZoomService.hasIntegration() ? 'Configure' : 'Connect'}
										</Button>
									</div>
								</div>

								{/* Google Meet Integration */}
								<div className="flex items-center justify-between p-4 border rounded-lg">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
											<Globe className="h-5 w-5 text-green-600" />
										</div>
										<div>
											<p className="font-medium">Google Meet</p>
											<p className="text-sm text-muted-foreground">
												{GoogleMeetService.hasIntegration() ? 'Connected' : 'Not connected'}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<div className={cn(
											"w-2 h-2 rounded-full",
											GoogleMeetService.hasIntegration() ? "bg-green-500" : "bg-red-500"
										)}></div>
										<Button
											size="sm"
											variant={GoogleMeetService.hasIntegration() ? "outline" : "default"}
										>
											{GoogleMeetService.hasIntegration() ? 'Configure' : 'Connect'}
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Meetings List */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Calendar className="mr-2 h-5 w-5" />
								Your Meetings
							</CardTitle>
							<CardDescription>
								Scheduled and past video conferences
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex items-center justify-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
								</div>
							) : meetings.length === 0 ? (
								<div className="text-center py-8">
									<Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">No meetings scheduled</p>
									<Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
										<Plus className="mr-2 h-4 w-4" />
										Schedule Your First Meeting
									</Button>
								</div>
							) : (
								<div className="space-y-4">
									{meetings.map((meeting: Meeting) => (
										<div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
											<div className="flex items-center gap-4">
												<div className="flex items-center gap-2">
													{getProviderIcon(meeting.provider)}
													<div>
														<p className="font-medium">{meeting.title}</p>
														<div className="flex items-center gap-2 text-sm text-muted-foreground">
															<Clock className="h-3 w-3" />
															{format(new Date(meeting.scheduledFor), 'MMM d, yyyy • HH:mm')}
															<span>•</span>
															{meeting.duration} min
														</div>
													</div>
												</div>
											</div>

											<div className="flex items-center gap-4">
												<div className="text-right">
													<div className="flex items-center gap-2">
														<Badge className={cn("text-xs", getStatusColor(meeting.status))}>
															{meeting.status}
														</Badge>
														<Badge className={cn("text-xs", getProviderColor(meeting.provider))}>
															{meeting.provider.replace('_', ' ')}
														</Badge>
													</div>
													<p className="text-xs text-muted-foreground mt-1">
														{meeting.participants.length} participants
													</p>
												</div>

												<div className="flex items-center gap-2">
													{meeting.status === 'scheduled' && (
														<>
															<Button size="sm" variant="outline">
																<Edit className="h-4 w-4" />
															</Button>
															<Button size="sm" onClick={() => handleJoinMeeting(meeting)}>
																<Play className="h-4 w-4" />
															</Button>
														</>
													)}

													{meeting.status === 'active' && (
														<Button size="sm" variant="destructive">
															<Square className="h-4 w-4" />
														</Button>
													)}

													{meeting.recordings && meeting.recordings.length > 0 && (
														<Button size="sm" variant="outline">
															<Download className="h-4 w-4" />
														</Button>
													)}

													<Button size="sm" variant="ghost">
														<MoreVertical className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="advanced">
					<AdvancedMeetingInterface meetingId="current" />
				</TabsContent>

				<TabsContent value="settings">
					{/* Meeting Settings Component */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Settings className="mr-2 h-5 w-5" />
								Meeting Settings
							</CardTitle>
							<CardDescription>
								Configure default settings and preferences for video meetings
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{/* Default Provider */}
								<div className="space-y-2">
									<Label htmlFor="defaultProvider">Default Provider</Label>
									<Select
										value={settings?.defaultProvider || 'zoom'}
										onValueChange={(value: 'zoom' | 'google_meet' | 'teams') =>
											// updateSettingsMutation.mutate({ defaultProvider: value })
											logger.info('Update default provider:', value)
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

								{/* Default Duration */}
								<div className="space-y-2">
									<Label htmlFor="defaultDuration">Default Duration</Label>
									<Select
										value={settings?.defaultDuration?.toString() || '60'}
										onValueChange={(value) =>
											// updateSettingsMutation.mutate({ defaultDuration: parseInt(value) })
											logger.info('Update default duration:', value)
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

								{/* Advanced Settings */}
								<Card>
									<CardHeader className="pb-3">
										<CardTitle className="text-sm">Advanced Settings</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="flex items-center justify-between">
											<div>
												<span className="text-sm">Auto Recording</span>
												<p className="text-xs text-muted-foreground">Automatically record all meetings</p>
											</div>
											<input type="checkbox" className="rounded" />
										</div>
										<div className="flex items-center justify-between">
											<div>
												<span className="text-sm">Waiting Room</span>
												<p className="text-xs text-muted-foreground">Require approval before joining</p>
											</div>
											<input type="checkbox" defaultChecked className="rounded" />
										</div>
										<div className="flex items-center justify-between">
											<div>
												<span className="text-sm">Mute on Entry</span>
												<p className="text-xs text-muted-foreground">Mute participants when they join</p>
											</div>
											<input type="checkbox" defaultChecked className="rounded" />
										</div>
									</CardContent>
								</Card>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Create Meeting Dialog */}
			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Schedule New Meeting</DialogTitle>
						<DialogDescription>
							Create a video conference with your preferred provider
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{/* Basic Information */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="meetingTitle">Meeting Title</Label>
								<Input
									id="meetingTitle"
									placeholder="e.g., Team Standup"
									value={newMeeting.title}
									onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="meetingProvider">Provider</Label>
								<Select
									value={newMeeting.provider}
									onValueChange={(value: 'zoom' | 'google_meet' | 'teams') =>
										setNewMeeting(prev => ({ ...prev, provider: value }))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select provider" />
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
						</div>

						<div className="space-y-2">
							<Label htmlFor="meetingDescription">Description (Optional)</Label>
							<Textarea
								id="meetingDescription"
								placeholder="Meeting agenda or notes"
								value={newMeeting.description}
								onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
							/>
						</div>

						{/* Scheduling */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="meetingDateTime">Date & Time</Label>
								<Input
									id="meetingDateTime"
									type="datetime-local"
									value={newMeeting.scheduledFor}
									onChange={(e) => setNewMeeting(prev => ({ ...prev, scheduledFor: e.target.value }))}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="meetingDuration">Duration</Label>
								<Select
									value={newMeeting.duration.toString()}
									onValueChange={(value) => setNewMeeting(prev => ({ ...prev, duration: parseInt(value) }))}
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
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="meetingTimezone">Timezone</Label>
								<Select
									value={newMeeting.timezone}
									onValueChange={(value) => setNewMeeting(prev => ({ ...prev, timezone: value }))}
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

						<div className="space-y-2">
							<Label htmlFor="meetingAttendees">Attendees (Optional)</Label>
							<Textarea
								id="meetingAttendees"
								placeholder="Enter email addresses separated by commas"
								value={newMeeting.attendees}
								onChange={(e) => setNewMeeting(prev => ({ ...prev, attendees: e.target.value }))}
							/>
						</div>

						{/* Meeting Settings */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm">Meeting Settings</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm">Waiting Room</span>
									<input type="checkbox" defaultChecked className="rounded" />
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Mute on Entry</span>
									<input type="checkbox" defaultChecked className="rounded" />
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm">Auto Recording</span>
									<input type="checkbox" className="rounded" />
								</div>
							</CardContent>
						</Card>

						<div className="flex gap-2">
							<Button
								className="flex-1"
								onClick={handleCreateMeeting}
								disabled={!newMeeting.title.trim() || !newMeeting.scheduledFor || createMeetingMutation.isPending}
							>
								{createMeetingMutation.isPending ? 'Creating...' : 'Create Meeting'}
							</Button>
							<Button variant="outline" className="flex-1">
								Schedule for Later
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
