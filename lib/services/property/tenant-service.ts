/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { getDbOrThrow } from "@/lib/db";
import {
	type NewServiceRequest,
	type NewTenantApplication,
	type ServiceRequest,
	type TenantApplication,
	properties,
	serviceRequests,
	tenantApplications,
	tenants,
} from "@/lib/db/schemas/real-estate-expanded.schema";
import { and, count, desc, eq, sql, sum } from "drizzle-orm";
import { Clock, LayoutDashboard } from "lucide-react";

/**
 * Create a tenant application
 */
export async function createTenantApplication(
	applicationData: Omit<NewTenantApplication, "createdAt" | "updatedAt">,
): Promise<TenantApplication> {
	const db = getDbOrThrow();

	const [application] = await db
		.insert(tenantApplications)
		.values(applicationData)
		.returning();

	return application;
}

/**
 * Get tenant applications for a user
 */
export async function getTenantApplications(
	applicantId: string,
	options?: {
		status?: string;
		limit?: number;
		offset?: number;
	},
): Promise<TenantApplication[]> {
	const db = getDbOrThrow();

	const conditions = [eq(tenantApplications.applicantId, applicantId)];

	if (options?.status) {
		conditions.push(eq(tenantApplications.status, options.status));
	}

	const whereClause = and(...conditions);

	const result = await db
		.select()
		.from(tenantApplications)
		.where(whereClause)
		.orderBy(desc(tenantApplications.createdAt))
		.limit(options?.limit || 50)
		.offset(options?.offset || 0);

	return result;
}

/**
 * Update tenant application status
 */
export async function updateTenantApplicationStatus(
	applicationId: string,
	applicantId: string,
	status: string,
	notes?: string,
): Promise<TenantApplication | null> {
	const db = getDbOrThrow();

	const updateData: any = { status };
	if (status === "approved" || status === "denied") {
		updateData.decisionDate = new Date();
	}
	if (notes) {
		updateData.notes = notes;
	}

	const [application] = await db
		.update(tenantApplications)
		.set({
			...updateData,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(tenantApplications.id, applicationId),
				eq(tenantApplications.applicantId, applicantId),
			),
		)
		.returning();

	return application || null;
}

/**
 * Create a service request
 */
export async function createServiceRequest(
	requestData: Omit<NewServiceRequest, "createdAt" | "updatedAt">,
): Promise<ServiceRequest> {
	const db = getDbOrThrow();

	const [request] = await db
		.insert(serviceRequests)
		.values(requestData)
		.returning();

	return request;
}

/**
 * Get service requests for a tenant
 */
export async function getTenantServiceRequests(
	tenantId: string,
	options?: {
		status?: string;
		priority?: string;
		category?: string;
		limit?: number;
		offset?: number;
	},
): Promise<ServiceRequest[]> {
	const db = getDbOrThrow();

	const conditions = [eq(serviceRequests.tenantId, tenantId)];

	if (options?.status) {
		conditions.push(eq(serviceRequests.status, options.status));
	}

	if (options?.priority) {
		conditions.push(eq(serviceRequests.priority, options.priority));
	}

	if (options?.category) {
		conditions.push(eq(serviceRequests.category, options.category));
	}

	const whereClause = and(...conditions);

	const result = await db
		.select()
		.from(serviceRequests)
		.where(whereClause)
		.orderBy(desc(serviceRequests.priority), desc(serviceRequests.createdAt))
		.limit(options?.limit || 50)
		.offset(options?.offset || 0);

	return result;
}

/**
 * Update service request
 */
export async function updateServiceRequest(
	requestId: string,
	tenantId: string,
	updateData: Partial<{
		title: string;
		description: string;
		priority: string;
		photos: any;
		tenantNotes: string;
	}>,
): Promise<ServiceRequest | null> {
	const db = getDbOrThrow();

	const [request] = await db
		.update(serviceRequests)
		.set({
			...updateData,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(serviceRequests.id, requestId),
				eq(serviceRequests.tenantId, tenantId),
			),
		)
		.returning();

	return request || null;
}

