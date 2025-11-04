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
import { OnboardingService } from "@/lib/services/onboarding/onboarding-service";
import { z } from "zod";
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

// Validation schema
const skipOnboardingSchema = z.object({
	reason: z.string().optional(),
	feedback: z.string().optional()
});

/**
 * POST /api/onboarding/skip - Skip entire onboarding process
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const validatedData = skipOnboardingSchema.parse(body);
		const { reason, feedback } = validatedData;

		// Check if user has onboarding to skip
		const onboardingStatus = await OnboardingService.getOnboardingStatus(userId);
		if (!onboardingStatus) {
			return ApiErrorHandler.notFound("No onboarding found for user");
		}

		// Skip the entire onboarding
		const skippedOnboarding = await OnboardingService.skipOnboarding(userId);

		return NextResponse.json({
			onboarding: skippedOnboarding,
			success: true,
			message: "Onboarding skipped successfully"
		});

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
