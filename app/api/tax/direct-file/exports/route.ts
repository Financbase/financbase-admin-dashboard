/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { directFileExports } from "@/lib/db/schemas/direct-file.schema";
import { eq, desc } from "drizzle-orm";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";
import { withRLS } from "@/lib/api/with-rls";
import { createSuccessResponse, type StandardApiResponse } from "@/lib/api/standard-response";

/**
 * GET /api/tax/direct-file/exports
 * Get export history for the current user (metadata only, no PII/FTI)
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	return withRLS<StandardApiResponse<unknown>>(async (clerkUserId) => {
		try {
			// Fetch export metadata for user (no PII/FTI)
			const exports = await db
				.select()
				.from(directFileExports)
				.where(eq(directFileExports.userId, clerkUserId))
				.orderBy(desc(directFileExports.exportDate));

			return createSuccessResponse(exports, 200, { requestId });
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId) as NextResponse<StandardApiResponse<unknown>>;
		}
	});
}

/**
 * POST /api/tax/direct-file/exports
 * Store export metadata (no PII/FTI)
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	return withRLS<StandardApiResponse<unknown>>(async (clerkUserId) => {
		try {
			let body;
			try {
				body = await request.json();
			} catch (error) {
				return ApiErrorHandler.badRequest("Invalid JSON in request body") as NextResponse<StandardApiResponse<unknown>>;
			}

			const { filename, format, fileSize } = body;

			// Validate that no PII/FTI is being stored
			if (!filename || !format || (format !== "mef-xml" && format !== "json")) {
				return ApiErrorHandler.badRequest(
					"Invalid export metadata: filename and format (mef-xml or json) are required"
				) as NextResponse<StandardApiResponse<unknown>>;
			}

			// Store only metadata
			const exportRecord = await db
				.insert(directFileExports)
				.values({
					userId: clerkUserId,
					filename,
					format,
					fileSize: fileSize || null,
					exportDate: new Date(),
				})
				.returning();

			return createSuccessResponse(
				exportRecord[0],
				201,
				{ requestId }
			);
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId) as NextResponse<StandardApiResponse<unknown>>;
		}
	});
}

