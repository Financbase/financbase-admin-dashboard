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

export interface TimeEntry {
	id: string;
	userId: string;
	projectId?: string;
	employeeId?: string;
	contractorId?: string;
	description: string;
	startTime: string;
	endTime?: string;
	duration?: string;
	status: "draft" | "running" | "paused" | "completed" | "approved" | "billed";
	taskId?: string;
	taskName?: string;
	isBillable?: boolean;
	hourlyRate?: string;
	totalAmount?: string;
	currency?: string;
	requiresApproval?: boolean;
	isApproved?: boolean;
	approvedBy?: string;
	approvedAt?: string;
	isBilled?: boolean;
	billedAt?: string;
	invoiceId?: string;
	tags?: any;
	metadata?: any;
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

export interface TimeEntryFilters {
	employeeId?: string;
	contractorId?: string;
	projectId?: string;
	taskId?: string;
	startDate?: Date;
	endDate?: Date;
	isBillable?: boolean;
	isBilled?: boolean;
	status?: string;
}

// Fetch time entries
export function useTimeEntries(filters?: TimeEntryFilters) {
	return useQuery({
		queryKey: ["time-entries", filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (filters?.employeeId) params.append("employeeId", filters.employeeId);
			if (filters?.contractorId) params.append("contractorId", filters.contractorId);
			if (filters?.projectId) params.append("projectId", filters.projectId);
			if (filters?.taskId) params.append("taskId", filters.taskId);
			if (filters?.startDate) params.append("startDate", filters.startDate.toISOString());
			if (filters?.endDate) params.append("endDate", filters.endDate.toISOString());
			if (filters?.isBillable !== undefined) params.append("isBillable", String(filters.isBillable));
			if (filters?.isBilled !== undefined) params.append("isBilled", String(filters.isBilled));
			if (filters?.status) params.append("status", filters.status);

			const response = await fetch(`/api/time-entries?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch time entries");
			const data = await response.json();
			return (data.timeEntries || data.data || data.timeEntries?.data || data) as TimeEntry[];
		},
	});
}

// Fetch single time entry
export function useTimeEntry(id: string) {
	return useQuery({
		queryKey: ["time-entry", id],
		queryFn: async () => {
			const response = await fetch(`/api/time-entries/${id}`);
			if (!response.ok) throw new Error("Failed to fetch time entry");
			const data = await response.json();
			return (data.timeEntry || data.data || data) as TimeEntry;
		},
		enabled: !!id,
	});
}

// Fetch time tracking statistics
export function useTimeTrackingStats(filters?: {
	employeeId?: string;
	contractorId?: string;
	startDate?: Date;
	endDate?: Date;
}) {
	return useQuery({
		queryKey: ["time-tracking-stats", filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (filters?.employeeId) params.append("employeeId", filters.employeeId);
			if (filters?.contractorId) params.append("contractorId", filters.contractorId);
			if (filters?.startDate) params.append("startDate", filters.startDate.toISOString());
			if (filters?.endDate) params.append("endDate", filters.endDate.toISOString());

			const response = await fetch(`/api/time-entries/stats?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch time tracking stats");
			return await response.json();
		},
	});
}

// Fetch running time entry (currently tracking)
export function useRunningTimeEntry(userId?: string) {
	return useQuery({
		queryKey: ["running-time-entry", userId],
		queryFn: async () => {
			if (!userId) return null;
			const response = await fetch(`/api/time-entries/running?userId=${userId}`);
			if (!response.ok) {
				if (response.status === 404) return null; // No running entry
				throw new Error("Failed to fetch running time entry");
			}
			const data = await response.json();
			return (data.timeEntry || data.data || data) as TimeEntry | null;
		},
		enabled: !!userId,
		refetchInterval: 60000, // Refetch every minute for active timer
	});
}

// Create time entry mutation
export function useCreateTimeEntry() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (timeEntry: Partial<TimeEntry>) => {
			const response = await fetch("/api/time-entries", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(timeEntry),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to create time entry");
			}
			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["time-entries"] });
			queryClient.invalidateQueries({ queryKey: ["time-tracking-stats"] });
			toast.success("Time entry created successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to create time entry", {
				description: error.message,
			});
		},
	});
}

// Start time tracking mutation
export function useStartTimeTracking() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: { projectId: string; description: string; employeeId?: string; contractorId?: string; taskId?: string; taskName?: string }) => {
			const response = await fetch("/api/time-entries", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "start", ...data }),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to start time tracking");
			}
			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["time-entries"] });
			queryClient.invalidateQueries({ queryKey: ["running-time-entry"] });
			toast.success("Time tracking started");
		},
		onError: (error: Error) => {
			toast.error("Failed to start time tracking", {
				description: error.message,
			});
		},
	});
}

// Stop time tracking mutation
export function useStopTimeTracking() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (timeEntryId: string) => {
			const response = await fetch(`/api/time-entries/${timeEntryId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "stop" }),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to stop time tracking");
			}
			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["time-entries"] });
			queryClient.invalidateQueries({ queryKey: ["running-time-entry"] });
			queryClient.invalidateQueries({ queryKey: ["time-tracking-stats"] });
			toast.success("Time tracking stopped");
		},
		onError: (error: Error) => {
			toast.error("Failed to stop time tracking", {
				description: error.message,
			});
		},
	});
}

// Update time entry mutation
export function useUpdateTimeEntry() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, ...timeEntry }: Partial<TimeEntry> & { id: string }) => {
			const response = await fetch(`/api/time-entries/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(timeEntry),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to update time entry");
			}
			return await response.json();
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["time-entries"] });
			queryClient.invalidateQueries({ queryKey: ["time-entry", variables.id] });
			queryClient.invalidateQueries({ queryKey: ["time-tracking-stats"] });
			toast.success("Time entry updated successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to update time entry", {
				description: error.message,
			});
		},
	});
}

// Approve time entry mutation
export function useApproveTimeEntry() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/time-entries/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isApproved: true, approvedAt: new Date().toISOString() }),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to approve time entry");
			}
			return await response.json();
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ["time-entries"] });
			queryClient.invalidateQueries({ queryKey: ["time-entry", id] });
			toast.success("Time entry approved");
		},
		onError: (error: Error) => {
			toast.error("Failed to approve time entry", {
				description: error.message,
			});
		},
	});
}

// Delete time entry mutation
export function useDeleteTimeEntry() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/time-entries/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to delete time entry");
			}
			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["time-entries"] });
			queryClient.invalidateQueries({ queryKey: ["time-tracking-stats"] });
			toast.success("Time entry deleted successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to delete time entry", {
				description: error.message,
			});
		},
	});
}

