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

export interface AttendanceRecord {
	id: string;
	organizationId: string;
	employeeId?: string;
	contractorId?: string;
	clockInTime: string;
	clockOutTime?: string;
	duration?: string;
	clockInLocation?: any;
	clockOutLocation?: any;
	clockInMethod?: "web" | "mobile" | "kiosk" | "biometric" | "api" | "manual";
	clockOutMethod?: "web" | "mobile" | "kiosk" | "biometric" | "api" | "manual";
	status: "present" | "absent" | "late" | "on_leave" | "holiday" | "sick";
	notes?: string;
	metadata?: any;
	createdAt: string;
	updatedAt: string;
}

export interface TimeCard {
	id: string;
	organizationId: string;
	employeeId?: string;
	contractorId?: string;
	payPeriodStart: string;
	payPeriodEnd: string;
	payFrequency: "weekly" | "biweekly" | "semimonthly" | "monthly";
	totalHours?: string;
	regularHours?: string;
	overtimeHours?: string;
	leaveHours?: string;
	daysPresent?: number;
	daysAbsent?: number;
	daysLate?: number;
	daysOnLeave?: number;
	status: "draft" | "submitted" | "approved" | "rejected" | "paid";
	submittedBy?: string;
	submittedAt?: string;
	approvedBy?: string;
	approvedAt?: string;
	rejectionReason?: string;
	notes?: string;
	metadata?: any;
	createdAt: string;
	updatedAt: string;
}

export interface AttendanceFilters {
	employeeId?: string;
	contractorId?: string;
	status?: string;
	startDate?: Date;
	endDate?: Date;
	organizationId?: string;
}

// Fetch attendance records
export function useAttendanceRecords(filters?: AttendanceFilters) {
	return useQuery({
		queryKey: ["attendance-records", filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (filters?.employeeId) params.append("employeeId", filters.employeeId);
			if (filters?.contractorId) params.append("contractorId", filters.contractorId);
			if (filters?.status) params.append("status", filters.status);
			if (filters?.startDate) params.append("startDate", filters.startDate.toISOString());
			if (filters?.endDate) params.append("endDate", filters.endDate.toISOString());
			if (filters?.organizationId) params.append("organizationId", filters.organizationId);

			const response = await fetch(`/api/hr/attendance/records?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch attendance records");
			const data = await response.json();
			return (data.records || data.data || data) as AttendanceRecord[];
		},
	});
}

// Fetch time cards
export function useTimeCards(filters?: {
	employeeId?: string;
	contractorId?: string;
	status?: string;
	payPeriodStart?: Date;
	payPeriodEnd?: Date;
}) {
	return useQuery({
		queryKey: ["time-cards", filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (filters?.employeeId) params.append("employeeId", filters.employeeId);
			if (filters?.contractorId) params.append("contractorId", filters.contractorId);
			if (filters?.status) params.append("status", filters.status);
			if (filters?.payPeriodStart) params.append("payPeriodStart", filters.payPeriodStart.toISOString());
			if (filters?.payPeriodEnd) params.append("payPeriodEnd", filters.payPeriodEnd.toISOString());

			const response = await fetch(`/api/hr/attendance/time-cards?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch time cards");
			const data = await response.json();
			return (data.timeCards || data.data || data) as TimeCard[];
		},
	});
}

// Fetch attendance statistics
export function useAttendanceStats(filters?: {
	employeeId?: string;
	contractorId?: string;
	startDate?: Date;
	endDate?: Date;
}) {
	return useQuery({
		queryKey: ["attendance-stats", filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (filters?.employeeId) params.append("employeeId", filters.employeeId);
			if (filters?.contractorId) params.append("contractorId", filters.contractorId);
			if (filters?.startDate) params.append("startDate", filters.startDate.toISOString());
			if (filters?.endDate) params.append("endDate", filters.endDate.toISOString());

			const response = await fetch(`/api/hr/attendance/stats?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch attendance stats");
			return await response.json();
		},
	});
}

// Fetch running attendance record (clocked in, not clocked out)
export function useRunningAttendanceRecord(employeeId?: string, contractorId?: string) {
	return useQuery({
		queryKey: ["running-attendance", employeeId, contractorId],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (employeeId) params.append("employeeId", employeeId);
			if (contractorId) params.append("contractorId", contractorId);

			const response = await fetch(`/api/hr/attendance/running?${params.toString()}`);
			if (!response.ok) {
				if (response.status === 404) return null; // No running record
				throw new Error("Failed to fetch running attendance record");
			}
			const data = await response.json();
			return (data.record || data.data || data) as AttendanceRecord | null;
		},
		enabled: !!(employeeId || contractorId),
		refetchInterval: 60000, // Refetch every minute for active timer
	});
}

// Clock in mutation
export function useClockIn() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			employeeId?: string;
			contractorId?: string;
			location?: { latitude?: number; longitude?: number; address?: string; ip?: string };
			method?: AttendanceRecord["clockInMethod"];
			notes?: string;
		}) => {
			const response = await fetch("/api/hr/attendance/clock-in", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to clock in");
			}
			return await response.json();
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
			queryClient.invalidateQueries({ queryKey: ["running-attendance"] });
			toast.success("Clocked in successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to clock in", {
				description: error.message,
			});
		},
	});
}

// Clock out mutation
export function useClockOut() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			attendanceRecordId: string;
			location?: { latitude?: number; longitude?: number; address?: string; ip?: string };
			method?: AttendanceRecord["clockOutMethod"];
			notes?: string;
		}) => {
			const response = await fetch("/api/hr/attendance/clock-out", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to clock out");
			}
			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
			queryClient.invalidateQueries({ queryKey: ["running-attendance"] });
			queryClient.invalidateQueries({ queryKey: ["time-cards"] });
			toast.success("Clocked out successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to clock out", {
				description: error.message,
			});
		},
	});
}

// Create time card mutation
export function useCreateTimeCard() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (timeCard: Partial<TimeCard>) => {
			const response = await fetch("/api/hr/attendance/time-cards", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(timeCard),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to create time card");
			}
			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["time-cards"] });
			toast.success("Time card created successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to create time card", {
				description: error.message,
			});
		},
	});
}

// Update time card status mutation
export function useUpdateTimeCardStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			id: string;
			status: TimeCard["status"];
			approvedBy?: string;
			rejectionReason?: string;
		}) => {
			const response = await fetch(`/api/hr/attendance/time-cards/${data.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: data.status, approvedBy: data.approvedBy, rejectionReason: data.rejectionReason }),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to update time card");
			}
			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["time-cards"] });
			toast.success("Time card updated successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to update time card", {
				description: error.message,
			});
		},
	});
}

