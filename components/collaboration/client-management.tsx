/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Users,
	Plus,
	Search,
	Filter,
	Building2,
	Mail,
	Phone,
	MapPin,
	Calendar,
	MoreVertical,
	UserCheck,
	UserX,
	Clock,
	Star,
	BarChart3,
	FileText,
	MessageSquare
} from 'lucide-react';
import { Client } from '@/types/auth';
import { workspaceService } from '@/lib/services/workspace-service';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ClientManagementProps {
	workspaceId: string;
}

export function ClientManagement({ workspaceId }: ClientManagementProps) {
	const { toast } = useToast();
	const [clients, setClients] = useState<Client[]>([]);
	const [filteredClients, setFilteredClients] = useState<Client[]>([]);
	const [selectedClient, setSelectedClient] = useState<Client | null>(null);
	const [loading, setLoading] = useState(true);
	const [showAddClient, setShowAddClient] = useState(false);
	const [showClientDetails, setShowClientDetails] = useState(false);

	// Filter states
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<Client['status'] | 'all'>('all');
	const [engagementFilter, setEngagementFilter] = useState<Client['engagementType'] | 'all'>('all');

	// Form states
	const [newClient, setNewClient] = useState({
		name: '',
		email: '',
		phone: '',
		company: '',
		industry: '',
		engagementType: 'monthly' as Client['engagementType'],
		taxId: '',
		address: {
			street: '',
			city: '',
			state: '',
			zipCode: '',
			country: 'US',
		},
	});

	useEffect(() => {
		loadClients();
	}, [workspaceId]);

	useEffect(() => {
		filterClients();
	}, [clients, searchTerm, statusFilter, engagementFilter]);

	const loadClients = async () => {
		try {
			setLoading(true);
			const clientData = await workspaceService.getClients(workspaceId);
			setClients(clientData);
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to load clients',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	const filterClients = () => {
		let filtered = clients;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(client =>
				client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				client.company?.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Status filter
		if (statusFilter !== 'all') {
			filtered = filtered.filter(client => client.status === statusFilter);
		}

		// Engagement type filter
		if (engagementFilter !== 'all') {
			filtered = filtered.filter(client => client.engagementType === engagementFilter);
		}

		setFilteredClients(filtered);
	};

	const handleCreateClient = async () => {
		try {
			const client = await workspaceService.createClient({
				...newClient,
				workspaceId,
				status: 'active',
				assignedAccountant: undefined,
			});

			setClients(prev => [...prev, client]);
			setShowAddClient(false);
			setNewClient({
				name: '',
				email: '',
				phone: '',
				company: '',
				industry: '',
				engagementType: 'monthly',
				taxId: '',
				address: {
					street: '',
					city: '',
					state: '',
					zipCode: '',
					country: 'US',
				},
			});

			toast({
				title: 'Success',
				description: 'Client added successfully',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to add client',
				variant: 'destructive',
			});
		}
	};

	const handleUpdateClient = async (clientId: string, updates: Partial<Client>) => {
		try {
			const updatedClient = await workspaceService.updateClient(workspaceId, clientId, updates);
			setClients(prev => prev.map(c => c.id === clientId ? updatedClient : c));

			if (selectedClient?.id === clientId) {
				setSelectedClient(updatedClient);
			}

			toast({
				title: 'Success',
				description: 'Client updated successfully',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to update client',
				variant: 'destructive',
			});
		}
	};

	const handleDeleteClient = async (clientId: string) => {
		try {
			await workspaceService.deleteClient(workspaceId, clientId);
			setClients(prev => prev.filter(c => c.id !== clientId));
			setShowClientDetails(false);
			setSelectedClient(null);

			toast({
				title: 'Success',
				description: 'Client deleted successfully',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to delete client',
				variant: 'destructive',
			});
		}
	};

	const getStatusColor = (status: Client['status']) => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800';
			case 'inactive':
				return 'bg-gray-100 text-gray-800';
			case 'prospect':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getEngagementColor = (type: Client['engagementType']) => {
		switch (type) {
			case 'monthly':
				return 'bg-purple-100 text-purple-800';
			case 'quarterly':
				return 'bg-orange-100 text-orange-800';
			case 'annual':
				return 'bg-green-100 text-green-800';
			case 'project':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-center">
					<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<p className="text-muted-foreground">Loading clients...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Client Management</h2>
					<p className="text-muted-foreground">
						Manage client relationships and engagement workflows
					</p>
				</div>
				<Button onClick={() => setShowAddClient(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Client
				</Button>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-wrap gap-4">
						<div className="flex-1 min-w-[200px]">
							<Label htmlFor="search">Search Clients</Label>
							<div className="relative">
								<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="search"
									placeholder="Search by name, email, or company..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>

						<div className="min-w-[120px]">
							<Label htmlFor="statusFilter">Status</Label>
							<Select value={statusFilter} onValueChange={(value: Client['status'] | 'all') => setStatusFilter(value)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
									<SelectItem value="prospect">Prospect</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="min-w-[120px]">
							<Label htmlFor="engagementFilter">Engagement</Label>
							<Select value={engagementFilter} onValueChange={(value: Client['engagementType'] | 'all') => setEngagementFilter(value)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Types</SelectItem>
									<SelectItem value="monthly">Monthly</SelectItem>
									<SelectItem value="quarterly">Quarterly</SelectItem>
									<SelectItem value="annual">Annual</SelectItem>
									<SelectItem value="project">Project</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Clients Grid/List */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{filteredClients.map((client) => (
					<Card key={client.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
						setSelectedClient(client);
						setShowClientDetails(true);
					}}>
						<CardContent className="p-4">
							<div className="flex items-start justify-between mb-3">
								<div className="flex items-center gap-3">
									<Avatar className="w-10 h-10">
										<AvatarFallback>
											{client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div>
										<h3 className="font-medium">{client.name}</h3>
										<p className="text-sm text-muted-foreground">{client.email}</p>
									</div>
								</div>
								<Button variant="ghost" size="sm">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</div>

							<div className="space-y-2">
								{client.company && (
									<div className="flex items-center gap-2 text-sm">
										<Building2 className="h-4 w-4 text-muted-foreground" />
										<span className="text-muted-foreground">{client.company}</span>
									</div>
								)}

								{client.phone && (
									<div className="flex items-center gap-2 text-sm">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<span className="text-muted-foreground">{client.phone}</span>
									</div>
								)}

								<div className="flex items-center gap-2">
									<Badge className={getStatusColor(client.status)}>
										{client.status}
									</Badge>
									<Badge variant="outline" className={getEngagementColor(client.engagementType)}>
										{client.engagementType}
									</Badge>
								</div>

								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<Calendar className="h-3 w-3" />
									<span>Added {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{filteredClients.length === 0 && (
				<Card>
					<CardContent className="p-8 text-center">
						<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-medium mb-2">No clients found</h3>
						<p className="text-muted-foreground mb-4">
							{searchTerm || statusFilter !== 'all' || engagementFilter !== 'all'
								? 'No clients match your current filters'
								: 'Start by adding your first client'
							}
						</p>
						<Button onClick={() => setShowAddClient(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Add Client
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Add Client Modal */}
			<Dialog open={showAddClient} onOpenChange={setShowAddClient}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Add New Client</DialogTitle>
						<DialogDescription>
							Add a new client to your practice
						</DialogDescription>
					</DialogHeader>

					<Tabs defaultValue="basic" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="basic">Basic Information</TabsTrigger>
							<TabsTrigger value="details">Additional Details</TabsTrigger>
						</TabsList>

						<TabsContent value="basic" className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="clientName">Full Name *</Label>
									<Input
										id="clientName"
										value={newClient.name}
										onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
										placeholder="John Smith"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="clientEmail">Email Address *</Label>
									<Input
										id="clientEmail"
										type="email"
										value={newClient.email}
										onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
										placeholder="john@company.com"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="clientPhone">Phone Number</Label>
									<Input
										id="clientPhone"
										value={newClient.phone}
										onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
										placeholder="+1 (555) 123-4567"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="clientCompany">Company</Label>
									<Input
										id="clientCompany"
										value={newClient.company}
										onChange={(e) => setNewClient(prev => ({ ...prev, company: e.target.value }))}
										placeholder="Acme Corporation"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="engagementType">Engagement Type</Label>
								<Select value={newClient.engagementType} onValueChange={(value: Client['engagementType']) => setNewClient(prev => ({ ...prev, engagementType: value }))}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="monthly">Monthly Bookkeeping</SelectItem>
										<SelectItem value="quarterly">Quarterly Review</SelectItem>
										<SelectItem value="annual">Annual Tax Preparation</SelectItem>
										<SelectItem value="project">Project-Based</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</TabsContent>

						<TabsContent value="details" className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="clientIndustry">Industry</Label>
								<Input
									id="clientIndustry"
									value={newClient.industry}
									onChange={(e) => setNewClient(prev => ({ ...prev, industry: e.target.value }))}
									placeholder="Technology, Healthcare, Retail, etc."
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="clientTaxId">Tax ID / EIN</Label>
								<Input
									id="clientTaxId"
									value={newClient.taxId}
									onChange={(e) => setNewClient(prev => ({ ...prev, taxId: e.target.value }))}
									placeholder="12-3456789"
								/>
							</div>

							<div className="space-y-3">
								<Label>Address</Label>
								<div className="space-y-2">
									<Input
										value={newClient.address.street}
										onChange={(e) => setNewClient(prev => ({
											...prev,
											address: { ...prev.address, street: e.target.value }
										}))}
										placeholder="Street Address"
									/>
									<div className="grid grid-cols-2 gap-2">
										<Input
											value={newClient.address.city}
											onChange={(e) => setNewClient(prev => ({
												...prev,
												address: { ...prev.address, city: e.target.value }
											}))}
											placeholder="City"
										/>
										<Input
											value={newClient.address.state}
											onChange={(e) => setNewClient(prev => ({
												...prev,
												address: { ...prev.address, state: e.target.value }
											}))}
											placeholder="State"
										/>
									</div>
									<div className="grid grid-cols-2 gap-2">
										<Input
											value={newClient.address.zipCode}
											onChange={(e) => setNewClient(prev => ({
												...prev,
												address: { ...prev.address, zipCode: e.target.value }
											}))}
											placeholder="ZIP Code"
										/>
										<Input
											value={newClient.address.country}
											onChange={(e) => setNewClient(prev => ({
												...prev,
												address: { ...prev.address, country: e.target.value }
											}))}
											placeholder="Country"
										/>
									</div>
								</div>
							</div>
						</TabsContent>
					</Tabs>

					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setShowAddClient(false)}>
							Cancel
						</Button>
						<Button
							onClick={handleCreateClient}
							disabled={!newClient.name || !newClient.email}
						>
							Add Client
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Client Details Modal */}
			<Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-3">
							{selectedClient && (
								<Avatar className="w-10 h-10">
									<AvatarFallback>
										{selectedClient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
									</AvatarFallback>
								</Avatar>
							)}
							{selectedClient?.name}
						</DialogTitle>
						<DialogDescription>
							Client details and management
						</DialogDescription>
					</DialogHeader>

					{selectedClient && (
						<div className="space-y-6">
							{/* Client Info */}
							<div className="grid grid-cols-2 gap-6">
								<div className="space-y-4">
									<div>
										<Label className="text-sm font-medium">Contact Information</Label>
										<div className="space-y-2 mt-2">
											<div className="flex items-center gap-2 text-sm">
												<Mail className="h-4 w-4 text-muted-foreground" />
												<span>{selectedClient.email}</span>
											</div>
											{selectedClient.phone && (
												<div className="flex items-center gap-2 text-sm">
													<Phone className="h-4 w-4 text-muted-foreground" />
													<span>{selectedClient.phone}</span>
												</div>
											)}
											{selectedClient.company && (
												<div className="flex items-center gap-2 text-sm">
													<Building2 className="h-4 w-4 text-muted-foreground" />
													<span>{selectedClient.company}</span>
												</div>
											)}
										</div>
									</div>

									<div>
										<Label className="text-sm font-medium">Engagement</Label>
										<div className="flex gap-2 mt-2">
											<Badge className={getStatusColor(selectedClient.status)}>
												{selectedClient.status}
											</Badge>
											<Badge variant="outline" className={getEngagementColor(selectedClient.engagementType)}>
												{selectedClient.engagementType}
											</Badge>
										</div>
									</div>
								</div>

								<div className="space-y-4">
									{selectedClient.address && (
										<div>
											<Label className="text-sm font-medium">Address</Label>
											<div className="flex items-start gap-2 text-sm mt-2">
												<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
												<div>
													<p>{selectedClient.address.street}</p>
													<p>{selectedClient.address.city}, {selectedClient.address.state} {selectedClient.address.zipCode}</p>
													<p>{selectedClient.address.country}</p>
												</div>
											</div>
										</div>
									)}

									<div>
										<Label className="text-sm font-medium">Account Details</Label>
										<div className="space-y-1 mt-2">
											{selectedClient.taxId && (
												<p className="text-sm">Tax ID: {selectedClient.taxId}</p>
											)}
											{selectedClient.industry && (
												<p className="text-sm">Industry: {selectedClient.industry}</p>
											)}
											<p className="text-sm text-muted-foreground">
												Added {formatDistanceToNow(new Date(selectedClient.createdAt), { addSuffix: true })}
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="flex gap-2 pt-4 border-t">
								<Button variant="outline" size="sm">
									<MessageSquare className="mr-2 h-4 w-4" />
									Send Message
								</Button>
								<Button variant="outline" size="sm">
									<FileText className="mr-2 h-4 w-4" />
									View Documents
								</Button>
								<Button variant="outline" size="sm">
									<BarChart3 className="mr-2 h-4 w-4" />
									View Reports
								</Button>
								<div className="ml-auto flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleUpdateClient(selectedClient.id, { status: selectedClient.status === 'active' ? 'inactive' : 'active' })}
									>
										{selectedClient.status === 'active' ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
										{selectedClient.status === 'active' ? 'Deactivate' : 'Activate'}
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => handleDeleteClient(selectedClient.id)}
									>
										Delete Client
									</Button>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
