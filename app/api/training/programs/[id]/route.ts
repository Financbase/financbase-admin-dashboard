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
import { TrainingService } from "@/lib/services/training-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";

/**
 * GET /api/training/programs/[id]
 * Get a specific training program by ID
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { id } = await params;
		const program = await TrainingService.getProgramById(id);

		if (!program) {
			return ApiErrorHandler.notFound("Training program not found");
		}

		return NextResponse.json({
			success: true,
			data: program,
			error: null,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

