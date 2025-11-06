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
 * GET /api/training/stats
 * Get user's overall training statistics
 */
export async function GET(request: Request) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const stats = await TrainingService.getTrainingStats(userId);

		return NextResponse.json({
			success: true,
			data: stats,
			error: null,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

