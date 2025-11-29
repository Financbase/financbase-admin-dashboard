/**
 * Organization Switcher Component
 * Dropdown to switch between organizations
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useOrganization } from '@/contexts/organization-context';
import { Building2, Check, ChevronDown, Plus, Settings } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface OrganizationSwitcherProps {
	className?: string;
	showCreateButton?: boolean;
}

export function OrganizationSwitcher({ className, showCreateButton = true }: OrganizationSwitcherProps) {
	const { activeOrganization, organizations, loading, switchOrganization } = useOrganization();
	const [switching, setSwitching] = useState(false);

	const handleSwitch = async (organizationId: string) => {
		if (switching || organizationId === activeOrganization?.id) return;

		try {
			setSwitching(true);
			await switchOrganization(organizationId);
		} catch (error) {
			console.error('Failed to switch organization:', error);
		} finally {
			setSwitching(false);
		}
	};

	if (loading) {
		return (
			<Button variant="outline" disabled className={className}>
				<Building2 className="mr-2 h-4 w-4" />
				Loading...
			</Button>
		);
	}

	if (organizations.length === 0) {
		return (
			<Button variant="outline" asChild className={className}>
				<Link href="/organizations/new">
					<Plus className="mr-2 h-4 w-4" />
					Create Organization
				</Link>
			</Button>
		);
	}

	const roleLabels: Record<string, string> = {
		owner: 'Owner',
		admin: 'Admin',
		member: 'Member',
		viewer: 'Viewer',
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className={cn('justify-between', className)} disabled={switching}>
					<div className="flex items-center gap-2">
						{activeOrganization?.logo ? (
							<Avatar className="h-5 w-5">
								<AvatarImage src={activeOrganization.logo} alt={activeOrganization.name} />
								<AvatarFallback>
									<Building2 className="h-3 w-3" />
								</AvatarFallback>
							</Avatar>
						) : (
							<Building2 className="h-4 w-4" />
						)}
						<span className="font-medium">{activeOrganization?.name || 'Select Organization'}</span>
						{activeOrganization?.role && (
							<Badge variant="secondary" className="text-xs">
								{roleLabels[activeOrganization.role]}
							</Badge>
						)}
					</div>
					<ChevronDown className="ml-2 h-4 w-4 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64">
				<DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<div className="max-h-64 overflow-y-auto">
					{organizations.map((org) => (
						<DropdownMenuItem
							key={org.id}
							onClick={() => handleSwitch(org.id)}
							className={cn(
								'flex items-center justify-between cursor-pointer',
								activeOrganization?.id === org.id && 'bg-accent'
							)}
						>
							<div className="flex items-center gap-2 flex-1 min-w-0">
								{org.logo ? (
									<Avatar className="h-6 w-6">
										<AvatarImage src={org.logo} alt={org.name} />
										<AvatarFallback>
											<Building2 className="h-3 w-3" />
										</AvatarFallback>
									</Avatar>
								) : (
									<div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
										<Building2 className="h-3 w-3" />
									</div>
								)}
								<div className="flex-1 min-w-0">
									<div className="font-medium truncate">{org.name}</div>
									{org.role && (
										<div className="text-xs text-muted-foreground">{roleLabels[org.role]}</div>
									)}
								</div>
							</div>
							{activeOrganization?.id === org.id && (
								<Check className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
							)}
						</DropdownMenuItem>
					))}
				</div>
				{showCreateButton && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link href="/organizations/new" className="flex items-center gap-2">
								<Plus className="h-4 w-4" />
								Create Organization
							</Link>
						</DropdownMenuItem>
					</>
				)}
				{activeOrganization && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild>
							<Link href={`/organizations/${activeOrganization.id}/settings`} className="flex items-center gap-2">
								<Settings className="h-4 w-4" />
								Organization Settings
							</Link>
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

