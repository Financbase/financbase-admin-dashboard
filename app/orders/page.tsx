import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
	Receipt
} from "lucide-react";

export const metadata: Metadata = {
	title: "Order Management | Financbase",
	description: "Manage sales orders, track fulfillment, and monitor order performance",
};

const orderStats = [
	{
		name: "Total Orders",
		value: "1,847",
		change: "+15%",
		changeType: "positive",
		icon: ShoppingCart,
	},
	{
		name: "Revenue",
		value: "$89,450",
		change: "+23%",
		changeType: "positive",
		icon: DollarSign,
	},
	{
		name: "Pending Orders",
		value: "23",
		change: "-12%",
		changeType: "positive",
		icon: Clock,
	},
	{
		name: "Avg Order Value",
		value: "$485",
		change: "+8%",
		changeType: "positive",
		icon: TrendingUp,
	},
];

const orderStatuses = [
	{
		name: "Pending",
		count: 23,
		value: 11200,
		color: "bg-yellow-500",
	},
	{
		name: "Processing",
		count: 45,
		value: 21800,
		color: "bg-blue-500",
	},
	{
		name: "Shipped",
		count: 67,
		value: 32500,
		color: "bg-green-500",
	},
	{
		name: "Delivered",
		count: 89,
		value: 43200,
		color: "bg-purple-500",
	},
	{
		name: "Cancelled",
		count: 12,
		value: 5800,
		color: "bg-red-500",
	},
];

const recentOrders = [
	{
		id: "ORD-001",
		customer: "Acme Corporation",
		products: ["Financbase Pro", "Consulting Package"],
		amount: 2599,
		status: "processing",
		date: "2025-01-20",
		dueDate: "2025-01-25",
		priority: "high",
		tracking: "TRK-789123",
	},
	{
		id: "ORD-002",
		customer: "TechStart Inc",
		products: ["Mobile App SDK"],
		amount: 299,
		status: "shipped",
		date: "2025-01-19",
		dueDate: "2025-01-22",
		priority: "normal",
		tracking: "TRK-456789",
	},
	{
		id: "ORD-003",
		customer: "Global Solutions LLC",
		products: ["Cloud Infrastructure"],
		amount: 1500,
		status: "pending",
		date: "2025-01-18",
		dueDate: "2025-01-28",
		priority: "low",
		tracking: null,
	},
	{
		id: "ORD-004",
		customer: "Creative Agency",
		products: ["Software License", "Support Package"],
		amount: 1299,
		status: "delivered",
		date: "2025-01-15",
		dueDate: "2025-01-18",
		priority: "normal",
		tracking: "TRK-123456",
	},
];

const orderAlerts = [
	{
		type: "warning",
		order: "ORD-001",
		message: "High priority order due in 2 days",
		action: "Expedite",
	},
	{
		type: "info",
		order: "ORD-003",
		message: "Payment pending for order",
		action: "Send Reminder",
	},
];

export default function OrdersPage() {
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
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</div>
											<div className="flex items-center gap-2">
												<Button variant="ghost" size="sm">
													<Receipt className="h-3 w-3 mr-1" />
													Invoice
												</Button>
												<Button variant="ghost" size="sm">
													<Package className="h-3 w-3 mr-1" />
													Track
												</Button>
											</div>
										</div>
									</div>
								))}
								<Separator />
								<Button variant="outline" className="w-full">
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
									<Button variant="outline" className="flex-1 justify-start">
										<Search className="h-4 w-4 mr-2" />
										Search orders...
									</Button>
									<Button variant="outline">
										<Filter className="h-4 w-4 mr-2" />
										Filter
									</Button>
								</div>

								{/* Orders table placeholder */}
								<div className="text-center py-8 text-muted-foreground">
									<p>Orders table with advanced search, filtering, sorting, and export capabilities would be implemented here</p>
								</div>
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
