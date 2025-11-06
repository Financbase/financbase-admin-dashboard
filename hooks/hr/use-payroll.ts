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

export interface PayrollRun {
	id: string;
	organizationId: string;
	runNumber: string;
	payPeriodStart: string;
	payPeriodEnd: string;
	payDate: string;
	payFrequency: "weekly" | "biweekly" | "semimonthly" | "monthly";
	status: "draft" | "processing" | "completed" | "failed" | "cancelled";
	totalEmployees?: number;
	totalContractors?: number;
	totalGrossPay?: string;
	totalNetPay?: string;
	totalDeductions?: string;
	totalTaxes?: string;
	totalBenefits?: string;
	processedBy?: string;
	processedAt?: string;
	notes?: string;
	metadata?: any;
	createdAt: string;
	updatedAt: string;
}

export interface PayrollEntry {
	id: string;
	payrollRunId: string;
	organizationId: string;
	employeeId?: string;
	contractorId?: string;
	grossPay: string;
	netPay: string;
	hoursWorked?: string;
	overtimeHours?: string;
	hourlyRate?: string;
	salary?: string;
	bonus?: string;
	commission?: string;
	reimbursements?: string;
	totalDeductions?: string;
	totalTaxes?: string;
	totalBenefits?: string;
	status: "pending" | "processed" | "paid" | "failed";
	payStubUrl?: string;
	notes?: string;
	metadata?: any;
	createdAt: string;
	updatedAt: string;
}

export interface PayrollFilters {
	status?: string;
	payFrequency?: string;
	startDate?: Date;
	endDate?: Date;
	organizationId?: string;
}

// Fetch payroll runs
export function usePayrollRuns(filters?: PayrollFilters) {
	return useQuery({
		queryKey: ["payroll-runs", filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (filters?.status) params.append("status", filters.status);
			if (filters?.payFrequency) params.append("payFrequency", filters.payFrequency);
			if (filters?.startDate) params.append("startDate", filters.startDate.toISOString());
			if (filters?.endDate) params.append("endDate", filters.endDate.toISOString());
			if (filters?.organizationId) params.append("organizationId", filters.organizationId);

			const response = await fetch(`/api/hr/payroll/runs?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch payroll runs");
			const data = await response.json();
			return (data.runs || data.data || data) as PayrollRun[];
		},
	});
}

// Fetch single payroll run
export function usePayrollRun(id: string) {
	return useQuery({
		queryKey: ["payroll-run", id],
		queryFn: async () => {
			const response = await fetch(`/api/hr/payroll/runs/${id}`);
			if (!response.ok) throw new Error("Failed to fetch payroll run");
			const data = await response.json();
			return (data.run || data.data || data) as PayrollRun;
		},
		enabled: !!id,
	});
}

// Fetch payroll entries
export function usePayrollEntries(payrollRunId?: string, filters?: { employeeId?: string; contractorId?: string }) {
	return useQuery({
		queryKey: ["payroll-entries", payrollRunId, filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (payrollRunId) params.append("payrollRunId", payrollRunId);
			if (filters?.employeeId) params.append("employeeId", filters.employeeId);
			if (filters?.contractorId) params.append("contractorId", filters.contractorId);

			const response = await fetch(`/api/hr/payroll/entries?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch payroll entries");
			const data = await response.json();
			return (data.entries || data.data || data) as PayrollEntry[];
		},
		enabled: !!payrollRunId,
	});
}

// Fetch payroll deductions
export function usePayrollDeductions(filters?: { employeeId?: string; contractorId?: string }) {
	return useQuery({
		queryKey: ["payroll-deductions", filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (filters?.employeeId) params.append("employeeId", filters.employeeId);
			if (filters?.contractorId) params.append("contractorId", filters.contractorId);

			const response = await fetch(`/api/hr/payroll/deductions?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch deductions");
			const data = await response.json();
			return (data.deductions || data.data || data);
		},
	});
}

// Fetch payroll taxes
export function usePayrollTaxes(filters?: { jurisdiction?: string; type?: string }) {
	return useQuery({
		queryKey: ["payroll-taxes", filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (filters?.jurisdiction) params.append("jurisdiction", filters.jurisdiction);
			if (filters?.type) params.append("type", filters.type);

			const response = await fetch(`/api/hr/payroll/taxes?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch taxes");
			const data = await response.json();
			return (data.taxes || data.data || data);
		},
	});
}

// Fetch payroll benefits
export function usePayrollBenefits(filters?: { employeeId?: string; contractorId?: string }) {
	return useQuery({
		queryKey: ["payroll-benefits", filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (filters?.employeeId) params.append("employeeId", filters.employeeId);
			if (filters?.contractorId) params.append("contractorId", filters.contractorId);

			const response = await fetch(`/api/hr/payroll/benefits?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch benefits");
			const data = await response.json();
			return (data.benefits || data.data || data);
		},
	});
}

// Create payroll run mutation
export function useCreatePayrollRun() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payrollRun: Partial<PayrollRun>) => {
			const response = await fetch("/api/hr/payroll/runs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payrollRun),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to create payroll run");
			}
			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
			toast.success("Payroll run created successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to create payroll run", {
				description: error.message,
			});
		},
	});
}

// Process payroll mutation
export function useProcessPayroll() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: { payrollRunId: string; employeeIds?: string[]; contractorIds?: string[] }) => {
			const response = await fetch("/api/hr/payroll/runs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "process", ...data }),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to process payroll");
			}
			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
			queryClient.invalidateQueries({ queryKey: ["payroll-entries"] });
			toast.success("Payroll processed successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to process payroll", {
				description: error.message,
			});
		},
	});
}

// Update payroll run status mutation
export function useUpdatePayrollRunStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, status }: { id: string; status: PayrollRun["status"] }) => {
			const response = await fetch(`/api/hr/payroll/runs/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to update payroll run");
			}
			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
			toast.success("Payroll run updated successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to update payroll run", {
				description: error.message,
			});
		},
	});
}

// Generate pay stub mutation
export function useGeneratePayStub() {
	return useMutation({
		mutationFn: async (payrollEntryId: string) => {
			const response = await fetch(`/api/hr/payroll/paystubs/${payrollEntryId}`, {
				method: "POST",
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to generate pay stub");
			}
			return await response.json();
		},
		onSuccess: () => {
			toast.success("Pay stub generated successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to generate pay stub", {
				description: error.message,
			});
		},
	});
}

