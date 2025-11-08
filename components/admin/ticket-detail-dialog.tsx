/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Clock, User, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TicketMessage {
	id: number;
	content: string;
	messageType: 'message' | 'note' | 'system';
	isInternal: boolean;
	author?: {
		id: string;
		name: string;
		email: string;
		clerkId: string;
	} | null;
	createdAt: Date;
}

interface Ticket {
	id: number;
	ticketNumber: string;
	subject: string;
	description: string;
	priority: 'low' | 'medium' | 'high' | 'urgent';
	status: 'open' | 'in_progress' | 'resolved' | 'closed';
	category: string;
	userId: string;
	assignedTo?: string;
	user?: {
		id: string;
		name: string;
		email: string;
		clerkId: string;
	} | null;
	assignee?: {
		id: string;
		name: string;
		email: string;
		clerkId: string;
	} | null;
	messages?: TicketMessage[];
	createdAt: Date;
	updatedAt: Date;
}

interface TicketDetailDialogProps {
	ticketId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUpdate: () => void;
}

export function TicketDetailDialog({
	ticketId,
	open,
	onOpenChange,
	onUpdate,
}: TicketDetailDialogProps) {
	const [ticket, setTicket] = useState<Ticket | null>(null);
	const [loading, setLoading] = useState(true);
	const [messageContent, setMessageContent] = useState('');
	const [isInternal, setIsInternal] = useState(false);
	const [updatingStatus, setUpdatingStatus] = useState(false);
	const [updatingPriority, setUpdatingPriority] = useState(false);

	useEffect(() => {
		if (open && ticketId) {
			fetchTicket();
		}
	}, [open, ticketId]);

	const fetchTicket = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/admin/support/tickets/${ticketId}`);
			if (!response.ok) {
				throw new Error('Failed to fetch ticket');
			}
			const data = await response.json();
			setTicket(data);
		} catch (error) {
			console.error('Error fetching ticket:', error);
			toast.error('Failed to load ticket details');
		} finally {
			setLoading(false);
		}
	};

	const handleSendMessage = async () => {
		if (!messageContent.trim()) {
			toast.error('Message cannot be empty');
			return;
		}

		try {
			const response = await fetch(`/api/admin/support/tickets/${ticketId}/messages`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: messageContent,
					messageType: isInternal ? 'note' : 'message',
					isInternal,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to send message');
			}

			toast.success(isInternal ? 'Internal note added' : 'Message sent');
			setMessageContent('');
			setIsInternal(false);
			fetchTicket();
			onUpdate();
		} catch (error) {
			console.error('Error sending message:', error);
			toast.error('Failed to send message');
		}
	};

	const handleStatusUpdate = async (newStatus: string) => {
		try {
			setUpdatingStatus(true);
			const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus }),
			});

			if (!response.ok) {
				throw new Error('Failed to update status');
			}

			toast.success('Status updated');
			fetchTicket();
			onUpdate();
		} catch (error) {
			console.error('Error updating status:', error);
			toast.error('Failed to update status');
		} finally {
			setUpdatingStatus(false);
		}
	};

	const handlePriorityUpdate = async (newPriority: string) => {
		try {
			setUpdatingPriority(true);
			const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ priority: newPriority }),
			});

			if (!response.ok) {
				throw new Error('Failed to update priority');
			}

			toast.success('Priority updated');
			fetchTicket();
			onUpdate();
		} catch (error) {
			console.error('Error updating priority:', error);
			toast.error('Failed to update priority');
		} finally {
			setUpdatingPriority(false);
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'urgent':
				return 'bg-red-500/10 text-red-700 dark:text-red-400';
			case 'high':
				return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
			case 'medium':
				return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
			case 'low':
				return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
			default:
				return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'open':
				return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
			case 'in_progress':
				return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
			case 'resolved':
				return 'bg-green-500/10 text-green-700 dark:text-green-400';
			case 'closed':
				return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
			default:
				return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
		}
	};

	if (loading) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-4xl max-h-[90vh]">
					<div className="animate-pulse space-y-4">
						<div className="h-4 bg-muted rounded w-1/4" />
						<div className="h-4 bg-muted rounded" />
						<div className="h-4 bg-muted rounded" />
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	if (!ticket) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between">
						<span>Ticket {ticket.ticketNumber}</span>
						<div className="flex gap-2">
							<Badge className={getStatusColor(ticket.status)} variant="secondary">
								{ticket.status.replace('_', ' ')}
							</Badge>
							<Badge className={getPriorityColor(ticket.priority)} variant="secondary">
								{ticket.priority}
							</Badge>
						</div>
					</DialogTitle>
					<DialogDescription>{ticket.subject}</DialogDescription>
				</DialogHeader>

				<ScrollArea className="flex-1 pr-4">
					<div className="space-y-6">
						{/* Ticket Info */}
						<div className="space-y-4">
							<div>
								<h3 className="font-semibold mb-2">Ticket Information</h3>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<div className="text-muted-foreground">User</div>
										<div className="font-medium">
											{ticket.user?.name || 'Unknown'} ({ticket.user?.email || ticket.userId})
										</div>
									</div>
									<div>
										<div className="text-muted-foreground">Assigned To</div>
										<div className="font-medium">
											{ticket.assignee?.name || 'Unassigned'}
										</div>
									</div>
									<div>
										<div className="text-muted-foreground">Category</div>
										<div className="font-medium">{ticket.category}</div>
									</div>
									<div>
										<div className="text-muted-foreground">Created</div>
										<div className="font-medium">
											{format(new Date(ticket.createdAt), 'PPp')}
										</div>
									</div>
								</div>
							</div>

							<div>
								<h3 className="font-semibold mb-2">Description</h3>
								<p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
							</div>

							{/* Quick Actions */}
							<div className="flex gap-4">
								<div className="flex-1">
									<Label>Status</Label>
									<Select
										value={ticket.status}
										onValueChange={handleStatusUpdate}
										disabled={updatingStatus}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="open">Open</SelectItem>
											<SelectItem value="in_progress">In Progress</SelectItem>
											<SelectItem value="resolved">Resolved</SelectItem>
											<SelectItem value="closed">Closed</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex-1">
									<Label>Priority</Label>
									<Select
										value={ticket.priority}
										onValueChange={handlePriorityUpdate}
										disabled={updatingPriority}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="low">Low</SelectItem>
											<SelectItem value="medium">Medium</SelectItem>
											<SelectItem value="high">High</SelectItem>
											<SelectItem value="urgent">Urgent</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>

						<Separator />

						{/* Messages */}
						<div>
							<h3 className="font-semibold mb-4 flex items-center gap-2">
								<MessageSquare className="h-4 w-4" />
								Conversation
							</h3>
							<div className="space-y-4">
								{ticket.messages && ticket.messages.length > 0 ? (
									ticket.messages.map((message) => (
										<div
											key={message.id}
											className={`p-4 rounded-lg border ${
												message.isInternal
													? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900'
													: 'bg-background'
											}`}
										>
											<div className="flex items-start justify-between mb-2">
												<div className="flex items-center gap-2">
													<User className="h-4 w-4 text-muted-foreground" />
													<span className="font-medium text-sm">
														{message.author?.name || 'System'}
													</span>
													{message.isInternal && (
														<Badge variant="outline" className="text-xs">
															Internal Note
														</Badge>
													)}
												</div>
												<span className="text-xs text-muted-foreground flex items-center gap-1">
													<Clock className="h-3 w-3" />
													{format(new Date(message.createdAt), 'PPp')}
												</span>
											</div>
											<p className="text-sm whitespace-pre-wrap">{message.content}</p>
										</div>
									))
								) : (
									<p className="text-sm text-muted-foreground">No messages yet</p>
								)}
							</div>
						</div>

						<Separator />

						{/* Add Message */}
						<div>
							<h3 className="font-semibold mb-4">Add Message</h3>
							<div className="space-y-4">
								<div>
									<Label htmlFor="message">Message</Label>
									<Textarea
										id="message"
										placeholder="Type your message..."
										value={messageContent}
										onChange={(e) => setMessageContent(e.target.value)}
										rows={4}
									/>
								</div>
								<div className="flex items-center gap-4">
									<label className="flex items-center gap-2 cursor-pointer">
										<input
											type="checkbox"
											checked={isInternal}
											onChange={(e) => setIsInternal(e.target.checked)}
											className="rounded"
										/>
										<span className="text-sm">Internal note (not visible to user)</span>
									</label>
									<Button onClick={handleSendMessage} className="ml-auto">
										<Send className="h-4 w-4 mr-2" />
										Send
									</Button>
								</div>
							</div>
						</div>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}

