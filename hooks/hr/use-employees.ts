/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Employee {
	id: string;
	userId: string;
	organizationId: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	avatar?: string;
	position: string;
	department: string;
	managerId?: string;
	employeeNumber?: string;
	salary?: string;
	currency?: string;
	payFrequency?: "hourly" | "weekly" | "biweekly" | "monthly" | "annual";
	startDate: string;
	endDate?: string;
	status: "active" | "inactive" | "terminated" | "on_leave";
	performance?: string;
	location?: string;
	timezone?: string;
	notes?: string;
	tags?: any;
	metadata?: any;
	isPayrollEnabled?: boolean;
	payrollEmployeeId?: string;
	totalLeaveBalance?: string;
	isAttendanceTracked?: boolean;
	attendanceMethod?: "clock" | "manual" | "hybrid";
	defaultWorkHours?: string;
	overtimeThreshold?: string;
	createdAt: string;
	updatedAt: string;
}

export interface EmployeeFilters {
	search?: string;
	status?: string;
	department?: string;
	organizationId?: string;
}

export interface EmployeeStats {
	total: number;
	active: number;
	inactive: number;
	onLeave: number;
	departments: number;
}

// Fetch employees
export function useEmployees(filters?: EmployeeFilters) {
	return useQuery({
		queryKey: ["employees", filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (filters?.search) params.append("search", filters.search);
			if (filters?.status) params.append("status", filters.status);
			if (filters?.department) params.append("department", filters.department);
			if (filters?.organizationId) params.append("organizationId", filters.organizationId);

			const response = await fetch(`/api/employees?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch employees");
			const data = await response.json();
			return (data.employees || data.data || data) as Employee[];
		},
	});
}

// Fetch single employee
export function useEmployee(id: string) {
	return useQuery({
		queryKey: ["employee", id],
		queryFn: async () => {
			const response = await fetch(`/api/employees/${id}`);
			if (!response.ok) throw new Error("Failed to fetch employee");
			const data = await response.json();
			return (data.employee || data.data || data) as Employee;
		},
		enabled: !!id,
	});
}

// Fetch employee stats
export function useEmployeeStats() {
	return useQuery({
		queryKey: ["employee-stats"],
		queryFn: async () => {
			const response = await fetch("/api/employees/stats");
			if (!response.ok) throw new Error("Failed to fetch employee stats");
			const data = await response.json();
			return (data.stats || data.data || data) as EmployeeStats;
		},
	});
}

// Fetch employee payroll summary
export function useEmployeePayrollSummary(employeeId: string, limit: number = 12) {
	return useQuery({
		queryKey: ["employee-payroll", employeeId, limit],
		queryFn: async () => {
			const response = await fetch(`/api/employees/${employeeId}/payroll?limit=${limit}`);
			if (!response.ok) throw new Error("Failed to fetch payroll summary");
			return await response.json();
		},
		enabled: !!employeeId,
	});
}

// Fetch employee leave balance
export function useEmployeeLeaveBalance(employeeId: string) {
	return useQuery({
		queryKey: ["employee-leave-balance", employeeId],
		queryFn: async () => {
			const response = await fetch(`/api/employees/${employeeId}/leave`);
			if (!response.ok) throw new Error("Failed to fetch leave balance");
			return await response.json();
		},
		enabled: !!employeeId,
	});
}

// Fetch employee attendance summary
export function useEmployeeAttendanceSummary(
	employeeId: string,
	startDate?: Date,
	endDate?: Date
) {
	return useQuery({
		queryKey: ["employee-attendance", employeeId, startDate, endDate],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (startDate) params.append("startDate", startDate.toISOString());
			if (endDate) params.append("endDate", endDate.toISOString());

			const response = await fetch(`/api/employees/${employeeId}/attendance?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch attendance summary");
			return await response.json();
		},
		enabled: !!employeeId,
	});
}

// Create employee mutation
export function useCreateEmployee() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (employee: Partial<Employee>) => {
			const response = await fetch("/api/employees", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(employee),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to create employee");
			}
			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employees"] });
			queryClient.invalidateQueries({ queryKey: ["employee-stats"] });
			toast.success("Employee created successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to create employee", {
				description: error.message,
			});
		},
	});
}

// Update employee mutation
export function useUpdateEmployee() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, ...employee }: Partial<Employee> & { id: string }) => {
			const response = await fetch(`/api/employees/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(employee),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to update employee");
			}
			return await response.json();
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["employees"] });
			queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
			queryClient.invalidateQueries({ queryKey: ["employee-stats"] });
			toast.success("Employee updated successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to update employee", {
				description: error.message,
			});
		},
	});
}

// Delete employee mutation
export function useDeleteEmployee() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/employees/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to delete employee");
			}
			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employees"] });
			queryClient.invalidateQueries({ queryKey: ["employee-stats"] });
			toast.success("Employee deleted successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to delete employee", {
				description: error.message,
			});
		},
	});
}

