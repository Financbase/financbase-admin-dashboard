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

			const service = new TaxService();
			let documents = await service.getDocuments(clerkUserId, year);

			// Filter by type if provided
			if (type) {
				documents = documents.filter((d) => d.type === type);
			}

			return NextResponse.json({
				success: true,
				data: documents,
			});
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

			return NextResponse.json(
				{
					success: true,
					message: "Tax document created successfully",
					data: document,
				},
				{ status: 201 }
			);
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

