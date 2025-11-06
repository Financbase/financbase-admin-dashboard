/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  MapPin,
  DollarSign,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";
import {
	useEmployees,
	useEmployeeStats,
	useDeleteEmployee,
	type Employee,
} from "@/hooks/hr/use-employees";
import { EmployeeForm } from "@/components/hr/employee-form";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function EmployeesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("");
	const [departmentFilter, setDepartmentFilter] = useState<string>("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();
	const queryClient = useQueryClient();
	const deleteMutation = useDeleteEmployee();
	const { data: currentUser } = useCurrentUser();
	const organizationId = currentUser?.organizationId || undefined;

	const { data: employees = [], isLoading, error } = useEmployees({
		search: searchQuery || undefined,
		status: statusFilter || undefined,
		department: departmentFilter || undefined,
	});

	const { data: stats } = useEmployeeStats();

	// Calculate department counts from employees
	const departmentCounts = employees.reduce((acc, emp) => {
		const dept = emp.department || "Unassigned";
		acc[dept] = (acc[dept] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	const departments = Object.entries(departmentCounts).map(([name, count], index) => ({
		name,
		count,
		color: ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-indigo-500"][index % 6],
	}));

	const handleEdit = (employee: Employee) => {
		setSelectedEmployee(employee);
		setIsFormOpen(true);
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this employee?")) {
			await deleteMutation.mutateAsync(id);
		}
	};

	const handleAdd = () => {
		setSelectedEmployee(undefined);
		setIsFormOpen(true);
	};

	const handleFormSuccess = () => {
		queryClient.invalidateQueries({ queryKey: ["employees"] });
		queryClient.invalidateQueries({ queryKey: ["employee-stats"] });
	};

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
				<div className="container mx-auto px-4 py-8">
					<div className="text-center text-red-600">
						Error loading employees: {error.message}
					</div>
				</div>
			</div>
		);
	}

	return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Employees
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage employee records and information
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Total Employees
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      stats?.total || employees.length
                    )}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Active
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      stats?.active || employees.filter((e) => e.status === "active").length
                    )}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    On Leave
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      stats?.onLeave || employees.filter((e) => e.status === "on_leave").length
                    )}
                  </p>
                </div>
                <UserX className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Departments
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      departments.length
                    )}
                  </p>
                </div>
                <Filter className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Departments */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>
                  Employee distribution by department
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : departments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No departments found</p>
                ) : (
                  departments.map((dept) => (
                    <div
                      key={dept.name}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      onClick={() => setDepartmentFilter(departmentFilter === dept.name ? "" : dept.name)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                        <span className="font-medium">{dept.name}</span>
                      </div>
                      <Badge variant="secondary">{dept.count}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Employee List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Employee Directory</CardTitle>
                    <CardDescription>
                      Complete list of all employees
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search employees..."
                        className="pl-10 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : employees.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      No employees found
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      {searchQuery || statusFilter || departmentFilter
                        ? "Try adjusting your filters"
                        : "Get started by adding your first employee"}
                    </p>
                    {!searchQuery && !statusFilter && !departmentFilter && (
                      <Button onClick={handleAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Employee
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {employees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center gap-4 p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">
                              {employee.firstName} {employee.lastName}
                            </h3>
                            <Badge
                              variant={employee.status === "active" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {employee.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {employee.position} • {employee.department}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
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
                        </div>
                        <div className="text-right">
                          {employee.salary && (
                            <p className="font-medium text-green-600 dark:text-green-400">
                              {employee.currency || "USD"} {employee.salary}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Started {new Date(employee.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(employee)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(employee.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <EmployeeForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          employee={selectedEmployee}
          organizationId={organizationId}
          onSuccess={handleFormSuccess}
        />
      </div>
    </div>
  );
}
