/**
 * Organization Members Management Component
 * List members with roles, invite new members, manage member roles, remove members
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Users, UserPlus, MoreVertical, Mail, Trash2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Member {
	id: string;
	role: 'owner' | 'admin' | 'member' | 'viewer';
	joinedAt: string;
	user: {
		id: string;
		email: string;
		firstName?: string | null;
		lastName?: string | null;
	};
}

interface OrganizationMembersProps {
	organizationId: string;
	currentUserRole?: 'owner' | 'admin' | 'member' | 'viewer';
}

export function OrganizationMembers({ organizationId, currentUserRole }: OrganizationMembersProps) {
	const [members, setMembers] = useState<Member[]>([]);
	const [loading, setLoading] = useState(true);
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState('');
	const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
	const [inviteMessage, setInviteMessage] = useState('');
	const [inviting, setInviting] = useState(false);
	const { toast } = useToast();

	const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin';

	useEffect(() => {
		fetchMembers();
	}, [organizationId]);

	const fetchMembers = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/organizations/${organizationId}/members`);
			if (!response.ok) throw new Error('Failed to fetch members');
			const data = await response.json();
			if (data.success) {
				setMembers(data.data || []);
			}
		} catch (error) {
			console.error('Error fetching members:', error);
			toast({
				title: 'Error',
				description: 'Failed to load members',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleInvite = async () => {
		if (!inviteEmail || !inviteEmail.includes('@')) {
			toast({
				title: 'Invalid email',
				description: 'Please enter a valid email address',
				variant: 'destructive',
			});
			return;
		}

		try {
			setInviting(true);
			const response = await fetch(`/api/organizations/${organizationId}/invitations`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: inviteEmail,
					role: inviteRole,
					message: inviteMessage || undefined,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to send invitation');
			}

			toast({
				title: 'Invitation sent',
				description: `Invitation sent to ${inviteEmail}`,
			});

			setInviteDialogOpen(false);
			setInviteEmail('');
			setInviteRole('member');
			setInviteMessage('');
		} catch (error) {
			toast({
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to send invitation',
				variant: 'destructive',
			});
		} finally {
			setInviting(false);
		}
	};

	const handleUpdateRole = async (memberId: string, newRole: 'owner' | 'admin' | 'member' | 'viewer') => {
		try {
			const response = await fetch(
				`/api/organizations/${organizationId}/members/${memberId}/role`,
				{
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ role: newRole }),
				}
			);

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to update role');
			}

			toast({
				title: 'Role updated',
				description: 'Member role has been updated',
			});

			fetchMembers();
		} catch (error) {
			toast({
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to update role',
				variant: 'destructive',
			});
		}
	};

	const handleRemoveMember = async (memberId: string) => {
		if (!confirm('Are you sure you want to remove this member?')) return;

		try {
			const response = await fetch(
				`/api/organizations/${organizationId}/members/${memberId}/role`,
				{
					method: 'DELETE',
				}
			);

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to remove member');
			}

			toast({
				title: 'Member removed',
				description: 'Member has been removed from the organization',
			});

			fetchMembers();
		} catch (error) {
			toast({
				title: 'Error',
				description: error instanceof Error ? error.message : 'Failed to remove member',
				variant: 'destructive',
			});
		}
	};

	const roleLabels: Record<string, string> = {
		owner: 'Owner',
		admin: 'Admin',
		member: 'Member',
		viewer: 'Viewer',
	};

	const getInitials = (firstName?: string | null, lastName?: string | null, email?: string) => {
		if (firstName && lastName) {
			return `${firstName[0]}${lastName[0]}`.toUpperCase();
		}
		if (firstName) {
			return firstName[0].toUpperCase();
		}
		if (email) {
			return email[0].toUpperCase();
		}
		return '?';
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Members
						</CardTitle>
						<CardDescription>
							Manage organization members and their roles
						</CardDescription>
					</div>
					{canManageMembers && (
						<Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
							<DialogTrigger asChild>
								<Button>
									<UserPlus className="mr-2 h-4 w-4" />
									Invite Member
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Invite Member</DialogTitle>
									<DialogDescription>
										Send an invitation to join this organization
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4">
									<div>
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											placeholder="user@example.com"
											value={inviteEmail}
											onChange={(e) => setInviteEmail(e.target.value)}
										/>
									</div>
									<div>
										<Label htmlFor="role">Role</Label>
										<Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="admin">Admin</SelectItem>
												<SelectItem value="member">Member</SelectItem>
												<SelectItem value="viewer">Viewer</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor="message">Message (Optional)</Label>
										<Textarea
											id="message"
											placeholder="Add a personal message to the invitation..."
											value={inviteMessage}
											onChange={(e) => setInviteMessage(e.target.value)}
											rows={3}
										/>
									</div>
								</div>
								<DialogFooter>
									<Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
										Cancel
									</Button>
									<Button onClick={handleInvite} disabled={inviting}>
										{inviting ? 'Sending...' : 'Send Invitation'}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="text-center py-8 text-muted-foreground">Loading members...</div>
				) : members.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">No members yet</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Member</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Joined</TableHead>
								{canManageMembers && <TableHead className="w-[50px]"></TableHead>}
							</TableRow>
						</TableHeader>
						<TableBody>
							{members.map((member) => (
								<TableRow key={member.id}>
									<TableCell>
										<div className="flex items-center gap-3">
											<Avatar>
												<AvatarFallback>
													{getInitials(member.user.firstName, member.user.lastName, member.user.email)}
												</AvatarFallback>
											</Avatar>
											<div>
												<div className="font-medium">
													{member.user.firstName && member.user.lastName
														? `${member.user.firstName} ${member.user.lastName}`
														: member.user.email}
												</div>
												<div className="text-sm text-muted-foreground">{member.user.email}</div>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
											{roleLabels[member.role]}
										</Badge>
									</TableCell>
									<TableCell>
										{new Date(member.joinedAt).toLocaleDateString()}
									</TableCell>
									{canManageMembers && (
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													{member.role !== 'owner' && (
														<>
															{member.role !== 'admin' && (
																<DropdownMenuItem
																	onClick={() => handleUpdateRole(member.id, 'admin')}
																>
																	<Shield className="mr-2 h-4 w-4" />
																	Make Admin
																</DropdownMenuItem>
															)}
															{member.role !== 'member' && (
																<DropdownMenuItem
																	onClick={() => handleUpdateRole(member.id, 'member')}
																>
																	Make Member
																</DropdownMenuItem>
															)}
															{member.role !== 'viewer' && (
																<DropdownMenuItem
																	onClick={() => handleUpdateRole(member.id, 'viewer')}
																>
																	Make Viewer
																</DropdownMenuItem>
															)}
															<DropdownMenuItem
																onClick={() => handleRemoveMember(member.id)}
																className="text-destructive"
															>
																<Trash2 className="mr-2 h-4 w-4" />
																Remove
															</DropdownMenuItem>
														</>
													)}
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									)}
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}

