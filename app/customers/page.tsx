import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
	MapPin
} from "lucide-react";

export const metadata: Metadata = {
	title: "Customer Management | Financbase",
	description: "Manage your customer relationships, track interactions, and grow your business",
};

const customerStats = [
	{
		name: "Total Customers",
		value: "1,247",
		change: "+12%",
		changeType: "positive",
		icon: Users,
	},
	{
		name: "Active Customers",
		value: "892",
		change: "+8%",
		changeType: "positive",
		icon: Star,
	},
	{
		name: "Monthly Revenue",
		value: "$45,320",
		change: "+23%",
		changeType: "positive",
		icon: TrendingUp,
	},
	{
		name: "Churn Rate",
		value: "2.4%",
		change: "-0.8%",
		changeType: "positive",
		icon: TrendingDown,
	},
];

const recentCustomers = [
	{
		id: "CUST-001",
		name: "Acme Corporation",
		contact: "John Smith",
		email: "john@acme.com",
		phone: "+1 (555) 123-4567",
		location: "New York, NY",
		status: "active",
		value: 12500,
		lastInteraction: "2025-01-15",
		nextMeeting: "2025-01-25",
		tags: ["enterprise", "high-value"],
	},
	{
		id: "CUST-002",
		name: "TechStart Inc",
		contact: "Sarah Johnson",
		email: "sarah@techstart.com",
		phone: "+1 (555) 987-6543",
		location: "San Francisco, CA",
		status: "active",
		value: 8500,
		lastInteraction: "2025-01-12",
		nextMeeting: null,
		tags: ["startup", "growing"],
	},
	{
		id: "CUST-003",
		name: "Global Solutions LLC",
		contact: "Mike Wilson",
		email: "mike@globalsolutions.com",
		phone: "+1 (555) 456-7890",
		location: "Chicago, IL",
		status: "inactive",
		value: 3200,
		lastInteraction: "2024-11-20",
		nextMeeting: null,
		tags: ["inactive", "follow-up"],
	},
	{
		id: "CUST-004",
		name: "Creative Agency",
		contact: "Lisa Chen",
		email: "lisa@creativeagency.com",
		phone: "+1 (555) 321-0987",
		location: "Los Angeles, CA",
		status: "active",
		value: 6800,
		lastInteraction: "2025-01-18",
		nextMeeting: "2025-01-28",
		tags: ["agency", "creative"],
	},
];

const customerSegments = [
	{
		name: "Enterprise",
		count: 45,
		avgValue: 25000,
		color: "bg-purple-500",
	},
	{
		name: "Mid-Market",
		count: 156,
		avgValue: 12000,
		color: "bg-blue-500",
	},
	{
		name: "Small Business",
		count: 342,
		avgValue: 4500,
		color: "bg-green-500",
	},
	{
		name: "Startup",
		count: 89,
		avgValue: 2800,
		color: "bg-orange-500",
	},
];

export default function CustomersPage() {
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
					<div className="grid gap-4 md:grid-cols-4">
						{customerSegments.map((segment, index) => (
							<div key={segment.name} className="space-y-2">
								<div className="flex items-center gap-2">
									<div className={`w-3 h-3 rounded-full ${segment.color}`} />
									<h4 className="font-medium">{segment.name}</h4>
								</div>
								<div className="space-y-1">
									<p className="text-2xl font-bold">{segment.count}</p>
									<p className="text-sm text-muted-foreground">
										Avg: ${segment.avgValue.toLocaleString()}
									</p>
								</div>
							</div>
						))}
					</div>
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
							<div className="space-y-4">
								{recentCustomers.map((customer, index) => (
									<div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{customer.name}</h4>
												<Badge variant="outline">{customer.contact}</Badge>
												<Badge variant={
													customer.status === 'active' ? 'default' :
													customer.status === 'inactive' ? 'secondary' :
													'destructive'
												}>
													{customer.status}
												</Badge>
											</div>
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<div className="flex items-center gap-1">
													<Mail className="h-3 w-3" />
													{customer.email}
												</div>
												<div className="flex items-center gap-1">
													<Phone className="h-3 w-3" />
													{customer.phone}
												</div>
												<div className="flex items-center gap-1">
													<MapPin className="h-3 w-3" />
													{customer.location}
												</div>
											</div>
											<div className="flex items-center gap-2">
												{customer.tags.map((tag, tagIndex) => (
													<Badge key={tagIndex} variant="outline" className="text-xs">
														{tag}
													</Badge>
												))}
											</div>
										</div>
										<div className="text-right space-y-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">${customer.value.toLocaleString()}</span>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</div>
											<div className="text-sm text-muted-foreground">
												Last: {customer.lastInteraction}
											</div>
											{customer.nextMeeting && (
												<div className="text-sm text-blue-600">
													Next: {customer.nextMeeting}
												</div>
											)}
											<div className="flex items-center gap-2">
												<Button variant="ghost" size="sm">View</Button>
												<Button variant="ghost" size="sm">Edit</Button>
											</div>
										</div>
									</div>
								))}
								<Separator />
								<Button variant="outline" className="w-full">
									<Search className="h-4 w-4 mr-2" />
									View All Customers
								</Button>
							</div>
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
									<Button variant="outline" className="flex-1 justify-start">
										<Search className="h-4 w-4 mr-2" />
										Search customers...
									</Button>
									<Button variant="outline">
										<Filter className="h-4 w-4 mr-2" />
										Filter
									</Button>
								</div>

								{/* Customer table placeholder */}
								<div className="text-center py-8 text-muted-foreground">
									<p>Customer table with advanced search, filtering, sorting, and export capabilities would be implemented here</p>
								</div>
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
							<div className="space-y-4">
								{customerSegments.map((segment, index) => (
									<div key={segment.name} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex items-center gap-3">
											<div className={`w-4 h-4 rounded-full ${segment.color}`} />
											<div>
												<h4 className="font-medium">{segment.name}</h4>
												<p className="text-sm text-muted-foreground">
													{segment.count} customers • Avg value: ${segment.avgValue.toLocaleString()}
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
								))}
								<Separator />
								<Button variant="outline" className="w-full">
									<Plus className="h-4 w-4 mr-2" />
									Create New Segment
								</Button>
							</div>
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
								<div className="space-y-2">
									{customerSegments.map((segment, index) => (
										<div key={segment.name} className="flex items-center justify-between">
											<span className="text-sm">{segment.name}</span>
											<span className="font-medium">${(segment.avgValue * 3).toLocaleString()}</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Customer Acquisition</CardTitle>
								<CardDescription>
									Customer acquisition metrics and trends
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm">Monthly Acquisition</span>
										<span className="font-medium">23 customers</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Cost per Acquisition</span>
										<span className="font-medium">$156</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Conversion Rate</span>
										<span className="font-medium">12.4%</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Retention Rate</span>
										<span className="font-medium">94.2%</span>
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
