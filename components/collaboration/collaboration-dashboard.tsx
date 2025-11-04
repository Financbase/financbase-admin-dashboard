/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState } from 'react';
import { useCollaboration } from '@/contexts/collaboration-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	MessageSquare,
	Users,
	Calendar,
	Activity,
	Plus,
	Settings,
	Video,
	Phone,
	FileText,
	Image,
	Hash,
	Clock,
	CheckCircle,
	AlertTriangle,
	Info,
	Star,
	MoreVertical,
	Bell,
	Search,
	Filter
} from 'lucide-react';
import { ChatInterface } from './chat-interface';
import { VideoMeetingInterface } from '@/components/video-conferencing/meeting-interface';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

export function CollaborationDashboard() {
	const {
		currentUser,
		channels,
		messages,
		meetings,
		activities,
		onlineUsers,
		isConnected,
		trackActivity,
		createMeeting,
	} = useCollaboration();

	const [activeTab, setActiveTab] = useState('overview');

	// Mock data for demonstration
	const recentActivities = [
		{
			id: '1',
			type: 'message',
			title: 'New message in #general',
			user: 'John Doe',
			userAvatar: '',
			timestamp: new Date(Date.now() - 5 * 60 * 1000),
			entity: '#general',
		},
		{
			id: '2',
			type: 'meeting',
			title: 'Meeting scheduled',
			user: 'Sarah Wilson',
			userAvatar: '',
			timestamp: new Date(Date.now() - 15 * 60 * 1000),
			entity: 'Q4 Planning',
		},
		{
			id: '3',
			type: 'file',
			title: 'File uploaded',
			user: 'Mike Johnson',
			userAvatar: '',
			timestamp: new Date(Date.now() - 30 * 60 * 1000),
			entity: 'Financial Report.pdf',
		},
	];

	const upcomingMeetings = [
		{
			id: '1',
			title: 'Team Standup',
			time: new Date(Date.now() + 2 * 60 * 60 * 1000),
			participants: 5,
		},
		{
			id: '2',
			title: 'Client Review',
			time: new Date(Date.now() + 4 * 60 * 60 * 1000),
			participants: 3,
		},
	];

	if (!currentUser) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-center">
					<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<p className="text-muted-foreground">Please sign in to access collaboration features</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Team Collaboration</h2>
					<p className="text-muted-foreground">
						Chat, meet, and collaborate with your team in real-time
					</p>
				</div>
				<div className="flex items-center gap-2">
					{/* Connection Status */}
					<div className="flex items-center gap-2 text-sm">
						<div className={cn(
							"w-2 h-2 rounded-full",
							isConnected ? "bg-green-500" : "bg-red-500"
						)}></div>
						<span className={cn(
							"text-muted-foreground",
							!isConnected && "text-red-600"
						)}>
							{isConnected ? 'Connected' : 'Disconnected'}
						</span>
					</div>

					<Button variant="outline">
						<Settings className="mr-2 h-4 w-4" />
						Settings
					</Button>

					<Button>
						<Plus className="mr-2 h-4 w-4" />
						New Meeting
					</Button>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<MessageSquare className="h-4 w-4 text-blue-600" />
							<div>
								<p className="text-sm text-muted-foreground">Active Channels</p>
								<p className="text-xl font-bold">{channels.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4 text-green-600" />
							<div>
								<p className="text-sm text-muted-foreground">Online Users</p>
								<p className="text-xl font-bold">{onlineUsers.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4 text-purple-600" />
							<div>
								<p className="text-sm text-muted-foreground">Upcoming Meetings</p>
								<p className="text-xl font-bold">{upcomingMeetings.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Activity className="h-4 w-4 text-orange-600" />
							<div>
								<p className="text-sm text-muted-foreground">Recent Activities</p>
								<p className="text-xl font-bold">{recentActivities.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="chat">Chat</TabsTrigger>
					<TabsTrigger value="meetings">Meetings</TabsTrigger>
					<TabsTrigger value="activity">Activity</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Chat Section */}
						<div className="lg:col-span-2">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center">
										<MessageSquare className="mr-2 h-5 w-5" />
										Recent Chat
									</CardTitle>
									<CardDescription>
										Latest messages from your channels
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{channels.slice(0, 3).map((channel) => {
											const channelMessages = messages[channel.id] || [];
											const lastMessage = channelMessages[channelMessages.length - 1];

											return (
												<div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
													<div className="flex items-center gap-3">
														<Hash className="h-4 w-4 text-muted-foreground" />
														<div>
															<p className="font-medium">{channel.name}</p>
															{lastMessage ? (
																<p className="text-sm text-muted-foreground">
																	{lastMessage.userName}: {lastMessage.content}
																</p>
															) : (
																<p className="text-sm text-muted-foreground">No messages yet</p>
															)}
														</div>
													</div>
													<Button size="sm" variant="ghost">
														View
													</Button>
												</div>
											);
										})}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Sidebar */}
						<div className="space-y-4">
							{/* Online Users */}
							<Card>
								<CardHeader>
									<CardTitle className="text-sm">Online Users</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{onlineUsers.slice(0, 5).map((user) => (
											<div key={user.id} className="flex items-center gap-3">
												<div className="relative">
													<Avatar className="w-8 h-8">
														<AvatarImage src={user.avatar} />
														<AvatarFallback className="text-xs">
															{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
														</AvatarFallback>
													</Avatar>
													<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">{user.name}</p>
													<p className="text-xs text-muted-foreground">{user.role}</p>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							{/* Upcoming Meetings */}
							<Card>
								<CardHeader>
									<CardTitle className="text-sm">Upcoming Meetings</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{upcomingMeetings.map((meeting) => (
											<div key={meeting.id} className="flex items-center gap-3">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">{meeting.title}</p>
													<p className="text-xs text-muted-foreground">
														{format(meeting.time, 'HH:mm')} • {meeting.participants} participants
													</p>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</TabsContent>

				{/* Chat Tab */}
				<TabsContent value="chat">
					<ChatInterface />
				</TabsContent>

				{/* Meetings Tab */}
				<TabsContent value="meetings">
					<VideoMeetingInterface />
				</TabsContent>

				{/* Activity Tab */}
				<TabsContent value="activity" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Activity className="mr-2 h-5 w-5" />
								Team Activity Feed
							</CardTitle>
							<CardDescription>
								Recent team activities and updates
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recentActivities.map((activity) => (
									<div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
										<div className="flex-shrink-0">
											{getActivityIcon(activity.type)}
										</div>
										<div className="flex-1">
											<p className="font-medium text-sm">{activity.title}</p>
											<p className="text-sm text-muted-foreground">
												by {activity.user} • {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
											</p>
											<Badge variant="outline" className="mt-1 text-xs">
												{activity.entity}
											</Badge>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

function getActivityIcon(type: string) {
	switch (type) {
		case 'message':
			return <MessageSquare className="h-4 w-4 text-blue-600" />;
		case 'meeting':
			return <Calendar className="h-4 w-4 text-purple-600" />;
		case 'file':
			return <FileText className="h-4 w-4 text-green-600" />;
		default:
			return <Info className="h-4 w-4 text-gray-600" />;
	}
}
