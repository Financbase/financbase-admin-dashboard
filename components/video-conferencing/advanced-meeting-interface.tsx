"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	Monitor,
	Users,
	Share2,
	Play,
	Square,
	Plus,
	Settings,
	Video,
	Mic,
	MicOff,
	VideoOff,
	Video as VideoIcon,
	Phone,
	MoreVertical,
	BarChart3,
	StickyNote,
	Edit,
	Save,
	X,
	Check,
	Timer,
	RefreshCw,
	AlertTriangle,
	Info,
	ScreenShare,
	SplitSquareHorizontal,
	BarChart3 as Poll,
	Whiteboard,
	Download,
	ExternalLink,
	Copy
} from 'lucide-react';
import { AdvancedVideoFeaturesService } from '@/lib/services/video-conferencing/advanced-features';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MeetingControls {
	isMicOn: boolean;
	isVideoOn: boolean;
	isScreenSharing: boolean;
	isRecording: boolean;
	isHandRaised: boolean;
}

interface BreakoutRoom {
	id: string;
	name: string;
	participants: Array<{
		id: string;
		name: string;
		email: string;
		role: 'host' | 'co-host' | 'participant';
	}>;
	maxParticipants?: number;
	isActive: boolean;
}

interface MeetingPoll {
	id: string;
	question: string;
	options: Array<{
		id: string;
		text: string;
		votes: number;
	}>;
	isAnonymous: boolean;
	allowMultiple: boolean;
	isActive: boolean;
}

