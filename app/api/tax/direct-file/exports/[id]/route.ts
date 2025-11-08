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
import { eq, and } from "drizzle-orm";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";
import { withRLS } from "@/lib/api/with-rls";

/**
 * DELETE /api/tax/direct-file/exports/[id]
 * Delete export metadata record (only if owned by user)
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	return withRLS(async (clerkUserId) => {
		try {
			const { id } = await params;

			// Verify the export exists and belongs to the user
			const exportRecord = await db
				.select()
				.from(directFileExports)
				.where(
					and(
						eq(directFileExports.id, id),
						eq(directFileExports.userId, clerkUserId)
					)
				)
				.limit(1);

			if (exportRecord.length === 0) {
				return ApiErrorHandler.notFound(
					"Export record not found or you do not have permission to delete it"
				);
			}

			// Delete the export record
			await db
				.delete(directFileExports)
				.where(
					and(
						eq(directFileExports.id, id),
						eq(directFileExports.userId, clerkUserId)
					)
				);

			return NextResponse.json({
				success: true,
				message: "Export metadata deleted successfully",
			});
		} catch (error) {
			return ApiErrorHandler.handle(error, requestId);
		}
	});
}

