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

export interface LeaveType {
	id: string;
	organizationId: string;
	name: string;
	category: "vacation" | "sick_leave" | "personal" | "fmla" | "bereavement" | "jury_duty" | "military" | "unpaid" | "other";
	description?: string;
	accrualMethod: "none" | "fixed" | "per_hour" | "per_week" | "per_month" | "per_year" | "proportional";
	accrualRate?: string;
	accrualPeriod?: "hourly" | "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
	maxAccrual?: string;
	initialBalance?: string;
	allowCarryover?: boolean;
	maxCarryover?: string;
	requiresApproval?: boolean;
	advanceNoticeDays?: number;
	notes?: string;
	metadata?: any;
	createdAt: string;
	updatedAt: string;
}

export interface LeaveBalance {
	id: string;
	employeeId: string;
	leaveTypeId: string;
	organizationId: string;
	currentBalance: string;
	accruedAmount?: string;
	takenAmount?: string;
	scheduledAmount?: string;
	lastAccrualDate?: string;
	nextAccrualDate?: string;
	notes?: string;
	metadata?: any;
	createdAt: string;
	updatedAt: string;
}

export interface LeaveRequest {
	id: string;
	employeeId: string;
	leaveTypeId: string;
	organizationId: string;
	startDate: string;
	endDate: string;
	duration: string;
	durationUnit: "hours" | "days";
	reason?: string;
	notes?: string;
	status: "pending" | "approved" | "rejected" | "cancelled" | "taken";
	requestedBy: string;
	requestedAt: string;
	approvedBy?: string;
	approvedAt?: string;
	rejectionReason?: string;
	metadata?: any;
	createdAt: string;
	updatedAt: string;
}

export interface LeaveFilters {
	employeeId?: string;
	status?: string;
	organizationId?: string;
	startDate?: Date;
	endDate?: Date;
}

// Fetch leave types
export function useLeaveTypes() {
	return useQuery({
		queryKey: ["leave-types"],
		queryFn: async () => {
			const response = await fetch("/api/hr/leave/types");
			if (!response.ok) throw new Error("Failed to fetch leave types");
			const data = await response.json();
			return (data.leaveTypes || data.data || data) as LeaveType[];
		},
	});
}

// Fetch leave requests
export function useLeaveRequests(filters?: LeaveFilters) {
	return useQuery({
		queryKey: ["leave-requests", filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (filters?.employeeId) params.append("employeeId", filters.employeeId);
			if (filters?.status) params.append("status", filters.status);
			if (filters?.organizationId) params.append("organizationId", filters.organizationId);
			if (filters?.startDate) params.append("startDate", filters.startDate.toISOString());
			if (filters?.endDate) params.append("endDate", filters.endDate.toISOString());

			const response = await fetch(`/api/hr/leave/requests?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch leave requests");
			const data = await response.json();
			return (data.requests || data.data || data) as LeaveRequest[];
		},
	});
}

// Fetch single leave request
export function useLeaveRequest(id: string) {
	return useQuery({
		queryKey: ["leave-request", id],
		queryFn: async () => {
			const response = await fetch(`/api/hr/leave/requests/${id}`);
			if (!response.ok) throw new Error("Failed to fetch leave request");
			const data = await response.json();
			return (data.request || data.data || data) as LeaveRequest;
		},
		enabled: !!id,
	});
}

// Fetch leave balances
export function useLeaveBalances(employeeId?: string) {
	return useQuery({
		queryKey: ["leave-balances", employeeId],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (employeeId) params.append("employeeId", employeeId);

			const response = await fetch(`/api/hr/leave/balances?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch leave balances");
			const data = await response.json();
			return (data.balances || data.data || data) as LeaveBalance[];
		},
		enabled: !!employeeId,
	});
}

// Fetch leave calendar
export function useLeaveCalendar(startDate: Date, endDate: Date) {
	return useQuery({
		queryKey: ["leave-calendar", startDate, endDate],
		queryFn: async () => {
			const params = new URLSearchParams();
			params.append("startDate", startDate.toISOString());
			params.append("endDate", endDate.toISOString());

			const response = await fetch(`/api/hr/leave/calendar?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch leave calendar");
			return await response.json();
		},
	});
}

// Request leave mutation
export function useRequestLeave() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (leaveRequest: Partial<LeaveRequest>) => {
			const response = await fetch("/api/hr/leave/requests", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(leaveRequest),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to submit leave request");
			}
			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
			queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
			toast.success("Leave request submitted successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to submit leave request", {
				description: error.message,
			});
		},
	});
}

// Approve/reject leave mutation
export function useApproveLeave() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: { requestId: string; approved: boolean; rejectionReason?: string }) => {
			const response = await fetch("/api/hr/leave/requests", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "approve", ...data }),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to update leave request");
			}
			return await response.json();
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
			queryClient.invalidateQueries({ queryKey: ["leave-request", variables.requestId] });
			queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
			toast.success(variables.approved ? "Leave request approved" : "Leave request rejected");
		},
		onError: (error: Error) => {
			toast.error("Failed to update leave request", {
				description: error.message,
			});
		},
	});
}

// Cancel leave request mutation
export function useCancelLeaveRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (requestId: string) => {
			const response = await fetch(`/api/hr/leave/requests/${requestId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "cancelled" }),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to cancel leave request");
			}
			return await response.json();
		},
		onSuccess: (_, requestId) => {
			queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
			queryClient.invalidateQueries({ queryKey: ["leave-request", requestId] });
			queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
			toast.success("Leave request cancelled");
		},
		onError: (error: Error) => {
			toast.error("Failed to cancel leave request", {
				description: error.message,
			});
		},
	});
}