/**
 * Get tenant dashboard data
 */
export async function getTenantDashboard(tenantId: string): Promise<{
	activeRequests: number;
	completedRequests: number;
	emergencyRequests: number;
	averageResponseTime: number;
	recentRequests: ServiceRequest[];
	propertyInfo: {
		propertyId: string;
		address: string;
		propertyType: string;
		rentalAmount: number;
	} | null;
}> {
	const db = getDbOrThrow();

	// Get service request statistics
	const [requestStats] = await db
		.select({
			activeRequests: sql<number>`count(CASE WHEN ${serviceRequests.status} IN ('submitted', 'acknowledged', 'in_progress') THEN 1 END)`,
			completedRequests: sql<number>`count(CASE WHEN ${serviceRequests.status} = 'completed' THEN 1 END)`,
			emergencyRequests: sql<number>`count(CASE WHEN ${serviceRequests.priority} = 'emergency' THEN 1 END)`,
		})
		.from(serviceRequests)
		.where(eq(serviceRequests.tenantId, tenantId));

	// Get recent requests
	const recentRequests = await db
		.select()
		.from(serviceRequests)
		.where(eq(serviceRequests.tenantId, tenantId))
		.orderBy(desc(serviceRequests.requestedDate))
		.limit(5);

	// Get property information
	const [propertyInfo] = await db
		.select({
			propertyId: properties.id,
			address: properties.address,
			propertyType: properties.propertyType,
			rentalAmount: sql<number>`COALESCE(avg(${serviceRequests.estimatedCost}), 0)`, // This would need to be from leases table
		})
		.from(tenants)
		.innerJoin(properties, eq(tenants.propertyId, properties.id))
		.leftJoin(serviceRequests, eq(tenants.id, serviceRequests.tenantId))
		.where(eq(tenants.id, tenantId))
		.groupBy(properties.id, properties.address, properties.propertyType);

	return {
		activeRequests: Number(requestStats?.activeRequests || 0),
		completedRequests: Number(requestStats?.completedRequests || 0),
		emergencyRequests: Number(requestStats?.emergencyRequests || 0),
		averageResponseTime: 0, // Would need to calculate based on request to acknowledgment time
		recentRequests,
		propertyInfo: propertyInfo
			? {
					propertyId: propertyInfo.propertyId,
					address: propertyInfo.address || "",
					propertyType: propertyInfo.propertyType || "",
					rentalAmount: Number(propertyInfo.rentalAmount || 0),
				}
			: null,
	};
}

/**
 * Get tenant application statistics
 */
export async function getTenantApplicationStats(applicantId: string): Promise<{
	totalApplications: number;
	approvedApplications: number;
	deniedApplications: number;
	pendingApplications: number;
	approvalRate: number;
	averageRentalAmount: number;
}> {
	const db = getDbOrThrow();

	const [stats] = await db
		.select({
			totalApplications: count(tenantApplications.id),
			approvedApplications: sql<number>`count(CASE WHEN ${tenantApplications.status} = 'approved' THEN 1 END)`,
			deniedApplications: sql<number>`count(CASE WHEN ${tenantApplications.status} = 'denied' THEN 1 END)`,
			pendingApplications: sql<number>`count(CASE WHEN ${tenantApplications.status} IN ('submitted', 'under_review') THEN 1 END)`,
			averageRentalAmount: sql<number>`COALESCE(avg(${tenantApplications.rentalAmount}), 0)`,
		})
		.from(tenantApplications)
		.where(eq(tenantApplications.applicantId, applicantId));

	const totalApplications = Number(stats?.totalApplications || 0);
	const approvedApplications = Number(stats?.approvedApplications || 0);
	const approvalRate =
		totalApplications > 0
			? (approvedApplications / totalApplications) * 100
			: 0;

	return {
		totalApplications,
		approvedApplications,
		deniedApplications: Number(stats?.deniedApplications || 0),
		pendingApplications: Number(stats?.pendingApplications || 0),
		approvalRate,
		averageRentalAmount: Number(stats?.averageRentalAmount || 0),
	};
}
