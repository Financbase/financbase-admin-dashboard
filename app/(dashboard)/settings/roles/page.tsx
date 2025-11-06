/**
 * Roles & Permissions Settings Page
 * Requires admin access
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Shield, Users, ArrowRight, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_ROLES, FINANCIAL_PERMISSIONS } from '@/types/auth';

function RolesSettingsClient() {
	const router = useRouter();

	// Fetch users to get role distribution
	const { data: usersData, isLoading } = useQuery({
		queryKey: ['admin-users'],
		queryFn: async () => {
			const response = await fetch('/api/admin/users');
			if (!response.ok) throw new Error('Failed to fetch users');
			const data = await response.json();
			return data.users || [];
		},
	});

	const roleCounts = usersData?.reduce((acc: Record<string, number>, user: any) => {
		const role = user.role || user.metadata?.role || 'user';
		acc[role] = (acc[role] || 0) + 1;
		return acc;
	}, {}) || {};

	const totalUsers = usersData?.length || 0;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-semibold mb-2">Roles & Permissions</h2>
					<p className="text-muted-foreground">
						Manage user roles and access permissions
					</p>
				</div>
				<Button onClick={() => router.push('/admin/rbac')}>
					<Settings className="h-4 w-4 mr-2" />
					Full Management
				</Button>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							<CardTitle>Role Management</CardTitle>
						</div>
						<Button variant="outline" size="sm" onClick={() => router.push('/admin/rbac')}>
							Manage Roles
							<ArrowRight className="h-4 w-4 ml-2" />
						</Button>
					</div>
					<CardDescription>
						Create and manage custom roles for your organization
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<p className="text-sm text-muted-foreground">Loading role information...</p>
					) : (
						<div className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								{Object.entries(DEFAULT_ROLES).map(([key, role]) => (
									<div key={key} className="p-4 border rounded-lg">
										<div className="flex items-center justify-between mb-2">
											<span className="font-medium capitalize">{key}</span>
											<Badge variant="outline">{roleCounts[key] || 0}</Badge>
										</div>
										<p className="text-sm text-muted-foreground">{role.description}</p>
									</div>
								))}
							</div>
							<div className="pt-4 border-t">
								<p className="text-sm text-muted-foreground">
									Total users: <span className="font-semibold">{totalUsers}</span>
								</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Key className="h-5 w-5" />
							<CardTitle>Permission Matrix</CardTitle>
						</div>
						<Button variant="outline" size="sm" onClick={() => router.push('/admin/rbac')}>
							Configure Permissions
							<ArrowRight className="h-4 w-4 ml-2" />
						</Button>
					</div>
					<CardDescription>
						Configure fine-grained permissions for each role
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="grid gap-2">
							{Object.entries(FINANCIAL_PERMISSIONS).slice(0, 5).map(([key, permission]) => (
								<div key={key} className="flex items-center justify-between p-2 border rounded">
									<span className="text-sm">{permission}</span>
									<Badge variant="secondary" className="text-xs">
										{key.replace('_', ' ')}
									</Badge>
								</div>
							))}
						</div>
						<p className="text-sm text-muted-foreground pt-2">
							Showing 5 of {Object.keys(FINANCIAL_PERMISSIONS).length} permissions.
							<Button variant="link" className="p-0 h-auto ml-1" onClick={() => router.push('/admin/rbac')}>
								View all
							</Button>
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							<CardTitle>Role Assignments</CardTitle>
						</div>
						<Button variant="outline" size="sm" onClick={() => router.push('/admin/rbac')}>
							Manage Assignments
							<ArrowRight className="h-4 w-4 ml-2" />
						</Button>
					</div>
					<CardDescription>
						View and manage role assignments for team members
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<p className="text-sm text-muted-foreground">Loading assignments...</p>
					) : usersData && usersData.length > 0 ? (
						<div className="space-y-2">
							{usersData.slice(0, 5).map((user: any) => (
								<div key={user.id} className="flex items-center justify-between p-2 border rounded">
									<div>
										<span className="text-sm font-medium">{user.name || user.email}</span>
										<p className="text-xs text-muted-foreground">{user.email}</p>
									</div>
									<Badge variant="outline" className="capitalize">
										{user.role || user.metadata?.role || 'user'}
									</Badge>
								</div>
							))}
							{usersData.length > 5 && (
								<p className="text-sm text-muted-foreground pt-2">
									Showing 5 of {usersData.length} users.
									<Button variant="link" className="p-0 h-auto ml-1" onClick={() => router.push('/admin/rbac')}>
										View all
									</Button>
								</p>
							)}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">No users found.</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default function RolesSettingsPage() {
	return <RolesSettingsClient />;
}

