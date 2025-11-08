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
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface User {
	id: string;
	email: string;
	name: string;
}

interface Ticket {
	id: number;
	ticketNumber: string;
	subject: string;
	assignedTo?: string;
	assignee?: {
		id: string;
		name: string;
		email: string;
		clerkId: string;
	} | null;
}

interface TicketAssignmentDialogProps {
	ticket: Ticket;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUpdate: () => void;
}

export function TicketAssignmentDialog({
	ticket,
	open,
	onOpenChange,
	onUpdate,
}: TicketAssignmentDialogProps) {
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUserId, setSelectedUserId] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [fetchingUsers, setFetchingUsers] = useState(true);

	useEffect(() => {
		if (open) {
			setSelectedUserId(ticket.assignedTo || '');
			fetchUsers();
		}
	}, [open, ticket]);

	const fetchUsers = async () => {
		try {
			setFetchingUsers(true);
			const response = await fetch('/api/admin/users');
			if (!response.ok) {
				throw new Error('Failed to fetch users');
			}
			const data = await response.json();
			setUsers(data || []);
		} catch (error) {
			console.error('Error fetching users:', error);
			toast.error('Failed to load users');
		} finally {
			setFetchingUsers(false);
		}
	};

	const handleAssign = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/admin/support/tickets/${ticket.id}/assign`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					assignedTo: selectedUserId || null,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to assign ticket');
			}

			toast.success(
				selectedUserId ? 'Ticket assigned successfully' : 'Ticket unassigned successfully'
			);
			onUpdate();
			onOpenChange(false);
		} catch (error) {
			console.error('Error assigning ticket:', error);
			toast.error('Failed to assign ticket');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Assign Ticket</DialogTitle>
					<DialogDescription>
						Assign ticket {ticket.ticketNumber} to a support agent
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div>
						<Label>Ticket</Label>
						<div className="text-sm font-medium mt-1">{ticket.subject}</div>
					</div>
					<div>
						<Label htmlFor="assignee">Assign To</Label>
						<Select
							value={selectedUserId}
							onValueChange={setSelectedUserId}
							disabled={fetchingUsers}
						>
							<SelectTrigger id="assignee" className="mt-2">
								<SelectValue placeholder="Select an agent..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">Unassigned</SelectItem>
								{users.map((user) => (
									<SelectItem key={user.id} value={user.id}>
										{user.name} ({user.email})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					{ticket.assignee && (
						<div className="text-sm text-muted-foreground">
							Currently assigned to: {ticket.assignee.name}
						</div>
					)}
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
						Cancel
					</Button>
					<Button onClick={handleAssign} disabled={loading || fetchingUsers}>
						{loading ? 'Assigning...' : 'Assign'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

