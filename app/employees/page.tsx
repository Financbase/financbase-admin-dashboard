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
	TrendingUp,
	TrendingDown,
	UserCheck,
	Clock,
	Calendar,
	Mail,
	Phone,
	MapPin,
	Building
} from "lucide-react";

export const metadata: Metadata = {
	title: "Employee Management | Financbase",
	description: "Manage your team, track performance, and handle HR operations",
};

const employeeStats = [
	{
		name: "Total Employees",
		value: "47",
		change: "+3",
		changeType: "positive",
		icon: Users,
	},
	{
		name: "Active Employees",
		value: "45",
		change: "+2",
		changeType: "positive",
		icon: UserCheck,
	},
	{
		name: "Departments",
		value: "8",
		change: "0",
		changeType: "neutral",
		icon: Building,
	},
	{
		name: "Avg Tenure",
		value: "2.8 years",
		change: "+0.3",
		changeType: "positive",
		icon: Clock,
	},
];

const departments = [
	{
		name: "Engineering",
		count: 12,
		head: "Sarah Johnson",
		budget: 45000,
		color: "bg-blue-500",
	},
	{
		name: "Sales",
		count: 8,
		head: "Mike Wilson",
		budget: 28000,
		color: "bg-green-500",
	},
	{
		name: "Marketing",
		count: 6,
		head: "Lisa Chen",
		budget: 22000,
		color: "bg-purple-500",
	},
	{
		name: "Support",
		count: 9,
		head: "David Brown",
		budget: 18000,
		color: "bg-orange-500",
	},
	{
		name: "HR",
		count: 3,
		head: "Emma Davis",
		budget: 12000,
		color: "bg-pink-500",
	},
	{
		name: "Finance",
		count: 4,
		head: "Robert Lee",
		budget: 25000,
		color: "bg-teal-500",
	},
];

const recentEmployees = [
	{
		id: "EMP-001",
		name: "Alice Thompson",
		position: "Senior Developer",
		department: "Engineering",
		email: "alice@company.com",
		phone: "+1 (555) 123-4567",
		location: "San Francisco, CA",
		status: "active",
		startDate: "2023-03-15",
		salary: 95000,
		performance: "excellent",
	},
	{
		id: "EMP-002",
		name: "Bob Martinez",
		position: "Sales Manager",
		department: "Sales",
		email: "bob@company.com",
		phone: "+1 (555) 987-6543",
		location: "New York, NY",
		status: "active",
		startDate: "2022-08-20",
		salary: 78000,
		performance: "good",
	},
	{
		id: "EMP-003",
		name: "Carol White",
		position: "Marketing Specialist",
		department: "Marketing",
		email: "carol@company.com",
		phone: "+1 (555) 456-7890",
		location: "Los Angeles, CA",
		status: "active",
		startDate: "2024-01-10",
		salary: 55000,
		performance: "good",
	},
	{
		id: "EMP-004",
		name: "Daniel Green",
		position: "Support Engineer",
		department: "Support",
		email: "daniel@company.com",
		phone: "+1 (555) 321-0987",
		location: "Remote",
		status: "on_leave",
		startDate: "2021-11-05",
		salary: 62000,
		performance: "satisfactory",
	},
];

