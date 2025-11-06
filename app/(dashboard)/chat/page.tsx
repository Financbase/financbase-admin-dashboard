/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
	FileText,
	Filter,
	Globe,
	Hash,
	Image,
	Lock,
	MessageSquare,
	MoreHorizontal,
	Paperclip,
	Phone,
	Plus,
	Search,
	Send,
	Settings,
	Smile,
	Users,
	Video,
	Loader2
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useWebSocket, WebSocketProvider } from "@/contexts/websocket-context";
import { useCurrentUser } from "@/hooks/use-current-user";

interface ChatChannel {
	id: string;
	name: string;
	description?: string;
	type: "public" | "private" | "direct";
	members?: any;
	lastMessageAt?: string;
}

interface ChatMessage {
	id: string;
	channelId: string;
	userId: string;
	message: string;
	type?: "message" | "file" | "system" | "reply";
	createdAt: string;
	readBy?: any;
	reactions?: any;
}

export default function ChatPage() {
	const { isConnected, sendMessage, lastMessage } = useWebSocket();
	const [channels, setChannels] = useState<ChatChannel[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [messageInput, setMessageInput] = useState("");
	const [loading, setLoading] = useState(true);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { data: userData } = useCurrentUser();
	const organizationId = userData?.organizationId || null;

	// Fetch channels
	const fetchChannels = async () => {
		try {
			const response = await fetch(`/api/chat/channels?organizationId=${organizationId}`);
			if (!response.ok) throw new Error("Failed to fetch channels");
			const data = await response.json();
			setChannels(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Error fetching channels:", error);
			toast.error("Failed to load channels");
		} finally {
			setLoading(false);
		}
	};

	// Fetch messages for a channel
	const fetchMessages = async (channelId: string) => {
		try {
			const response = await fetch(`/api/chat/channels/${channelId}/messages?limit=50`);
			if (!response.ok) throw new Error("Failed to fetch messages");
			const data = await response.json();
			setMessages(Array.isArray(data) ? data.reverse() : []); // Reverse to show oldest first
		} catch (error) {
			console.error("Error fetching messages:", error);
			toast.error("Failed to load messages");
		}
	};

	// Handle file attachment
	const handleFileAttachment = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// In a real app, this would upload the file and attach it to the message
		toast.info(`File "${file.name}" selected. Uploading...`);
		// Simulate upload
		setTimeout(() => {
			toast.success(`File "${file.name}" attached to message`);
		}, 1000);
		// Reset input
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	// Handle emoji picker
	const handleEmojiClick = () => {
		// Simple emoji list for now - in a real app, this would be a proper emoji picker component
		const commonEmojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰'];
		const randomEmoji = commonEmojis[Math.floor(Math.random() * commonEmojis.length)];
		setMessageInput((prev) => prev + randomEmoji);
	};

	// Send a message
	const handleSendMessage = async () => {
		if (!messageInput.trim() || !selectedChannel) return;

		try {
			const response = await fetch(`/api/chat/channels/${selectedChannel}/messages`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					organizationId,
					message: messageInput,
				}),
			});

			if (!response.ok) throw new Error("Failed to send message");
			const newMessage = await response.json();
			setMessages((prev) => [...prev, newMessage]);
			setMessageInput("");

			// Broadcast via WebSocket
			if (isConnected) {
				sendMessage("chat-message", {
					channelId: selectedChannel,
					message: newMessage,
				});
			}

			// Refresh channels to update lastMessageAt
			fetchChannels();
		} catch (error) {
			console.error("Error sending message:", error);
			toast.error("Failed to send message");
		}
	};

	// Handle WebSocket messages
	useEffect(() => {
		if (lastMessage && lastMessage.type === "chat-message") {
			const messageData = lastMessage.data;
			if (messageData.channelId === selectedChannel) {
				setMessages((prev) => {
					// Check if message already exists
					if (prev.some((m) => m.id === messageData.message.id)) {
						return prev;
					}
					return [...prev, messageData.message];
				});
			}
		}
	}, [lastMessage, selectedChannel]);

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		fetchChannels();
	}, []);

	useEffect(() => {
		if (selectedChannel) {
			fetchMessages(selectedChannel);
		}
	}, [selectedChannel]);

	// Get channel icon
	const getChannelIcon = (type: string) => {
		switch (type) {
			case "public":
				return Globe;
			case "private":
				return Lock;
			case "direct":
				return Users;
			default:
				return Hash;
		}
	};

	// Get member count
	const getMemberCount = (channel: ChatChannel) => {
		if (channel.members) {
			const members = typeof channel.members === "string" ? JSON.parse(channel.members) : channel.members;
			return Array.isArray(members) ? members.length : 0;
		}
		return 0;
	};

	const chatStats = [
		{
			name: "Active Users",
			value: "23",
			change: "+3",
			changeType: "positive" as const,
			icon: Users,
		},
		{
			name: "Messages Today",
			value: messages.length.toString(),
			change: "+18%",
			changeType: "positive" as const,
			icon: MessageSquare,
		},
		{
			name: "Channels",
			value: channels.length.toString(),
			change: "+2",
			changeType: "positive" as const,
			icon: Hash,
		},
		{
			name: "Connection",
			value: isConnected ? "Connected" : "Disconnected",
			change: isConnected ? "Online" : "Offline",
			changeType: isConnected ? ("positive" as const) : ("negative" as const),
			icon: Phone,
		},
	];

	const selectedChannelData = channels.find((c) => c.id === selectedChannel);

	return (
		<WebSocketProvider roomId={selectedChannel || "chat-main"}>
			<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Team Chat</h1>
					<p className="text-muted-foreground">
						Real-time team communication and collaboration platform
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Video className="h-4 w-4 mr-2" />
						Start Meeting
					</Button>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						New Channel
					</Button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-4">
				{chatStats.map((stat, index) => (
					<Card key={stat.name}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
							<stat.icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
								{stat.change} from yesterday
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Chat Interface */}
			<div className="grid gap-6 lg:grid-cols-4">
				{/* Channels and DMs Sidebar */}
				<div className="lg:col-span-1 space-y-6">
					{/* Channels */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-lg">Channels</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{loading ? (
								<div className="flex items-center justify-center py-4">
									<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
								</div>
							) : channels.length === 0 ? (
								<div className="text-center py-4 text-muted-foreground text-sm">
									<p>No channels yet</p>
								</div>
							) : (
								channels.map((channel) => {
									const Icon = getChannelIcon(channel.type);
									const memberCount = getMemberCount(channel);
									return (
										<div
											key={channel.id}
											className={`flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer ${
												selectedChannel === channel.id ? "bg-muted" : ""
											}`}
											onClick={() => setSelectedChannel(channel.id)}
										>
											<div className="flex items-center gap-2">
												<Icon className="h-4 w-4" />
												<div>
													<p className="text-sm font-medium">#{channel.name}</p>
													<p className="text-xs text-muted-foreground">{memberCount} members</p>
												</div>
											</div>
										</div>
									);
								})
							)}
						</CardContent>
					</Card>

					{/* Direct Messages */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-lg">Direct Messages</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{channels
								.filter((c) => c.type === "direct")
								.map((channel) => {
									const Icon = getChannelIcon(channel.type);
									return (
										<div
											key={channel.id}
											className={`flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer ${
												selectedChannel === channel.id ? "bg-muted" : ""
											}`}
											onClick={() => setSelectedChannel(channel.id)}
										>
											<div className="flex items-center gap-2">
												<Icon className="h-4 w-4" />
												<div>
													<p className="text-sm font-medium">{channel.name}</p>
													{channel.description && (
														<p className="text-xs text-muted-foreground truncate max-w-24">
															{channel.description}
														</p>
													)}
												</div>
											</div>
										</div>
									);
								})}
							{channels.filter((c) => c.type === "direct").length === 0 && (
								<div className="text-center py-4 text-muted-foreground text-sm">
									<p>No direct messages</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Main Chat Area */}
				<div className="lg:col-span-3">
					<Card className="h-[600px] flex flex-col">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									{selectedChannelData ? (
										<>
											{(() => {
												const Icon = getChannelIcon(selectedChannelData.type);
												return <Icon className="h-5 w-5" />;
											})()}
											<CardTitle>#{selectedChannelData.name}</CardTitle>
											<Badge variant="secondary">
												{getMemberCount(selectedChannelData)} members
											</Badge>
										</>
									) : (
										<>
											<Hash className="h-5 w-5" />
											<CardTitle>Select a channel</CardTitle>
										</>
									)}
								</div>
								{selectedChannel && (
									<div className="flex items-center gap-2">
										<Button variant="outline" size="sm">
											<Phone className="h-4 w-4 mr-1" />
											Call
										</Button>
										<Button variant="outline" size="sm">
											<Video className="h-4 w-4 mr-1" />
											Video
										</Button>
										<Button variant="outline" size="sm">
											<Settings className="h-4 w-4" />
										</Button>
									</div>
								)}
							</div>
						</CardHeader>
						<CardContent className="flex-1 flex flex-col">
							{/* Messages Area */}
							<div className="flex-1 space-y-4 overflow-y-auto">
								{selectedChannel ? (
									messages.length === 0 ? (
										<div className="flex items-center justify-center h-full text-muted-foreground">
											<p>No messages yet. Start the conversation!</p>
										</div>
									) : (
										<>
											{messages.map((message) => {
												const initials = message.userId.substring(0, 2).toUpperCase();
												return (
													<div key={message.id} className="flex items-start gap-3">
														<div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
															{initials}
														</div>
														<div className="flex-1 space-y-1">
															<div className="flex items-center gap-2">
																<span className="text-sm font-medium">User {message.userId.substring(0, 8)}</span>
																<span className="text-xs text-muted-foreground">
																	{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
																</span>
															</div>
															<p className="text-sm">{message.message}</p>
														</div>
													</div>
												);
											})}
											<div ref={messagesEndRef} />
										</>
									)
								) : (
									<div className="flex items-center justify-center h-full text-muted-foreground">
										<p>Select a channel to start chatting</p>
									</div>
								)}
							</div>

							{/* Message Input */}
							{selectedChannel && (
								<div className="pt-4 border-t">
									<div className="flex items-center gap-2">
										<input
											type="file"
											ref={fileInputRef}
											className="hidden"
											onChange={handleFileChange}
											accept="image/*,application/pdf,.doc,.docx"
										/>
										<Button variant="outline" size="icon" onClick={handleFileAttachment}>
											<Paperclip className="h-4 w-4" />
										</Button>
										<div className="flex-1 relative">
											<Input
												type="text"
												placeholder="Type a message..."
												value={messageInput}
												onChange={(e) => setMessageInput(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter" && !e.shiftKey) {
														e.preventDefault();
														handleSendMessage();
													}
												}}
												className="pr-12"
											/>
											<Button
												variant="ghost"
												size="icon"
												className="absolute right-1 top-1/2 -translate-y-1/2"
												onClick={handleEmojiClick}
											>
												<Smile className="h-4 w-4" />
											</Button>
										</div>
										<Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
											<Send className="h-4 w-4" />
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
					<CardDescription>
						Latest messages and activity across all channels
					</CardDescription>
				</CardHeader>
				<CardContent>
					{messages.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<p>No recent activity</p>
						</div>
					) : (
						<div className="space-y-3">
							{messages.slice(-10).map((message) => {
								const channel = channels.find((c) => c.id === message.channelId);
								const initials = message.userId.substring(0, 2).toUpperCase();
								return (
									<div key={message.id} className="flex items-center justify-between p-3 rounded-lg border">
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
												{initials}
											</div>
											<div>
												<p className="text-sm font-medium">User {message.userId.substring(0, 8)}</p>
												<p className="text-sm text-muted-foreground truncate max-w-md">{message.message}</p>
											</div>
											{channel && <Badge variant="outline">#{channel.name}</Badge>}
										</div>
										<div className="text-right">
											<p className="text-xs text-muted-foreground">
												{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
											</p>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
		</WebSocketProvider>
	);
}
