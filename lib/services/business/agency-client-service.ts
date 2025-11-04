/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import {
	agencyClients,
	agencyProjects,
	clientBudgets,
} from "@/lib/db/schemas/agency.schema";
import { and, avg, count, desc, eq, gte, lte, sum } from "drizzle-orm";
import {
	Building2,
	CheckCircle,
	MessageCircle,
	Phone,
	PiggyBank,
	Trash2,
	TrendingUp,
	XCircle,
} from "lucide-react";

export interface CreateClientData {
	name: string;
	email?: string;
	phone?: string;
	company?: string;
	website?: string;
	industry?: string;
	address?: Record<string, unknown>;
	notes?: string;
	tags?: string[];
	customFields?: Record<string, unknown>;
}

export interface UpdateClientData {
	name?: string;
	email?: string;
	phone?: string;
	company?: string;
	website?: string;
	industry?: string;
	status?: "active" | "inactive" | "prospect" | "churned";
	address?: Record<string, unknown>;
	notes?: string;
	tags?: string[];
	customFields?: Record<string, unknown>;
}

export interface ClientFilters {
	status?: string;
	industry?: string;
	search?: string;
	startDate?: Date;
	endDate?: Date;
	limit?: number;
	offset?: number;
}

export class AgencyClientService {
	/**
	 * Create a new client
	 */
	async createClient(userId: string, data: CreateClientData) {
		try {
			const [client] = await db
				.insert(agencyClients)
				.values({
					userId,
					...data,
				})
				.returning();

			return client;
		} catch (error) {
			console.error("Error creating client:", error);
			throw new Error(
				`Failed to create client: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get client by ID
	 */
	async getClientById(clientId: string, userId: string) {
		try {
			const [client] = await db
				.select()
				.from(agencyClients)
				.where(
					and(eq(agencyClients.id, clientId), eq(agencyClients.userId, userId)),
				)
				.limit(1);

			if (!client) {
				throw new Error("Client not found");
			}

			return client;
		} catch (error) {
			console.error("Error fetching client:", error);
			throw new Error(
				`Failed to fetch client: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get all clients with optional filters
	 */
	async getClients(userId: string, filters: ClientFilters = {}) {
		try {
			const {
				status,
				industry,
				search,
				startDate,
				endDate,
				limit = 50,
				offset = 0,
			} = filters;

			const whereConditions = [eq(agencyClients.userId, userId)];

			if (status) {
				whereConditions.push(eq(agencyClients.status, status as any));
			}

			if (industry) {
				whereConditions.push(eq(agencyClients.industry, industry));
			}

			if (search) {
				whereConditions.push(
					// This would need to be implemented with a proper search function
					// For now, we'll use a simple LIKE pattern
					// In a real implementation, you'd use full-text search
				);
			}

			if (startDate) {
				whereConditions.push(gte(agencyClients.createdAt, startDate));
			}

			if (endDate) {
				whereConditions.push(lte(agencyClients.createdAt, endDate));
			}

			const clients = await db
				.select()
				.from(agencyClients)
				.where(and(...whereConditions))
				.orderBy(desc(agencyClients.createdAt))
				.limit(limit)
				.offset(offset);

			return clients;
		} catch (error) {
			console.error("Error fetching clients:", error);
			throw new Error(
				`Failed to fetch clients: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Update client
	 */
	async updateClient(clientId: string, userId: string, data: UpdateClientData) {
		try {
			const [updatedClient] = await db
				.update(agencyClients)
				.set({
					...data,
					updatedAt: new Date(),
				})
				.where(
					and(eq(agencyClients.id, clientId), eq(agencyClients.userId, userId)),
				)
				.returning();

			if (!updatedClient) {
				throw new Error("Client not found");
			}

			return updatedClient;
		} catch (error) {
			console.error("Error updating client:", error);
			throw new Error(
				`Failed to update client: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Delete client
	 */
	async deleteClient(clientId: string, userId: string) {
		try {
			const [deletedClient] = await db
				.delete(agencyClients)
				.where(
					and(eq(agencyClients.id, clientId), eq(agencyClients.userId, userId)),
				)
				.returning();

			if (!deletedClient) {
				throw new Error("Client not found");
			}

			return { success: true };
		} catch (error) {
			console.error("Error deleting client:", error);
			throw new Error(
				`Failed to delete client: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get client financial summary
	 */
	async getClientFinancialSummary(clientId: string, userId: string) {
		try {
			// Verify client exists and belongs to user
			await this.getClientById(clientId, userId);

			// Get project statistics
			const [projectStats] = await db
				.select({
					totalProjects: count(agencyProjects.id),
					totalRevenue: sum(agencyProjects.budget),
					averageProjectValue: avg(agencyProjects.budget),
					totalActualCost: sum(agencyProjects.actualCost),
					totalActualHours: sum(agencyProjects.actualHours),
				})
				.from(agencyProjects)
				.where(
					and(
						eq(agencyProjects.clientId, clientId),
						eq(agencyProjects.userId, userId),
					),
				);

			// Get budget statistics
			const [budgetStats] = await db
				.select({
					totalBudget: sum(clientBudgets.budgetAmount),
					totalSpent: sum(clientBudgets.spentAmount),
					totalRemaining: sum(clientBudgets.remainingAmount),
				})
				.from(clientBudgets)
				.where(
					and(
						eq(clientBudgets.clientId, clientId),
						eq(clientBudgets.userId, userId),
					),
				);

			// Get recent projects
			const recentProjects = await db
				.select()
				.from(agencyProjects)
				.where(
					and(
						eq(agencyProjects.clientId, clientId),
						eq(agencyProjects.userId, userId),
					),
				)
				.orderBy(desc(agencyProjects.createdAt))
				.limit(5);

			return {
				projectStats: {
					totalProjects: projectStats.totalProjects || 0,
					totalRevenue: projectStats.totalRevenue || 0,
					averageProjectValue: projectStats.averageProjectValue || 0,
					totalActualCost: projectStats.totalActualCost || 0,
					totalActualHours: projectStats.totalActualHours || 0,
				},
				budgetStats: {
					totalBudget: budgetStats.totalBudget || 0,
					totalSpent: budgetStats.totalSpent || 0,
					totalRemaining: budgetStats.totalRemaining || 0,
				},
				recentProjects,
			};
		} catch (error) {
			console.error("Error fetching client financial summary:", error);
			throw new Error(
				`Failed to fetch client financial summary: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get client projects
	 */
	async getClientProjects(
		clientId: string,
		userId: string,
		filters: {
			status?: string;
			limit?: number;
			offset?: number;
		} = {},
	) {
		try {
			const { status, limit = 50, offset = 0 } = filters;

			const whereConditions = [
				eq(agencyProjects.clientId, clientId),
				eq(agencyProjects.userId, userId),
			];

			if (status) {
				whereConditions.push(eq(agencyProjects.status, status as any));
			}

			const projects = await db
				.select()
				.from(agencyProjects)
				.where(and(...whereConditions))
				.orderBy(desc(agencyProjects.createdAt))
				.limit(limit)
				.offset(offset);

			return projects;
		} catch (error) {
			console.error("Error fetching client projects:", error);
			throw new Error(
				`Failed to fetch client projects: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get client budgets
	 */
	async getClientBudgets(
		clientId: string,
		userId: string,
		filters: {
			status?: string;
			limit?: number;
			offset?: number;
		} = {},
	) {
		try {
			const { status, limit = 50, offset = 0 } = filters;

			const whereConditions = [
				eq(clientBudgets.clientId, clientId),
				eq(clientBudgets.userId, userId),
			];

			if (status) {
				whereConditions.push(eq(clientBudgets.status, status as any));
			}

			const budgets = await db
				.select()
				.from(clientBudgets)
				.where(and(...whereConditions))
				.orderBy(desc(clientBudgets.createdAt))
				.limit(limit)
				.offset(offset);

			return budgets;
		} catch (error) {
			console.error("Error fetching client budgets:", error);
			throw new Error(
				`Failed to fetch client budgets: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get client statistics
	 */
	async getClientStats(userId: string) {
		try {
			// Get total clients by status
			const [clientStats] = await db
				.select({
					totalClients: count(agencyClients.id),
					activeClients: count(agencyClients.id),
					prospectClients: count(agencyClients.id),
					churnedClients: count(agencyClients.id),
				})
				.from(agencyClients)
				.where(eq(agencyClients.userId, userId));

			// Get revenue statistics
			const [revenueStats] = await db
				.select({
					totalRevenue: sum(agencyClients.totalRevenue),
					averageRevenue: avg(agencyClients.totalRevenue),
				})
				.from(agencyClients)
				.where(eq(agencyClients.userId, userId));

			return {
				clientStats,
				revenueStats,
			};
		} catch (error) {
			console.error("Error fetching client stats:", error);
			throw new Error(
				`Failed to fetch client stats: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Search clients
	 */
	async searchClients(userId: string, query: string, limit = 20) {
		try {
			const clients = await db
				.select()
				.from(agencyClients)
				.where(
					and(
						eq(agencyClients.userId, userId),
						// This is a simplified search - in production you'd use full-text search
						// For now, we'll search by name, company, and email
					),
				)
				.orderBy(desc(agencyClients.createdAt))
				.limit(limit);

			return clients;
		} catch (error) {
			console.error("Error searching clients:", error);
			throw new Error(
				`Failed to search clients: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}
}