export default function EmployeesPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
					<p className="text-muted-foreground">
						Manage your team, track performance, and handle HR operations
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Filter className="h-4 w-4 mr-2" />
						Filter
					</Button>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Add Employee
					</Button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-4">
				{employeeStats.map((stat, index) => (
					<Card key={stat.name}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
							<stat.icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-muted-foreground'}`}>
								{stat.change} from last month
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Departments Overview */}
			<Card>
				<CardHeader>
					<CardTitle>Departments</CardTitle>
					<CardDescription>
						Overview of employees by department
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
						{departments.map((dept, index) => (
							<div key={dept.name} className="space-y-2">
								<div className="flex items-center gap-2">
									<div className={`w-3 h-3 rounded-full ${dept.color}`} />
									<h4 className="font-medium">{dept.name}</h4>
								</div>
								<div className="space-y-1">
									<p className="text-2xl font-bold">{dept.count}</p>
									<p className="text-sm text-muted-foreground">
										Head: {dept.head}
									</p>
									<p className="text-sm text-muted-foreground">
										${dept.budget.toLocaleString()}/month
									</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Employee Management */}
			<Tabs defaultValue="recent" className="space-y-4">
				<TabsList>
					<TabsTrigger value="recent">Recent Employees</TabsTrigger>
					<TabsTrigger value="all">All Employees</TabsTrigger>
					<TabsTrigger value="departments">Departments</TabsTrigger>
					<TabsTrigger value="performance">Performance</TabsTrigger>
				</TabsList>

				<TabsContent value="recent" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Recent Employees</CardTitle>
							<CardDescription>
								Recently hired and active employees
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recentEmployees.map((employee, index) => (
									<div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{employee.name}</h4>
												<Badge variant="outline">{employee.position}</Badge>
												<Badge variant={
													employee.status === 'active' ? 'default' :
													employee.status === 'on_leave' ? 'secondary' :
													'destructive'
												}>
													{employee.status.replace('_', ' ')}
												</Badge>
												<Badge variant="outline">{employee.department}</Badge>
											</div>
											<div className="flex items-center gap-4 text-sm text-muted-foreground">
												<div className="flex items-center gap-1">
													<Mail className="h-3 w-3" />
													{employee.email}
												</div>
												<div className="flex items-center gap-1">
													<Phone className="h-3 w-3" />
													{employee.phone}
												</div>
												<div className="flex items-center gap-1">
													<MapPin className="h-3 w-3" />
													{employee.location}
												</div>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-sm text-muted-foreground">
													Started: {employee.startDate}
												</span>
												<span className="text-sm text-muted-foreground">•</span>
												<span className="text-sm text-muted-foreground">
													Salary: ${employee.salary.toLocaleString()}
												</span>
												<span className="text-sm text-muted-foreground">•</span>
												<Badge variant={
													employee.performance === 'excellent' ? 'default' :
													employee.performance === 'good' ? 'secondary' :
													'outline'
												} className="text-xs">
													{employee.performance}
												</Badge>
											</div>
										</div>
										<div className="text-right space-y-1">
											<Button variant="ghost" size="icon">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
											<div className="flex items-center gap-2">
												<Button variant="ghost" size="sm">
													<Calendar className="h-3 w-3 mr-1" />
													Schedule
												</Button>
												<Button variant="ghost" size="sm">
													Edit
												</Button>
											</div>
										</div>
									</div>
								))}
								<Separator />
								<Button variant="outline" className="w-full">
									<Search className="h-4 w-4 mr-2" />
									View All Employees
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="all" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>All Employees</CardTitle>
							<CardDescription>
								Complete employee directory with search and management
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{/* Search and filter controls */}
								<div className="flex items-center gap-4">
									<Button variant="outline" className="flex-1 justify-start">
										<Search className="h-4 w-4 mr-2" />
										Search employees...
									</Button>
									<Button variant="outline">
										<Filter className="h-4 w-4 mr-2" />
										Filter
									</Button>
								</div>

								{/* Employee table placeholder */}
								<div className="text-center py-8 text-muted-foreground">
									<p>Employee directory with advanced search, organizational chart, and HR management tools would be implemented here</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="departments" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Department Management</CardTitle>
							<CardDescription>
								Manage departments, teams, and organizational structure
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{departments.map((dept, index) => (
									<div key={dept.name} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex items-center gap-3">
											<div className={`w-4 h-4 rounded-full ${dept.color}`} />
											<div>
												<h4 className="font-medium">{dept.name}</h4>
												<p className="text-sm text-muted-foreground">
													Head: {dept.head} • {dept.count} employees
												</p>
											</div>
										</div>
										<div className="text-right space-y-1">
											<p className="font-medium">${dept.budget.toLocaleString()}/month</p>
											<div className="flex items-center gap-2">
												<Button variant="outline" size="sm">
													View Team
												</Button>
												<Button variant="outline" size="sm">
													Edit
												</Button>
											</div>
										</div>
									</div>
								))}
								<Separator />
								<Button variant="outline" className="w-full">
									<Plus className="h-4 w-4 mr-2" />
									Create Department
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="performance" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Performance Management</CardTitle>
							<CardDescription>
								Track employee performance and reviews
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-3">
									<div className="space-y-2">
										<h4 className="font-medium">Reviews Due</h4>
										<p className="text-2xl font-bold">8</p>
										<p className="text-sm text-muted-foreground">This quarter</p>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Avg Performance</h4>
										<p className="text-2xl font-bold">4.2/5</p>
										<p className="text-sm text-muted-foreground">Company average</p>
									</div>
									<div className="space-y-2">
										<h4 className="font-medium">Top Performers</h4>
										<p className="text-2xl font-bold">12</p>
										<p className="text-sm text-muted-foreground">Excellent rating</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
