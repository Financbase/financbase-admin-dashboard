"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Plus,
	Key,
	Activity,
	BarChart3,
	Code,
	Download,
	Copy,
	Trash2,
	RefreshCw,
	Shield,
	Zap,
	Clock,
	AlertTriangle,
	BookOpen,
	Terminal,
	Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface APIKey {
	id: string;
	name: string;
	key: string;
	permissions: string[];
	status: 'active' | 'inactive' | 'revoked';
	createdAt: string;
	lastUsed?: string;
	usageCount: number;
	monthlyUsage: number;
	monthlyLimit: number;
}

interface APIUsage {
	date: string;
	requests: number;
	errors: number;
	avgResponseTime: number;
}

const SAMPLE_API_KEYS: APIKey[] = [
	{
		id: '1',
		name: 'Production API Key',
		key: 'fb_prod_1234567890abcdef1234567890abcdef',
		permissions: ['read:accounts', 'write:transactions', 'read:invoices'],
		status: 'active',
		createdAt: '2024-10-15T10:30:00Z',
		lastUsed: '2024-11-15T14:22:00Z',
		usageCount: 15420,
		monthlyUsage: 15420,
		monthlyLimit: 100000,
	},
	{
		id: '2',
		name: 'Development API Key',
		key: 'fb_dev_0987654321fedcba0987654321fedcba',
		permissions: ['read:accounts', 'write:transactions'],
		status: 'active',
		createdAt: '2024-10-20T09:15:00Z',
		lastUsed: '2024-11-15T13:45:00Z',
		usageCount: 2340,
		monthlyUsage: 2340,
		monthlyLimit: 10000,
	},
	{
		id: '3',
		name: 'Analytics API Key',
		key: 'fb_analytics_abcdef1234567890abcdef1234567890',
		permissions: ['read:analytics', 'read:reports'],
		status: 'inactive',
		createdAt: '2024-11-01T11:00:00Z',
		usageCount: 0,
		monthlyUsage: 0,
		monthlyLimit: 50000,
	},
];

const SAMPLE_USAGE_DATA: APIUsage[] = [
	{ date: '2024-11-15', requests: 1240, errors: 12, avgResponseTime: 245 },
	{ date: '2024-11-14', requests: 980, errors: 8, avgResponseTime: 210 },
	{ date: '2024-11-13', requests: 1100, errors: 15, avgResponseTime: 280 },
	{ date: '2024-11-12', requests: 890, errors: 6, avgResponseTime: 195 },
	{ date: '2024-11-11', requests: 1050, errors: 10, avgResponseTime: 220 },
];

