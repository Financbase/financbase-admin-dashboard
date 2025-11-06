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
 * GET /api/training/paths-with-progress
 * Get all learning paths with user's progress
 */
export async function GET(request: Request) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		
		// If user is authenticated, include their progress
		// If not authenticated, return paths without progress
		if (userId) {
			const paths = await TrainingService.getLearningPathsWithProgress(userId);
			return NextResponse.json({
				success: true,
				data: paths,
				error: null,
			});
		} else {
			// Return paths without progress for unauthenticated users
			const paths = await TrainingService.getLearningPaths();
			return NextResponse.json({
				success: true,
				data: paths,
				error: null,
			});
		}
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

