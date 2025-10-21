"use client";

/**
 * Financbase GPT Chat Interface
 * AI-powered financial assistant with real-time context
 */

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
	Bot, 
	User, 
	Send, 
	Loader2, 
	TrendingUp, 
	DollarSign, 
	FileText,
	Sparkles,
	RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface FinancbaseGPTChatProps {
	className?: string;
	showHeader?: boolean;
	showQuickActions?: boolean;
	placeholder?: string;
	maxHeight?: string;
}

export function FinancbaseGPTChat({
	className,
	showHeader = true,
	showQuickActions = true,
	placeholder = "Ask about your finances...",
	maxHeight = "600px",
}: FinancbaseGPTChatProps) {
	const { messages, input, handleInputChange, handleSubmit, isLoading, reload, stop } = useChat({
		api: '/api/ai/financbase-gpt',
		initialMessages: [
			{
				id: 'welcome',
				role: 'assistant',
				content: 'Hello! I\'m Financbase GPT, your AI financial assistant. I can help you analyze expenses, forecast revenue, review invoices, and provide financial insights. What would you like to know?',
			},
		],
	});

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	// Auto-focus textarea
	useEffect(() => {
		textareaRef.current?.focus();
	}, []);

	const handleQuickAction = (prompt: string) => {
		handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLTextAreaElement>);
		// Auto-submit
		setTimeout(() => {
			const form = new FormEvent('submit', { cancelable: true, bubbles: true });
			handleSubmit(form as unknown as React.FormEvent<HTMLFormElement>);
		}, 100);
	};

	const quickActions = [
		{
			label: 'Analyze Expenses',
			prompt: 'Analyze my expenses from the last 30 days and identify any unusual spending patterns or opportunities to save.',
			icon: TrendingUp,
			color: 'text-blue-500',
		},
		{
			label: 'Revenue Forecast',
			prompt: 'Generate a revenue forecast for the next quarter based on my current data and trends.',
			icon: DollarSign,
			color: 'text-green-500',
		},
		{
			label: 'Invoice Summary',
			prompt: 'Summarize my outstanding invoices and highlight any that are overdue or approaching due dates.',
			icon: FileText,
			color: 'text-orange-500',
		},
		{
			label: 'Financial Health',
			prompt: 'Provide an overview of my current financial health, including cash flow, profitability, and key metrics.',
			icon: Sparkles,
			color: 'text-purple-500',
		},
	];

	return (
		<Card className={cn('flex flex-col', className)} style={{ height: maxHeight }}>
			{showHeader && (
				<CardHeader className="border-b">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
								<Bot className="h-5 w-5 text-primary" />
							</div>
							<div>
								<CardTitle className="text-lg">Financbase GPT</CardTitle>
								<CardDescription>AI-powered financial assistant</CardDescription>
							</div>
						</div>
						<Badge variant="secondary" className="gap-1">
							<Sparkles className="h-3 w-3" />
							Powered by GPT-4
						</Badge>
					</div>
				</CardHeader>
			)}

			{/* Messages */}
			<CardContent className="flex-1 p-0">
				<ScrollArea className="h-full">
					<div className="p-4 space-y-4">
						{messages.map((message, index) => (
							<ChatMessage
								key={message.id || index}
								message={message}
								isLatest={index === messages.length - 1}
							/>
						))}
						{isLoading && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Thinking...</span>
							</div>
						)}
						<div ref={messagesEndRef} />
					</div>
				</ScrollArea>
			</CardContent>

			{/* Input */}
			<div className="border-t p-4 space-y-3">
				{showQuickActions && messages.length <= 2 && (
					<>
						<div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
							<Sparkles className="h-3 w-3" />
							<span>Quick Actions</span>
						</div>
						<div className="grid grid-cols-2 gap-2 mb-3">
							{quickActions.map((action) => (
								<Button
									key={action.label}
									variant="outline"
									size="sm"
									className="justify-start text-left h-auto py-2 px-3"
									onClick={() => handleQuickAction(action.prompt)}
									disabled={isLoading}
								>
									<action.icon className={cn('h-4 w-4 mr-2 flex-shrink-0', action.color)} />
									<span className="text-xs">{action.label}</span>
								</Button>
							))}
						</div>
						<Separator />
					</>
				)}

				<form onSubmit={handleSubmit} className="space-y-2">
					<div className="flex gap-2">
						<Textarea
							ref={textareaRef}
							value={input}
							onChange={handleInputChange}
							placeholder={placeholder}
							rows={2}
							className="flex-1 resize-none"
							disabled={isLoading}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && !e.shiftKey) {
									e.preventDefault();
									handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
								}
							}}
						/>
						<div className="flex flex-col gap-2">
							{isLoading ? (
								<Button
									type="button"
									size="icon"
									variant="outline"
									onClick={stop}
								>
									<RefreshCw className="h-4 w-4" />
								</Button>
							) : (
								<Button
									type="submit"
									size="icon"
									disabled={!input.trim() || isLoading}
								>
									<Send className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>
					<p className="text-xs text-muted-foreground">
						Press Enter to send, Shift+Enter for new line
					</p>
				</form>
			</div>
		</Card>
	);
}

interface ChatMessageProps {
	message: {
		id: string;
		role: 'user' | 'assistant' | 'system';
		content: string;
		createdAt?: Date;
	};
	isLatest?: boolean;
}

function ChatMessage({ message, isLatest }: ChatMessageProps) {
	const isAssistant = message.role === 'assistant';
	const isSystem = message.role === 'system';

	if (isSystem) {
		return (
			<div className="flex items-center justify-center">
				<Badge variant="secondary" className="text-xs">
					{message.content}
				</Badge>
			</div>
		);
	}

	return (
		<div
			className={cn(
				'flex gap-3 group',
				!isAssistant && 'flex-row-reverse'
			)}
		>
			{/* Avatar */}
			<div
				className={cn(
					'flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0',
					isAssistant ? 'bg-primary/10' : 'bg-accent'
				)}
			>
				{isAssistant ? (
					<Bot className="h-4 w-4 text-primary" />
				) : (
					<User className="h-4 w-4" />
				)}
			</div>

			{/* Message Content */}
			<div
				className={cn(
					'flex-1 space-y-1',
					!isAssistant && 'flex flex-col items-end'
				)}
			>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<span className="font-medium">
						{isAssistant ? 'Financbase GPT' : 'You'}
					</span>
					{message.createdAt && (
						<span>
							{formatDistanceToNow(new Date(message.createdAt), {
								addSuffix: true,
							})}
						</span>
					)}
				</div>

				<div
					className={cn(
						'rounded-lg px-4 py-3 prose prose-sm max-w-none',
						isAssistant
							? 'bg-muted'
							: 'bg-primary text-primary-foreground'
					)}
				>
					<MessageContent content={message.content} />
				</div>
			</div>
		</div>
	);
}

function MessageContent({ content }: { content: string }) {
	// Simple markdown-like formatting
	const formattedContent = content
		.split('\n')
		.map((line, index) => {
			// Bold text **text**
			line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
			
			// Italic text *text*
			line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
			
			// Code `code`
			line = line.replace(/`(.*?)`/g, '<code class="bg-accent px-1 rounded">$1</code>');

			return <p key={index} dangerouslySetInnerHTML={{ __html: line }} />;
		});

	return <>{formattedContent}</>;
}

