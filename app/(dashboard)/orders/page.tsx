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
	ShoppingCart,
	Search,
	Filter,
	MoreHorizontal,
	TrendingUp,
	TrendingDown,
	DollarSign,
	Package,
	Clock,
	CheckCircle,
	XCircle,
	AlertTriangle,
	Receipt,
	Loader2
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Order {
	id: string;
	orderNumber: string;
	customerId?: string;
	status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
	priority?: "low" | "normal" | "high" | "urgent";
	totalAmount: string;
	products: any;
	orderDate: string;
	dueDate?: string;
	trackingNumber?: string;
	createdAt: string;
}

export default function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [analytics, setAnalytics] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	// Fetch orders
	const fetchOrders = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams();
			if (searchQuery) params.append("search", searchQuery);
			if (statusFilter !== "all") params.append("status", statusFilter);

			const response = await fetch(`/api/orders?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch orders");
			const data = await response.json();
			setOrders(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Error fetching orders:", error);
			toast.error("Failed to load orders");
		} finally {
			setLoading(false);
		}
	};

	// Fetch analytics
	const fetchAnalytics = async () => {
		try {
			const response = await fetch("/api/orders/analytics");
			if (!response.ok) throw new Error("Failed to fetch analytics");
			const data = await response.json();
			setAnalytics(data);
		} catch (error) {
			console.error("Error fetching analytics:", error);
		}
	};

	useEffect(() => {
		fetchOrders();
		fetchAnalytics();
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			fetchOrders();
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery, statusFilter]);

	const recentOrders = orders
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, 10);

	const orderStats = [
		{
			name: "Total Orders",
			value: analytics?.total?.toString() || "0",
			change: "+15%",
			changeType: "positive" as const,
			icon: ShoppingCart,
		},
		{
			name: "Revenue",
			value: `$${analytics?.totalRevenue?.toLocaleString() || "0"}`,
			change: "+23%",
			changeType: "positive" as const,
			icon: DollarSign,
		},
		{
			name: "Pending Orders",
			value: analytics?.pending?.toString() || "0",
			change: "-12%",
			changeType: "positive" as const,
			icon: Clock,
		},
		{
			name: "Avg Order Value",
			value: analytics?.totalRevenue && analytics?.total
				? `$${Math.round(analytics.totalRevenue / Math.max(analytics.total, 1)).toLocaleString()}`
				: "$0",
			change: "+8%",
			changeType: "positive" as const,
			icon: TrendingUp,
		},
	];

	// Calculate status breakdown
	const statusBreakdown = analytics?.statusBreakdown || [];

	if (loading && orders.length === 0) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	// Map status breakdown to display format
	const orderStatuses = statusBreakdown.map((stat: any) => {
		const colors: Record<string, string> = {
			pending: "bg-yellow-500",
			processing: "bg-blue-500",
			shipped: "bg-green-500",
			delivered: "bg-purple-500",
			cancelled: "bg-red-500",
			refunded: "bg-gray-500",
		};
		return {
			name: stat.status.charAt(0).toUpperCase() + stat.status.slice(1),
			count: stat.count || 0,
			value: parseFloat(stat.total || "0"),
			color: colors[stat.status] || "bg-gray-500",
		};
	});

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
					<p className="text-muted-foreground">
						Manage sales orders, track fulfillment, and monitor performance
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Filter className="h-4 w-4 mr-2" />
						Filter
					</Button>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						New Order
					</Button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-4">
				{orderStats.map((stat, index) => (
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

			{/* Order Status Overview */}
			<Card>
				<CardHeader>
					<CardTitle>Order Status Overview</CardTitle>
					<CardDescription>
						Current status distribution of all orders
					</CardDescription>
				</CardHeader>
				<CardContent>
					{orderStatuses.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<p>No order status data available</p>
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-5">
							{orderStatuses.map((status, index) => (
								<div key={status.name} className="space-y-2">
									<div className="flex items-center gap-2">
										<div className={`w-3 h-3 rounded-full ${status.color}`} />
										<h4 className="font-medium">{status.name}</h4>
									</div>
									<div className="space-y-1">
										<p className="text-2xl font-bold">{status.count}</p>
										<p className="text-sm text-muted-foreground">
											${status.value.toLocaleString()}
										</p>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Order Alerts */}
			{orderAlerts.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							Order Alerts
						</CardTitle>
						<CardDescription>
							Important order notifications and actions needed
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{orderAlerts.map((alert, index) => (
							<div key={index} className="flex items-center justify-between p-3 rounded-lg border">
								<div className="flex items-center gap-3">
									<AlertTriangle className="h-4 w-4 text-yellow-500" />
									<div>
										<span className="text-sm font-medium">Order {alert.order}</span>
										<p className="text-sm text-muted-foreground">{alert.message}</p>
									</div>
								</div>
								<Button variant="outline" size="sm">
									{alert.action}
								</Button>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Order Management */}
			<Tabs defaultValue="recent" className="space-y-4">
				<TabsList>
					<TabsTrigger value="recent">Recent Orders</TabsTrigger>
					<TabsTrigger value="all">All Orders</TabsTrigger>
					<TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
				</TabsList>

				<TabsContent value="recent" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Recent Orders</CardTitle>
							<CardDescription>
								Latest orders and their current status
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recentOrders.map((order, index) => (
									<div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{order.customer}</h4>
												<Badge variant="outline">{order.id}</Badge>
												<Badge variant={
													order.status === 'delivered' ? 'default' :
													order.status === 'shipped' ? 'secondary' :
													order.status === 'processing' ? 'secondary' :
													order.status === 'pending' ? 'outline' :
													'destructive'
												}>
													{order.status}
												</Badge>
												{order.priority === 'high' && (
													<Badge variant="destructive">High Priority</Badge>
												)}
											</div>
											<p className="text-sm text-muted-foreground">
												{order.products.join(', ')} • {order.date}
											</p>
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<span>Due: {order.dueDate}</span>
												{order.tracking && <span>Track: {order.tracking}</span>}
											</div>
										</div>
										<div className="text-right space-y-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">${order.amount.toLocaleString()}</span>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => toast.info(`More options for order ${order.orderNumber}`)}
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</div>
											<div className="flex items-center gap-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => toast.info(`Generating invoice for order ${order.orderNumber}`)}
												>
													<Receipt className="h-3 w-3 mr-1" />
													Invoice
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => toast.info(`Tracking order ${order.orderNumber}`)}
												>
													<Package className="h-3 w-3 mr-1" />
													Track
												</Button>
											</div>
										</div>
									</div>
								))}
								<Separator />
								<Button
									variant="outline"
									className="w-full"
									onClick={() => {
										setStatusFilter('all');
										toast.info('Showing all orders');
									}}
								>
									<Search className="h-4 w-4 mr-2" />
									View All Orders
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="all" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>All Orders</CardTitle>
							<CardDescription>
								Complete order history with search and filtering
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{/* Search and filter controls */}
								<div className="flex items-center gap-4">
									<div className="relative flex-1">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Search orders..."
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
										<option value="pending">Pending</option>
										<option value="processing">Processing</option>
										<option value="shipped">Shipped</option>
										<option value="delivered">Delivered</option>
										<option value="cancelled">Cancelled</option>
										<option value="refunded">Refunded</option>
									</select>
								</div>

								{/* Orders list */}
								{loading ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
									</div>
								) : orders.length === 0 ? (
									<div className="text-center py-8 text-muted-foreground">
										<p>No orders found</p>
									</div>
								) : (
									<div className="space-y-2">
										{orders.map((order) => {
											const totalAmount = parseFloat(order.totalAmount || "0");
											return (
												<div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
													<div className="space-y-1">
														<div className="flex items-center gap-2">
															<h4 className="font-medium">{order.orderNumber}</h4>
															<Badge
																variant={
																	order.status === "pending"
																		? "secondary"
																		: order.status === "processing" || order.status === "shipped" || order.status === "delivered"
																			? "default"
																			: "destructive"
																}
															>
																{order.status}
															</Badge>
														</div>
														<p className="text-sm text-muted-foreground">
															{new Date(order.orderDate).toLocaleDateString()}
														</p>
													</div>
													<div className="flex items-center gap-2">
														<span className="font-medium">${totalAmount.toLocaleString()}</span>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toast.info('Viewing order details')}
														>
															View
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toast.info('Editing order information')}
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

				<TabsContent value="fulfillment" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Order Fulfillment</CardTitle>
							<CardDescription>
								Manage order fulfillment and shipping
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-3">
									<div className="space-y-2">
										<h4 className="font-medium">Fulfillment Rate</h4>
										<p className="text-2xl font-bold">94.2%</p>
										<p className="text-sm text-muted-foreground">On-time delivery</p>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Avg Processing Time</h4>
										<p className="text-2xl font-bold">2.3 days</p>
										<p className="text-sm text-muted-foreground">Order to shipment</p>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Shipping Partners</h4>
										<p className="text-2xl font-bold">5</p>
										<p className="text-sm text-muted-foreground">Active carriers</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Order Trends</CardTitle>
								<CardDescription>
									Order volume and value trends over time
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm">This Month</span>
										<span className="font-medium">$89,450</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Last Month</span>
										<span className="font-medium">$72,800</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Growth Rate</span>
										<span className="font-medium text-green-600">+23%</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Top Products</CardTitle>
								<CardDescription>
									Best-selling products by order volume
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2 text-sm">
									<div className="flex items-center justify-between">
										<span>Financbase Pro</span>
										<span className="font-medium">342 orders</span>
									</div>
									<div className="flex items-center justify-between">
										<span>Consulting Package</span>
										<span className="font-medium">89 orders</span>
									</div>
									<div className="flex items-center justify-between">
										<span>Mobile App SDK</span>
										<span className="font-medium">67 orders</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
