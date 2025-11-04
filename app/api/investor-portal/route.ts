/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { investorPortals, customReports, investorAccessLogs } from '@/lib/db/schemas';
import { eq, and, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

// GET /api/investor-portal - List user's investor portals
export async function GET() {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const portals = await db
			.select()
			.from(investorPortals)
			.where(eq(investorPortals.userId, userId))
			.orderBy(investorPortals.createdAt);

		// Add access statistics for each portal
		const portalsWithStats = await Promise.all(
			portals.map(async (portal) => {
				// Count access logs for this portal
				const accessCount = await db
					.select({ count: sql<number>`count(*)` })
					.from(investorAccessLogs)
					.where(eq(investorAccessLogs.portalId, portal.id));

				// Get last access
				const lastAccess = await db
					.select()
					.from(investorAccessLogs)
					.where(eq(investorAccessLogs.portalId, portal.id))
					.orderBy(investorAccessLogs.accessedAt)
					.limit(1);

				return {
					...portal,
					accessCount: Number(accessCount[0]?.count || 0),
					lastAccessed: lastAccess[0]?.accessedAt,
				};
			})
		);

		return NextResponse.json(portalsWithStats);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

// POST /api/investor-portal - Create new investor portal
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const {
			name,
			description,
			logo,
			primaryColor = '#3b82f6',
			allowedMetrics = [],
			allowedReports = [],
			expiresAt,
		} = body;

		if (!name) {
			return ApiErrorHandler.badRequest('Portal name is required');
		}

		// Generate unique access token
		const accessToken = nanoid(32);

		// Validate allowed reports exist and belong to user
		if (allowedReports.length > 0) {
			const validReports = await db
				.select()
				.from(customReports)
				.where(and(
					eq(customReports.userId, userId),
					sql`${customReports.id} = ANY(${allowedReports})`
				));

			if (validReports.length !== allowedReports.length) {
				return ApiErrorHandler.badRequest('Invalid report IDs');
			}
		}

		const newPortal = await db.insert(investorPortals).values({
			userId,
			name,
			description,
			logo,
			primaryColor,
			allowedMetrics,
			allowedReports,
			accessToken,
			expiresAt: expiresAt ? new Date(expiresAt) : null,
			isActive: true,
		}).returning();

		return NextResponse.json(newPortal[0], { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
