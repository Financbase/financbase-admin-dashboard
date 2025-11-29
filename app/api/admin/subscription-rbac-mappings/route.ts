/**
 * Admin API for Subscription RBAC Mappings
 * Manage plan-to-role/permission mappings
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
	subscriptionPlanRbacMappings,
	subscriptionPlans,
} from "@/lib/db/schemas";
import { eq, and } from "drizzle-orm";
import { checkPermission } from "@/lib/auth/financbase-rbac";
import { FINANCIAL_PERMISSIONS } from "@/types/auth";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";
import { z } from "zod";

const createMappingSchema = z.object({
	planId: z.string().uuid(),
	role: z.enum(["admin", "manager", "user", "viewer"]),
	permissions: z.array(z.string()),
	isTrialMapping: z.boolean().default(false),
	gracePeriodDays: z.number().int().min(0).max(365).default(7),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

const updateMappingSchema = createMappingSchema.partial().extend({
	id: z.string().uuid(),
});

/**
 * GET /api/admin/subscription-rbac-mappings
 * List all plan mappings
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check if user has permission to manage roles
		const hasPermission = await checkPermission(
			FINANCIAL_PERMISSIONS.ROLES_MANAGE,
		);
		if (!hasPermission) {
			return ApiErrorHandler.forbidden(
				"You do not have permission to manage RBAC mappings",
			);
		}

		const { searchParams } = new URL(request.url);
		const planId = searchParams.get("planId");

		let query = db
			.select({
				mapping: subscriptionPlanRbacMappings,
				plan: subscriptionPlans,
			})
			.from(subscriptionPlanRbacMappings)
			.innerJoin(
				subscriptionPlans,
				eq(subscriptionPlans.id, subscriptionPlanRbacMappings.planId),
			);

		if (planId) {
			query = query.where(
				eq(subscriptionPlanRbacMappings.planId, planId),
			) as any;
		}

		const mappings = await query;

		return NextResponse.json({
			mappings: mappings.map((m) => ({
				...m.mapping,
				plan: m.plan,
			})),
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/admin/subscription-rbac-mappings
 * Create new mapping
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check if user has permission to manage roles
		const hasPermission = await checkPermission(
			FINANCIAL_PERMISSIONS.ROLES_MANAGE,
		);
		if (!hasPermission) {
			return ApiErrorHandler.forbidden(
				"You do not have permission to manage RBAC mappings",
			);
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest("Invalid JSON in request body");
		}

		const validatedData = createMappingSchema.parse(body);

		// Check if mapping already exists
		const existing = await db
			.select()
			.from(subscriptionPlanRbacMappings)
			.where(
				and(
					eq(subscriptionPlanRbacMappings.planId, validatedData.planId),
					eq(
						subscriptionPlanRbacMappings.isTrialMapping,
						validatedData.isTrialMapping,
					),
				),
			)
			.limit(1);

		if (existing.length > 0) {
			return ApiErrorHandler.badRequest(
				"Mapping already exists for this plan and trial status",
			);
		}

		// Create mapping
		const newMapping = await db
			.insert(subscriptionPlanRbacMappings)
			.values({
				planId: validatedData.planId,
				role: validatedData.role,
				permissions: validatedData.permissions,
				isTrialMapping: validatedData.isTrialMapping,
				gracePeriodDays: validatedData.gracePeriodDays,
				metadata: validatedData.metadata || {},
			})
			.returning();

		return NextResponse.json({
			success: true,
			mapping: newMapping[0],
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * PUT /api/admin/subscription-rbac-mappings
 * Update mapping
 */
export async function PUT(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check if user has permission to manage roles
		const hasPermission = await checkPermission(
			FINANCIAL_PERMISSIONS.ROLES_MANAGE,
		);
		if (!hasPermission) {
			return ApiErrorHandler.forbidden(
				"You do not have permission to manage RBAC mappings",
			);
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest("Invalid JSON in request body");
		}

		const validatedData = updateMappingSchema.parse(body);

		// Update mapping
		const updateData: any = {};
		if (validatedData.role) updateData.role = validatedData.role;
		if (validatedData.permissions)
			updateData.permissions = validatedData.permissions;
		if (validatedData.isTrialMapping !== undefined)
			updateData.isTrialMapping = validatedData.isTrialMapping;
		if (validatedData.gracePeriodDays !== undefined)
			updateData.gracePeriodDays = validatedData.gracePeriodDays;
		if (validatedData.metadata !== undefined)
			updateData.metadata = validatedData.metadata;
		updateData.updatedAt = new Date();

		const updatedMapping = await db
			.update(subscriptionPlanRbacMappings)
			.set(updateData)
			.where(eq(subscriptionPlanRbacMappings.id, validatedData.id))
			.returning();

		if (updatedMapping.length === 0) {
			return ApiErrorHandler.notFound("Mapping not found");
		}

		return NextResponse.json({
			success: true,
			mapping: updatedMapping[0],
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * DELETE /api/admin/subscription-rbac-mappings
 * Delete mapping
 */
export async function DELETE(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check if user has permission to manage roles
		const hasPermission = await checkPermission(
			FINANCIAL_PERMISSIONS.ROLES_MANAGE,
		);
		if (!hasPermission) {
			return ApiErrorHandler.forbidden(
				"You do not have permission to manage RBAC mappings",
			);
		}

		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return ApiErrorHandler.badRequest("Mapping ID is required");
		}

		// Delete mapping
		const deleted = await db
			.delete(subscriptionPlanRbacMappings)
			.where(eq(subscriptionPlanRbacMappings.id, id))
			.returning();

		if (deleted.length === 0) {
			return ApiErrorHandler.notFound("Mapping not found");
		}

		return NextResponse.json({
			success: true,
			message: "Mapping deleted successfully",
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

