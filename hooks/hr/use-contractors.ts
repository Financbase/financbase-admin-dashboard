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

export interface Contractor {
	id: string;
	userId: string;
	organizationId: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	avatar?: string;
	contractorType: "1099" | "w2" | "c2c" | "other";
	companyName?: string;
	taxId?: string;
	licenseNumber?: string;
	specialties?: any;
	hourlyRate?: string;
	monthlyRate?: string;
	annualRate?: string;
	currency?: string;
	paymentTerms: "net_15" | "net_30" | "net_45" | "net_60" | "due_on_receipt" | "custom";
	customPaymentTerms?: string;
	contractStartDate: string;
	contractEndDate?: string;
	status: "active" | "inactive" | "terminated" | "pending";
	location?: string;
	timezone?: string;
	notes?: string;
	tags?: any;
	metadata?: any;
	createdAt: string;
	updatedAt: string;
}

export interface ContractorFilters {
	search?: string;
	status?: string;
	contractorType?: string;
	organizationId?: string;
}

export interface ContractorStats {
	total: number;
	active: number;
	pending: number;
	terminated: number;
	totalSpend: number;
}

// Fetch contractors
export function useContractors(filters?: ContractorFilters) {
	return useQuery({
		queryKey: ["contractors", filters],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (filters?.search) params.append("search", filters.search);
			if (filters?.status) params.append("status", filters.status);
			if (filters?.contractorType) params.append("contractorType", filters.contractorType);
			if (filters?.organizationId) params.append("organizationId", filters.organizationId);

			const response = await fetch(`/api/hr/contractors?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch contractors");
			const data = await response.json();
			return (data.contractors || data.data || data) as Contractor[];
		},
	});
}

// Fetch single contractor
export function useContractor(id: string) {
	return useQuery({
		queryKey: ["contractor", id],
		queryFn: async () => {
			const response = await fetch(`/api/hr/contractors/${id}`);
			if (!response.ok) throw new Error("Failed to fetch contractor");
			const data = await response.json();
			return (data.contractor || data.data || data) as Contractor;
		},
		enabled: !!id,
	});
}

// Fetch contractor performance metrics
export function useContractorPerformance(id: string) {
	return useQuery({
		queryKey: ["contractor-performance", id],
		queryFn: async () => {
			const response = await fetch(`/api/hr/contractors/${id}/performance`);
			if (!response.ok) throw new Error("Failed to fetch contractor performance");
			return await response.json();
		},
		enabled: !!id,
	});
}

// Create contractor mutation
export function useCreateContractor() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (contractor: Partial<Contractor>) => {
			const response = await fetch("/api/hr/contractors", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(contractor),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to create contractor");
			}
			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contractors"] });
			toast.success("Contractor created successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to create contractor", {
				description: error.message,
			});
		},
	});
}

// Update contractor mutation
export function useUpdateContractor() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, ...contractor }: Partial<Contractor> & { id: string }) => {
			const response = await fetch(`/api/hr/contractors/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(contractor),
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to update contractor");
			}
			return await response.json();
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["contractors"] });
			queryClient.invalidateQueries({ queryKey: ["contractor", variables.id] });
			toast.success("Contractor updated successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to update contractor", {
				description: error.message,
			});
		},
	});
}

// Delete contractor mutation
export function useDeleteContractor() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/hr/contractors/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to delete contractor");
			}
			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contractors"] });
			toast.success("Contractor deleted successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to delete contractor", {
				description: error.message,
			});
		},
	});
}

