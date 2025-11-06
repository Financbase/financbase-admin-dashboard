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
 * GET /api/training/programs-with-progress
 * Get all training programs with user's progress
 */
export async function GET(request: Request) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		
		// If user is authenticated, include their progress
		// If not authenticated, return programs without progress
		if (userId) {
			const programs = await TrainingService.getProgramsWithProgress(userId);
			return NextResponse.json({
				success: true,
				data: programs,
				error: null,
			});
		} else {
			// Return programs without progress for unauthenticated users
			const programs = await TrainingService.getPrograms();
			return NextResponse.json({
				success: true,
				data: programs,
				error: null,
			});
		}
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

