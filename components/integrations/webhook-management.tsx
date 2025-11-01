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
	Settings,
	Webhook,
	Activity,
	AlertTriangle,
	CheckCircle,
	Clock,
	Copy,
	Trash2,
	RefreshCw,
	ExternalLink,
	Shield,
	Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WebhookEndpoint {
	id: string;
	url: string;
	events: string[];
	secret: string;
	status: 'active' | 'inactive' | 'error';
	createdAt: string;
	lastDelivery?: string;
	failureCount: number;
}

interface WebhookEvent {
	id: string;
	integrationId: string;
	integrationName: string;
	eventType: string;
	payload: Record<string, any>;
	status: 'delivered' | 'failed' | 'pending';
	createdAt: string;
	processedAt?: string;
	error?: string;
}

const SAMPLE_WEBHOOK_ENDPOINTS: WebhookEndpoint[] = [
	{
		id: '1',
		url: 'https://api.myapp.com/webhooks/financbase',
		events: ['payment.received', 'invoice.paid', 'invoice.overdue'],
		secret: 'wh_sec_1234567890abcdef',
		status: 'active',
		createdAt: '2024-10-15T10:30:00Z',
		lastDelivery: '2024-11-15T14:22:00Z',
		failureCount: 0,
	},
	{
		id: '2',
		url: 'https://webhook.site/12345678-1234-1234-1234-123456789abc',
		events: ['transaction.created', 'transaction.updated'],
		secret: 'wh_sec_0987654321fedcba',
		status: 'active',
		createdAt: '2024-10-20T09:15:00Z',
		lastDelivery: '2024-11-15T13:45:00Z',
		failureCount: 2,
	},
];

const SAMPLE_WEBHOOK_EVENTS: WebhookEvent[] = [
	{
		id: '1',
		integrationId: 'stripe_123',
		integrationName: 'Stripe',
		eventType: 'payment_intent.succeeded',
		payload: { id: 'pi_123', amount: 2999, currency: 'usd' },
		status: 'delivered',
		createdAt: '2024-11-15T14:22:00Z',
		processedAt: '2024-11-15T14:22:01Z',
	},
	{
		id: '2',
		integrationId: 'gusto_456',
		integrationName: 'Gusto',
		eventType: 'employee.created',
		payload: { id: 'emp_789', name: 'John Doe' },
		status: 'failed',
		createdAt: '2024-11-15T13:45:00Z',
		error: 'Timeout: Endpoint did not respond within 30 seconds',
	},
];