export function AdvancedMeetingInterface({ meetingId }: { meetingId: string }) {
	const [controls, setControls] = useState<MeetingControls>({
		isMicOn: true,
		isVideoOn: true,
		isScreenSharing: false,
		isRecording: false,
		isHandRaised: false,
	});

	const [showBreakoutDialog, setShowBreakoutDialog] = useState(false);
	const [showPollDialog, setShowPollDialog] = useState(false);
	const [showWhiteboardDialog, setShowWhiteboardDialog] = useState(false);

	const [newBreakoutRoom, setNewBreakoutRoom] = useState({
		name: '',
		participants: [] as string[],
		maxParticipants: 5,
		duration: 30,
	});

	const [newPoll, setNewPoll] = useState({
		question: '',
		options: ['Option 1', 'Option 2'],
		isAnonymous: false,
		allowMultiple: false,
	});

	const [breakoutRooms, setBreakoutRooms] = useState<BreakoutRoom[]>([]);
	const [activePolls, setActivePolls] = useState<MeetingPoll[]>([]);
	const [screenShareSession, setScreenShareSession] = useState<any>(null);

	const queryClient = useQueryClient();

	// Fetch meeting details
	const { data: meeting } = useQuery({
		queryKey: ['meeting', meetingId],
		queryFn: async () => {
			const response = await fetch(`/api/video-conferencing/meetings/${meetingId}`);
			return response.json();
		},
	});

	// Fetch breakout rooms
	const { data: rooms = [] } = useQuery({
		queryKey: ['breakout-rooms', meetingId],
		queryFn: async () => {
			const response = await fetch(`/api/video-conferencing/meetings/${meetingId}/breakout-rooms`);
			return response.json();
		},
	});

	// Fetch active polls
	const { data: polls = [] } = useQuery({
		queryKey: ['meeting-polls', meetingId],
		queryFn: async () => {
			const response = await fetch(`/api/video-conferencing/meetings/${meetingId}/polls`);
			return response.json();
		},
	});

	// Start screen share mutation
	const startScreenShareMutation = useMutation({
		mutationFn: async (options: { screenType?: 'screen' | 'window' | 'browser'; title?: string }) => {
			return await AdvancedVideoFeaturesService.startScreenShare(meetingId, 'current_user', options);
		},
		onSuccess: (session) => {
			setScreenShareSession(session);
			setControls(prev => ({ ...prev, isScreenSharing: true }));
		},
	});

	// Stop screen share mutation
	const stopScreenShareMutation = useMutation({
		mutationFn: async (sessionId: string) => {
			return await AdvancedVideoFeaturesService.stopScreenShare(sessionId, meetingId);
		},
		onSuccess: () => {
			setScreenShareSession(null);
			setControls(prev => ({ ...prev, isScreenSharing: false }));
		},
	});

	// Create breakout room mutation
	const createBreakoutRoomMutation = useMutation({
		mutationFn: async (roomData: any) => {
			return await AdvancedVideoFeaturesService.createBreakoutRoom(meetingId, roomData);
		},
		onSuccess: (room) => {
			setBreakoutRooms(prev => [...prev, room]);
			setShowBreakoutDialog(false);
		},
	});

	// Create poll mutation
	const createPollMutation = useMutation({
		mutationFn: async (pollData: any) => {
			return await AdvancedVideoFeaturesService.createPoll(meetingId, pollData);
		},
		onSuccess: (poll) => {
			setActivePolls(prev => [...prev, poll]);
			setShowPollDialog(false);
		},
	});

	// Toggle recording mutation
	const toggleRecordingMutation = useMutation({
		mutationFn: async (action: 'start' | 'stop') => {
			if (action === 'start') {
				await AdvancedVideoFeaturesService.startRecording(meetingId);
			} else {
				await AdvancedVideoFeaturesService.stopRecording(meetingId);
			}
		},
		onSuccess: (_, action) => {
			setControls(prev => ({ ...prev, isRecording: action === 'start' }));
		},
	});

	const handleScreenShare = () => {
		if (controls.isScreenSharing) {
			if (screenShareSession) {
				stopScreenShareMutation.mutate(screenShareSession.id);
			}
		} else {
			startScreenShareMutation.mutate({
				screenType: 'screen',
				title: 'Meeting Presentation',
			});
		}
	};

	const handleCreateBreakoutRoom = () => {
		if (!newBreakoutRoom.name.trim()) return;

		createBreakoutRoomMutation.mutate({
			name: newBreakoutRoom.name,
			participants: newBreakoutRoom.participants.map(id => ({
				id,
				name: 'Participant', // Would get from user data
				email: 'participant@example.com',
			})),
			maxParticipants: newBreakoutRoom.maxParticipants,
			duration: newBreakoutRoom.duration,
		});
	};

	const handleCreatePoll = () => {
		if (!newPoll.question.trim()) return;

		createPollMutation.mutate({
			question: newPoll.question,
			options: newPoll.options,
			isAnonymous: newPoll.isAnonymous,
			allowMultiple: newPoll.allowMultiple,
		});
	};

	return (
		<div className="space-y-6">
			{/* Meeting Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">{meeting?.title || 'Video Meeting'}</h2>
					<p className="text-muted-foreground">
						Advanced meeting controls and collaboration tools
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant={meeting?.status === 'active' ? 'default' : 'secondary'}>
						{meeting?.status || 'Unknown'}
					</Badge>
					<Button variant="outline" size="sm">
						<BarChart3 className="mr-2 h-4 w-4" />
						Analytics
					</Button>
				</div>
			</div>

			{/* Main Controls */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Video className="mr-2 h-5 w-5" />
						Meeting Controls
					</CardTitle>
					<CardDescription>
						Control your audio, video, and advanced meeting features
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{/* Audio Control */}
						<Button
							variant={controls.isMicOn ? "default" : "destructive"}
							size="lg"
							onClick={() => setControls(prev => ({ ...prev, isMicOn: !prev.isMicOn }))}
							className="flex flex-col gap-2 h-20"
						>
							{controls.isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
							<span className="text-xs">
								{controls.isMicOn ? 'Mic On' : 'Mic Off'}
							</span>
						</Button>

						{/* Video Control */}
						<Button
							variant={controls.isVideoOn ? "default" : "destructive"}
							size="lg"
							onClick={() => setControls(prev => ({ ...prev, isVideoOn: !prev.isVideoOn }))}
							className="flex flex-col gap-2 h-20"
						>
							{controls.isVideoOn ? <VideoIcon className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
							<span className="text-xs">
								{controls.isVideoOn ? 'Video On' : 'Video Off'}
							</span>
						</Button>

						{/* Screen Share */}
						<Button
							variant={controls.isScreenSharing ? "default" : "outline"}
							size="lg"
							onClick={handleScreenShare}
							className="flex flex-col gap-2 h-20"
						>
							<ScreenShare className="h-6 w-6" />
							<span className="text-xs">
								{controls.isScreenSharing ? 'Stop Share' : 'Share Screen'}
							</span>
						</Button>

						{/* Recording */}
						<Button
							variant={controls.isRecording ? "destructive" : "outline"}
							size="lg"
							onClick={() => toggleRecordingMutation.mutate(controls.isRecording ? 'stop' : 'start')}
							className="flex flex-col gap-2 h-20"
						>
							<div className={cn(
								"h-3 w-3 rounded-full",
								controls.isRecording ? "bg-red-500 animate-pulse" : "bg-gray-400"
							)}></div>
							<span className="text-xs">
								{controls.isRecording ? 'Stop Recording' : 'Start Recording'}
							</span>
						</Button>
					</div>

					{/* Additional Controls */}
					<div className="flex items-center justify-between mt-6 pt-4 border-t">
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setControls(prev => ({ ...prev, isHandRaised: !prev.isHandRaised }))}
							>
								✋ {controls.isHandRaised ? 'Lower Hand' : 'Raise Hand'}
							</Button>

							<Button variant="outline" size="sm">
								<Phone className="mr-2 h-4 w-4" />
								Leave Meeting
							</Button>
						</div>

						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Advanced Features */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Breakout Rooms */}
				<Card className="lg:col-span-1">
					<CardHeader>
						<CardTitle className="flex items-center">
							<SplitSquareHorizontal className="mr-2 h-5 w-5" />
							Breakout Rooms
						</CardTitle>
						<CardDescription>
							Create and manage breakout sessions
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Create Room Button */}
						<Button
							className="w-full"
							onClick={() => setShowBreakoutDialog(true)}
						>
							<Plus className="mr-2 h-4 w-4" />
							Create Breakout Room
						</Button>

						{/* Active Rooms */}
						<div className="space-y-3">
							<h4 className="font-medium">Active Rooms</h4>
							{breakoutRooms.length === 0 ? (
								<p className="text-sm text-muted-foreground">No breakout rooms created</p>
							) : (
								breakoutRooms.map((room) => (
									<div key={room.id} className="p-3 border rounded-lg">
										<div className="flex items-center justify-between mb-2">
											<p className="font-medium text-sm">{room.name}</p>
											<Badge variant={room.isActive ? "default" : "secondary"}>
												{room.isActive ? 'Active' : 'Inactive'}
											</Badge>
										</div>
										<p className="text-xs text-muted-foreground">
											{room.participants.length} participants
										</p>
									</div>
								))
							)}
						</div>
					</CardContent>
				</Card>

				{/* Polls */}
				<Card className="lg:col-span-1">
					<CardHeader>
						<CardTitle className="flex items-center">
							<Poll className="mr-2 h-5 w-5" />
							Live Polls
						</CardTitle>
						<CardDescription>
							Create interactive polls and surveys
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button
							className="w-full"
							onClick={() => setShowPollDialog(true)}
						>
							<Plus className="mr-2 h-4 w-4" />
							Create Poll
						</Button>

						{/* Active Polls */}
						<div className="space-y-3">
							<h4 className="font-medium">Active Polls</h4>
							{activePolls.length === 0 ? (
								<p className="text-sm text-muted-foreground">No active polls</p>
							) : (
								activePolls.map((poll) => (
									<div key={poll.id} className="p-3 border rounded-lg">
										<p className="font-medium text-sm mb-2">{poll.question}</p>
										<div className="space-y-1">
											{poll.options.map((option) => (
												<div key={option.id} className="flex items-center justify-between text-xs">
													<span>{option.text}</span>
													<Badge variant="outline">{option.votes} votes</Badge>
												</div>
											))}
										</div>
									</div>
								))
							)}
						</div>
					</CardContent>
				</Card>

				{/* Whiteboard */}
				<Card className="lg:col-span-1">
					<CardHeader>
						<CardTitle className="flex items-center">
							<Edit className="mr-2 h-5 w-5" />
							Whiteboard
						</CardTitle>
						<CardDescription>
							Collaborative drawing and notes
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button
							className="w-full"
							onClick={() => setShowWhiteboardDialog(true)}
						>
							<Plus className="mr-2 h-4 w-4" />
							Create Whiteboard
						</Button>

						<div className="p-4 border rounded-lg bg-muted/50 text-center">
							<StickyNote className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
							<p className="text-sm text-muted-foreground">
								Whiteboard integration coming soon
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Screen Share Status */}
			{screenShareSession && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<ScreenShare className="mr-2 h-5 w-5" />
							Screen Sharing Active
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
								<div>
									<p className="font-medium">
										{screenShareSession.userName} is sharing their screen
									</p>
									<p className="text-sm text-muted-foreground">
										Started {formatDistanceToNow(new Date(screenShareSession.startedAt), { addSuffix: true })}
									</p>
								</div>
							</div>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => stopScreenShareMutation.mutate(screenShareSession.id)}
							>
								<Square className="mr-2 h-4 w-4" />
								Stop Sharing
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Create Breakout Room Dialog */}
			<Dialog open={showBreakoutDialog} onOpenChange={setShowBreakoutDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center">
							<SplitSquareHorizontal className="mr-2 h-5 w-5" />
							Create Breakout Room
						</DialogTitle>
						<DialogDescription>
							Set up a breakout session for smaller group discussions
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="roomName">Room Name</Label>
							<Input
								id="roomName"
								placeholder="e.g., Discussion Group 1"
								value={newBreakoutRoom.name}
								onChange={(e) => setNewBreakoutRoom(prev => ({ ...prev, name: e.target.value }))}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="maxParticipants">Max Participants</Label>
								<Select
									value={newBreakoutRoom.maxParticipants.toString()}
									onValueChange={(value) => setNewBreakoutRoom(prev => ({ ...prev, maxParticipants: parseInt(value) }))}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="2">2 participants</SelectItem>
										<SelectItem value="3">3 participants</SelectItem>
										<SelectItem value="4">4 participants</SelectItem>
										<SelectItem value="5">5 participants</SelectItem>
										<SelectItem value="10">10 participants</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="duration">Duration (minutes)</Label>
								<Select
									value={newBreakoutRoom.duration.toString()}
									onValueChange={(value) => setNewBreakoutRoom(prev => ({ ...prev, duration: parseInt(value) }))}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="15">15 minutes</SelectItem>
										<SelectItem value="30">30 minutes</SelectItem>
										<SelectItem value="45">45 minutes</SelectItem>
										<SelectItem value="60">1 hour</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="flex gap-2">
							<Button
								className="flex-1"
								onClick={handleCreateBreakoutRoom}
								disabled={!newBreakoutRoom.name.trim() || createBreakoutRoomMutation.isPending}
							>
								{createBreakoutRoomMutation.isPending ? 'Creating...' : 'Create Room'}
							</Button>
							<Button variant="outline" className="flex-1">
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Create Poll Dialog */}
			<Dialog open={showPollDialog} onOpenChange={setShowPollDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center">
							<Poll className="mr-2 h-5 w-5" />
							Create Poll
						</DialogTitle>
						<DialogDescription>
							Create an interactive poll for meeting participants
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="pollQuestion">Question</Label>
							<Input
								id="pollQuestion"
								placeholder="What would you like to ask?"
								value={newPoll.question}
								onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
							/>
						</div>

						<div className="space-y-2">
							<Label>Options</Label>
							<div className="space-y-2">
								{newPoll.options.map((option, index) => (
									<div key={index} className="flex items-center gap-2">
										<Input
											value={option}
											onChange={(e) => {
												const newOptions = [...newPoll.options];
												newOptions[index] = e.target.value;
												setNewPoll(prev => ({ ...prev, options: newOptions }));
											}}
											placeholder={`Option ${index + 1}`}
										/>
										{newPoll.options.length > 2 && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													const newOptions = newPoll.options.filter((_, i) => i !== index);
													setNewPoll(prev => ({ ...prev, options: newOptions }));
												}}
											>
												<X className="h-4 w-4" />
											</Button>
										)}
									</div>
								))}
								{newPoll.options.length < 6 && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => setNewPoll(prev => ({ ...prev, options: [...prev.options, `Option ${prev.options.length + 1}`] }))}
									>
										<Plus className="mr-2 h-4 w-4" />
										Add Option
									</Button>
								)}
							</div>
						</div>

						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="anonymous"
									checked={newPoll.isAnonymous}
									onChange={(e) => setNewPoll(prev => ({ ...prev, isAnonymous: e.target.checked }))}
								/>
								<Label htmlFor="anonymous" className="text-sm">Anonymous voting</Label>
							</div>

							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="multiple"
									checked={newPoll.allowMultiple}
									onChange={(e) => setNewPoll(prev => ({ ...prev, allowMultiple: e.target.checked }))}
								/>
								<Label htmlFor="multiple" className="text-sm">Allow multiple answers</Label>
							</div>
						</div>

						<div className="flex gap-2">
							<Button
								className="flex-1"
								onClick={handleCreatePoll}
								disabled={!newPoll.question.trim() || newPoll.options.some(opt => !opt.trim()) || createPollMutation.isPending}
							>
								{createPollMutation.isPending ? 'Creating...' : 'Create Poll'}
							</Button>
							<Button variant="outline" className="flex-1">
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Whiteboard Dialog */}
			<Dialog open={showWhiteboardDialog} onOpenChange={setShowWhiteboardDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center">
							<Edit className="mr-2 h-5 w-5" />
							Create Whiteboard
						</DialogTitle>
						<DialogDescription>
							Start a collaborative whiteboard session
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="p-8 border-2 border-dashed border-muted rounded-lg text-center">
							<StickyNote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">
								Whiteboard integration coming soon
							</p>
							<p className="text-sm text-muted-foreground mt-2">
								Integration with tools like Miro, Mural, or native whiteboard features
							</p>
						</div>

						<div className="flex gap-2">
							<Button className="flex-1" disabled>
								Create Whiteboard (Coming Soon)
							</Button>
							<Button variant="outline" className="flex-1">
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
