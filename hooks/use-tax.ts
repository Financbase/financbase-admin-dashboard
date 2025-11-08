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
import type {
	CreateTaxObligationInput,
	UpdateTaxObligationInput,
	CreateTaxDeductionInput,
	UpdateTaxDeductionInput,
	CreateTaxDocumentInput,
	RecordTaxPaymentInput,
} from "@/lib/validation-schemas";

export interface TaxObligation {
	id: string;
	userId: string;
	name: string;
	type: string;
	amount: string;
	dueDate: string;
	status: "pending" | "paid" | "overdue" | "cancelled";
	quarter?: string | null;
	year: number;
	paid: string;
	paymentDate?: string | null;
	paymentMethod?: string | null;
	notes?: string | null;
	metadata?: any;
	createdAt: string;
	updatedAt: string;
}

export interface TaxDeduction {
	id: string;
	userId: string;
	category: string;
	amount: string;
	percentage?: string | null;
	transactionCount: number;
	year: number;
	description?: string | null;
	metadata?: any;
	createdAt: string;
	updatedAt: string;
}

export interface TaxDocument {
	id: string;
	userId: string;
	name: string;
	type: string;
	year: number;
	fileUrl: string;
	fileSize?: number | null;
	fileName?: string | null;
	mimeType?: string | null;
	description?: string | null;
	metadata?: any;
	uploadedAt: string;
	createdAt: string;
	updatedAt: string;
}

export interface TaxSummary {
	totalObligations: number;
	totalPaid: number;
	totalPending: number;
	totalDeductions: number;
	obligationsByStatus: {
		pending: number;
		paid: number;
		overdue: number;
	};
	obligationsByType: Record<string, number>;
}

export interface TaxAlert {
	type: "danger" | "warning" | "info";
	message: string;
	action?: string;
	amount?: string | null;
	obligationId?: string;
}

export interface TaxSummaryResponse {
	summary: TaxSummary;
	alerts: TaxAlert[];
}

// Tax Obligations Hooks

export function useTaxObligations(filters?: {
	status?: "pending" | "paid" | "overdue" | "cancelled";
	year?: number;
	quarter?: string;
	type?: string;
}) {
	return useQuery({
		queryKey: ["tax-obligations", filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (filters?.status) params.append("status", filters.status);
			if (filters?.year) params.append("year", filters.year.toString());
			if (filters?.quarter) params.append("quarter", filters.quarter);
			if (filters?.type) params.append("type", filters.type);

			const response = await fetch(`/api/tax/obligations?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch tax obligations");
			const data = await response.json();
			return (data.data || data) as TaxObligation[];
		},
	});
}

export function useTaxObligation(id: string) {
	return useQuery({
		queryKey: ["tax-obligation", id],
		queryFn: async () => {
			const response = await fetch(`/api/tax/obligations/${id}`);
			if (!response.ok) throw new Error("Failed to fetch tax obligation");
			const data = await response.json();
			return (data.data || data) as TaxObligation;
		},
		enabled: !!id,
	});
}

export function useCreateTaxObligation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: CreateTaxObligationInput) => {
			const response = await fetch("/api/tax/obligations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to create tax obligation");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tax-obligations"] });
			queryClient.invalidateQueries({ queryKey: ["tax-summary"] });
			toast.success("Tax obligation created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create tax obligation");
		},
	});
}

export function useUpdateTaxObligation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: UpdateTaxObligationInput) => {
			const response = await fetch(`/api/tax/obligations/${input.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to update tax obligation");
			}
			return response.json();
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["tax-obligations"] });
			queryClient.invalidateQueries({ queryKey: ["tax-obligation", variables.id] });
			queryClient.invalidateQueries({ queryKey: ["tax-summary"] });
			toast.success("Tax obligation updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update tax obligation");
		},
	});
}

export function useDeleteTaxObligation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/tax/obligations/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to delete tax obligation");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tax-obligations"] });
			queryClient.invalidateQueries({ queryKey: ["tax-summary"] });
			toast.success("Tax obligation deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete tax obligation");
		},
	});
}

export function useRecordTaxPayment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: RecordTaxPaymentInput) => {
			const response = await fetch(
				`/api/tax/obligations/${input.obligationId}/payment`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(input),
				}
			);
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to record tax payment");
			}
			return response.json();
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["tax-obligations"] });
			queryClient.invalidateQueries({
				queryKey: ["tax-obligation", variables.obligationId],
			});
			queryClient.invalidateQueries({ queryKey: ["tax-summary"] });
			toast.success("Tax payment recorded successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to record tax payment");
		},
	});
}

// Tax Deductions Hooks

export function useTaxDeductions(year?: number) {
	return useQuery({
		queryKey: ["tax-deductions", year],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (year) params.append("year", year.toString());

			const response = await fetch(`/api/tax/deductions?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch tax deductions");
			const data = await response.json();
			return (data.data || data) as TaxDeduction[];
		},
	});
}

export function useCreateTaxDeduction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: CreateTaxDeductionInput) => {
			const response = await fetch("/api/tax/deductions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to create tax deduction");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tax-deductions"] });
			queryClient.invalidateQueries({ queryKey: ["tax-summary"] });
			toast.success("Tax deduction created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create tax deduction");
		},
	});
}

export function useUpdateTaxDeduction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: UpdateTaxDeductionInput) => {
			const response = await fetch(`/api/tax/deductions/${input.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to update tax deduction");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tax-deductions"] });
			queryClient.invalidateQueries({ queryKey: ["tax-summary"] });
			toast.success("Tax deduction updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update tax deduction");
		},
	});
}

export function useDeleteTaxDeduction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/tax/deductions/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to delete tax deduction");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tax-deductions"] });
			queryClient.invalidateQueries({ queryKey: ["tax-summary"] });
			toast.success("Tax deduction deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete tax deduction");
		},
	});
}

// Tax Documents Hooks

export function useTaxDocuments(year?: number) {
	return useQuery({
		queryKey: ["tax-documents", year],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (year) params.append("year", year.toString());

			const response = await fetch(`/api/tax/documents?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch tax documents");
			const data = await response.json();
			return (data.data || data) as TaxDocument[];
		},
	});
}

export function useCreateTaxDocument() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: CreateTaxDocumentInput) => {
			const response = await fetch("/api/tax/documents", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to create tax document");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tax-documents"] });
			queryClient.invalidateQueries({ queryKey: ["tax-summary"] });
			toast.success("Tax document created successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create tax document");
		},
	});
}

export function useDeleteTaxDocument() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/tax/documents/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to delete tax document");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tax-documents"] });
			queryClient.invalidateQueries({ queryKey: ["tax-summary"] });
			toast.success("Tax document deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete tax document");
		},
	});
}

// Tax Summary Hook

export function useTaxSummary(year?: number) {
	return useQuery({
		queryKey: ["tax-summary", year],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (year) params.append("year", year.toString());

			const response = await fetch(`/api/tax/summary?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch tax summary");
			const data = await response.json();
			return (data.data || data) as TaxSummaryResponse;
		},
	});
}