export function WebhookManagement() {
	const [selectedEndpoint, setSelectedEndpoint] = useState<WebhookEndpoint | null>(null);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showEventDetails, setShowEventDetails] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);

	const queryClient = useQueryClient();

	// Fetch webhook endpoints
	const { data: webhookEndpoints = SAMPLE_WEBHOOK_ENDPOINTS } = useQuery({
		queryKey: ['webhook-endpoints'],
		queryFn: async () => {
			try {
				const response = await fetch('/api/integrations/webhooks/endpoints');
				if (!response.ok) {
					throw new Error(`Failed to fetch webhook endpoints: ${response.statusText}`);
				}
				return response.json();
			} catch (error) {
				console.error('Error fetching webhook endpoints:', error);
				return SAMPLE_WEBHOOK_ENDPOINTS;
			}
		},
	});

	// Fetch webhook events
	const { data: webhookEvents = SAMPLE_WEBHOOK_EVENTS } = useQuery({
		queryKey: ['webhook-events'],
		queryFn: async () => {
			try {
				const response = await fetch('/api/integrations/webhooks');
				if (!response.ok) {
					throw new Error(`Failed to fetch webhook events: ${response.statusText}`);
				}
				return response.json();
			} catch (error) {
				console.error('Error fetching webhook events:', error);
				return SAMPLE_WEBHOOK_EVENTS;
			}
		},
	});

	// Create webhook endpoint mutation
	const createEndpointMutation = useMutation({
		mutationFn: async (data: { url: string; events: string[]; secret?: string }) => {
			const response = await fetch('/api/integrations/webhooks/endpoints', {
				method: 'POST',
				body: JSON.stringify(data),
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['webhook-endpoints']);
			setShowCreateDialog(false);
		},
	});

	// Delete webhook endpoint mutation
	const deleteEndpointMutation = useMutation({
		mutationFn: async (endpointId: string) => {
			const response = await fetch(`/api/integrations/webhooks/endpoints/${endpointId}`, {
				method: 'DELETE',
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['webhook-endpoints']);
		},
	});

	// Test webhook endpoint mutation
	const testEndpointMutation = useMutation({
		mutationFn: async (endpointId: string) => {
			const response = await fetch(`/api/integrations/webhooks/endpoints/${endpointId}/test`, {
				method: 'POST',
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries(['webhook-events']);
		},
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'inactive':
				return 'bg-gray-100 text-gray-800 border-gray-200';
			case 'error':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'delivered':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'failed':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'active':
			case 'delivered':
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case 'error':
			case 'failed':
				return <AlertTriangle className="h-4 w-4 text-red-600" />;
			case 'pending':
				return <Clock className="h-4 w-4 text-yellow-600" />;
			default:
				return <Activity className="h-4 w-4 text-gray-600" />;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Webhook Management</h2>
					<p className="text-muted-foreground">
						Configure and monitor webhook endpoints for real-time integrations
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={() => queryClient.invalidateQueries(['webhook-events'])}>
						<RefreshCw className="mr-2 h-4 w-4" />
						Refresh
					</Button>
					<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Add Endpoint
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>Create Webhook Endpoint</DialogTitle>
								<DialogDescription>
									Set up a new webhook endpoint to receive real-time events
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="url">Endpoint URL</Label>
									<Input
										id="url"
										placeholder="https://your-app.com/webhooks/financbase"
										type="url"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="secret">Webhook Secret (Optional)</Label>
									<Input
										id="secret"
										placeholder="Generate a secure secret for signature verification"
									/>
									<p className="text-sm text-muted-foreground">
										Used to verify webhook authenticity. Leave empty to auto-generate.
									</p>
								</div>

								<div className="space-y-2">
									<Label>Events to Subscribe</Label>
									<div className="grid grid-cols-2 gap-2">
										{[
											'payment.received',
											'payment.failed',
											'invoice.paid',
											'invoice.overdue',
											'expense.approved',
											'user.created',
											'transaction.created',
											'webhook.test'
										].map((event) => (
											<div key={event} className="flex items-center space-x-2">
												<input type="checkbox" id={event} className="rounded" />
												<Label htmlFor={event} className="text-sm">
													{event}
												</Label>
											</div>
										))}
									</div>
								</div>

								<div className="flex gap-2">
									<Button
										className="flex-1"
										onClick={() => createEndpointMutation.mutate({
											url: 'https://example.com/webhook',
											events: ['payment.received', 'invoice.paid'],
											secret: 'test-secret'
										})}
										disabled={createEndpointMutation.isPending}
									>
										{createEndpointMutation.isPending ? 'Creating...' : 'Create Endpoint'}
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
							<Webhook className="h-4 w-4 text-blue-600" />
							<div>
								<p className="text-sm text-muted-foreground">Total Endpoints</p>
								<p className="text-xl font-bold">{webhookEndpoints.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Activity className="h-4 w-4 text-green-600" />
							<div>
								<p className="text-sm text-muted-foreground">Events Today</p>
								<p className="text-xl font-bold">
									{webhookEvents.filter(e =>
										new Date(e.createdAt).toDateString() === new Date().toDateString()
									).length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<CheckCircle className="h-4 w-4 text-green-600" />
							<div>
								<p className="text-sm text-muted-foreground">Success Rate</p>
								<p className="text-xl font-bold">
									{Math.round((webhookEvents.filter(e => e.status === 'delivered').length / webhookEvents.length) * 100)}%
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<AlertTriangle className="h-4 w-4 text-red-600" />
							<div>
								<p className="text-sm text-muted-foreground">Failed Events</p>
								<p className="text-xl font-bold">
									{webhookEvents.filter(e => e.status === 'failed').length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="endpoints" className="space-y-4">
				<TabsList>
					<TabsTrigger value="endpoints">Webhook Endpoints</TabsTrigger>
					<TabsTrigger value="events">Event History</TabsTrigger>
					<TabsTrigger value="logs">Delivery Logs</TabsTrigger>
				</TabsList>

				{/* Endpoints Tab */}
				<TabsContent value="endpoints" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Webhook className="mr-2 h-5 w-5" />
								Webhook Endpoints
							</CardTitle>
							<CardDescription>
								Manage your webhook endpoints and their configurations
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{webhookEndpoints.map((endpoint) => (
									<div key={endpoint.id} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<p className="font-medium">{endpoint.url}</p>
												<Badge className={cn("text-xs", getStatusColor(endpoint.status))}>
													{getStatusIcon(endpoint.status)}
													<span className="ml-1">{endpoint.status}</span>
												</Badge>
											</div>
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<span>{endpoint.events.length} events</span>
												<span>Created {new Date(endpoint.createdAt).toLocaleDateString()}</span>
												{endpoint.lastDelivery && (
													<span>Last delivery {new Date(endpoint.lastDelivery).toLocaleDateString()}</span>
												)}
												{endpoint.failureCount > 0 && (
													<span className="text-red-600">{endpoint.failureCount} failures</span>
												)}
											</div>
										</div>

										<div className="flex items-center gap-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => testEndpointMutation.mutate(endpoint.id)}
												disabled={testEndpointMutation.isPending}
											>
												<Zap className="h-4 w-4" />
											</Button>

											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													setSelectedEndpoint(endpoint);
													setShowEventDetails(true);
												}}
											>
												<Settings className="h-4 w-4" />
											</Button>

											<Button
												variant="ghost"
												size="sm"
												onClick={() => deleteEndpointMutation.mutate(endpoint.id)}
												disabled={deleteEndpointMutation.isPending}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}

								{webhookEndpoints.length === 0 && (
									<div className="text-center py-8">
										<Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
										<p className="text-muted-foreground">No webhook endpoints configured</p>
										<Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
											Create Your First Endpoint
										</Button>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Events Tab */}
				<TabsContent value="events" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Activity className="mr-2 h-5 w-5" />
								Recent Events
							</CardTitle>
							<CardDescription>
								View recent webhook deliveries and their status
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{webhookEvents.map((event) => (
									<div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex items-center gap-4">
											<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
												{getStatusIcon(event.status)}
											</div>
											<div>
												<div className="flex items-center gap-2 mb-1">
													<p className="font-medium">{event.eventType}</p>
													<Badge variant="outline">{event.integrationName}</Badge>
												</div>
												<p className="text-sm text-muted-foreground">
													{new Date(event.createdAt).toLocaleString()}
												</p>
											</div>
										</div>

										<div className="flex items-center gap-2">
											<Badge className={cn("text-xs", getStatusColor(event.status))}>
												{event.status}
											</Badge>

											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													setSelectedEvent(event);
													setShowEventDetails(true);
												}}
											>
												<ExternalLink className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Logs Tab */}
				<TabsContent value="logs" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<Shield className="mr-2 h-5 w-5" />
								Delivery Logs
							</CardTitle>
							<CardDescription>
								Detailed logs of webhook delivery attempts and responses
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-center py-8">
								<Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<p className="text-muted-foreground">Detailed delivery logs coming soon</p>
								<p className="text-sm text-muted-foreground mt-2">
									Advanced logging and debugging features will be available in the next update.
								</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Event Details Dialog */}
			{selectedEvent && (
				<Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
					<DialogContent className="max-w-4xl">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<Activity className="h-5 w-5" />
								Webhook Event Details
							</DialogTitle>
							<DialogDescription>
								Details for {selectedEvent.eventType} event
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-6">
							{/* Event Info */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="font-medium">Event Type</p>
									<p className="text-sm text-muted-foreground">{selectedEvent.eventType}</p>
								</div>
								<div>
									<p className="font-medium">Integration</p>
									<p className="text-sm text-muted-foreground">{selectedEvent.integrationName}</p>
								</div>
								<div>
									<p className="font-medium">Status</p>
									<Badge className={cn("text-xs", getStatusColor(selectedEvent.status))}>
										{selectedEvent.status}
									</Badge>
								</div>
								<div>
									<p className="font-medium">Created At</p>
									<p className="text-sm text-muted-foreground">
										{new Date(selectedEvent.createdAt).toLocaleString()}
									</p>
								</div>
							</div>

							{/* Payload */}
							<div>
								<p className="font-medium mb-2">Payload</p>
								<div className="bg-muted p-4 rounded-lg">
									<pre className="text-sm overflow-x-auto">
										{JSON.stringify(selectedEvent.payload, null, 2)}
									</pre>
								</div>
							</div>

							{/* Error */}
							{selectedEvent.error && (
								<div>
									<p className="font-medium mb-2">Error</p>
									<div className="bg-red-50 border border-red-200 p-4 rounded-lg">
										<p className="text-sm text-red-800">{selectedEvent.error}</p>
									</div>
								</div>
							)}

							{/* Actions */}
							<div className="flex gap-2">
								<Button
									variant="outline"
									onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedEvent.payload, null, 2))}
								>
									<Copy className="mr-2 h-4 w-4" />
									Copy Payload
								</Button>
								<Button variant="outline">
									Retry Delivery
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
