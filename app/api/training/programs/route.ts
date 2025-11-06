/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { TrainingService } from "@/lib/services/training-service";
import { ApiErrorHandler, generateRequestId } from "@/lib/api-error-handler";

/**
 * GET /api/training/programs
 * Get all active training programs
 */
export async function GET(request: Request) {
	const requestId = generateRequestId();
	try {
		// Allow public access to view training programs
		// Progress tracking requires authentication
		const programs = await TrainingService.getPrograms();

		return NextResponse.json({
			success: true,
			data: programs,
			error: null,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