export function DeveloperPortal() {
	const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showSDKDialog, setShowSDKDialog] = useState(false);
	const [showDocsDialog, setShowDocsDialog] = useState(false);

	const queryClient = useQueryClient();

	// Fetch API keys
	const { data: apiKeys = SAMPLE_API_KEYS } = useQuery({
		queryKey: ['api-keys'],
		queryFn: async () => {
			try {
				const response = await fetch('/api/developer/api-keys');
				if (!response.ok) {
					throw new Error(`Failed to fetch API keys: ${response.statusText}`);
				}
				return response.json();
			} catch (error) {
				console.error('Error fetching API keys:', error);
				return SAMPLE_API_KEYS;
			}
		},
	});

	// Fetch usage data
	const { data: usageData = SAMPLE_USAGE_DATA } = useQuery({
		queryKey: ['api-usage'],
		queryFn: async () => {
			try {
				const response = await fetch('/api/developer/usage');
				if (!response.ok) {
					throw new Error(`Failed to fetch usage data: ${response.statusText}`);
				}
				return response.json();
			} catch (error) {
				console.error('Error fetching usage data:', error);
				return SAMPLE_USAGE_DATA;
			}
		},
	});

	// Create API key mutation
	const createApiKeyMutation = useMutation({
		mutationFn: async (data: { name: string; permissions: string[]; monthlyLimit: number }) => {
			const response = await fetch('/api/developer/api-keys', {
				method: 'POST',
				body: JSON.stringify(data),
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['api-keys']);
			setShowCreateDialog(false);
		},
	});

	// Delete API key mutation
	const deleteApiKeyMutation = useMutation({
		mutationFn: async (keyId: string) => {
			const response = await fetch(`/api/developer/api-keys/${keyId}`, {
				method: 'DELETE',
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['api-keys']);
		},
	});

	// Revoke API key mutation
	const revokeApiKeyMutation = useMutation({
		mutationFn: async (keyId: string) => {
			const response = await fetch(`/api/developer/api-keys/${keyId}/revoke`, {
				method: 'POST',
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['api-keys']);
		},
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'inactive':
				return 'bg-gray-100 text-gray-800 border-gray-200';
			case 'revoked':
				return 'bg-red-100 text-red-800 border-red-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getUsagePercentage = (usage: number, limit: number) => {
		return Math.min((usage / limit) * 100, 100);
	};

	const getUsageColor = (percentage: number) => {
		if (percentage >= 90) return 'bg-red-500';
		if (percentage >= 70) return 'bg-yellow-500';
		return 'bg-green-500';
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Developer Portal</h2>
					<p className="text-muted-foreground">
						Manage your API keys, monitor usage, and access developer resources
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={() => queryClient.invalidateQueries(['api-usage'])}>
						<RefreshCw className="mr-2 h-4 w-4" />
						Refresh
					</Button>
					<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Create API Key
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>Create API Key</DialogTitle>
								<DialogDescription>
									Generate a new API key for your application
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="name">Key Name</Label>
									<Input
										id="name"
										placeholder="e.g., Production API Key"
									/>
								</div>

								<div className="space-y-2">
									<Label>Permissions</Label>
									<div className="grid grid-cols-2 gap-2">
										{[
											{ value: 'read:accounts', label: 'Read Accounts' },
											{ value: 'write:accounts', label: 'Write Accounts' },
											{ value: 'read:transactions', label: 'Read Transactions' },
											{ value: 'write:transactions', label: 'Write Transactions' },
											{ value: 'read:invoices', label: 'Read Invoices' },
											{ value: 'write:invoices', label: 'Write Invoices' },
											{ value: 'read:analytics', label: 'Read Analytics' },
											{ value: 'read:reports', label: 'Read Reports' },
											{ value: 'webhooks', label: 'Manage Webhooks' },
											{ value: 'integrations', label: 'Manage Integrations' },
										].map((permission) => (
											<div key={permission.value} className="flex items-center space-x-2">
												<input type="checkbox" id={permission.value} className="rounded" />
												<Label htmlFor={permission.value} className="text-sm">
													{permission.label}
												</Label>
											</div>
										))}
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="limit">Monthly Request Limit</Label>
									<Select>
										<SelectTrigger>
											<SelectValue placeholder="Select limit" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="1000">1,000 requests</SelectItem>
											<SelectItem value="10000">10,000 requests</SelectItem>
											<SelectItem value="50000">50,000 requests</SelectItem>
											<SelectItem value="100000">100,000 requests</SelectItem>
											<SelectItem value="1000000">1,000,000 requests</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="flex gap-2">
									<Button
										className="flex-1"
										onClick={() => createApiKeyMutation.mutate({
											name: 'New API Key',
											permissions: ['read:accounts', 'write:transactions'],
											monthlyLimit: 10000
										})}
										disabled={createApiKeyMutation.isPending}
									>
										{createApiKeyMutation.isPending ? 'Creating...' : 'Create Key'}
									</Button>
									<Button variant="outline" className="flex-1">
										Cancel
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Key className="h-4 w-4 text-blue-600" />
							<div>
								<p className="text-sm text-muted-foreground">Active API Keys</p>
								<p className="text-xl font-bold">{apiKeys.filter(k => k.status === 'active').length}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Activity className="h-4 w-4 text-green-600" />
							<div>
								<p className="text-sm text-muted-foreground">Requests Today</p>
								<p className="text-xl font-bold">
									{usageData.reduce((sum, day) => sum + day.requests, 0)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<BarChart3 className="h-4 w-4 text-purple-600" />
							<div>
								<p className="text-sm text-muted-foreground">Success Rate</p>
								<p className="text-xl font-bold">
									{Math.round((usageData.reduce((sum, day) => sum + day.requests, 0) /
										(usageData.reduce((sum, day) => sum + day.requests + day.errors, 0))) * 100)}%
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-orange-600" />
							<div>
								<p className="text-sm text-muted-foreground">Avg Response</p>
								<p className="text-xl font-bold">
									{Math.round(usageData.reduce((sum, day) => sum + day.avgResponseTime, 0) / usageData.length)}ms
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="keys" className="space-y-4">
				<TabsList>
					<TabsTrigger value="keys">API Keys</TabsTrigger>
					<TabsTrigger value="usage">Usage Analytics</TabsTrigger>
					<TabsTrigger value="docs">Documentation</TabsTrigger>
					<TabsTrigger value="sdks">SDKs</TabsTrigger>
				</TabsList>

				{/* API Keys Tab */}
				<TabsContent value="keys" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Key className="mr-2 h-5 w-5" />
								API Keys
							</CardTitle>
							<CardDescription>
								Manage your API keys and their permissions
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{apiKeys.map((apiKey) => (
									<div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<p className="font-medium">{apiKey.name}</p>
												<Badge className={cn("text-xs", getStatusColor(apiKey.status))}>
													{apiKey.status}
												</Badge>
											</div>
											<div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
												<span>{apiKey.permissions.length} permissions</span>
												<span>Created {new Date(apiKey.createdAt).toLocaleDateString()}</span>
												{apiKey.lastUsed && (
													<span>Last used {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
												)}
											</div>
											<div className="w-full bg-gray-200 rounded-full h-2 mb-1">
												<div
													className={cn("h-2 rounded-full", getUsageColor(getUsagePercentage(apiKey.monthlyUsage, apiKey.monthlyLimit)))}
													style={{ width: `${getUsagePercentage(apiKey.monthlyUsage, apiKey.monthlyLimit)}%` }}
												></div>
											</div>
											<p className="text-xs text-muted-foreground">
												{apiKey.monthlyUsage.toLocaleString()} / {apiKey.monthlyLimit.toLocaleString()} requests this month
											</p>
										</div>

										<div className="flex items-center gap-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													navigator.clipboard.writeText(apiKey.key);
												}}
											>
												<Copy className="h-4 w-4" />
											</Button>

											<Button
												variant="ghost"
												size="sm"
												onClick={() => setSelectedKey(apiKey)}
											>
												<Shield className="h-4 w-4" />
											</Button>

											{apiKey.status === 'active' ? (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => revokeApiKeyMutation.mutate(apiKey.id)}
													disabled={revokeApiKeyMutation.isPending}
												>
													<AlertTriangle className="h-4 w-4 text-orange-600" />
												</Button>
											) : (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {/* Reactivate key */}}
												>
													<RefreshCw className="h-4 w-4 text-green-600" />
												</Button>
											)}

											<Button
												variant="ghost"
												size="sm"
												onClick={() => deleteApiKeyMutation.mutate(apiKey.id)}
												disabled={deleteApiKeyMutation.isPending}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Usage Analytics Tab */}
				<TabsContent value="usage" className="space-y-4">
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Request Volume</CardTitle>
								<CardDescription>Daily API request volume over the last 5 days</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{usageData.map((day) => (
										<div key={day.date} className="flex items-center justify-between">
											<span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
											<span className="font-medium">{day.requests.toLocaleString()}</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Error Rate</CardTitle>
								<CardDescription>Daily error rate and response times</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{usageData.map((day) => (
										<div key={day.date} className="space-y-1">
											<div className="flex items-center justify-between">
												<span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
												<span className="text-sm text-muted-foreground">
													{day.errors} errors ({Math.round((day.errors / (day.requests + day.errors)) * 100)}%)
												</span>
											</div>
											<div className="text-xs text-muted-foreground">
												{day.avgResponseTime}ms avg response
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Documentation Tab */}
				<TabsContent value="docs" className="space-y-4">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						<Card className="cursor-pointer hover:shadow-md transition-shadow">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<BookOpen className="h-5 w-5 text-blue-600" />
									Getting Started
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground mb-4">
									Learn the basics of using the Financbase API
								</p>
								<Button variant="outline" className="w-full" onClick={() => setShowDocsDialog(true)}>
									View Guide
								</Button>
							</CardContent>
						</Card>

						<Card className="cursor-pointer hover:shadow-md transition-shadow">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Code className="h-5 w-5 text-green-600" />
									API Reference
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground mb-4">
									Complete reference for all API endpoints
								</p>
								<Button variant="outline" className="w-full">
									View Reference
								</Button>
							</CardContent>
						</Card>

						<Card className="cursor-pointer hover:shadow-md transition-shadow">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Zap className="h-5 w-5 text-yellow-600" />
									Code Examples
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground mb-4">
									Ready-to-use code examples in multiple languages
								</p>
								<Button variant="outline" className="w-full">
									View Examples
								</Button>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* SDKs Tab */}
				<TabsContent value="sdks" className="space-y-4">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						<Card className="cursor-pointer hover:shadow-md transition-shadow">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Terminal className="h-5 w-5 text-blue-600" />
									JavaScript SDK
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground mb-4">
									Official JavaScript/TypeScript SDK for Node.js and browsers
								</p>
								<Button variant="outline" className="w-full" onClick={() => setShowSDKDialog(true)}>
									<Download className="mr-2 h-4 w-4" />
									Download
								</Button>
							</CardContent>
						</Card>

						<Card className="cursor-pointer hover:shadow-md transition-shadow">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Code className="h-5 w-5 text-purple-600" />
									Python SDK
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground mb-4">
									Official Python SDK with full API coverage
								</p>
								<Button variant="outline" className="w-full">
									<Download className="mr-2 h-4 w-4" />
									Download
								</Button>
							</CardContent>
						</Card>

						<Card className="cursor-pointer hover:shadow-md transition-shadow">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Globe className="h-5 w-5 text-green-600" />
									PHP SDK
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground mb-4">
									Official PHP SDK for Laravel and other frameworks
								</p>
								<Button variant="outline" className="w-full">
									<Download className="mr-2 h-4 w-4" />
									Download
								</Button>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>

			{/* API Key Details Dialog */}
			{selectedKey && (
				<Dialog open={!!selectedKey} onOpenChange={() => setSelectedKey(null)}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>API Key Details</DialogTitle>
							<DialogDescription>
								Manage {selectedKey.name} API key
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-6">
							{/* Key Info */}
							<div className="space-y-4">
								<div>
									<Label>API Key</Label>
									<div className="flex items-center gap-2 mt-1">
										<Input value={selectedKey.key} readOnly className="font-mono" />
										<Button
											variant="outline"
											size="sm"
											onClick={() => navigator.clipboard.writeText(selectedKey.key)}
										>
											<Copy className="h-4 w-4" />
										</Button>
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										Keep this key secure and never share it publicly
									</p>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>Status</Label>
										<Badge className={cn("mt-1", getStatusColor(selectedKey.status))}>
											{selectedKey.status}
										</Badge>
									</div>
									<div>
										<Label>Created</Label>
										<p className="text-sm mt-1">{new Date(selectedKey.createdAt).toLocaleDateString()}</p>
									</div>
								</div>
							</div>

							{/* Permissions */}
							<div>
								<Label>Permissions</Label>
								<div className="flex flex-wrap gap-2 mt-2">
									{selectedKey.permissions.map((permission) => (
										<Badge key={permission} variant="outline">
											{permission}
										</Badge>
									))}
								</div>
							</div>

							{/* Usage */}
							<div>
								<Label>Usage This Month</Label>
								<div className="space-y-2 mt-2">
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className={cn("h-2 rounded-full", getUsageColor(getUsagePercentage(selectedKey.monthlyUsage, selectedKey.monthlyLimit)))}
											style={{ width: `${getUsagePercentage(selectedKey.monthlyUsage, selectedKey.monthlyLimit)}%` }}
										></div>
									</div>
									<p className="text-sm text-muted-foreground">
										{selectedKey.monthlyUsage.toLocaleString()} / {selectedKey.monthlyLimit.toLocaleString()} requests
									</p>
								</div>
							</div>

							{/* Actions */}
							<div className="flex gap-2">
								<Button variant="outline" className="flex-1">
									Edit Permissions
								</Button>
								<Button variant="outline" className="flex-1">
									Reset Usage
								</Button>
								{selectedKey.status === 'active' ? (
									<Button
										variant="outline"
										onClick={() => revokeApiKeyMutation.mutate(selectedKey.id)}
										disabled={revokeApiKeyMutation.isPending}
									>
										Revoke Key
									</Button>
								) : (
									<Button variant="outline" className="flex-1">
										Reactivate
									</Button>
								)}
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}

			{/* SDK Download Dialog */}
			<Dialog open={showSDKDialog} onOpenChange={setShowSDKDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Download SDKs</DialogTitle>
						<DialogDescription>
							Choose the SDK that best fits your development environment
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="grid gap-4">
							<Card className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-medium">JavaScript/TypeScript SDK</h3>
										<p className="text-sm text-muted-foreground">For Node.js and modern browsers</p>
									</div>
									<Button>
										<Download className="mr-2 h-4 w-4" />
										Download
									</Button>
								</div>
							</Card>

							<Card className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-medium">Python SDK</h3>
										<p className="text-sm text-muted-foreground">For Python applications and scripts</p>
									</div>
									<Button variant="outline">
										<Download className="mr-2 h-4 w-4" />
										Download
									</Button>
								</div>
							</Card>

							<Card className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-medium">PHP SDK</h3>
										<p className="text-sm text-muted-foreground">For PHP and Laravel applications</p>
									</div>
									<Button variant="outline">
										<Download className="mr-2 h-4 w-4" />
										Download
									</Button>
								</div>
							</Card>
						</div>

						<div className="bg-muted p-4 rounded-lg">
							<h4 className="font-medium mb-2">Installation Example</h4>
							<div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
								<code>npm install @financbase/sdk</code>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
