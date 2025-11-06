/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
 Bot,
 Brain,
 Filter,
 Lightbulb,
 MessageSquare,
 Play,
 Plus,
 RefreshCw,
 Search,
 Settings,
 Shield,
 Square as Stop,
 Target,
 TrendingDown,
 TrendingUp,
 Zap,
 Send,
 Loader2,
 Download,
 X
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";

const aiFeatures = [
	{
		name: "Smart Categorization",
		description: "Automatically categorize transactions with 97% accuracy",
		status: "active",
		usage: "1,247 transactions",
		accuracy: "97.2%",
		icon: Target,
		color: "text-green-600",
	},
	{
		name: "Fraud Detection",
		description: "Real-time fraud detection and anomaly alerts",
		status: "active",
		usage: "24/7 monitoring",
		accuracy: "94.8%",
		icon: Shield,
		color: "text-red-600",
	},
	{
		name: "Cash Flow Prediction",
		description: "Predict future cash flow with ML algorithms",
		status: "active",
		usage: "30-day forecast",
		accuracy: "89.5%",
		icon: TrendingUp,
		color: "text-blue-600",
	},
	{
		name: "Expense Optimization",
		description: "AI-powered suggestions to reduce expenses",
		status: "beta",
		usage: "Monthly analysis",
		accuracy: "85.3%",
		icon: Lightbulb,
		color: "text-yellow-600",
	},
];

const recentInteractions = [
	{
		type: "categorization",
		query: "How should I categorize this $2,500 software subscription?",
		response: "Based on the transaction details, this appears to be a SaaS subscription. I've categorized it as 'Software & Technology' with high confidence (94%).",
		timestamp: "2 minutes ago",
		confidence: 94,
	},
	{
		type: "insight",
		query: "What are my biggest expense categories this month?",
		response: "Your top expense categories this month are: 1) Office Rent ($3,200), 2) Marketing ($2,800), 3) Software Subscriptions ($1,900).",
		timestamp: "15 minutes ago",
		confidence: 100,
	},
	{
		type: "recommendation",
		query: "How can I optimize my cash flow?",
		response: "Consider negotiating better payment terms with vendors, implementing automated invoicing, and setting up a cash reserve for seasonal fluctuations.",
		timestamp: "1 hour ago",
		confidence: 88,
	},
];

const aiModels = [
	{
		name: "GPT-4 Turbo",
		provider: "OpenAI",
		status: "active",
		usage: "Financial Analysis",
		cost: "$0.03/1k tokens",
	},
	{
		name: "Claude 3",
		provider: "Anthropic",
		status: "active",
		usage: "Document Processing",
		cost: "$0.008/1k tokens",
	},
	{
		name: "Gemini Pro",
		provider: "Google",
		status: "standby",
		usage: "Data Analysis",
		cost: "$0.002/1k tokens",
	},
];

interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	createdAt: string;
}

