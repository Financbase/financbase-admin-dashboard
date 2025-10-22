"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Shield, Settings, UserPlus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { FINANCIAL_PERMISSIONS, DEFAULT_ROLES, FinancbaseUserMetadata } from '@/types/auth';

interface UserWithPermissions extends FinancbaseUserMetadata {
	id: string;
	email: string;
	name: string;
	lastActive?: string;
}

// Client-side placeholder for updating user permissions
// In production, this should call an API endpoint
async function updateUserPermissions(userId: string, permissions: string[]): Promise<boolean> {
	try {
		// TODO: Implement API call to update user permissions
		console.log('Update permissions for user:', userId, permissions);
		return true;
	} catch (error) {
		console.error('Error updating permissions:', error);
		return false;
	}
}

export function RBACManagementDashboard() {
	const { user } = useUser();
	const [users, setUsers] = useState<UserWithPermissions[]>([]);
	const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
	const [isAdminUser, setIsAdminUser] = useState(false);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		checkAdminStatus();
		loadUsers();
	}, []);

	const checkAdminStatus = async () => {
		try {
			// Check admin status from Clerk user metadata
			const metadata = user?.publicMetadata as FinancbaseUserMetadata | undefined;
			setIsAdminUser(metadata?.role === 'admin');
		} catch (error) {
			console.error('Error checking admin status:', error);
		}
	};

	const loadUsers = async () => {
		try {
			setLoading(true);
			// In a real implementation, this would fetch from your user management API
			const response = await fetch('/api/admin/users');
			if (response.ok) {
				const userData = await response.json();
				setUsers(userData);
			}
		} catch (error) {
			console.error('Error loading users:', error);
		} finally {
			setLoading(false);
		}
	};

	const handlePermissionChange = async (userId: string, permission: string, enabled: boolean) => {
		try {
			setSaving(true);

			// Get current user permissions
			const user = users.find(u => u.id === userId);
			if (!user) return;

			let updatedPermissions = [...user.permissions];

			if (enabled) {
				if (!updatedPermissions.includes(permission)) {
					updatedPermissions.push(permission);
				}
			} else {
				updatedPermissions = updatedPermissions.filter(p => p !== permission);
			}

			// Update user permissions
			const success = await updateUserPermissions(userId, updatedPermissions);

			if (success) {
				// Update local state
				setUsers(prev => prev.map(u =>
					u.id === userId
						? { ...u, permissions: updatedPermissions }
						: u
				));
			}
		} catch (error) {
			console.error('Error updating permissions:', error);
		} finally {
			setSaving(false);
		}
	};

	const handleRoleChange = async (userId: string, newRole: FinancbaseUserMetadata['role']) => {
		try {
			setSaving(true);

			// Get default permissions for the new role
			const defaultPermissions = DEFAULT_ROLES[newRole] || [];

			const success = await updateUserPermissions(userId, defaultPermissions);

			if (success) {
				// Update local state
				setUsers(prev => prev.map(u =>
					u.id === userId
						? { ...u, role: newRole, permissions: defaultPermissions }
						: u
				));
			}
		} catch (error) {
			console.error('Error updating role:', error);
		} finally {
			setSaving(false);
		}
	};

	const getPermissionDescription = (permission: string): string => {
		const descriptions: Record<string, string> = {
			[FINANCIAL_PERMISSIONS.INVOICES_VIEW]: 'View invoices and invoice data',
			[FINANCIAL_PERMISSIONS.INVOICES_CREATE]: 'Create new invoices',
			[FINANCIAL_PERMISSIONS.INVOICES_EDIT]: 'Edit existing invoices',
			[FINANCIAL_PERMISSIONS.INVOICES_DELETE]: 'Delete invoices',
			[FINANCIAL_PERMISSIONS.EXPENSES_VIEW]: 'View expense records',
			[FINANCIAL_PERMISSIONS.EXPENSES_CREATE]: 'Create expense records',
			[FINANCIAL_PERMISSIONS.EXPENSES_EDIT]: 'Edit expense records',
			[FINANCIAL_PERMISSIONS.EXPENSES_APPROVE]: 'Approve expense requests',
			[FINANCIAL_PERMISSIONS.REPORTS_VIEW]: 'View financial reports',
			[FINANCIAL_PERMISSIONS.REPORTS_CREATE]: 'Create custom reports',
			[FINANCIAL_PERMISSIONS.REPORTS_EXPORT]: 'Export report data',
			[FINANCIAL_PERMISSIONS.REVENUE_VIEW]: 'View revenue and income data',
			[FINANCIAL_PERMISSIONS.AUDIT_LOGS_VIEW]: 'View audit logs and system activity',
			[FINANCIAL_PERMISSIONS.SETTINGS_MANAGE]: 'Manage system settings',
			[FINANCIAL_PERMISSIONS.USERS_MANAGE]: 'Manage user accounts',
			[FINANCIAL_PERMISSIONS.ROLES_MANAGE]: 'Manage user roles and permissions',
		};
		return descriptions[permission] || permission;
	};

	if (!isAdminUser) {
		return (
			<Card className="p-6">
				<CardContent className="text-center">
					<Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">Access Denied</h3>
					<p className="text-muted-foreground">
						You need administrator privileges to manage user roles and permissions.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Role & Permission Management</h2>
					<p className="text-muted-foreground">
						Manage user roles, permissions, and access control
					</p>
				</div>
				<Button>
					<UserPlus className="mr-2 h-4 w-4" />
					Add User
				</Button>
			</div>

			<Tabs defaultValue="users" className="space-y-4">
				<TabsList>
					<TabsTrigger value="users">Users</TabsTrigger>
					<TabsTrigger value="roles">Roles</TabsTrigger>
					<TabsTrigger value="permissions">Permissions</TabsTrigger>
				</TabsList>

				<TabsContent value="users" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Users className="mr-2 h-5 w-5" />
								User Management
							</CardTitle>
							<CardDescription>
								Manage user roles and permissions across your organization
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{loading ? (
									<div className="text-center py-8">
										<p className="text-muted-foreground">Loading users...</p>
									</div>
								) : (
									users.map((user) => (
										<div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
											<div className="flex items-center space-x-4">
												<div>
													<p className="font-medium">{user.name || user.email}</p>
													<p className="text-sm text-muted-foreground">{user.email}</p>
													<div className="flex items-center gap-2 mt-1">
														<Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
															{user.role}
														</Badge>
														<span className="text-xs text-muted-foreground">
															{user.permissions.length} permissions
														</span>
													</div>
												</div>
											</div>

											<div className="flex items-center space-x-2">
												<Select
													value={user.role}
													onValueChange={(value) => handleRoleChange(user.id, value as FinancbaseUserMetadata['role'])}
													disabled={saving}
												>
													<SelectTrigger className="w-32">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="viewer">Viewer</SelectItem>
														<SelectItem value="user">User</SelectItem>
														<SelectItem value="manager">Manager</SelectItem>
														<SelectItem value="admin">Admin</SelectItem>
													</SelectContent>
												</Select>

												<Dialog>
													<DialogTrigger asChild>
														<Button variant="outline" size="sm">
															<Settings className="h-4 w-4" />
														</Button>
													</DialogTrigger>
													<DialogContent className="max-w-2xl">
														<DialogHeader>
															<DialogTitle>Edit Permissions - {user.name}</DialogTitle>
															<DialogDescription>
																Configure specific permissions for this user
															</DialogDescription>
														</DialogHeader>

														<div className="grid grid-cols-2 gap-6">
															{Object.entries(FINANCIAL_PERMISSIONS).map(([key, permission]) => (
																<div key={permission} className="flex items-center justify-between">
																	<div className="flex-1">
																		<p className="text-sm font-medium">{key.replace(/_/g, ' ')}</p>
																		<p className="text-xs text-muted-foreground">
																			{getPermissionDescription(permission)}
																		</p>
																	</div>
																	<Switch
																		checked={user.permissions.includes(permission)}
																		onCheckedChange={(enabled) =>
																			handlePermissionChange(user.id, permission, enabled)
																		}
																		disabled={saving}
																	/>
																</div>
															))}
														</div>
													</DialogContent>
												</Dialog>
											</div>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="roles" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Role Definitions</CardTitle>
							<CardDescription>
								Predefined roles with their associated permissions
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{Object.entries(DEFAULT_ROLES).map(([roleName, permissions]) => (
									<div key={roleName} className="p-4 border rounded-lg">
										<div className="flex items-center justify-between mb-2">
											<h4 className="font-semibold capitalize">{roleName}</h4>
											<Badge variant={roleName === 'admin' ? 'default' : 'secondary'}>
												{permissions.length} permissions
											</Badge>
										</div>
										<div className="flex flex-wrap gap-1">
											{permissions.slice(0, 5).map((permission) => (
												<Badge key={permission} variant="outline" className="text-xs">
													{permission.split(':')[0]}
												</Badge>
											))}
											{permissions.length > 5 && (
												<Badge variant="outline" className="text-xs">
													+{permissions.length - 5} more
												</Badge>
											)}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="permissions" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Permission Reference</CardTitle>
							<CardDescription>
								Complete list of available permissions and their descriptions
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{Object.entries(FINANCIAL_PERMISSIONS).map(([key, permission]) => (
									<div key={permission} className="p-3 border rounded-lg">
										<div className="flex items-start justify-between mb-1">
											<code className="text-sm font-mono">{permission}</code>
										</div>
										<p className="text-sm text-muted-foreground">
											{getPermissionDescription(permission)}
										</p>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
