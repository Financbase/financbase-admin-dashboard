/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import { useCollaboration } from '@/contexts/collaboration-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
	Hash,
	Send,
	Plus,
	Settings,
	Users,
	Search,
	MoreVertical,
	Paperclip,
	Smile,
	Phone,
	Video,
	Info,
	Lock,
	Globe,
	AtSign,
	Pin,
	Reply,
	Edit,
	Trash2,
	Flag,
	Copy,
	ExternalLink,
	MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

interface Message {
	id: string;
	type: 'message' | 'system' | 'file' | 'image';
	content: string;
	userId: string;
	userName: string;
	userAvatar?: string;
	timestamp: string;
	channelId: string;
	replyTo?: string;
	attachments?: Array<{
		id: string;
		name: string;
		url: string;
		type: string;
		size: number;
	}>;
	reactions?: Record<string, string[]>;
	edited?: boolean;
	editedAt?: string;
}

interface Channel {
	id: string;
	name: string;
	description?: string;
	type: 'public' | 'private' | 'dm';
	members: string[];
	lastMessage?: Message;
	unreadCount?: number;
}

export function ChatInterface() {
	const {
		currentUser,
		channels,
		messages,
		activeChannelId,
		onlineUsers,
		isConnected,
		sendMessage,
		joinChannel,
		startTyping,
		stopTyping,
	} = useCollaboration();

	const [messageInput, setMessageInput] = useState('');
	const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
	const [isTyping, setIsTyping] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const typingTimeoutRef = useRef<NodeJS.Timeout>();

	useEffect(() => {
		// Auto-join first channel if available
		if (channels.length > 0 && !activeChannelId) {
			joinChannel(channels[0].id);
		}
	}, [channels, activeChannelId, joinChannel]);

	useEffect(() => {
		// Auto-scroll to bottom when new messages arrive
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSendMessage = () => {
		if (messageInput.trim() && activeChannelId) {
			sendMessage(messageInput.trim());
			setMessageInput('');

			// Stop typing indicator
			if (isTyping) {
				stopTyping();
				setIsTyping(false);
			}
		}
	};

	const handleInputChange = (value: string) => {
		setMessageInput(value);

		if (activeChannelId) {
			if (value.trim() && !isTyping) {
				startTyping();
				setIsTyping(true);
			} else if (!value.trim() && isTyping) {
				stopTyping();
				setIsTyping(false);
			}

			// Clear existing timeout
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}

			// Stop typing after 3 seconds of no input
			typingTimeoutRef.current = setTimeout(() => {
				if (isTyping) {
					stopTyping();
					setIsTyping(false);
				}
			}, 3000);
		}
	};

	const handleChannelSelect = (channel: Channel) => {
		setSelectedChannel(channel);
		joinChannel(channel.id);
	};

	const getChannelIcon = (type: Channel['type']) => {
		switch (type) {
			case 'public':
				return <Hash className="h-4 w-4" />;
			case 'private':
				return <Lock className="h-4 w-4" />;
			case 'dm':
				return <AtSign className="h-4 w-4" />;
			default:
				return <Hash className="h-4 w-4" />;
		}
	};

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
		<div className="flex h-[600px] border rounded-lg overflow-hidden">
			{/* Channels Sidebar */}
			<div className="w-64 border-r bg-muted/30">
				<div className="p-4 border-b">
					<h3 className="font-medium mb-2">Channels</h3>
					<div className="flex items-center gap-2">
						<div className={cn(
							"w-2 h-2 rounded-full",
							isConnected ? "bg-green-500" : "bg-red-500"
						)}></div>
						<span className="text-sm text-muted-foreground">
							{isConnected ? 'Connected' : 'Disconnected'}
						</span>
					</div>
				</div>

				<ScrollArea className="flex-1">
					<div className="p-2">
						{channels.map((channel) => (
							<button
								key={channel.id}
								onClick={() => handleChannelSelect(channel)}
								className={cn(
									"w-full flex items-center gap-2 p-2 rounded-lg text-left hover:bg-muted transition-colors",
									activeChannelId === channel.id && "bg-primary/10"
								)}
							>
								{getChannelIcon(channel.type)}
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">{channel.name}</p>
									{channel.description && (
										<p className="text-xs text-muted-foreground truncate">
											{channel.description}
										</p>
									)}
								</div>
								{channel.unreadCount && channel.unreadCount > 0 && (
									<Badge variant="secondary" className="text-xs">
										{channel.unreadCount}
									</Badge>
								)}
							</button>
						))}
					</div>
				</ScrollArea>

				{/* Online Users */}
				<div className="p-4 border-t">
					<h4 className="text-sm font-medium mb-3">Online ({onlineUsers.length})</h4>
					<div className="space-y-2">
						{onlineUsers.slice(0, 5).map((user) => (
							<div key={user.id} className="flex items-center gap-2">
								<div className="relative">
									<Avatar className="w-6 h-6">
										<AvatarImage src={user.avatar} />
										<AvatarFallback className="text-xs">
											{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-background rounded-full"></div>
								</div>
								<span className="text-xs truncate">{user.name}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Chat Area */}
			<div className="flex-1 flex flex-col">
				{/* Chat Header */}
				{selectedChannel && (
					<div className="p-4 border-b bg-background">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								{getChannelIcon(selectedChannel.type)}
								<div>
									<h3 className="font-medium">{selectedChannel.name}</h3>
									{selectedChannel.description && (
										<p className="text-sm text-muted-foreground">
											{selectedChannel.description}
										</p>
									)}
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button variant="ghost" size="sm">
									<Users className="h-4 w-4" />
								</Button>
								<Button variant="ghost" size="sm">
									<Settings className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* Messages */}
				<ScrollArea className="flex-1 p-4">
					<div className="space-y-4">
						{activeChannelId && messages[activeChannelId]?.map((message: Message) => (
							<MessageBubble
								key={message.id}
								message={message}
								isCurrentUser={message.userId === currentUser?.id}
								currentUser={currentUser}
							/>
						))}

						{(!activeChannelId || !messages[activeChannelId] || messages[activeChannelId]?.length === 0) && (
							<div className="flex items-center justify-center h-64">
								<div className="text-center">
									<MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">
										{activeChannelId ? 'No messages yet' : 'Select a channel to start chatting'}
									</p>
								</div>
							</div>
						)}
					</div>
					<div ref={messagesEndRef} />
				</ScrollArea>

				{/* Message Input */}
				<div className="p-4 border-t">
					<div className="flex gap-2">
						<div className="flex-1 relative">
							<Input
								value={messageInput}
								onChange={(e) => handleInputChange(e.target.value)}
								onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
								placeholder={`Message ${selectedChannel?.name || 'channel'}`}
								className="pr-12"
							/>
							<div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
								<Button variant="ghost" size="sm" className="h-6 w-6 p-0">
									<AtSign className="h-4 w-4" />
								</Button>
								<Button variant="ghost" size="sm" className="h-6 w-6 p-0">
									<Paperclip className="h-4 w-4" />
								</Button>
							</div>
						</div>
						<Button
							onClick={handleSendMessage}
							disabled={!messageInput.trim()}
							size="sm"
						>
							<Send className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

// Message Bubble Component
interface MessageBubbleProps {
	message: Message;
	isCurrentUser: boolean;
	currentUser: any;
}

function MessageBubble({ message, isCurrentUser, currentUser }: MessageBubbleProps) {
	const [showActions, setShowActions] = useState(false);

	return (
		<div className={cn(
			"group flex gap-3 hover:bg-muted/30 p-2 rounded-lg transition-colors",
			isCurrentUser && "flex-row-reverse"
		)}>
			{/* Avatar */}
			<Avatar className="w-8 h-8 flex-shrink-0">
				<AvatarImage src={message.userAvatar} />
				<AvatarFallback className="text-xs">
					{message.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
				</AvatarFallback>
			</Avatar>

			{/* Message Content */}
			<div className={cn(
				"flex-1 min-w-0",
				isCurrentUser && "text-right"
			)}>
				{/* User Info */}
				<div className={cn(
					"flex items-center gap-2 mb-1",
					isCurrentUser && "flex-row-reverse"
				)}>
					<span className="font-medium text-sm">{message.userName}</span>
					<span className="text-xs text-muted-foreground">
						{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
					</span>
					{message.edited && (
						<span className="text-xs text-muted-foreground">(edited)</span>
					)}
				</div>

				{/* Message Text */}
				<div className={cn(
					"inline-block max-w-[70%] p-3 rounded-lg text-sm",
					isCurrentUser
						? "bg-primary text-primary-foreground"
						: "bg-muted"
				)}>
					{message.content}
				</div>

				{/* Attachments */}
				{message.attachments && message.attachments.length > 0 && (
					<div className="mt-2 space-y-2">
						{message.attachments.map((attachment) => (
							<div key={attachment.id} className="flex items-center gap-2 p-2 border rounded">
								<Paperclip className="h-4 w-4 text-muted-foreground" />
								<div className="flex-1">
									<p className="text-sm font-medium">{attachment.name}</p>
									<p className="text-xs text-muted-foreground">
										{(attachment.size / 1024 / 1024).toFixed(2)} MB
									</p>
								</div>
								<Button size="sm" variant="ghost">
									<ExternalLink className="h-4 w-4" />
								</Button>
							</div>
						))}
					</div>
				)}

				{/* Reactions */}
				{message.reactions && Object.keys(message.reactions).length > 0 && (
					<div className="flex gap-1 mt-2">
						{Object.entries(message.reactions).map(([emoji, users]) => (
							<Button
								key={emoji}
								size="sm"
								variant="outline"
								className="h-6 px-2 text-xs"
							>
								{emoji} {users.length}
							</Button>
						))}
					</div>
				)}
			</div>

			{/* Message Actions */}
			<div className={cn(
				"opacity-0 group-hover:opacity-100 transition-opacity",
				isCurrentUser && "order-first"
			)}>
				<Button
					size="sm"
					variant="ghost"
					onClick={() => setShowActions(!showActions)}
				>
					<MoreVertical className="h-4 w-4" />
				</Button>

				{showActions && (
					<div className="absolute top-8 right-0 bg-popover border rounded-md shadow-lg p-1 z-10">
						<Button size="sm" variant="ghost" className="w-full justify-start">
							<Reply className="mr-2 h-3 w-3" />
							Reply
						</Button>
						<Button size="sm" variant="ghost" className="w-full justify-start">
							<Pin className="mr-2 h-3 w-3" />
							Pin
						</Button>
						<Button size="sm" variant="ghost" className="w-full justify-start">
							<Copy className="mr-2 h-3 w-3" />
							Copy
						</Button>
						<Button size="sm" variant="ghost" className="w-full justify-start">
							<Flag className="mr-2 h-3 w-3" />
							Report
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
