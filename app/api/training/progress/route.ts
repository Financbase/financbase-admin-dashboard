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
 * GET /api/training/progress
 * Get user's training progress for all programs
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const progress = await TrainingService.getUserProgress(userId);

		return NextResponse.json({
			success: true,
			data: progress,
			error: null,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/training/progress
 * Update or create training progress
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const body = await request.json();
		const { programId, status, progress } = body;

		if (!programId) {
			return ApiErrorHandler.badRequest("programId is required");
		}

		if (status && !["not_started", "in_progress", "completed"].includes(status)) {
			return ApiErrorHandler.badRequest("Invalid status value");
		}

		if (progress !== undefined && (progress < 0 || progress > 100)) {
			return ApiErrorHandler.badRequest("Progress must be between 0 and 100");
		}

		const updatedProgress = await TrainingService.updateProgress(userId, programId, {
			status,
			progress,
		});

		return NextResponse.json({
			success: true,
			data: updatedProgress,
			error: null,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

