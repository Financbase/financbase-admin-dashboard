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
	ExternalLink
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
	// Temporarily disabled due to TypeScript compilation issues
	// TODO: Fix collaboration context and imports
	return (
		<div className="flex items-center justify-center h-96">
			<p className="text-muted-foreground">Collaboration features are currently disabled</p>
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
