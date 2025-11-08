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
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreVertical, Eye, UserPlus, MessageSquare, RefreshCw, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { TicketDetailDialog } from './ticket-detail-dialog';
import { TicketAssignmentDialog } from './ticket-assignment-dialog';

interface SupportTicket {
	id: number;
	ticketNumber: string;
	subject: string;
	description: string;
	priority: 'low' | 'medium' | 'high' | 'urgent';
	status: 'open' | 'in_progress' | 'resolved' | 'closed';
	category: string;
	userId: string;
	organizationId?: string;
	assignedTo?: string;
	assignedAt?: Date | null;
	createdAt: Date;
	updatedAt: Date;
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
}

export function SupportTicketsAdminTable() {
	const [tickets, setTickets] = useState<SupportTicket[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
	const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
	const [assignmentTicket, setAssignmentTicket] = useState<SupportTicket | null>(null);

	// Filters
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [priorityFilter, setPriorityFilter] = useState<string>('all');
	const [categoryFilter, setCategoryFilter] = useState<string>('all');
	const [assignedToFilter, setAssignedToFilter] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState('');

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [limit] = useState(20);

	// Sorting
	const [sortBy, setSortBy] = useState('createdAt');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

	useEffect(() => {
		fetchTickets();
	}, [currentPage, statusFilter, priorityFilter, categoryFilter, assignedToFilter, sortBy, sortOrder]);

	const fetchTickets = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams({
				limit: limit.toString(),
				offset: ((currentPage - 1) * limit).toString(),
				sortBy,
				sortOrder,
			});

			if (statusFilter !== 'all') params.append('status', statusFilter);
			if (priorityFilter !== 'all') params.append('priority', priorityFilter);
			if (categoryFilter !== 'all') params.append('category', categoryFilter);
			if (assignedToFilter !== 'all') params.append('assignedTo', assignedToFilter);

			const response = await fetch(`/api/admin/support/tickets?${params.toString()}`);
			if (!response.ok) {
				throw new Error('Failed to fetch tickets');
			}

			const data = await response.json();
			setTickets(data.tickets || []);

			// Estimate total pages (in a real app, you'd get this from the API)
			setTotalPages(Math.ceil((data.tickets?.length || 0) / limit) || 1);
		} catch (error) {
			console.error('Error fetching tickets:', error);
			toast.error('Failed to load support tickets');
		} finally {
			setLoading(false);
		}
	};

	const handleStatusUpdate = async (ticketId: number, newStatus: string) => {
		try {
			const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus }),
			});

			if (!response.ok) {
				throw new Error('Failed to update status');
			}

			toast.success('Ticket status updated');
			fetchTickets();
		} catch (error) {
			console.error('Error updating status:', error);
			toast.error('Failed to update ticket status');
		}
	};

	const handlePriorityUpdate = async (ticketId: number, newPriority: string) => {
		try {
			const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ priority: newPriority }),
			});

			if (!response.ok) {
				throw new Error('Failed to update priority');
			}

			toast.success('Ticket priority updated');
			fetchTickets();
		} catch (error) {
			console.error('Error updating priority:', error);
			toast.error('Failed to update ticket priority');
		}
	};

	const handleViewTicket = (ticket: SupportTicket) => {
		setSelectedTicket(ticket);
		setIsDetailDialogOpen(true);
	};

	const handleAssignTicket = (ticket: SupportTicket) => {
		setAssignmentTicket(ticket);
		setIsAssignmentDialogOpen(true);
	};

	const handleSort = (field: string) => {
		if (sortBy === field) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(field);
			setSortOrder('desc');
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

	const filteredTickets = tickets.filter((ticket) => {
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			return (
				ticket.ticketNumber.toLowerCase().includes(query) ||
				ticket.subject.toLowerCase().includes(query) ||
				ticket.user?.email?.toLowerCase().includes(query)
			);
		}
		return true;
	});

	if (loading) {
		return (
			<div className="border rounded-lg p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-4 bg-muted rounded w-1/4" />
					<div className="space-y-2">
						<div className="h-4 bg-muted rounded" />
						<div className="h-4 bg-muted rounded" />
						<div className="h-4 bg-muted rounded" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="border rounded-lg">
				{/* Filters */}
				<div className="p-4 border-b space-y-4">
					<div className="flex flex-wrap gap-4 items-center">
						<div className="relative flex-1 min-w-[200px]">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search tickets..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="open">Open</SelectItem>
								<SelectItem value="in_progress">In Progress</SelectItem>
								<SelectItem value="resolved">Resolved</SelectItem>
								<SelectItem value="closed">Closed</SelectItem>
							</SelectContent>
						</Select>
						<Select value={priorityFilter} onValueChange={setPriorityFilter}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Priority" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Priority</SelectItem>
								<SelectItem value="urgent">Urgent</SelectItem>
								<SelectItem value="high">High</SelectItem>
								<SelectItem value="medium">Medium</SelectItem>
								<SelectItem value="low">Low</SelectItem>
							</SelectContent>
						</Select>
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								<SelectItem value="technical">Technical</SelectItem>
								<SelectItem value="billing">Billing</SelectItem>
								<SelectItem value="feature_request">Feature Request</SelectItem>
								<SelectItem value="bug_report">Bug Report</SelectItem>
								<SelectItem value="general">General</SelectItem>
							</SelectContent>
						</Select>
						<Button
							variant="outline"
							size="icon"
							onClick={fetchTickets}
							title="Refresh"
						>
							<RefreshCw className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Table */}
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead
									className="cursor-pointer hover:bg-muted"
									onClick={() => handleSort('ticketNumber')}
								>
									Ticket #
									{sortBy === 'ticketNumber' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
								</TableHead>
								<TableHead
									className="cursor-pointer hover:bg-muted"
									onClick={() => handleSort('subject')}
								>
									Subject
									{sortBy === 'subject' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
								</TableHead>
								<TableHead>User</TableHead>
								<TableHead
									className="cursor-pointer hover:bg-muted"
									onClick={() => handleSort('status')}
								>
									Status
									{sortBy === 'status' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
								</TableHead>
								<TableHead
									className="cursor-pointer hover:bg-muted"
									onClick={() => handleSort('priority')}
								>
									Priority
									{sortBy === 'priority' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
								</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>Assigned To</TableHead>
								<TableHead
									className="cursor-pointer hover:bg-muted"
									onClick={() => handleSort('createdAt')}
								>
									Created
									{sortBy === 'createdAt' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
								</TableHead>
								<TableHead className="w-[50px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredTickets.length === 0 ? (
								<TableRow>
									<TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
										No tickets found
									</TableCell>
								</TableRow>
							) : (
								filteredTickets.map((ticket) => (
									<TableRow key={ticket.id}>
										<TableCell className="font-mono text-sm">
											{ticket.ticketNumber}
										</TableCell>
										<TableCell className="max-w-[300px] truncate">
											{ticket.subject}
										</TableCell>
										<TableCell>
											<div className="text-sm">
												<div className="font-medium">{ticket.user?.name || 'Unknown'}</div>
												<div className="text-muted-foreground text-xs">
													{ticket.user?.email || ticket.userId}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge className={getStatusColor(ticket.status)} variant="secondary">
												{ticket.status.replace('_', ' ')}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge className={getPriorityColor(ticket.priority)} variant="secondary">
												{ticket.priority}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge variant="outline">{ticket.category}</Badge>
										</TableCell>
										<TableCell>
											{ticket.assignee ? (
												<div className="text-sm">
													<div className="font-medium">{ticket.assignee.name}</div>
													<div className="text-muted-foreground text-xs">
														{ticket.assignee.email}
													</div>
												</div>
											) : (
												<span className="text-muted-foreground text-sm">Unassigned</span>
											)}
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{new Date(ticket.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onClick={() => handleViewTicket(ticket)}>
														<Eye className="h-4 w-4 mr-2" />
														View Details
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleAssignTicket(ticket)}>
														<UserPlus className="h-4 w-4 mr-2" />
														Assign
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleStatusUpdate(ticket.id, 'in_progress')}
														disabled={ticket.status === 'in_progress'}
													>
														Mark In Progress
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleStatusUpdate(ticket.id, 'resolved')}
														disabled={ticket.status === 'resolved'}
													>
														Mark Resolved
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleStatusUpdate(ticket.id, 'closed')}
														disabled={ticket.status === 'closed'}
													>
														Close Ticket
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between p-4 border-t">
						<div className="text-sm text-muted-foreground">
							Page {currentPage} of {totalPages}
						</div>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
								disabled={currentPage <= 1}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
								disabled={currentPage >= totalPages}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Detail Dialog */}
			{selectedTicket && (
				<TicketDetailDialog
					ticketId={selectedTicket.id}
					open={isDetailDialogOpen}
					onOpenChange={setIsDetailDialogOpen}
					onUpdate={fetchTickets}
				/>
			)}

			{/* Assignment Dialog */}
			{assignmentTicket && (
				<TicketAssignmentDialog
					ticket={assignmentTicket}
					open={isAssignmentDialogOpen}
					onOpenChange={setIsAssignmentDialogOpen}
					onUpdate={fetchTickets}
				/>
			)}
		</>
	);
}

