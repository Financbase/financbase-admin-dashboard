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
import { EmailService } from "@/lib/email/service";
import { z } from "zod";
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

// Validation schemas
const completeStepSchema = z.object({
	stepData: z.record(z.string(), z.unknown()).optional(),
	timeSpent: z.number().optional()
});

const skipStepSchema = z.object({
	reason: z.string().optional()
});

interface RouteParams {
	params: Promise<{ stepId: string }>;
}

/**
 * POST /api/onboarding/steps/[stepId] - Complete a specific onboarding step
 */
export async function POST(
	request: NextRequest,
	{ params }: RouteParams
) {
	const requestId = generateRequestId();
	const { stepId } = await params;
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

		const validatedData = completeStepSchema.parse(body);
		const { stepData = {}, timeSpent } = validatedData;

		// Complete the step
		const completedStep = await OnboardingService.completeStep(userId, stepId, stepData);

		// Get updated onboarding status
		const onboardingStatus = await OnboardingService.getOnboardingStatus(userId);
		
		// Send milestone email if this is a significant step
		if (shouldSendMilestoneEmail(stepId)) {
			try {
				// Get user info (replace with actual user data)
				const userEmail = "user@example.com";
				const userName = "User";
				const persona = onboardingStatus?.userOnboarding.persona || "freelancer";
				
				await EmailService.sendMilestoneEmail(
					userEmail, 
					userName, 
					`Completed ${completedStep.stepName}`,
					persona as any
				);
			} catch (emailError) {
				// Don't fail the step completion if email fails
			}
		}

		return NextResponse.json({
			step: completedStep,
			onboarding: onboardingStatus,
			success: true,
			message: "Step completed successfully"
		});

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * PATCH /api/onboarding/steps/[stepId] - Skip a specific onboarding step
 */
export async function PATCH(
	request: NextRequest,
	{ params }: RouteParams
) {
	const requestId = generateRequestId();
	const { stepId } = await params;
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

		const validatedData = skipStepSchema.parse(body);
		const { reason } = validatedData;

		// Skip the step
		const skippedStep = await OnboardingService.skipStep(userId, stepId);

		// Get updated onboarding status
		const onboardingStatus = await OnboardingService.getOnboardingStatus(userId);

		return NextResponse.json({
			step: skippedStep,
			onboarding: onboardingStatus,
			success: true,
			message: "Step skipped successfully"
		});

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * GET /api/onboarding/steps/[stepId] - Get step details
 */
export async function GET(
	request: NextRequest,
	{ params }: RouteParams
) {
	const requestId = generateRequestId();
	const { stepId } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Get onboarding status to find the step
		const onboardingStatus = await OnboardingService.getOnboardingStatus(userId);
		if (!onboardingStatus) {
			return ApiErrorHandler.notFound("No onboarding found for user");
		}

		// Find the specific step
		const step = onboardingStatus.steps.find(s => s.stepId === stepId);
		if (!step) {
			return ApiErrorHandler.notFound("Step not found");
		}

		// Get step configuration from flow
		const flow = OnboardingService.getPersonaFlow(onboardingStatus.userOnboarding.persona);
		const stepConfig = flow.steps.find(s => s.stepId === stepId);

		return NextResponse.json({
			step,
			stepConfig,
			success: true
		});

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * Helper function to determine if a milestone email should be sent
 */
function shouldSendMilestoneEmail(stepId: string): boolean {
	// Define which steps are significant enough to send milestone emails
	const milestoneSteps = [
		"import_clients",
		"import_financials", 
		"add_property",
		"setup_profile",
		"create_invoice",
		"invoice_demo",
		"profitability_dashboard",
		"portfolio_dashboard",
		"burn_rate_dashboard"
	];
	
	return milestoneSteps.includes(stepId);
}
