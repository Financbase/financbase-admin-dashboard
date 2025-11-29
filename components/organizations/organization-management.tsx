/**
 * Organization Management Dashboard
 * List all user's organizations with create, settings, and member management
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useOrganization } from '@/contexts/organization-context';
import { Building2, Plus, Settings, Users, ArrowRight, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function OrganizationManagement() {
	const { organizations, loading, activeOrganization, switchOrganization } = useOrganization();
	const [switching, setSwitching] = useState<string | null>(null);

	const handleSwitch = async (organizationId: string) => {
		if (switching || organizationId === activeOrganization?.id) return;

		try {
			setSwitching(organizationId);
			await switchOrganization(organizationId);
		} catch (error) {
			console.error('Failed to switch organization:', error);
		} finally {
			setSwitching(null);
		}
	};

	const roleLabels: Record<string, string> = {
		owner: 'Owner',
		admin: 'Admin',
		member: 'Member',
		viewer: 'Viewer',
	};

	if (loading) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold">Organizations</h1>
				</div>
				<div className="text-muted-foreground">Loading organizations...</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Organizations</h1>
					<p className="text-muted-foreground mt-1">
						Manage your businesses and switch between them
					</p>
				</div>
				<Button asChild>
					<Link href="/organizations/new">
						<Plus className="mr-2 h-4 w-4" />
						Create Organization
					</Link>
				</Button>
			</div>

			{organizations.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Building2 className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
						<p className="text-muted-foreground text-center mb-4">
							Create your first organization to get started managing your business
						</p>
						<Button asChild>
							<Link href="/organizations/new">
								<Plus className="mr-2 h-4 w-4" />
								Create Organization
							</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{organizations.map((org) => (
						<Card
							key={org.id}
							className={activeOrganization?.id === org.id ? 'ring-2 ring-primary' : ''}
						>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-3">
										{org.logo ? (
											<Avatar className="h-10 w-10">
												<AvatarImage src={org.logo} alt={org.name} />
												<AvatarFallback>
													<Building2 className="h-5 w-5" />
												</AvatarFallback>
											</Avatar>
										) : (
											<div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
												<Building2 className="h-5 w-5" />
											</div>
										)}
										<div className="flex-1 min-w-0">
											<CardTitle className="truncate">{org.name}</CardTitle>
											{org.description && (
												<CardDescription className="truncate mt-1">
													{org.description}
												</CardDescription>
											)}
										</div>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem asChild>
												<Link href={`/organizations/${org.id}/settings`}>
													<Settings className="mr-2 h-4 w-4" />
													Settings
												</Link>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Your Role</span>
										<Badge variant="secondary">
											{org.role ? roleLabels[org.role] : 'Member'}
										</Badge>
									</div>
									{org.memberCount !== undefined && (
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">Members</span>
											<div className="flex items-center gap-1">
												<Users className="h-4 w-4" />
												<span>{org.memberCount}</span>
											</div>
										</div>
									)}
									<div className="flex gap-2 pt-2">
										{activeOrganization?.id !== org.id ? (
											<Button
												variant="outline"
												className="flex-1"
												onClick={() => handleSwitch(org.id)}
												disabled={switching === org.id}
											>
												{switching === org.id ? 'Switching...' : 'Switch to'}
												<ArrowRight className="ml-2 h-4 w-4" />
											</Button>
										) : (
											<Button variant="outline" className="flex-1" disabled>
												Current Organization
											</Button>
										)}
										<Button variant="outline" size="icon" asChild>
											<Link href={`/organizations/${org.id}/settings`}>
												<Settings className="h-4 w-4" />
											</Link>
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

