/**
 * API Key Management Components
 * Reusable components for managing API keys
 */

'use client';

import { useState, useEffect, useId, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Key, Plus, Copy, RefreshCw, Trash2, Eye, EyeOff, Clock, Activity } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ApiKey {
	id: string;
	name: string;
	description: string | null;
	type: 'production' | 'development' | 'testing';
	scopes: string[];
	status: 'active' | 'inactive' | 'revoked' | 'expired';
	lastUsedAt: string | null;
	expiresAt: string | null;
	createdAt: string;
	updatedAt: string;
	keyPrefix: string;
	keySuffix: string;
	rateLimitPerMinute: number;
	rateLimitPerHour: number;
	usageCount: number;
	usageToday: number;
	usageThisMonth: number;
}

interface ApiKeyFormData {
	name: string;
	description: string;
	type: 'production' | 'development' | 'testing';
	scopes: string[];
	expiresAt?: string;
	rateLimitPerMinute: number;
	rateLimitPerHour: number;
}

export function ApiKeyManager() {
	const [keys, setKeys] = useState<ApiKey[]>([]);
	const [loading, setLoading] = useState(true);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [newKey, setNewKey] = useState<string | null>(null);
	const nameId = useId();
	const descriptionId = useId();
	const typeId = useId();
	const scopesId = useId();

	const [formData, setFormData] = useState<ApiKeyFormData>({
		name: '',
		description: '',
		type: 'production',
		scopes: ['read', 'write'],
		rateLimitPerMinute: 1000,
		rateLimitPerHour: 10000,
	});

	const loadApiKeys = useCallback(async () => {
		try {
			const response = await fetch('/api/settings/security/api-keys');
			if (response.ok) {
				const data = await response.json();
				setKeys(data.keys);
			}
		} catch (error) {
			console.error('Error loading API keys:', error);
			toast({
				title: 'Error',
				description: 'Failed to load API keys',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadApiKeys();
	}, [loadApiKeys]);

	const createApiKey = async () => {
		try {
			const response = await fetch('/api/settings/security/api-keys', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				const data = await response.json();
				setNewKey(data.apiKey);
				setCreateDialogOpen(false);
				loadApiKeys();
				toast({
					title: 'Success',
					description: 'API key created successfully',
				});
			} else {
				const error = await response.json();
				toast({
					title: 'Error',
					description: error.error || 'Failed to create API key',
					variant: 'destructive',
				});
			}
		} catch (error) {
			console.error('Error creating API key:', error);
			toast({
				title: 'Error',
				description: 'Failed to create API key',
				variant: 'destructive',
			});
		}
	};

	const regenerateApiKey = async (keyId: string) => {
		try {
			const response = await fetch(`/api/settings/security/api-keys/${keyId}/regenerate`, {
				method: 'POST',
			});

			if (response.ok) {
				const data = await response.json();
				setNewKey(data.apiKey);
				loadApiKeys();
				toast({
					title: 'Success',
					description: 'API key regenerated successfully',
				});
			} else {
				const error = await response.json();
				toast({
					title: 'Error',
					description: error.error || 'Failed to regenerate API key',
					variant: 'destructive',
				});
			}
		} catch (error) {
			console.error('Error regenerating API key:', error);
			toast({
				title: 'Error',
				description: 'Failed to regenerate API key',
				variant: 'destructive',
			});
		}
	};

	const deleteApiKey = async (keyId: string) => {
		try {
			const response = await fetch(`/api/settings/security/api-keys/${keyId}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				loadApiKeys();
				toast({
					title: 'Success',
					description: 'API key revoked successfully',
				});
			} else {
				const error = await response.json();
				toast({
					title: 'Error',
					description: error.error || 'Failed to delete API key',
					variant: 'destructive',
				});
			}
		} catch (error) {
			console.error('Error deleting API key:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete API key',
				variant: 'destructive',
			});
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast({
			title: 'Success',
			description: 'Copied to clipboard',
		});
	};

	const formatLastUsed = (dateString: string | null) => {
		if (!dateString) return 'Never';
		const date = new Date(dateString);
		const now = new Date();
		const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

		if (diffHours < 1) return 'Just now';
		if (diffHours < 24) return `${diffHours}h ago`;
		return date.toLocaleDateString();
	};

	const getStatusBadge = (status: string) => {
		const variants = {
			active: 'default',
			inactive: 'secondary',
			revoked: 'destructive',
			expired: 'outline',
		} as const;

		return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
	};

	const getTypeBadge = (type: string) => {
		const variants = {
			production: 'default',
			development: 'secondary',
			testing: 'outline',
		} as const;

		return <Badge variant={variants[type as keyof typeof variants] || 'outline'}>{type}</Badge>;
	};

	if (loading) {
		return <div className="flex justify-center p-8">Loading API keys...</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h3 className="text-lg font-medium">API Keys</h3>
					<p className="text-sm text-muted-foreground">
						Manage API keys for programmatic access to your account
					</p>
				</div>
				<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Create API Key
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Create New API Key</DialogTitle>
							<DialogDescription>
								Create a new API key for programmatic access. The full key will only be shown once.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor={nameId}>Name</Label>
								<Input
									id={nameId}
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									placeholder="My Application"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor={descriptionId}>Description</Label>
								<Textarea
									id={descriptionId}
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									placeholder="Optional description"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor={typeId}>Type</Label>
								<Select value={formData.type} onValueChange={(value: 'production' | 'development' | 'testing') => setFormData({ ...formData, type: value })}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="production">Production</SelectItem>
										<SelectItem value="development">Development</SelectItem>
										<SelectItem value="testing">Testing</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="grid gap-2">
								<Label htmlFor={scopesId}>Scopes</Label>
								<div className="flex gap-2">
									{['read', 'write', 'admin'].map((scope) => (
										<Button
											key={scope}
											type="button"
											variant={formData.scopes.includes(scope) ? 'default' : 'outline'}
											size="sm"
											onClick={() => {
												const newScopes = formData.scopes.includes(scope)
													? formData.scopes.filter(s => s !== scope)
													: [...formData.scopes, scope];
												setFormData({ ...formData, scopes: newScopes });
											}}
										>
											{scope}
										</Button>
									))}
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
								Cancel
							</Button>
							<Button type="button" onClick={createApiKey}>
								Create Key
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{newKey && (
				<Card className="border-green-200 bg-green-50">
					<CardHeader>
						<CardTitle className="text-green-800">API Key Created</CardTitle>
						<CardDescription className="text-green-600">
							Copy this key now. It will not be shown again for security reasons.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<Input value={newKey} readOnly className="font-mono text-sm" />
							<Button size="sm" onClick={() => copyToClipboard(newKey)}>
								<Copy className="h-4 w-4" />
							</Button>
						</div>
						<Button
							variant="outline"
							size="sm"
							className="mt-2"
							onClick={() => setNewKey(null)}
						>
							I have copied the key
						</Button>
					</CardContent>
				</Card>
			)}

			{keys.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-8">
						<Key className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium mb-2">No API keys yet</h3>
						<p className="text-muted-foreground mb-4">
							Create your first API key to get started with programmatic access.
						</p>
						<Button onClick={() => setCreateDialogOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Create API Key
						</Button>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>Your API Keys</CardTitle>
						<CardDescription>
							Manage and monitor your API keys
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Scopes</TableHead>
									<TableHead>Last Used</TableHead>
									<TableHead>Usage</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{keys.map((key) => (
									<TableRow key={key.id}>
										<TableCell>
											<div>
												<div className="font-medium">{key.name}</div>
												<div className="text-sm text-muted-foreground">
													{key.description || 'No description'}
												</div>
											</div>
										</TableCell>
										<TableCell>{getTypeBadge(key.type)}</TableCell>
										<TableCell>{getStatusBadge(key.status)}</TableCell>
										<TableCell>
											<div className="flex gap-1">
												{key.scopes.map((scope) => (
													<Badge key={scope} variant="outline" className="text-xs">
														{scope}
													</Badge>
												))}
											</div>
										</TableCell>
										<TableCell className="text-sm">
											{formatLastUsed(key.lastUsedAt)}
										</TableCell>
										<TableCell className="text-sm">
											<div className="text-muted-foreground">
												<div>{key.usageToday} today</div>
												<div>{key.usageThisMonth} this month</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() => copyToClipboard(`${key.keyPrefix}...${key.keySuffix}`)}
												>
													<Copy className="h-4 w-4" />
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => regenerateApiKey(key.id)}
												>
													<RefreshCw className="h-4 w-4" />
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button size="sm" variant="outline">
															<Trash2 className="h-4 w-4" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>Revoke API Key</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to revoke this API key? This action cannot be undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction onClick={() => deleteApiKey(key.id)}>
																Revoke
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
