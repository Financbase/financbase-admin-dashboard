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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
	Send, 
	Bot, 
	User, 
	MessageSquare, 
	Sparkles, 
	TrendingUp,
	AlertCircle,
	CheckCircle,
	Lightbulb,
	Loader2,
	Plus,
	Trash2
} from "lucide-react";
import { toast } from "@/lib/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ChatMessage {
	id: string;
	conversationId: string;
	role: 'user' | 'assistant';
	content: string;
	metadata?: {
		suggestions?: string[];
		relatedData?: {
			invoices?: Array<{ id: string; amount: number; status: string }>;
			expenses?: Array<{ id: string; amount: number; category: string }>;
			clients?: Array<{ id: string; name: string; status: string }>;
		};
		confidence?: number;
	};
	createdAt: string;
}

interface Conversation {
	id: string;
	userId: string;
	title: string;
	lastMessageAt: string;
	messageCount: number;
	createdAt: string;
}

export default function AIAssistantPage() {
	const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
	const [inputMessage, setInputMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const queryClient = useQueryClient();

	// Fetch conversations
	const { data: conversationsData, isLoading: conversationsLoading, error: conversationsError } = useQuery({
		queryKey: ['ai-conversations'],
		queryFn: async () => {
			try {
				const response = await fetch('/api/ai/chat/conversations');
				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch conversations`);
				}
				return response.json();
			} catch (error) {
				if (error instanceof Error) {
					throw error;
				}
				throw new Error('Network error: Failed to fetch conversations');
			}
		},
		retry: 1,
	});

	// Fetch messages for selected conversation
	const { data: messagesData, isLoading: messagesLoading, error: messagesError } = useQuery({
		queryKey: ['ai-messages', selectedConversation],
		queryFn: async () => {
			if (!selectedConversation) return { messages: [] };
			try {
				const response = await fetch(`/api/ai/chat/conversations/${selectedConversation}`);
				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch messages`);
				}
				return response.json();
			} catch (error) {
				if (error instanceof Error) {
					throw error;
				}
				throw new Error('Network error: Failed to fetch messages');
			}
		},
		enabled: !!selectedConversation,
		retry: 1,
	});

	// Fetch conversation suggestions
	const { data: suggestionsData, error: suggestionsError } = useQuery({
		queryKey: ['ai-suggestions'],
		queryFn: async () => {
			try {
				const response = await fetch('/api/ai/chat/suggestions');
				if (!response.ok) {
					// Suggestions are optional, so we don't throw on error
					return { suggestions: [] };
				}
				return response.json();
			} catch (error) {
				// Return empty suggestions on error
				return { suggestions: [] };
			}
		},
		retry: 1,
	});

	// Send message mutation
	const sendMessageMutation = useMutation({
		mutationFn: async (message: string) => {
			try {
				if (!selectedConversation) {
					// Create new conversation
					const convResponse = await fetch('/api/ai/chat/conversations', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ title: message.slice(0, 50) }),
					});
					if (!convResponse.ok) {
						const errorData = await convResponse.json().catch(() => ({}));
						throw new Error(errorData.message || 'Failed to create conversation');
					}
					const { conversation } = await convResponse.json();
					setSelectedConversation(conversation.id);
					
					// Send message to new conversation
					const response = await fetch('/api/ai/chat/messages', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							conversationId: conversation.id,
							message,
						}),
					});
					if (!response.ok) {
						const errorData = await response.json().catch(() => ({}));
						throw new Error(errorData.message || 'Failed to send message');
					}
					return response.json();
				} else {
					// Send message to existing conversation
					const response = await fetch('/api/ai/chat/messages', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							conversationId: selectedConversation,
							message,
						}),
					});
					if (!response.ok) {
						const errorData = await response.json().catch(() => ({}));
						throw new Error(errorData.message || 'Failed to send message');
					}
					return response.json();
				}
			} catch (error) {
				if (error instanceof Error) {
					throw error;
				}
				throw new Error('Network error: Failed to send message');
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['ai-messages', selectedConversation] });
			queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
			setInputMessage("");
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to send message. Please try again.');
		},
	});

	const conversations: Conversation[] = conversationsData?.conversations || [];
	const messages: ChatMessage[] = messagesData?.messages || [];
	const suggestions: string[] = suggestionsData?.suggestions || [];

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSendMessage = async () => {
		if (!inputMessage.trim() || isLoading) return;
		
		setIsLoading(true);
		try {
			await sendMessageMutation.mutateAsync(inputMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSuggestionClick = (suggestion: string) => {
		setInputMessage(suggestion);
	};

	const handleNewConversation = () => {
		setSelectedConversation(null);
		setInputMessage("");
	};

	return (
		<div className="flex h-[calc(100vh-4rem)]">
			{/* Sidebar - Conversations */}
			<div className="w-80 border-r bg-muted/30 flex flex-col">
				<div className="p-4 border-b">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold">Conversations</h2>
						<Button size="sm" onClick={handleNewConversation}>
							<Plus className="h-4 w-4" />
						</Button>
					</div>
					{conversationsLoading ? (
						<div className="flex items-center justify-center py-4">
							<Loader2 className="h-4 w-4 animate-spin" />
				</div>
					) : conversations.length === 0 ? (
						<div className="text-center text-muted-foreground py-4">
							No conversations yet. Start a new chat!
				</div>
					) : (
							<div className="space-y-2">
							{conversations.map((conversation) => (
								<div
									key={conversation.id}
									className={`p-3 rounded-lg cursor-pointer transition-colors ${
										selectedConversation === conversation.id
											? 'bg-primary text-primary-foreground'
											: 'hover:bg-muted'
									}`}
									onClick={() => setSelectedConversation(conversation.id)}
								>
									<div className="font-medium text-sm truncate">
										{conversation.title}
									</div>
									<div className="text-xs opacity-70">
										{conversation.messageCount} messages
							</div>
						</div>
					))}
				</div>
					)}
			</div>

				{/* Suggestions */}
				{suggestions.length > 0 && (
					<div className="p-4 border-b">
						<h3 className="text-sm font-medium mb-3">Quick Questions</h3>
						<div className="space-y-2">
							{suggestions.slice(0, 4).map((suggestion, index) => (
						<Button
							key={index}
							variant="outline"
									size="sm"
									className="w-full justify-start text-left h-auto py-2"
									onClick={() => handleSuggestionClick(suggestion)}
						>
									<MessageSquare className="mr-2 h-3 w-3 shrink-0" />
									<span className="text-xs truncate">{suggestion}</span>
						</Button>
					))}
				</div>
					</div>
				)}
				{/* Error Display */}
				{(conversationsError || messagesError) && (
					<div className="p-4 border-b">
						<div className="bg-destructive/10 border border-destructive text-destructive px-3 py-2 rounded text-sm">
							<AlertCircle className="h-4 w-4 inline mr-2" />
							{conversationsError?.message || messagesError?.message || 'Failed to load data'}
						</div>
					</div>
				)}
			</div>

			{/* Main Chat Area */}
			<div className="flex-1 flex flex-col">
				{/* Header */}
				<div className="p-4 border-b bg-muted/30">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
						<Bot className="h-4 w-4 text-blue-600" />
					</div>
					<div>
							<h1 className="font-semibold">AI Financial Assistant</h1>
							<p className="text-sm text-muted-foreground">
								Ask me anything about your finances
							</p>
						</div>
					</div>
				</div>

				{/* Messages */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{!selectedConversation ? (
						<div className="flex items-center justify-center h-full">
							<div className="text-center">
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mx-auto mb-4">
									<Bot className="h-8 w-8 text-blue-600" />
								</div>
								<h3 className="text-lg font-semibold mb-2">Start a New Conversation</h3>
								<p className="text-muted-foreground mb-6">
									Ask me anything about your finances, get insights, and receive personalized recommendations.
								</p>
								<div className="space-y-2">
									{suggestions.slice(0, 3).map((suggestion, index) => (
										<Button
											key={index}
											variant="outline"
											className="w-full justify-start"
											onClick={() => handleSuggestionClick(suggestion)}
										>
											<MessageSquare className="mr-2 h-4 w-4" />
											{suggestion}
										</Button>
									))}
								</div>
							</div>
						</div>
					) : messagesLoading ? (
						<div className="flex items-center justify-center h-full">
							<Loader2 className="h-6 w-6 animate-spin" />
						</div>
					) : messages.length === 0 ? (
						<div className="flex items-center justify-center h-full">
							<div className="text-center">
								<Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<p className="text-muted-foreground">Start the conversation!</p>
							</div>
						</div>
					) : (
						messages.map((message) => (
							<div
								key={message.id}
								className={`flex gap-3 ${
									message.role === 'user' ? 'justify-end' : 'justify-start'
								}`}
							>
								{message.role === 'assistant' && (
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
										<Bot className="h-4 w-4 text-blue-600" />
									</div>
								)}
								<div
									className={`max-w-[80%] rounded-lg p-3 ${
										message.role === 'user'
											? 'bg-primary text-primary-foreground'
											: 'bg-muted'
									}`}
								>
									<div className="whitespace-pre-wrap">{message.content}</div>
									{message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
										<div className="mt-3 space-y-1">
											{message.metadata.suggestions.map((suggestion, index) => (
												<Button
													key={index}
													variant="ghost"
													size="sm"
													className="h-auto py-1 px-2 text-xs"
													onClick={() => handleSuggestionClick(suggestion)}
												>
													{suggestion}
												</Button>
											))}
										</div>
									)}
									{message.metadata?.confidence && (
										<div className="mt-2 text-xs opacity-70">
											Confidence: {message.metadata.confidence}%
										</div>
									)}
								</div>
								{message.role === 'user' && (
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
										<User className="h-4 w-4 text-primary-foreground" />
									</div>
								)}
							</div>
						))
					)}
					<div ref={messagesEndRef} />
				</div>

				{/* Input */}
				<div className="p-4 border-t">
					<div className="flex gap-2">
						<Input
							placeholder="Ask me anything about your finances..."
							value={inputMessage}
							onChange={(e) => setInputMessage(e.target.value)}
							onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
							disabled={isLoading}
						/>
						<Button 
							onClick={handleSendMessage}
							disabled={!inputMessage.trim() || isLoading}
						>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Send className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}