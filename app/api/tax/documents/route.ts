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
import { TaxService } from "@/lib/services/business/tax-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";
import { createTaxDocumentSchema } from "@/lib/validation-schemas";
import { withRLS } from "@/lib/api/with-rls";
import { createSuccessResponse } from "@/lib/api/standard-response";

/**
 * GET /api/tax/documents
 * Get list of tax documents with optional filters
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	return withRLS(async (clerkUserId) => {
		try {
			const { searchParams } = new URL(request.url);
			const year = searchParams.get("year")
				? parseInt(searchParams.get("year")!)
				: undefined;
			const type = searchParams.get("type") || undefined;
			
			// Pagination parameters
			const page = searchParams.get("page")
				? parseInt(searchParams.get("page")!)
				: undefined;
			const limit = searchParams.get("limit")
				? parseInt(searchParams.get("limit")!)
				: undefined;
			const offset = page && limit ? (page - 1) * limit : undefined;

			const service = new TaxService();
			const result = await service.getDocuments(clerkUserId, year, {
				type,
				limit,
				offset,
			});

			// Check if result is paginated
			if (limit !== undefined && "data" in result) {
				return createSuccessResponse(
					result.data,
					200,
					{
						requestId,
						pagination: {
							page: result.page,
							limit: result.limit,
							total: result.total,
							totalPages: result.totalPages,
						},
					}
				);
			}

			// Filter by type if provided and not paginated
			let documents = Array.isArray(result) ? result : result.data;
			if (type && !limit) {
				documents = documents.filter((d) => d.type === type);
			}

			return createSuccessResponse(documents, 200, { requestId });
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

/**
 * POST /api/tax/documents
 * Create new tax document record
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	return withRLS(async (clerkUserId) => {
		try {
			let body;
			try {
				body = await request.json();
			} catch (error) {
				return ApiErrorHandler.badRequest("Invalid JSON in request body");
			}

			const validatedData = createTaxDocumentSchema.parse({
				...body,
				userId: clerkUserId,
			});

			const service = new TaxService();
			const document = await service.createDocument(validatedData);

			return createSuccessResponse(document, 201, { requestId });
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

