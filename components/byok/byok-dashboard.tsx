"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Plus,
	Key,
	Trash2,
	Edit,
	CheckCircle,
	XCircle,
	AlertTriangle,
	Eye,
	EyeOff,
	RefreshCw,
	Settings,
	Shield,
	CreditCard,
	Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
	id: number;
	provider: string;
	providerName: string;
	keyName?: string;
	keyType: string;
	isActive: boolean;
	isValid: boolean;
	lastValidated?: string;
	lastUsed?: string;
	createdAt: string;
	updatedAt: string;
	monthlyLimit?: string;
	currentUsage?: string;
	allowedModels?: string[];
}

interface Provider {
	id: string;
	name: string;
	baseUrl: string;
	models: Array<{
		id: string;
		name: string;
		provider: string;
		costPer1kTokens?: { input: number; output: number };
		supportsStreaming?: boolean;
		supportsVision?: boolean;
		supportsFunctionCalling?: boolean;
	}>;
	features: {
		streaming: boolean;
		vision: boolean;
		functionCalling: boolean;
	};
}

export function BYOKDashboard() {
	const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
	const [selectedProvider, setSelectedProvider] = useState('');
	const [apiKey, setApiKey] = useState('');
	const [keyName, setKeyName] = useState('');
	const [showApiKey, setShowApiKey] = useState(false);
	const queryClient = useQueryClient();

	// Fetch user's API keys
	const { data: apiKeysData, isLoading: keysLoading } = useQuery({
		queryKey: ['user-api-keys'],
		queryFn: async (): Promise<{ apiKeys: ApiKey[] }> => {
			const response = await fetch('/api/byok/api-keys');
			if (!response.ok) {
				throw new Error('Failed to fetch API keys');
			}
			return response.json();
		},
	});

	// Fetch supported providers
	const { data: providersData, isLoading: providersLoading } = useQuery({
		queryKey: ['ai-providers'],
		queryFn: async (): Promise<{ providers: Provider[] }> => {
			const response = await fetch('/api/byok/providers');
			if (!response.ok) {
				throw new Error('Failed to fetch providers');
			}
			return response.json();
		},
	});

	// Validate API key mutation
	const validateKeyMutation = useMutation({
		mutationFn: async ({ provider, apiKey }: { provider: string; apiKey: string }) => {
			const response = await fetch('/api/byok/validate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ provider, apiKey }),
			});
			if (!response.ok) {
				throw new Error('Failed to validate API key');
			}
			return response.json();
		},
	});

	// Store API key mutation
	const storeKeyMutation = useMutation({
		mutationFn: async ({ provider, apiKey, keyName }: { provider: string; apiKey: string; keyName?: string }) => {
			const response = await fetch('/api/byok/api-keys', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ provider, apiKey, keyName }),
			});
			if (!response.ok) {
				throw new Error('Failed to store API key');
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-api-keys'] });
			setIsAddKeyDialogOpen(false);
			setApiKey('');
			setKeyName('');
			setSelectedProvider('');
			toast.success('API key added successfully');
		},
		onError: (error) => {
			toast.error('Failed to add API key');
		},
	});

	// Delete API key mutation
	const deleteKeyMutation = useMutation({
		mutationFn: async (keyId: number) => {
			const response = await fetch(`/api/byok/api-keys/${keyId}`, {
				method: 'DELETE',
			});
			if (!response.ok) {
				throw new Error('Failed to delete API key');
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-api-keys'] });
			toast.success('API key deleted successfully');
		},
	});

	// Toggle API key status mutation
	const toggleKeyStatusMutation = useMutation({
		mutationFn: async ({ keyId, isActive }: { keyId: number; isActive: boolean }) => {
			const response = await fetch(`/api/byok/api-keys/${keyId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ isActive }),
			});
			if (!response.ok) {
				throw new Error('Failed to update API key');
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-api-keys'] });
			toast.success('API key status updated');
		},
	});

	const handleValidateKey = async () => {
		if (!selectedProvider || !apiKey) {
			toast.error('Please select a provider and enter an API key');
			return;
		}

		validateKeyMutation.mutate({ provider: selectedProvider, apiKey });
	};

	const handleStoreKey = () => {
		if (!selectedProvider || !apiKey) {
			toast.error('Please select a provider and enter an API key');
			return;
		}

		storeKeyMutation.mutate({
			provider: selectedProvider,
			apiKey,
			keyName: keyName || `${selectedProvider} API Key`
		});
	};

	const handleDeleteKey = (keyId: number) => {
		if (confirm('Are you sure you want to delete this API key?')) {
			deleteKeyMutation.mutate(keyId);
		}
	};

	const handleToggleKeyStatus = (keyId: number, isActive: boolean) => {
		toggleKeyStatusMutation.mutate({ keyId, isActive });
	};

	const getStatusBadge = (isActive: boolean, isValid: boolean) => {
		if (!isActive) {
			return <Badge variant="secondary">Inactive</Badge>;
		}
		if (isValid) {
			return <Badge className="bg-green-100 text-green-800 border-green-200">Valid</Badge>;
		}
		return <Badge variant="destructive">Invalid</Badge>;
	};

	const formatCost = (cost: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 4
		}).format(cost);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold flex items-center gap-2">
						<Key className="h-6 w-6" />
						Bring Your Own Key (BYOK)
					</h2>
					<p className="text-muted-foreground">
						Manage your own AI API keys for different providers
					</p>
				</div>
				<Dialog open={isAddKeyDialogOpen} onOpenChange={setIsAddKeyDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add API Key
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Add API Key</DialogTitle>
							<DialogDescription>
								Add your own API key for an AI provider
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							<div>
								<Label htmlFor="provider">AI Provider</Label>
								<Select value={selectedProvider} onValueChange={setSelectedProvider}>
									<SelectTrigger>
										<SelectValue placeholder="Select a provider" />
									</SelectTrigger>
									<SelectContent>
										{providersData?.providers.map((provider) => (
											<SelectItem key={provider.id} value={provider.id}>
												{provider.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="keyName">Key Name (Optional)</Label>
								<Input
									id="keyName"
									value={keyName}
									onChange={(e) => setKeyName(e.target.value)}
									placeholder="My OpenAI Key"
								/>
							</div>

							<div>
								<Label htmlFor="apiKey">API Key</Label>
								<div className="relative">
									<Input
										id="apiKey"
										type={showApiKey ? 'text' : 'password'}
										value={apiKey}
										onChange={(e) => setApiKey(e.target.value)}
										placeholder="sk-..."
										className="pr-10"
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute right-0 top-0 h-full px-3"
										onClick={() => setShowApiKey(!showApiKey)}
									>
										{showApiKey ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>
							</div>

							{validateKeyMutation.data?.validation && (
								<Alert>
									{validateKeyMutation.data.validation.isValid ? (
										<CheckCircle className="h-4 w-4" />
									) : (
										<XCircle className="h-4 w-4" />
									)}
									<AlertDescription>
										{validateKeyMutation.data.validation.isValid
											? 'API key is valid!'
											: validateKeyMutation.data.validation.error || 'API key is invalid'
										}
									</AlertDescription>
								</Alert>
							)}
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								onClick={handleValidateKey}
								disabled={validateKeyMutation.isPending || !selectedProvider || !apiKey}
							>
								{validateKeyMutation.isPending ? (
									<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<CheckCircle className="h-4 w-4 mr-2" />
								)}
								Validate
							</Button>
							<Button
								onClick={handleStoreKey}
								disabled={storeKeyMutation.isPending || !validateKeyMutation.data?.validation?.isValid}
							>
								{storeKeyMutation.isPending ? (
									<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Plus className="h-4 w-4 mr-2" />
								)}
								Add Key
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Supported Providers */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						Supported AI Providers
					</CardTitle>
					<CardDescription>
						Providers you can use with your own API keys
					</CardDescription>
				</CardHeader>
				<CardContent>
					{providersLoading ? (
						<div className="flex items-center justify-center p-4">
							<RefreshCw className="h-4 w-4 animate-spin mr-2" />
							Loading providers...
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{providersData?.providers.map((provider) => (
								<div key={provider.id} className="p-4 border rounded-lg">
									<div className="flex items-center gap-2 mb-2">
										<h4 className="font-medium">{provider.name}</h4>
										<div className="flex gap-1">
											{provider.features.streaming && (
												<Badge variant="outline" className="text-xs">Stream</Badge>
											)}
											{provider.features.vision && (
												<Badge variant="outline" className="text-xs">Vision</Badge>
											)}
											{provider.features.functionCalling && (
												<Badge variant="outline" className="text-xs">Tools</Badge>
											)}
										</div>
									</div>
									<p className="text-sm text-muted-foreground mb-2">
										{provider.models.length} models available
									</p>
									<div className="text-xs text-muted-foreground">
										{provider.models.slice(0, 2).map(model => model.name).join(', ')}
										{provider.models.length > 2 && ` +${provider.models.length - 2} more`}
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Your API Keys */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						Your API Keys
					</CardTitle>
					<CardDescription>
						Manage your stored API keys and their usage
					</CardDescription>
				</CardHeader>
				<CardContent>
					{keysLoading ? (
						<div className="flex items-center justify-center p-4">
							<RefreshCw className="h-4 w-4 animate-spin mr-2" />
							Loading API keys...
						</div>
					) : apiKeysData?.apiKeys.length === 0 ? (
						<div className="text-center py-8">
							<Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
							<p className="text-muted-foreground">No API keys added yet</p>
							<p className="text-sm text-muted-foreground mt-2">
								Add your first API key to get started
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{apiKeysData?.apiKeys.map((key) => (
								<div key={key.id} className="p-4 border rounded-lg">
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-2">
												<h4 className="font-medium">{key.keyName || `${key.providerName} Key`}</h4>
												{getStatusBadge(key.isActive, key.isValid)}
												<Badge variant="outline">{key.keyType}</Badge>
											</div>
											<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
												<div>
													<span className="font-medium">Provider:</span> {key.providerName}
												</div>
												<div>
													<span className="font-medium">Added:</span> {new Date(key.createdAt).toLocaleDateString()}
												</div>
												{key.lastUsed && (
													<div>
														<span className="font-medium">Last Used:</span> {new Date(key.lastUsed).toLocaleDateString()}
													</div>
												)}
												{key.currentUsage && (
													<div>
														<span className="font-medium">Usage:</span> {formatCost(parseFloat(key.currentUsage))}
													</div>
												)}
											</div>
										</div>
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleToggleKeyStatus(key.id, !key.isActive)}
												disabled={toggleKeyStatusMutation.isPending}
											>
												{key.isActive ? 'Disable' : 'Enable'}
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleDeleteKey(key.id)}
												disabled={deleteKeyMutation.isPending}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Usage Analytics */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Activity className="h-5 w-5" />
						Usage Analytics
					</CardTitle>
					<CardDescription>
						Track your AI usage and costs across all providers
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
						<p className="text-muted-foreground">Usage analytics will appear here</p>
						<p className="text-sm text-muted-foreground mt-2">
							Start using AI features to see your usage statistics
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
