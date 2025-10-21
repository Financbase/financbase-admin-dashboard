"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
	Calendar,
	Mail,
	Phone
} from "lucide-react";
import { useState } from "react";

export default function ClientsPage() {
	const [searchQuery, setSearchQuery] = useState("");

	// Sample client data
	const clients = [
		{
			id: "CLIENT-001",
			name: "Acme Corporation",
			email: "contact@acme.com",
			phone: "+1 (555) 123-4567",
			company: "Acme Corp",
			totalInvoices: 12,
			totalAmount: 45231.89,
			status: "Active",
			lastInvoice: "2024-12-15",
		},
		{
			id: "CLIENT-002",
			name: "Tech Solutions Ltd",
			email: "hello@techsolutions.com",
			phone: "+1 (555) 987-6543",
			company: "Tech Solutions",
			totalInvoices: 8,
			totalAmount: 18299.50,
			status: "Active",
			lastInvoice: "2024-12-10",
		},
		{
			id: "CLIENT-003",
			name: "Global Industries",
			email: "info@globalindustries.com",
			phone: "+1 (555) 456-7890",
			company: "Global Industries Inc",
			totalInvoices: 15,
			totalAmount: 67899.99,
			status: "Inactive",
			lastInvoice: "2024-11-28",
		},
	];

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "Active":
				return "default";
			case "Inactive":
				return "secondary";
			case "Prospect":
				return "outline";
			default:
				return "outline";
		}
	};

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
						<div className="text-2xl font-bold">24</div>
						<p className="text-xs text-muted-foreground">
							+2 new this month
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
						<div className="text-2xl font-bold">18</div>
						<p className="text-xs text-muted-foreground">
							75% of total clients
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
						<div className="text-2xl font-bold">$131,431.38</div>
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
						<div className="text-2xl font-bold">$5,476.31</div>
						<p className="text-xs text-muted-foreground">
							Per client average
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
									id="search"
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
									<TableHead>Client #</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Company</TableHead>
									<TableHead>Total Invoices</TableHead>
									<TableHead>Total Amount</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Last Invoice</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{clients.map((client) => (
									<TableRow key={client.id}>
										<TableCell className="font-medium">
											{client.id}
										</TableCell>
										<TableCell className="font-medium">
											{client.name}
										</TableCell>
										<TableCell>
											<div className="space-y-1">
												<div className="flex items-center text-sm">
													<Mail className="mr-1 h-3 w-3" />
													{client.email}
												</div>
												<div className="flex items-center text-sm text-muted-foreground">
													<Phone className="mr-1 h-3 w-3" />
													{client.phone}
												</div>
											</div>
										</TableCell>
										<TableCell>{client.company}</TableCell>
										<TableCell>{client.totalInvoices}</TableCell>
										<TableCell>${client.totalAmount.toLocaleString()}</TableCell>
										<TableCell>
											<Badge variant={getStatusBadgeVariant(client.status)}>
												{client.status}
											</Badge>
										</TableCell>
										<TableCell>{client.lastInvoice}</TableCell>
										<TableCell className="text-right">
											<Button variant="ghost" size="icon">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
