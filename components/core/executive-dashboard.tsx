import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Activity,
	AlertCircle,
	AlertTriangle,
	ArrowDown,
	ArrowUp,
	BarChart3,
	Briefcase,
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	FileText,
	Info,
	Mail,
	ShoppingCart,
	Target,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface DashboardMetrics {
	totalRevenue: number;
	revenueChange: number;
	totalUsers: number;
	usersChange: number;
	totalOrders: number;
	ordersChange: number;
	conversionRate: number;
	avgOrderValue: number;
	topProducts: Array<{ name: string; sales: number; revenue: number }>;
	userGrowth: Array<{ month: string; users: number; newUsers: number }>;
	revenueByCategory: Array<{
		category: string;
		revenue: number;
		percentage: number;
	}>;
	recentActivity: Array<{
		id: string;
		type: string;
		description: string;
		timestamp: string;
		status: string;
	}>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function ExecutiveDashboard() {
	// Mock data - replace with real API calls
	const metrics: DashboardMetrics = {
		totalRevenue: 125000,
		revenueChange: 12.5,
		totalUsers: 15420,
		usersChange: 8.2,
		totalOrders: 3420,
		ordersChange: -2.1,
		conversionRate: 3.4,
		avgOrderValue: 89.5,
		topProducts: [
			{ name: "Premium Plan", sales: 450, revenue: 45000 },
			{ name: "Basic Plan", sales: 320, revenue: 19200 },
			{ name: "Enterprise Plan", sales: 180, revenue: 36000 },
			{ name: "Add-on Services", sales: 890, revenue: 26700 },
		],
		userGrowth: [
			{ month: "Jan", users: 12000, newUsers: 800 },
			{ month: "Feb", users: 12800, newUsers: 950 },
			{ month: "Mar", users: 13900, newUsers: 1100 },
			{ month: "Apr", users: 14500, newUsers: 600 },
			{ month: "May", users: 15420, newUsers: 920 },
		],
		revenueByCategory: [
			{ category: "Subscriptions", revenue: 85000, percentage: 68 },
			{ category: "One-time", revenue: 25000, percentage: 20 },
			{ category: "Services", revenue: 15000, percentage: 12 },
		],
		recentActivity: [
			{
				id: "1",
				type: "order",
				description: "New purchase order approved",
				timestamp: "2 minutes ago",
				status: "success",
			},
			{
				id: "2",
				type: "user",
				description: "New user registration",
				timestamp: "5 minutes ago",
				status: "info",
			},
			{
				id: "3",
				type: "system",
				description: "Database backup completed",
				timestamp: "1 hour ago",
				status: "success",
			},
			{
				id: "4",
				type: "alert",
				description: "High memory usage detected",
				timestamp: "2 hours ago",
				status: "warning",
			},
		],
	};

	const MetricCard = ({
		title,
		value,
		change,
		icon: Icon,
		trend,
	}: {
		title: string;
		value: string | number;
		change?: number;
		icon: any;
		trend?: "up" | "down";
	}) => (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				{change !== undefined && (
					<div className="flex items-center text-xs text-muted-foreground">
						{trend === "up" ? (
							<TrendingUp className="mr-1 h-3 w-3 text-green-500" />
						) : trend === "down" ? (
							<TrendingDown className="mr-1 h-3 w-3 text-red-500" />
						) : null}
						<span
							className={
								trend === "up"
									? "text-green-500"
									: trend === "down"
										? "text-red-500"
										: ""
							}
						>
							{Math.abs(change)}% from last month
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">
						Executive Dashboard
					</h2>
					<p className="text-muted-foreground">
						Real-time overview of your CMS performance and business metrics
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<Button variant="outline" size="sm">
						<Calendar className="mr-2 h-4 w-4" />
						Last 30 Days
					</Button>
					<Button size="sm">Export Report</Button>
				</div>
			</div>

			{/* Key Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					title="Total Revenue"
					value={`$${metrics.totalRevenue.toLocaleString()}`}
					change={metrics.revenueChange}
					icon={DollarSign}
					trend="up"
				/>
				<MetricCard
					title="Total Users"
					value={metrics.totalUsers.toLocaleString()}
					change={metrics.usersChange}
					icon={Users}
					trend="up"
				/>
				<MetricCard
					title="Total Orders"
					value={metrics.totalOrders.toLocaleString()}
					change={metrics.ordersChange}
					icon={ShoppingCart}
					trend="down"
				/>
				<MetricCard
					title="Conversion Rate"
					value={`${metrics.conversionRate}%`}
					icon={Target}
				/>
			</div>

			{/* Charts Section */}
			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
					<TabsTrigger value="activity">Recent Activity</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
						{/* Revenue Trend */}
						<Card className="col-span-4">
							<CardHeader>
								<CardTitle>Revenue Trend</CardTitle>
								<CardDescription>
									Monthly revenue growth over time
								</CardDescription>
							</CardHeader>
							<CardContent className="pl-2">
								<ResponsiveContainer width="100%" height={350}>
									<AreaChart data={metrics.userGrowth}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="month" />
										<YAxis />
										<Tooltip />
										<Area
											type="monotone"
											dataKey="users"
											stroke="#8884d8"
											fill="#8884d8"
											fillOpacity={0.3}
										/>
									</AreaChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>

						{/* Revenue by Category */}
						<Card className="col-span-3">
							<CardHeader>
								<CardTitle>Revenue by Category</CardTitle>
								<CardDescription>
									Distribution of revenue sources
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ResponsiveContainer width="100%" height={350}>
									<PieChart>
										<Pie
											data={metrics.revenueByCategory}
											cx="50%"
											cy="50%"
											labelLine={false}
											label={({ category, percentage }) =>
												`${category}: ${percentage}%`
											}
											outerRadius={80}
											fill="#8884d8"
											dataKey="revenue"
										>
											{metrics.revenueByCategory.map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={COLORS[index % COLORS.length]}
												/>
											))}
										</Pie>
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</div>

					{/* Top Products */}
					<Card>
						<CardHeader>
							<CardTitle>Top Performing Products</CardTitle>
							<CardDescription>
								Best-selling products and services
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{metrics.topProducts.map((product, index) => (
									<div
										key={product.name}
										className="flex items-center space-x-4"
									>
										<div className="flex-1 space-y-1">
											<div className="flex items-center justify-between">
												<p className="text-sm font-medium leading-none">
													{product.name}
												</p>
												<p className="text-sm text-muted-foreground">
													{product.sales} sales
												</p>
											</div>
											<div className="flex items-center space-x-2">
												<Progress
													value={
														(product.revenue /
															Math.max(
																...metrics.topProducts.map((p) => p.revenue),
															)) *
														100
													}
													className="flex-1"
												/>
												<p className="text-sm font-medium">
													${product.revenue.toLocaleString()}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>User Growth Trend</CardTitle>
								<CardDescription>
									New user registrations over time
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ResponsiveContainer width="100%" height={300}>
									<LineChart data={metrics.userGrowth}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="month" />
										<YAxis />
										<Tooltip />
										<Legend />
										<Line
											type="monotone"
											dataKey="newUsers"
											stroke="#8884d8"
											strokeWidth={2}
											name="New Users"
										/>
									</LineChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Conversion Funnel</CardTitle>
								<CardDescription>User journey conversion rates</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Visitors</span>
										<span>10,000</span>
									</div>
									<Progress value={100} className="h-2" />
								</div>
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Sign-ups</span>
										<span>3,400</span>
									</div>
									<Progress value={34} className="h-2" />
								</div>
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Purchases</span>
										<span>340</span>
									</div>
									<Progress value={10} className="h-2" />
								</div>
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Retention</span>
										<span>85%</span>
									</div>
									<Progress value={85} className="h-2" />
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="activity" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
							<CardDescription>
								Latest system and user activities
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{metrics.recentActivity.map((activity) => (
									<div
										key={activity.id}
										className="flex items-center space-x-4"
									>
										<div className="flex-shrink-0">
											{activity.status === "success" && (
												<CheckCircle className="h-5 w-5 text-green-500" />
											)}
											{activity.status === "warning" && (
												<AlertCircle className="h-5 w-5 text-yellow-500" />
											)}
											{activity.status === "info" && (
												<Activity className="h-5 w-5 text-blue-500" />
											)}
										</div>
										<div className="flex-1 space-y-1">
											<p className="text-sm font-medium leading-none">
												{activity.description}
											</p>
											<p className="text-sm text-muted-foreground">
												{activity.timestamp}
											</p>
										</div>
										<Badge
											variant={
												activity.status === "success"
													? "default"
													: activity.status === "warning"
														? "destructive"
														: "secondary"
											}
										>
											{activity.type}
										</Badge>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
