/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
	RefreshCw,
	Brain,
	Info,
	Lightbulb,
	Target,
	BarChart3,
	ExternalLink,
	AlertTriangle,
	TrendingDown,
	MessageSquare,
	Calendar,
	Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { logger } from '@/lib/logger';

interface Message {
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: string;
	confidence?: number;
	analysis?: {
		insights: Array<{
			type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
			title: string;
			description: string;
			confidence: number;
			impact: 'low' | 'medium' | 'high';
		}>;
		recommendations: Array<{
			category: 'cost_saving' | 'revenue_growth' | 'efficiency' | 'risk_mitigation';
			title: string;
			description: string;
			priority: 'low' | 'medium' | 'high';
			effort: 'low' | 'medium' | 'high';
			impact: 'low' | 'medium' | 'high';
		}>;
		actions: Array<{
			type: 'navigate' | 'create' | 'update' | 'analyze';
			title: string;
			description: string;
			url?: string;
			priority: 'low' | 'medium' | 'high';
		}>;
		questions: string[];
	};
	metadata?: {
		processingTime: number;
		model: string;
		tokens: {
			input: number;
			output: number;
		};
	};
}

interface FinancbaseGPTChatProps {
	userId?: string;
	className?: string;
	showHeader?: boolean;
	showQuickActions?: boolean;
	placeholder?: string;
	maxHeight?: string;
	compact?: boolean;
}

const QUICK_QUESTIONS = [
	"How's my cash flow looking?",
	"Show me expense trends this month",
	"What's my profit margin?",
	"Are there any overdue invoices?",
	"Suggest ways to improve my budget",
	"What are my top expense categories?",
	"How can I increase revenue?",
	"Analyze my financial health",
];

