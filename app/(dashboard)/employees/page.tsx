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
	TrendingUp,
	TrendingDown,
	UserCheck,
	Clock,
	Calendar,
	Mail,
	Phone,
	MapPin,
	Building,
	Loader2
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useCurrentUser } from "@/hooks/use-current-user";

interface Employee {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	position: string;
	department: string;
	status: "active" | "on_leave" | "terminated" | "suspended";
	salary?: string;
	startDate: string;
	performance?: string;
	location?: string;
	createdAt: string;
}

interface Department {
	id: string;
	name: string;
	description?: string;
	count?: number;
}

export default function EmployeesPage() {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [analytics, setAnalytics] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [departmentFilter, setDepartmentFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const { data: userData } = useCurrentUser();

	// Fetch employees
	const fetchEmployees = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams();
			if (searchQuery) params.append("search", searchQuery);
			if (departmentFilter !== "all") params.append("department", departmentFilter);
			if (statusFilter !== "all") params.append("status", statusFilter);

			const response = await fetch(`/api/employees?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch employees");
			const data = await response.json();
			setEmployees(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Error fetching employees:", error);
			toast.error("Failed to load employees");
		} finally {
			setLoading(false);
		}
	};

	// Fetch departments
	const fetchDepartments = async () => {
		try {
			const organizationId = userData?.organizationId || null;
			if (!organizationId) {
				console.warn("No organizationId available");
				return;
			}
			const response = await fetch(`/api/employees/departments?organizationId=${organizationId}`);
			if (!response.ok) throw new Error("Failed to fetch departments");
			const data = await response.json();
			setDepartments(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Error fetching departments:", error);
		}
	};

	// Fetch analytics
	const fetchAnalytics = async () => {
		try {
			const response = await fetch("/api/employees/analytics");
			if (!response.ok) throw new Error("Failed to fetch analytics");
			const data = await response.json();
			setAnalytics(data);
		} catch (error) {
			console.error("Error fetching analytics:", error);
		}
	};

	useEffect(() => {
		fetchEmployees();
		fetchDepartments();
		fetchAnalytics();
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			fetchEmployees();
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery, departmentFilter, statusFilter]);

	const recentEmployees = employees
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, 10);

	const employeeStats: Array<{
		name: string;
		value: string;
		change: string;
		changeType: "positive" | "negative" | "neutral";
		icon: React.ComponentType<{ className?: string }>;
	}> = [
		{
			name: "Total Employees",
			value: analytics?.total?.toString() || "0",
			change: "+3",
			changeType: "positive",
			icon: Users,
		},
		{
			name: "Active Employees",
			value: analytics?.active?.toString() || "0",
			change: "+2",
			changeType: "positive",
			icon: UserCheck,
		},
		{
			name: "Departments",
			value: departments.length.toString(),
			change: "0",
			changeType: "neutral",
			icon: Building,
		},
		{
			name: "On Leave",
			value: analytics?.onLeave?.toString() || "0",
			change: "0",
			changeType: "neutral",
			icon: Clock,
		},
	];

	if (loading && employees.length === 0) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	// Calculate department stats from employees
	const departmentStats = departments.map((dept) => {
		const deptEmployees = employees.filter((emp) => emp.department === dept.name);
		return {
			...dept,
			count: deptEmployees.length,
			color: ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-teal-500"][departments.indexOf(dept) % 6] || "bg-gray-500",
		};
	});

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
					{departmentStats.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<p>No departments defined yet</p>
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
							{departmentStats.map((dept, index) => (
								<div key={dept.id || dept.name} className="space-y-2">
									<div className="flex items-center gap-2">
										<div className={`w-3 h-3 rounded-full ${dept.color}`} />
										<h4 className="font-medium">{dept.name}</h4>
									</div>
									<div className="space-y-1">
										<p className="text-2xl font-bold">{dept.count}</p>
										{dept.description && (
											<p className="text-sm text-muted-foreground">{dept.description}</p>
										)}
									</div>
								</div>
							))}
						</div>
					)}
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
							{recentEmployees.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<p>No employees yet</p>
									<p className="text-sm mt-2">Add your first employee to get started</p>
								</div>
							) : (
								<div className="space-y-4">
									{recentEmployees.map((employee) => {
										const fullName = `${employee.firstName} ${employee.lastName}`;
										const salary = employee.salary ? parseFloat(employee.salary) : 0;
										return (
											<div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
												<div className="space-y-1 flex-1">
													<div className="flex items-center gap-2">
														<h4 className="font-medium">{fullName}</h4>
														<Badge variant="outline">{employee.position}</Badge>
														<Badge
															variant={
																employee.status === "active"
																	? "default"
																	: employee.status === "on_leave"
																		? "secondary"
																		: "destructive"
															}
														>
															{employee.status.replace("_", " ")}
														</Badge>
														<Badge variant="outline">{employee.department}</Badge>
													</div>
													<div className="flex items-center gap-4 text-sm text-muted-foreground">
														<div className="flex items-center gap-1">
															<Mail className="h-3 w-3" />
															{employee.email}
														</div>
														{employee.phone && (
															<div className="flex items-center gap-1">
																<Phone className="h-3 w-3" />
																{employee.phone}
															</div>
														)}
														{employee.location && (
															<div className="flex items-center gap-1">
																<MapPin className="h-3 w-3" />
																{employee.location}
															</div>
														)}
													</div>
													<div className="flex items-center gap-2">
														<span className="text-sm text-muted-foreground">
															Started: {new Date(employee.startDate).toLocaleDateString()}
														</span>
														{salary > 0 && (
															<>
																<span className="text-sm text-muted-foreground">•</span>
																<span className="text-sm text-muted-foreground">
																	Salary: ${salary.toLocaleString()}
																</span>
															</>
														)}
														{employee.performance && (
															<>
																<span className="text-sm text-muted-foreground">•</span>
																<Badge
																	variant={
																		employee.performance === "excellent"
																			? "default"
																			: employee.performance === "good"
																				? "secondary"
																				: "outline"
																	}
																	className="text-xs"
																>
																	{employee.performance}
																</Badge>
															</>
														)}
													</div>
												</div>
												<div className="text-right space-y-1">
													<Button
														variant="ghost"
														size="icon"
														onClick={() => toast.info(`More options for ${fullName}`)}
													>
														<MoreHorizontal className="h-4 w-4" />
													</Button>
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toast.info(`Scheduling for ${fullName}`)}
														>
															<Calendar className="h-3 w-3 mr-1" />
															Schedule
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toast.info(`Editing ${fullName}`)}
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
							<CardTitle>All Employees</CardTitle>
							<CardDescription>
								Complete employee directory with search and management
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{/* Search and filter controls */}
								<div className="flex items-center gap-4">
									<div className="relative flex-1">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Search employees..."
											className="pl-10"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</div>
									<select
										className="px-3 py-2 border rounded-lg text-sm"
										value={departmentFilter}
										onChange={(e) => setDepartmentFilter(e.target.value)}
									>
										<option value="all">All Departments</option>
										{departments.map((dept) => (
											<option key={dept.id || dept.name} value={dept.name}>
												{dept.name}
											</option>
										))}
									</select>
									<select
										className="px-3 py-2 border rounded-lg text-sm"
										value={statusFilter}
										onChange={(e) => setStatusFilter(e.target.value)}
									>
										<option value="all">All Status</option>
										<option value="active">Active</option>
										<option value="on_leave">On Leave</option>
										<option value="terminated">Terminated</option>
										<option value="suspended">Suspended</option>
									</select>
								</div>

								{/* Employee list */}
								{loading ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
									</div>
								) : employees.length === 0 ? (
									<div className="text-center py-8 text-muted-foreground">
										<p>No employees found</p>
									</div>
								) : (
									<div className="space-y-2">
										{employees.map((employee) => {
											const fullName = `${employee.firstName} ${employee.lastName}`;
											return (
												<div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
													<div className="space-y-1">
														<div className="flex items-center gap-2">
															<h4 className="font-medium">{fullName}</h4>
															<Badge
																variant={
																	employee.status === "active"
																		? "default"
																		: employee.status === "on_leave"
																			? "secondary"
																			: "destructive"
																}
															>
																{employee.status.replace("_", " ")}
															</Badge>
															<Badge variant="outline">{employee.department}</Badge>
														</div>
														<p className="text-sm text-muted-foreground">
															{employee.position} • {employee.email}
														</p>
													</div>
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toast.info(`Viewing details for ${fullName}`)}
														>
															View
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toast.info(`Editing ${fullName}`)}
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

				<TabsContent value="departments" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Department Management</CardTitle>
							<CardDescription>
								Manage departments, teams, and organizational structure
							</CardDescription>
						</CardHeader>
						<CardContent>
							{departmentStats.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<p>No departments defined yet</p>
								</div>
							) : (
								<div className="space-y-4">
									{departmentStats.map((dept, index) => (
										<div key={dept.id || dept.name} className="flex items-center justify-between p-4 border rounded-lg">
											<div className="flex items-center gap-3">
												<div className={`w-4 h-4 rounded-full ${dept.color}`} />
												<div>
													<h4 className="font-medium">{dept.name}</h4>
													<p className="text-sm text-muted-foreground">
														{dept.count} employees
														{dept.description && ` • ${dept.description}`}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Button variant="outline" size="sm">
													View Team
												</Button>
												<Button variant="outline" size="sm">
													Edit
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
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