export default function AiAssistPage() {
	const router = useRouter();
	const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
	const [chatStarted, setChatStarted] = useState(false);
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [chatInput, setChatInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [selectedModel, setSelectedModel] = useState<string | null>(null);
	const [trainingData, setTrainingData] = useState({
		retrainLoading: false,
		exportLoading: false,
	});

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [chatMessages]);

	// Send chat message
	const sendMessageMutation = useMutation({
		mutationFn: async (message: string) => {
			try {
				const response = await fetch('/api/ai/chat', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ message }),
				});
				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error(errorData.message || `HTTP ${response.status}: Failed to send message`);
				}
				return response.json();
			} catch (error) {
				if (error instanceof Error) {
					throw error;
				}
				throw new Error('Network error: Failed to send message');
			}
		},
		onSuccess: (data) => {
			const userMessage: ChatMessage = {
				id: Date.now().toString(),
				role: 'user',
				content: chatInput,
				createdAt: new Date().toISOString(),
			};
			const assistantMessage: ChatMessage = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: data.response || 'I apologize, but I encountered an error processing your request.',
				createdAt: new Date().toISOString(),
			};
			setChatMessages((prev) => [...prev, userMessage, assistantMessage]);
			setChatInput("");
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to send message. Please try again.');
		},
	});

	const handleStartChat = () => {
		setChatStarted(true);
	};

	const handleSendChatMessage = () => {
		if (!chatInput.trim()) return;
		sendMessageMutation.mutate(chatInput);
	};

	const handleQuickAction = async (action: string) => {
		const actionMessages: Record<string, string> = {
			'Analyze Expenses': 'Analyze my expenses and provide insights',
			'Predict Cash Flow': 'Predict my cash flow for the next 30 days',
			'Categorize Transactions': 'Categorize my recent transactions',
			'Generate Report': 'Generate a financial report for this month',
		};
		
		const message = actionMessages[action] || action;
		setChatStarted(true);
		setChatInput(message);
		// Auto-send after a brief delay
		setTimeout(() => {
			sendMessageMutation.mutate(message);
		}, 100);
	};

	const handleConfigureModel = (modelName: string) => {
		setSelectedModel(modelName);
		setSettingsDialogOpen(true);
	};

	const handleToggleModel = async (modelName: string, currentStatus: string) => {
		try {
			const newStatus = currentStatus === 'active' ? 'standby' : 'active';
			// In a real app, this would call an API
			toast.success(`${modelName} ${newStatus === 'active' ? 'activated' : 'disabled'}`);
		} catch (error) {
			toast.error('Failed to update model status');
		}
	};

	const handleRetrainModels = async () => {
		setTrainingData((prev) => ({ ...prev, retrainLoading: true }));
		try {
			// In a real app, this would call an API
			await new Promise(resolve => setTimeout(resolve, 2000));
			toast.success('Model retraining initiated');
		} catch (error) {
			toast.error('Failed to retrain models');
		} finally {
			setTrainingData((prev) => ({ ...prev, retrainLoading: false }));
		}
	};

	const handleExportData = async () => {
		setTrainingData((prev) => ({ ...prev, exportLoading: true }));
		try {
			// In a real app, this would call an API and download a file
			await new Promise(resolve => setTimeout(resolve, 1500));
			toast.success('Training data exported successfully');
		} catch (error) {
			toast.error('Failed to export data');
		} finally {
			setTrainingData((prev) => ({ ...prev, exportLoading: false }));
		}
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
					<p className="text-muted-foreground">
						Intelligent AI assistance for financial management and business insights
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={() => setSettingsDialogOpen(true)}>
						<Settings className="h-4 w-4 mr-2" />
						AI Settings
					</Button>
					<Button onClick={() => router.push('/ai-assistant')}>
						<MessageSquare className="h-4 w-4 mr-2" />
						Start Chat
					</Button>
				</div>
			</div>

			{/* AI Features Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{aiFeatures.map((feature, index) => (
					<Card key={feature.name}>
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<feature.icon className={`h-5 w-5 ${feature.color}`} />
									<CardTitle className="text-lg">{feature.name}</CardTitle>
								</div>
								<Badge variant={
									feature.status === 'active' ? 'default' :
									feature.status === 'beta' ? 'secondary' :
									'outline'
								}>
									{feature.status}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-2">
							<p className="text-sm text-muted-foreground">{feature.description}</p>
							<div className="space-y-1">
								<div className="flex items-center justify-between text-sm">
									<span>Usage</span>
									<span className="font-medium">{feature.usage}</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span>Accuracy</span>
									<span className="font-medium text-green-600">{feature.accuracy}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* AI Assistant Interface */}
			<Tabs defaultValue="chat" className="space-y-4">
				<TabsList>
					<TabsTrigger value="chat">AI Chat</TabsTrigger>
					<TabsTrigger value="insights">Insights</TabsTrigger>
					<TabsTrigger value="models">AI Models</TabsTrigger>
					<TabsTrigger value="training">Training Data</TabsTrigger>
				</TabsList>

				<TabsContent value="chat" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Bot className="h-5 w-5" />
								AI Assistant Chat
							</CardTitle>
							<CardDescription>
								Ask questions about your finances and get intelligent insights
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{/* Chat interface */}
								<div className="h-96 border rounded-lg flex flex-col">
									{!chatStarted ? (
										<div className="flex-1 flex items-center justify-center text-muted-foreground">
											<div className="text-center space-y-2">
												<Bot className="h-12 w-12 mx-auto opacity-50" />
												<h3 className="font-medium">AI Assistant Ready</h3>
												<p className="text-sm">Ask me anything about your financial data, transactions, or business insights</p>
												<Button className="mt-4" onClick={handleStartChat}>
													<MessageSquare className="h-4 w-4 mr-2" />
													Start Conversation
												</Button>
											</div>
										</div>
									) : (
										<>
											<div className="flex-1 overflow-y-auto p-4 space-y-4">
												{chatMessages.length === 0 ? (
													<div className="flex items-center justify-center h-full text-muted-foreground">
														<p>Start a conversation by typing a message below</p>
													</div>
												) : (
													chatMessages.map((message) => (
														<div
															key={message.id}
															className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
														>
															{message.role === 'assistant' && (
																<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
																	<Bot className="h-4 w-4 text-primary-foreground" />
																</div>
															)}
															<div
																className={`rounded-lg p-3 max-w-[80%] ${
																	message.role === 'user'
																		? 'bg-primary text-primary-foreground'
																		: 'bg-muted'
																}`}
															>
																<p className="text-sm">{message.content}</p>
															</div>
															{message.role === 'user' && (
																<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
																	<span className="text-xs font-medium">U</span>
																</div>
															)}
														</div>
													))
												)}
												{sendMessageMutation.isPending && (
													<div className="flex gap-3 justify-start">
														<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
															<Bot className="h-4 w-4 text-primary-foreground" />
														</div>
														<div className="rounded-lg p-3 bg-muted">
															<Loader2 className="h-4 w-4 animate-spin" />
														</div>
													</div>
												)}
												<div ref={messagesEndRef} />
											</div>
											<div className="p-4 border-t">
												<div className="flex gap-2">
													<Input
														placeholder="Ask me anything about your finances..."
														value={chatInput}
														onChange={(e) => setChatInput(e.target.value)}
														onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
														disabled={sendMessageMutation.isPending}
													/>
													<Button
														onClick={handleSendChatMessage}
														disabled={!chatInput.trim() || sendMessageMutation.isPending}
													>
														{sendMessageMutation.isPending ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															<Send className="h-4 w-4" />
														)}
													</Button>
												</div>
											</div>
										</>
									)}
								</div>

								{/* Quick actions */}
								<div className="grid gap-2 md:grid-cols-4">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleQuickAction('Analyze Expenses')}
									>
										Analyze Expenses
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleQuickAction('Predict Cash Flow')}
									>
										Predict Cash Flow
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleQuickAction('Categorize Transactions')}
									>
										Categorize Transactions
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleQuickAction('Generate Report')}
									>
										Generate Report
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="insights" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Lightbulb className="h-5 w-5" />
								Recent AI Insights
							</CardTitle>
							<CardDescription>
								Latest insights and recommendations from AI analysis
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recentInteractions.map((interaction, index) => (
									<div key={`${interaction.type}-${interaction.timestamp}`} className="p-4 border rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<Badge variant="outline">{interaction.type}</Badge>
											<span className="text-sm text-muted-foreground">{interaction.timestamp}</span>
											<div className="ml-auto">
												<Badge variant="secondary">{interaction.confidence}% confidence</Badge>
											</div>
										</div>
										<div className="space-y-2">
											<p className="text-sm font-medium">Q: {interaction.query}</p>
											<p className="text-sm text-muted-foreground">A: {interaction.response}</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="models" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>AI Model Management</CardTitle>
							<CardDescription>
								Manage AI models and their configurations
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{aiModels.map((model, index) => (
									<div key={model.name} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{model.name}</h4>
												<Badge variant="outline">{model.provider}</Badge>
												<Badge variant={
													model.status === 'active' ? 'default' :
													model.status === 'standby' ? 'secondary' :
													'outline'
												}>
													{model.status}
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground">
												{model.usage} • {model.cost}
											</p>
										</div>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleConfigureModel(model.name)}
											>
												Configure
											</Button>
											{model.status === 'active' ? (
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleToggleModel(model.name, model.status)}
												>
													<Stop className="h-3 w-3 mr-1" />
													Disable
												</Button>
											) : (
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleToggleModel(model.name, model.status)}
												>
													<Play className="h-3 w-3 mr-1" />
													Activate
												</Button>
											)}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="training" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Brain className="h-5 w-5" />
								Training Data Management
							</CardTitle>
							<CardDescription>
								Manage training data and model performance
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-3">
									<div className="space-y-2">
										<h4 className="font-medium">Training Data</h4>
										<p className="text-2xl font-bold">24,567</p>
										<p className="text-sm text-muted-foreground">Transactions processed</p>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Model Accuracy</h4>
										<p className="text-2xl font-bold">94.2%</p>
										<p className="text-sm text-muted-foreground">Overall performance</p>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Feedback Received</h4>
										<p className="text-2xl font-bold">1,847</p>
										<p className="text-sm text-muted-foreground">User corrections</p>
									</div>
								</div>
								<Separator />
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										onClick={handleRetrainModels}
										disabled={trainingData.retrainLoading}
									>
										{trainingData.retrainLoading ? (
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										) : (
											<RefreshCw className="h-4 w-4 mr-2" />
										)}
										Retrain Models
									</Button>
									<Button
										variant="outline"
										onClick={handleExportData}
										disabled={trainingData.exportLoading}
									>
										{trainingData.exportLoading ? (
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										) : (
											<Download className="h-4 w-4 mr-2" />
										)}
										Export Data
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* AI Settings Dialog */}
			<Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>AI Settings</DialogTitle>
						<DialogDescription>
							Configure AI assistant preferences and model settings
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Default AI Model</Label>
							<select className="w-full px-3 py-2 border rounded-lg">
								<option value="gpt-4">GPT-4 Turbo</option>
								<option value="claude-3">Claude 3</option>
								<option value="gemini-pro">Gemini Pro</option>
							</select>
						</div>
						<div className="space-y-2">
							<Label>Response Length</Label>
							<select className="w-full px-3 py-2 border rounded-lg">
								<option value="short">Short</option>
								<option value="medium">Medium</option>
								<option value="long">Long</option>
							</select>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Auto-categorization</Label>
								<p className="text-sm text-muted-foreground">
									Automatically categorize transactions using AI
								</p>
							</div>
							<Switch defaultChecked />
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Smart Notifications</Label>
								<p className="text-sm text-muted-foreground">
									Receive AI-powered insights and recommendations
								</p>
							</div>
							<Switch defaultChecked />
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Data Privacy</Label>
								<p className="text-sm text-muted-foreground">
									Allow AI to analyze your financial data
								</p>
							</div>
							<Switch defaultChecked />
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={() => {
							toast.success('Settings saved');
							setSettingsDialogOpen(false);
						}}>
							Save Settings
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