export function FinancbaseGPTChat({
	userId = 'default_user',
	className,
	showHeader = true,
	showQuickActions = true,
	placeholder = "Ask about your finances...",
	maxHeight = "600px",
	compact = false,
}: FinancbaseGPTChatProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	// Auto-resize textarea
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [input]);

	// Welcome message
	useEffect(() => {
		if (messages.length === 0) {
			const welcomeMessage: Message = {
				role: 'assistant',
				content: `Hello! I'm Financbase GPT, your AI financial assistant. I can help you analyze your finances, track expenses, manage invoices, and provide personalized financial insights.

Based on your current financial data:
- **Revenue**: $45,000 (growing 12.5% monthly)
- **Expenses**: $32,000 (marketing is over budget)
- **Cash Flow**: $13,000 positive
- **Outstanding Invoices**: 8 (2 overdue)
- **Profit Margin**: 28.9%

What would you like to know about your finances?`,
				timestamp: new Date().toISOString(),
				confidence: 0.95,
			};
			setMessages([welcomeMessage]);
		}
	}, []);

	const sendMessageMutation = useMutation({
		mutationFn: async (query: string) => {
			// Send message to the enhanced API
			const response = await fetch('/api/ai/financbase-gpt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messages: [
						...messages.map(msg => ({
							role: msg.role,
							content: msg.content,
						})),
						{
							role: 'user',
							content: query,
						},
					],
					analysisType: detectAnalysisType(query),
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to get GPT response');
			}

			return await response.json();
		},
		onSuccess: (response) => {
			const newMessage: Message = {
				role: 'assistant',
				content: response.response,
				timestamp: new Date().toISOString(),
				confidence: response.confidence,
				analysis: response.analysis,
				metadata: response.metadata,
			};

			setMessages(prev => [...prev, newMessage]);
			setIsTyping(false);
		},
		onError: (error) => {
			logger.error('GPT Error', { error });
			const errorMessage: Message = {
				role: 'assistant',
				content: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
				timestamp: new Date().toISOString(),
			};
			setMessages(prev => [...prev, errorMessage]);
			setIsTyping(false);
		},
	});

	const handleSendMessage = async (message?: string) => {
		const query = message || input.trim();
		if (!query) return;

		const userMessage: Message = {
			role: 'user',
			content: query,
			timestamp: new Date().toISOString(),
		};

		setMessages(prev => [...prev, userMessage]);
		setInput('');
		setIsTyping(true);

		sendMessageMutation.mutate(query);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const detectAnalysisType = (query: string): 'general' | 'invoice' | 'expense' | 'report' | 'forecast' | 'budget' => {
		const lowerQuery = query.toLowerCase();
		if (lowerQuery.includes('invoice')) return 'invoice';
		if (lowerQuery.includes('expense') || lowerQuery.includes('cost')) return 'expense';
		if (lowerQuery.includes('report') || lowerQuery.includes('analysis')) return 'report';
		if (lowerQuery.includes('forecast') || lowerQuery.includes('future') || lowerQuery.includes('predict')) return 'forecast';
		if (lowerQuery.includes('budget')) return 'budget';
		return 'general';
	};

	const getInsightIcon = (type: string) => {
		switch (type) {
			case 'trend':
				return <TrendingUp className="h-4 w-4" />;
			case 'anomaly':
				return <AlertTriangle className="h-4 w-4" />;
			case 'opportunity':
				return <Lightbulb className="h-4 w-4" />;
			case 'risk':
				return <TrendingDown className="h-4 w-4" />;
			default:
				return <Info className="h-4 w-4" />;
		}
	};

	const getInsightColor = (type: string) => {
		switch (type) {
			case 'trend':
				return 'bg-blue-50 border-blue-200 text-blue-800';
			case 'anomaly':
				return 'bg-yellow-50 border-yellow-200 text-yellow-800';
			case 'opportunity':
				return 'bg-green-50 border-green-200 text-green-800';
			case 'risk':
				return 'bg-red-50 border-red-200 text-red-800';
			default:
				return 'bg-gray-50 border-gray-200 text-gray-800';
		}
	};

	const getRecommendationIcon = (category: string) => {
		switch (category) {
			case 'cost_saving':
				return <DollarSign className="h-4 w-4" />;
			case 'revenue_growth':
				return <TrendingUp className="h-4 w-4" />;
			case 'efficiency':
				return <Target className="h-4 w-4" />;
			case 'risk_mitigation':
				return <AlertTriangle className="h-4 w-4" />;
			default:
				return <Lightbulb className="h-4 w-4" />;
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'high':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'medium':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'low':
				return 'bg-green-100 text-green-800 border-green-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	return (
		<Card className={cn("flex flex-col", className)} style={{ maxHeight }}>
			{showHeader && (
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center">
						<Brain className="mr-2 h-5 w-5 text-primary" />
						Financbase GPT
					</CardTitle>
					<CardDescription>
						AI-powered financial assistant with real-time insights
					</CardDescription>
				</CardHeader>
			)}

			<CardContent className="flex-1 flex flex-col p-0">
				{/* Messages Area */}
				<ScrollArea className="flex-1 p-4">
					<div className="space-y-6">
						{messages.map((message, index) => (
							<div key={index} className="space-y-4">
								<div className={cn(
									"flex items-start gap-4",
									message.role === 'user' ? "justify-end" : "justify-start"
								)}>
									<div className={cn(
										"flex items-start gap-3 max-w-[80%]",
										message.role === 'user' ? "flex-row-reverse" : "flex-row"
									)}>
										<div className={cn(
											"w-10 h-10 rounded-full flex items-center justify-center",
											message.role === 'user'
												? "bg-primary text-primary-foreground"
												: "bg-muted"
										)}>
											{message.role === 'user' ? (
												<User className="h-5 w-5" />
											) : (
												<Bot className="h-5 w-5" />
											)}
										</div>

										<div className="space-y-3">
											<div className={cn(
												"rounded-lg px-4 py-3",
												message.role === 'user'
													? "bg-primary text-primary-foreground"
													: "bg-muted"
											)}>
												<p className="text-sm leading-relaxed">{message.content}</p>

												{message.confidence && message.role === 'assistant' && (
													<div className="flex items-center gap-2 mt-2 text-xs opacity-70">
														<BarChart3 className="h-3 w-3" />
														<span>{Math.round(message.confidence * 100)}% confidence</span>
													</div>
												)}
											</div>

											<div className="text-xs text-muted-foreground">
												{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
											</div>
										</div>
									</div>
								</div>

								{/* Analysis Display */}
								{message.analysis && message.role === 'assistant' && (
									<div className="ml-14 space-y-4">
										{/* Insights */}
										{message.analysis.insights.length > 0 && (
											<div className="space-y-3">
												<div className="flex items-center gap-2">
													<Info className="h-4 w-4 text-blue-600" />
													<p className="text-sm font-medium">Key Insights</p>
												</div>
												<div className="grid gap-3">
													{message.analysis.insights.map((insight, idx) => (
														<div key={idx} className={cn(
															"flex items-start gap-3 p-3 rounded-lg border",
															getInsightColor(insight.type)
														)}>
															{getInsightIcon(insight.type)}
															<div className="flex-1">
																<p className="font-medium text-sm">{insight.title}</p>
																<p className="text-sm text-muted-foreground mt-1">
																	{insight.description}
																</p>
															</div>
															<div className="flex flex-col gap-1">
																<Badge variant="outline" className="text-xs">
																	{insight.impact} impact
																</Badge>
																<span className="text-xs text-muted-foreground">
																	{Math.round(insight.confidence * 100)}% confidence
																</span>
															</div>
														</div>
													))}
												</div>
											</div>
										)}

										{/* Recommendations */}
										{message.analysis.recommendations.length > 0 && (
											<div className="space-y-3">
												<div className="flex items-center gap-2">
													<Lightbulb className="h-4 w-4 text-yellow-600" />
													<p className="text-sm font-medium">Recommendations</p>
												</div>
												<div className="grid gap-3">
													{message.analysis.recommendations.map((rec, idx) => (
														<div key={idx} className="p-3 border rounded-lg">
															<div className="flex items-start gap-3">
																{getRecommendationIcon(rec.category)}
																<div className="flex-1">
																	<div className="flex items-center gap-2 mb-1">
																		<p className="font-medium text-sm">{rec.title}</p>
																		<Badge className={cn("text-xs", getPriorityColor(rec.priority))}>
																			{rec.priority}
																		</Badge>
																	</div>
																	<p className="text-sm text-muted-foreground mb-2">
																		{rec.description}
																	</p>
																	<div className="flex gap-2">
																		<Badge variant="outline" className="text-xs">
																			{rec.effort} effort
																		</Badge>
																		<Badge variant="outline" className="text-xs">
																			{rec.impact} impact
																		</Badge>
																	</div>
																</div>
															</div>
														</div>
													))}
												</div>
											</div>
										)}

										{/* Actions */}
										{message.analysis.actions.length > 0 && (
											<div className="space-y-3">
												<div className="flex items-center gap-2">
													<Target className="h-4 w-4 text-green-600" />
													<p className="text-sm font-medium">Suggested Actions</p>
												</div>
												<div className="grid gap-2">
													{message.analysis.actions.map((action, idx) => (
														<Button
															key={idx}
															variant="outline"
															className="justify-start"
															asChild={!!action.url}
														>
															{action.url ? (
																<a href={action.url} className="flex items-center gap-2">
																	{action.title}
																	<ExternalLink className="h-3 w-3" />
																</a>
															) : (
																<span>{action.title}</span>
															)}
														</Button>
													))}
												</div>
											</div>
										)}

										{/* Follow-up Questions */}
										{message.analysis.questions.length > 0 && (
											<div className="space-y-3">
												<div className="flex items-center gap-2">
													<MessageSquare className="h-4 w-4 text-purple-600" />
													<p className="text-sm font-medium">Follow-up Questions</p>
												</div>
												<div className="flex flex-wrap gap-2">
													{message.analysis.questions.map((question, idx) => (
														<Button
															key={idx}
															variant="outline"
															size="sm"
															onClick={() => handleSendMessage(question)}
															disabled={isTyping}
														>
															{question}
														</Button>
													))}
												</div>
											</div>
										)}

										{/* Metadata */}
										{message.metadata && (
											<div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-2">
												<span>Model: {message.metadata.model}</span>
												<span>{message.metadata.processingTime}ms</span>
												<span>{message.metadata.tokens.input + message.metadata.tokens.output} tokens</span>
											</div>
										)}
									</div>
								)}
							</div>
						))}

						{isTyping && (
							<div className="flex items-start gap-4">
								<div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
									<Bot className="h-5 w-5" />
								</div>
								<div className="bg-muted rounded-lg px-4 py-3">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
										<div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
										<div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
										<span className="text-sm text-muted-foreground ml-2">Financbase GPT is thinking...</span>
									</div>
								</div>
							</div>
						)}

						<div ref={messagesEndRef} />
					</div>
				</ScrollArea>

				{/* Input Area */}
				<div className="border-t p-4">
					<div className="flex gap-3">
						<div className="flex-1">
							<Textarea
								ref={textareaRef}
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder={placeholder}
								disabled={isTyping}
								className="min-h-[44px] max-h-32 resize-none"
								rows={1}
							/>
						</div>
						<Button
							onClick={() => handleSendMessage()}
							disabled={!input.trim() || isTyping}
							size="icon"
							className="self-end"
						>
							<Send className="h-4 w-4" />
						</Button>
					</div>

					{/* Quick Actions */}
					{showQuickActions && (
						<div className="flex flex-wrap gap-2 mt-3">
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleSendMessage("How's my cash flow?")}
								disabled={isTyping}
							>
								<DollarSign className="mr-1 h-3 w-3" />
								Cash Flow
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleSendMessage("Show me expense trends")}
								disabled={isTyping}
							>
								<TrendingUp className="mr-1 h-3 w-3" />
								Expenses
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleSendMessage("What's my profit margin?")}
								disabled={isTyping}
							>
								<BarChart3 className="mr-1 h-3 w-3" />
								Profit
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleSendMessage("Any overdue invoices?")}
								disabled={isTyping}
							>
								<Clock className="mr-1 h-3 w-3" />
								Overdue
							</Button>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

