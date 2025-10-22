"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Plus,
	Search,
	MoreHorizontal,
	Users,
	DollarSign,
	Mail,
	Phone,
	Loader2
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface Client {
	id: string;
	companyName: string;
	contactName?: string;
	email: string;
	phone?: string;
	address?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	country?: string;
	taxId?: string;
	currency?: string;
	paymentTerms?: string;
	isActive: boolean;
	notes?: string;
	metadata?: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
}

interface ClientStats {
	totalClients: number;
	activeClients: number;
	totalRevenue: number;
	averageInvoiceValue: number;
	topClients: Array<{
		id: string;
		companyName: string;
		totalInvoices: number;
		totalAmount: number;
	}>;
}

export default function ClientsPage() {
	const [searchQuery, setSearchQuery] = useState("");

	// Fetch clients data
	const { data: clientsData, isLoading: clientsLoading, error: clientsError } = useQuery({
		queryKey: ['clients', searchQuery],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (searchQuery) params.append('search', searchQuery);
			
			const response = await fetch(`/api/clients?${params.toString()}`);
			if (!response.ok) throw new Error('Failed to fetch clients');
			return response.json();
		},
	});

	// Fetch client stats
	const { data: statsData, isLoading: statsLoading } = useQuery({
		queryKey: ['client-stats'],
		queryFn: async () => {
			const response = await fetch('/api/clients/stats');
			if (!response.ok) throw new Error('Failed to fetch client stats');
			return response.json();
		},
	});

	const clients: Client[] = clientsData?.clients || [];
	const stats: ClientStats = statsData?.stats || {
		totalClients: 0,
		activeClients: 0,
		totalRevenue: 0,
		averageInvoiceValue: 0,
		topClients: [],
	};

	const getStatusBadgeVariant = (isActive: boolean) => {
		return isActive ? "default" : "secondary";
	};

	if (clientsLoading || statsLoading) {
		return (
			<div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}

	if (clientsError) {
		return (
			<div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
				<div className="text-center text-red-600">
					Error loading clients: {clientsError.message}
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Clients</h2>
					<p className="text-muted-foreground">
						Manage your client relationships and information
					</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					New Client
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Clients
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalClients}</div>
						<p className="text-xs text-muted-foreground">
							{stats.activeClients} active
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Clients
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.activeClients}</div>
						<p className="text-xs text-muted-foreground">
							{stats.totalClients > 0 ? Math.round((stats.activeClients / stats.totalClients) * 100) : 0}% of total
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Revenue
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							From all clients
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Avg Invoice Value
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${stats.averageInvoiceValue.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground">
							Per invoice average
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardHeader>
					<CardTitle>All Clients</CardTitle>
					<CardDescription>
						View and manage all your clients
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center space-x-2 mb-4">
						<div className="flex-1">
							<Label htmlFor="search" className="sr-only">
								Search
							</Label>
							<div className="relative">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search clients..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-8"
							/>
							</div>
						</div>
					</div>

					{/* Clients Table */}
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Company</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Payment Terms</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{clients.length === 0 ? (
									<TableRow>
										<TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
											No clients found. Create your first client to get started.
										</TableCell>
									</TableRow>
								) : (
									clients.map((client) => (
										<TableRow key={client.id}>
											<TableCell className="font-medium">
												{client.companyName}
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="flex items-center text-sm">
														<Mail className="mr-1 h-3 w-3" />
														{client.email}
													</div>
													{client.contactName && (
														<div className="text-sm text-muted-foreground">
															{client.contactName}
														</div>
													)}
													{client.phone && (
														<div className="flex items-center text-sm text-muted-foreground">
															<Phone className="mr-1 h-3 w-3" />
															{client.phone}
														</div>
													)}
												</div>
											</TableCell>
											<TableCell>
												{client.city && client.state ? (
													<div className="text-sm">
														{client.city}, {client.state}
													</div>
												) : (
													<div className="text-sm text-muted-foreground">
														{client.country || 'US'}
													</div>
												)}
											</TableCell>
											<TableCell className="text-sm">
												{client.paymentTerms || 'net30'}
											</TableCell>
											<TableCell>
												<Badge variant={getStatusBadgeVariant(client.isActive)}>
													{client.isActive ? 'Active' : 'Inactive'}
												</Badge>
											</TableCell>
											<TableCell className="text-sm">
												{new Date(client.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-right">
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
