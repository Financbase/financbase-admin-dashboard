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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
	Plus,
	Users,
	Search,
	Filter,
	MoreHorizontal,
	Phone,
	Mail,
	Calendar,
	TrendingUp,
	TrendingDown,
	Star,
	Building,
	MapPin,
	Loader2
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { logger } from '@/lib/logger';

interface Customer {
	id: number;
	name: string;
	email: string;
	phone?: string;
	company?: string;
	address?: string;
	city?: string;
	state?: string;
	status: "active" | "inactive" | "suspended";
	totalInvoiced?: string;
	totalPaid?: string;
	outstandingBalance?: string;
	tags?: any;
	createdAt: string;
}

interface CustomerSegment {
	id: string;
	name: string;
	description?: string;
	count: number;
}

interface CustomerAnalytics {
	totalCustomers: number;
	activeCustomers: number;
	inactiveCustomers: number;
	suspendedCustomers: number;
	totalInvoiced: number;
	totalPaid: number;
	outstandingBalance: number;
	averageOrderValue: number;
	customerLifetimeValue: number;
}

export default function CustomersPage() {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [segments, setSegments] = useState<CustomerSegment[]>([]);
	const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	// Fetch customers
	const fetchCustomers = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams();
			if (searchQuery) params.append("search", searchQuery);
			if (statusFilter !== "all") params.append("status", statusFilter);

			const response = await fetch(`/api/customers?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch customers");
			const data = await response.json();
			setCustomers(Array.isArray(data) ? data : []);
		} catch (error) {
			logger.error("Error fetching customers:", error);
			toast.error("Failed to load customers");
		} finally {
			setLoading(false);
		}
	};

	// Fetch segments
	const fetchSegments = async () => {
		try {
			const response = await fetch("/api/customers/segments");
			if (!response.ok) throw new Error("Failed to fetch segments");
			const data = await response.json();
			setSegments(Array.isArray(data) ? data : []);
		} catch (error) {
			logger.error("Error fetching segments:", error);
		}
	};

	// Fetch analytics
	const fetchAnalytics = async () => {
		try {
			const response = await fetch("/api/customers/analytics");
			if (!response.ok) throw new Error("Failed to fetch analytics");
			const data = await response.json();
			setAnalytics(data);
		} catch (error) {
			logger.error("Error fetching analytics:", error);
		}
	};

	useEffect(() => {
		fetchCustomers();
		fetchSegments();
		fetchAnalytics();
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			fetchCustomers();
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery, statusFilter]);

	const recentCustomers = customers
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, 10);

	const customerStats = [
		{
			name: "Total Customers",
			value: analytics?.totalCustomers.toString() || "0",
			change: "+12%",
			changeType: "positive" as const,
			icon: Users,
		},
		{
			name: "Active Customers",
			value: analytics?.activeCustomers.toString() || "0",
			change: "+8%",
			changeType: "positive" as const,
			icon: Star,
		},
		{
			name: "Total Revenue",
			value: `$${analytics?.totalInvoiced.toLocaleString() || "0"}`,
			change: "+23%",
			changeType: "positive" as const,
			icon: TrendingUp,
		},
		{
			name: "Outstanding Balance",
			value: `$${analytics?.outstandingBalance.toLocaleString() || "0"}`,
			change: "-0.8%",
			changeType: "positive" as const,
			icon: TrendingDown,
		},
	];

	if (loading && customers.length === 0) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
					<p className="text-muted-foreground">
						Manage customer relationships, track interactions, and grow your business
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Filter className="h-4 w-4 mr-2" />
						Filter
					</Button>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Add Customer
					</Button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-4">
				{customerStats.map((stat, index) => (
					<Card key={stat.name}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
							<stat.icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
								{stat.change} from last month
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Customer Segments */}
			<Card>
				<CardHeader>
					<CardTitle>Customer Segments</CardTitle>
					<CardDescription>
						Overview of your customer base by segment
					</CardDescription>
				</CardHeader>
						<CardContent>
							{segments.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<p>No segments defined yet</p>
								</div>
							) : (
								<div className="grid gap-4 md:grid-cols-4">
									{segments.slice(0, 4).map((segment, index) => {
										const colors = ["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-orange-500"];
										return (
											<div key={segment.id} className="space-y-2">
												<div className="flex items-center gap-2">
													<div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
													<h4 className="font-medium">{segment.name}</h4>
												</div>
												<div className="space-y-1">
													<p className="text-2xl font-bold">{segment.count}</p>
													{segment.description && (
														<p className="text-sm text-muted-foreground">{segment.description}</p>
													)}
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
			</Card>

			{/* Customer Management */}
			<Tabs defaultValue="recent" className="space-y-4">
				<TabsList>
					<TabsTrigger value="recent">Recent Customers</TabsTrigger>
					<TabsTrigger value="all">All Customers</TabsTrigger>
					<TabsTrigger value="segments">Segments</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
				</TabsList>

				<TabsContent value="recent" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Recent Customers</CardTitle>
							<CardDescription>
								Recently active customers and new additions
							</CardDescription>
						</CardHeader>
						<CardContent>
							{recentCustomers.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<p>No customers yet</p>
									<p className="text-sm mt-2">Create your first customer to get started</p>
								</div>
							) : (
								<div className="space-y-4">
									{recentCustomers.map((customer) => {
										const tags = typeof customer.tags === "string" ? JSON.parse(customer.tags || "[]") : (customer.tags || []);
										const location = [customer.city, customer.state].filter(Boolean).join(", ");
										const outstandingBalance = parseFloat(customer.outstandingBalance || "0");

										return (
											<div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
												<div className="space-y-1 flex-1">
													<div className="flex items-center gap-2">
														<h4 className="font-medium">{customer.name}</h4>
														{customer.company && (
															<Badge variant="outline">{customer.company}</Badge>
														)}
														<Badge
															variant={
																customer.status === "active"
																	? "default"
																	: customer.status === "inactive"
																		? "secondary"
																		: "destructive"
															}
														>
															{customer.status}
														</Badge>
													</div>
													<div className="flex items-center gap-4 text-sm text-muted-foreground">
														<div className="flex items-center gap-1">
															<Mail className="h-3 w-3" />
															{customer.email}
														</div>
														{customer.phone && (
															<div className="flex items-center gap-1">
																<Phone className="h-3 w-3" />
																{customer.phone}
															</div>
														)}
														{location && (
															<div className="flex items-center gap-1">
																<MapPin className="h-3 w-3" />
																{location}
															</div>
														)}
													</div>
													{tags.length > 0 && (
														<div className="flex items-center gap-2">
															{tags.slice(0, 3).map((tag: string, tagIndex: number) => (
																<Badge key={tagIndex} variant="outline" className="text-xs">
																	{tag}
																</Badge>
															))}
														</div>
													)}
												</div>
												<div className="text-right space-y-1">
													<div className="flex items-center gap-2">
														<span className="font-medium">
															${outstandingBalance.toLocaleString()}
														</span>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</div>
													<div className="text-sm text-muted-foreground">
														Added {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true })}
													</div>
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toast.info('Viewing customer details')}
														>
															View
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toast.info('Editing customer information')}
														>
															Edit
														</Button>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="all" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>All Customers</CardTitle>
							<CardDescription>
								Complete customer database with search and filtering
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{/* Search and filter controls */}
								<div className="flex items-center gap-4">
									<div className="relative flex-1">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Search customers..."
											className="pl-10"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</div>
									<select
										className="px-3 py-2 border rounded-lg text-sm"
										value={statusFilter}
										onChange={(e) => setStatusFilter(e.target.value)}
									>
										<option value="all">All Status</option>
										<option value="active">Active</option>
										<option value="inactive">Inactive</option>
										<option value="suspended">Suspended</option>
									</select>
								</div>

								{/* Customer list */}
								{loading ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
									</div>
								) : customers.length === 0 ? (
									<div className="text-center py-8 text-muted-foreground">
										<p>No customers found</p>
									</div>
								) : (
									<div className="space-y-2">
										{customers.map((customer) => {
											const tags = typeof customer.tags === "string" ? JSON.parse(customer.tags || "[]") : (customer.tags || []);
											return (
												<div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
													<div className="space-y-1">
														<div className="flex items-center gap-2">
															<h4 className="font-medium">{customer.name}</h4>
															<Badge
																variant={
																	customer.status === "active"
																		? "default"
																		: customer.status === "inactive"
																			? "secondary"
																			: "destructive"
																}
															>
																{customer.status}
															</Badge>
														</div>
														<p className="text-sm text-muted-foreground">{customer.email}</p>
													</div>
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toast.info('Viewing customer details')}
														>
															View
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toast.info('Editing customer information')}
														>
															Edit
														</Button>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="segments" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Customer Segments</CardTitle>
							<CardDescription>
								Manage customer segments and targeting
							</CardDescription>
						</CardHeader>
						<CardContent>
							{segments.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<p>No segments defined yet</p>
								</div>
							) : (
								<div className="space-y-4">
									{segments.map((segment, index) => {
										const colors = ["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-orange-500"];
										return (
											<div key={segment.id} className="flex items-center justify-between p-4 border rounded-lg">
												<div className="flex items-center gap-3">
													<div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`} />
													<div>
														<h4 className="font-medium">{segment.name}</h4>
														<p className="text-sm text-muted-foreground">
															{segment.count} customers
															{segment.description && ` • ${segment.description}`}
														</p>
													</div>
												</div>
												<div className="flex items-center gap-2">
													<Button variant="outline" size="sm">
														View Customers
													</Button>
													<Button variant="outline" size="sm">
														Edit Segment
													</Button>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Customer Lifetime Value</CardTitle>
								<CardDescription>
									Average customer lifetime value by segment
								</CardDescription>
							</CardHeader>
							<CardContent>
								{analytics ? (
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<span className="text-sm">Average Order Value</span>
											<span className="font-medium">
												${analytics.averageOrderValue.toLocaleString()}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm">Customer Lifetime Value</span>
											<span className="font-medium">
												${analytics.customerLifetimeValue.toLocaleString()}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm">Total Invoiced</span>
											<span className="font-medium">
												${analytics.totalInvoiced.toLocaleString()}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm">Total Paid</span>
											<span className="font-medium">
												${analytics.totalPaid.toLocaleString()}
											</span>
										</div>
									</div>
								) : (
									<div className="text-center py-4 text-muted-foreground">
										<p>Loading analytics...</p>
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Customer Status</CardTitle>
								<CardDescription>
									Customer distribution by status
								</CardDescription>
							</CardHeader>
							<CardContent>
								{analytics ? (
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<span className="text-sm">Active Customers</span>
											<span className="font-medium">{analytics.activeCustomers}</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm">Inactive Customers</span>
											<span className="font-medium">{analytics.inactiveCustomers}</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm">Suspended Customers</span>
											<span className="font-medium">{analytics.suspendedCustomers}</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm">Total Customers</span>
											<span className="font-medium">{analytics.totalCustomers}</span>
										</div>
									</div>
								) : (
									<div className="text-center py-4 text-muted-foreground">
										<p>Loading analytics...</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
