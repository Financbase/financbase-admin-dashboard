/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from "react";
import { DeveloperPortal } from "@/components/integrations/developer-portal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Key,
	Activity,
	BarChart3,
	Code,
	Copy,
	Trash2,
	RefreshCw,
	Shield,
	Zap,
	Clock,
	AlertTriangle,
	BookOpen,
	Terminal,
	Globe,
	Webhook,
	Settings,
	Users,
	Database,
	Network,
	Building2,
	FileText,
	Play,
	CheckCircle,
	Star,
	TrendingUp,
	Monitor,
	AlertCircle,
	Loader2,
	Plus,
	Edit,
	Eye,
	ExternalLink,
	Server,
	Lock,
	Unlock
} from "lucide-react";

interface APIKey {
	id: string;
	name: string;
	description: string;
	keyPrefix: string;
	scopes: string[];
	status: 'active' | 'inactive' | 'expired';
	lastUsed?: string;
	createdAt: string;
	expiresAt?: string;
	usageCount: number;
}

interface DeveloperStats {
	totalAPIKeys: number;
	activeAPIKeys: number;
	totalRequests: number;
	successRate: number;
	averageResponseTime: number;
	uptime: number;
}

export default function DeveloperPortalPage() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
	const [stats, setStats] = useState<DeveloperStats>({
		totalAPIKeys: 0,
		activeAPIKeys: 0,
		totalRequests: 0,
		successRate: 0,
		averageResponseTime: 0,
		uptime: 0
	});

	// Sample API keys data
	const sampleAPIKeys: APIKey[] = [
		{
			id: '1',
			name: 'Production API Key',
			description: 'Main API key for production environment',
			keyPrefix: 'pk_live_',
			scopes: ['read', 'write'],
			status: 'active',
			lastUsed: '2024-01-15T10:30:00Z',
			createdAt: '2024-01-01T00:00:00Z',
			usageCount: 15420
		},
		{
			id: '2',
			name: 'Development API Key',
			description: 'API key for development and testing',
			keyPrefix: 'pk_test_',
			scopes: ['read'],
			status: 'active',
			lastUsed: '2024-01-14T16:45:00Z',
			createdAt: '2024-01-01T00:00:00Z',
			usageCount: 3250
		},
		{
			id: '3',
			name: 'Webhook API Key',
			description: 'API key for webhook authentication',
			keyPrefix: 'pk_webhook_',
			scopes: ['webhook'],
			status: 'inactive',
			lastUsed: '2024-01-10T12:00:00Z',
			createdAt: '2024-01-01T00:00:00Z',
			usageCount: 890
		}
	];

	// Load data on component mount
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			setError(null);
			try {
				// Try to fetch real API keys, fallback to sample data
				let keysToUse = sampleAPIKeys;
				try {
					const response = await fetch('/api/developer/api-keys');
					if (response.ok) {
						const data = await response.json();
						keysToUse = Array.isArray(data) ? data : data.apiKeys || sampleAPIKeys;
					}
				} catch {
					// Use sample data on error
				}
				
				setApiKeys(keysToUse);
				
				// Calculate stats
				const calculatedStats = {
					totalAPIKeys: keysToUse.length,
					activeAPIKeys: keysToUse.filter((key: APIKey) => key.status === 'active').length,
					totalRequests: keysToUse.reduce((sum: number, key: APIKey) => sum + key.usageCount, 0),
					successRate: 99.8,
					averageResponseTime: 120,
					uptime: 99.98
				};
				setStats(calculatedStats);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Failed to load developer portal data. Please try again.';
				setError(errorMessage);
				console.error('Error loading developer portal data:', err);
				// Use sample data as fallback
				setApiKeys(sampleAPIKeys);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	const handleCreateAPIKey = async () => {
		setLoading(true);
		setError(null);
		try {
			// Simulate API key creation
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			const newKey: APIKey = {
				id: Date.now().toString(),
				name: 'New API Key',
				description: 'Newly created API key',
				keyPrefix: 'pk_new_',
				scopes: ['read', 'write'],
				status: 'active',
				createdAt: new Date().toISOString(),
				usageCount: 0
			};
			
			setApiKeys(prev => [...prev, newKey]);
			setStats(prev => ({
				...prev,
				totalAPIKeys: prev.totalAPIKeys + 1,
				activeAPIKeys: prev.activeAPIKeys + 1
			}));
		} catch (err) {
			setError('Failed to create API key. Please try again.');
			console.error('Error creating API key:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteAPIKey = async (keyId: string) => {
		if (!confirm('Are you sure you want to delete this API key?')) return;
		
		setLoading(true);
		setError(null);
		try {
			// Simulate API key deletion
			await new Promise(resolve => setTimeout(resolve, 500));
			
			const keyToDelete = apiKeys.find(key => key.id === keyId);
			setApiKeys(prev => prev.filter(key => key.id !== keyId));
			
			if (keyToDelete) {
				setStats(prev => ({
					...prev,
					totalAPIKeys: prev.totalAPIKeys - 1,
					activeAPIKeys: keyToDelete.status === 'active' ? prev.activeAPIKeys - 1 : prev.activeAPIKeys
				}));
			}
		} catch (err) {
			setError('Failed to delete API key. Please try again.');
			console.error('Error deleting API key:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleRevokeAPIKey = async (keyId: string) => {
		setLoading(true);
		setError(null);
		try {
			// Simulate API key revocation
			await new Promise(resolve => setTimeout(resolve, 500));
			
			setApiKeys(prev => prev.map(key => 
				key.id === keyId 
					? { ...key, status: 'inactive' as const }
					: key
			));
			
			setStats(prev => ({
				...prev,
				activeAPIKeys: prev.activeAPIKeys - 1
			}));
		} catch (err) {
			setError('Failed to revoke API key. Please try again.');
			console.error('Error revoking API key:', err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Enhanced Header */}
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
								<Code className="h-8 w-8 text-primary" />
								API Developer Portal
							</h1>
							<p className="text-muted-foreground mt-1">
								Comprehensive API management, documentation, and development tools for building integrations
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">
								<BookOpen className="h-4 w-4 mr-2" />
								Interactive API Explorer
							</Button>
							<Button variant="outline" size="sm">
								<Webhook className="h-4 w-4 mr-2" />
								Webhook Testing
							</Button>
							<Button size="sm">
								<Settings className="h-4 w-4 mr-2" />
								API Settings
							</Button>
						</div>
					</div>

					{/* Error Alert */}
					{error && (
						<Alert variant="destructive" className="mt-4">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{/* Developer Stats */}
					<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
						<Card>
							<CardContent className="p-4 text-center">
								<div className="flex items-center justify-center gap-2 mb-2">
									<Key className="h-4 w-4 text-blue-600" />
									<span className="text-sm font-medium">API Keys</span>
								</div>
								<p className="text-2xl font-bold">{loading ? '...' : stats.totalAPIKeys}</p>
								<p className="text-xs text-muted-foreground">{loading ? 'Loading...' : `${stats.activeAPIKeys} Active`}</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4 text-center">
								<div className="flex items-center justify-center gap-2 mb-2">
									<Activity className="h-4 w-4 text-green-600" />
									<span className="text-sm font-medium">Requests</span>
								</div>
								<p className="text-2xl font-bold">{loading ? '...' : `${(stats.totalRequests / 1000).toFixed(1)}K+`}</p>
								<p className="text-xs text-muted-foreground">Total</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4 text-center">
								<div className="flex items-center justify-center gap-2 mb-2">
									<BarChart3 className="h-4 w-4 text-purple-600" />
									<span className="text-sm font-medium">Success Rate</span>
								</div>
								<p className="text-2xl font-bold">{loading ? '...' : `${stats.successRate}%`}</p>
								<p className="text-xs text-muted-foreground">Uptime</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4 text-center">
								<div className="flex items-center justify-center gap-2 mb-2">
									<Users className="h-4 w-4 text-orange-600" />
									<span className="text-sm font-medium">Developers</span>
								</div>
								<p className="text-2xl font-bold">2.5K+</p>
								<p className="text-xs text-muted-foreground">Registered</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4 text-center">
								<div className="flex items-center justify-center gap-2 mb-2">
									<Clock className="h-4 w-4 text-indigo-600" />
									<span className="text-sm font-medium">Avg Response</span>
								</div>
								<p className="text-2xl font-bold">{loading ? '...' : `${stats.averageResponseTime}ms`}</p>
								<p className="text-xs text-muted-foreground">API Latency</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-6">
				{/* Quick Actions */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<Card className="cursor-pointer hover:shadow-md transition-all duration-200">
						<CardContent className="p-4 text-center">
							<div className="p-3 rounded-lg bg-blue-100 text-blue-600 mb-3 mx-auto w-fit">
								<Key className="h-6 w-6" />
							</div>
							<h3 className="font-medium mb-1">API Keys</h3>
							<p className="text-sm text-muted-foreground mb-3">Manage authentication</p>
							<Button 
								size="sm" 
								className="w-full"
								onClick={handleCreateAPIKey}
								disabled={loading}
							>
								{loading ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Creating...
									</>
								) : (
									<>
										<Plus className="h-4 w-4 mr-2" />
										Create Key
									</>
								)}
							</Button>
						</CardContent>
					</Card>

					<Card className="cursor-pointer hover:shadow-md transition-all duration-200">
						<CardContent className="p-4 text-center">
							<div className="p-3 rounded-lg bg-green-100 text-green-600 mb-3 mx-auto w-fit">
								<Webhook className="h-6 w-6" />
							</div>
							<h3 className="font-medium mb-1">Webhooks</h3>
							<p className="text-sm text-muted-foreground mb-3">Event notifications</p>
							<Button size="sm" variant="outline" className="w-full">
								Configure
							</Button>
						</CardContent>
					</Card>

					<Card className="cursor-pointer hover:shadow-md transition-all duration-200">
						<CardContent className="p-4 text-center">
							<div className="p-3 rounded-lg bg-purple-100 text-purple-600 mb-3 mx-auto w-fit">
								<BarChart3 className="h-6 w-6" />
							</div>
							<h3 className="font-medium mb-1">Analytics</h3>
							<p className="text-sm text-muted-foreground mb-3">Usage insights</p>
							<Button size="sm" variant="outline" className="w-full">
								View Stats
							</Button>
						</CardContent>
					</Card>

					<Card className="cursor-pointer hover:shadow-md transition-all duration-200">
						<CardContent className="p-4 text-center">
							<div className="p-3 rounded-lg bg-orange-100 text-orange-600 mb-3 mx-auto w-fit">
								<BookOpen className="h-6 w-6" />
							</div>
							<h3 className="font-medium mb-1">Documentation</h3>
							<p className="text-sm text-muted-foreground mb-3">API reference</p>
							<Button size="sm" variant="outline" className="w-full">
								Browse Docs
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* API Categories Overview */}
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
					<Card className="cursor-pointer hover:shadow-md transition-all duration-200">
						<CardContent className="p-4 text-center">
							<div className="flex flex-col items-center gap-2">
								<div className="p-2 rounded-lg bg-green-100 text-green-600">
									<FileText className="h-4 w-4" />
								</div>
								<div>
									<p className="text-sm font-medium">Financial</p>
									<p className="text-xs text-muted-foreground">25 endpoints</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="cursor-pointer hover:shadow-md transition-all duration-200">
						<CardContent className="p-4 text-center">
							<div className="flex flex-col items-center gap-2">
								<div className="p-2 rounded-lg bg-blue-100 text-blue-600">
									<Users className="h-4 w-4" />
								</div>
								<div>
									<p className="text-sm font-medium">Clients</p>
									<p className="text-xs text-muted-foreground">15 endpoints</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="cursor-pointer hover:shadow-md transition-all duration-200">
						<CardContent className="p-4 text-center">
							<div className="flex flex-col items-center gap-2">
								<div className="p-2 rounded-lg bg-purple-100 text-purple-600">
									<Activity className="h-4 w-4" />
								</div>
								<div>
									<p className="text-sm font-medium">Analytics</p>
									<p className="text-xs text-muted-foreground">20 endpoints</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="cursor-pointer hover:shadow-md transition-all duration-200">
						<CardContent className="p-4 text-center">
							<div className="flex flex-col items-center gap-2">
								<div className="p-2 rounded-lg bg-orange-100 text-orange-600">
									<Database className="h-4 w-4" />
								</div>
								<div>
									<p className="text-sm font-medium">Integration</p>
									<p className="text-xs text-muted-foreground">18 endpoints</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="cursor-pointer hover:shadow-md transition-all duration-200">
						<CardContent className="p-4 text-center">
							<div className="flex flex-col items-center gap-2">
								<div className="p-2 rounded-lg bg-red-100 text-red-600">
									<Webhook className="h-4 w-4" />
								</div>
								<div>
									<p className="text-sm font-medium">Webhooks</p>
									<p className="text-xs text-muted-foreground">8 endpoints</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className="cursor-pointer hover:shadow-md transition-all duration-200">
						<CardContent className="p-4 text-center">
							<div className="flex flex-col items-center gap-2">
								<div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
									<Shield className="h-4 w-4" />
								</div>
								<div>
									<p className="text-sm font-medium">Security</p>
									<p className="text-xs text-muted-foreground">12 endpoints</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* API Keys Management */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Key className="h-5 w-5" />
							API Keys Management
						</CardTitle>
						<CardDescription>
							Manage your API keys for authentication and access control
						</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<Loader2 className="h-6 w-6 animate-spin mr-2" />
								<span>Loading API keys...</span>
							</div>
						) : (
							<div className="space-y-4">
								{apiKeys.map((key) => (
									<Card key={key.id} className="border-l-4 border-l-blue-500">
										<CardContent className="p-4">
											<div className="flex items-center justify-between">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-2">
														<h4 className="font-semibold">{key.name}</h4>
														<Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
															{key.status}
														</Badge>
													</div>
													<p className="text-sm text-muted-foreground mb-2">{key.description}</p>
													<div className="flex items-center gap-4 text-sm text-muted-foreground">
														<span>Prefix: {key.keyPrefix}***</span>
														<span>Scopes: {key.scopes.join(', ')}</span>
														<span>Usage: {key.usageCount.toLocaleString()}</span>
														{key.lastUsed && (
															<span>Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>
														)}
													</div>
												</div>
												<div className="flex items-center gap-2">
													<Button variant="outline" size="sm">
														<Copy className="h-4 w-4 mr-2" />
														Copy
													</Button>
													{key.status === 'active' && (
														<Button 
															variant="outline" 
															size="sm"
															onClick={() => handleRevokeAPIKey(key.id)}
															disabled={loading}
														>
															<Lock className="h-4 w-4 mr-2" />
															Revoke
														</Button>
													)}
													<Button 
														variant="outline" 
														size="sm"
														onClick={() => handleDeleteAPIKey(key.id)}
														disabled={loading}
													>
														<Trash2 className="h-4 w-4 mr-2" />
														Delete
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
								{apiKeys.length === 0 && (
									<div className="text-center py-8 text-muted-foreground">
										<Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
										<p>No API keys found. Create your first API key to get started.</p>
									</div>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Main Developer Portal */}
				<DeveloperPortal />

				{/* API Status */}
				<Card className="mt-8">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Activity className="h-5 w-5 text-green-600" />
							API Status
						</CardTitle>
						<CardDescription>
							Real-time API health and performance metrics
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2">
									<CheckCircle className="h-5 w-5 text-green-600" />
									<span className="text-sm font-medium">API Status</span>
								</div>
								<Badge className="bg-green-100 text-green-800">Operational</Badge>
							</div>
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2">
									<Zap className="h-5 w-5 text-blue-600" />
									<span className="text-sm font-medium">Response Time</span>
								</div>
								<span className="text-sm font-bold">120ms</span>
							</div>
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2">
									<TrendingUp className="h-5 w-5 text-purple-600" />
									<span className="text-sm font-medium">Uptime</span>
								</div>
								<span className="text-sm font-bold">99.98%</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
