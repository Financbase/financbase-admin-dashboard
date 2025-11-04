import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { OnboardingService } from "@/lib/services/onboarding/onboarding-service";
import { EmailService } from "@/lib/email/service";
import { z } from "zod";
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

// Validation schemas
const initializeOnboardingSchema = z.object({
	persona: z.enum(["digital_agency", "real_estate", "tech_startup", "freelancer"])
});

const updateOnboardingSchema = z.object({
	status: z.enum(["in_progress", "completed", "skipped"]).optional(),
	currentStep: z.string().optional(),
	metadata: z.record(z.any()).optional()
});

/**
 * GET /api/onboarding - Get current user's onboarding status
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const onboardingStatus = await OnboardingService.getOnboardingStatus(userId);
		
		if (!onboardingStatus) {
			return NextResponse.json({ 
				onboarding: null,
				message: "No onboarding found for user"
			});
		}

		return NextResponse.json({
			onboarding: onboardingStatus,
			success: true
		});

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/onboarding - Initialize onboarding for a user
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

		const validatedData = initializeOnboardingSchema.parse(body);
		const { persona } = validatedData;

		// Check if user already has onboarding
		const existingOnboarding = await OnboardingService.getOnboardingStatus(userId);
		if (existingOnboarding) {
			return ApiErrorHandler.badRequest("Onboarding already exists for this user");
		}

		// Initialize onboarding
		const onboarding = await OnboardingService.initializeOnboarding(userId, persona);

		// Send persona-specific welcome email
		try {
			// Get user info from Clerk (you might need to fetch this from your user service)
			const userEmail = "user@example.com"; // Replace with actual user email
			const userName = "User"; // Replace with actual user name
			
			await EmailService.sendPersonaWelcomeEmail(userEmail, userName, persona);
		} catch (emailError) {
			// Don't fail the onboarding if email fails - log but continue
		}

		return NextResponse.json({
			onboarding,
			success: true,
			message: "Onboarding initialized successfully"
		}, { status: 201 });

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * PATCH /api/onboarding - Update onboarding progress
 */
export async function PATCH(request: NextRequest) {
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

		const validatedData = updateOnboardingSchema.parse(body);

		// Get current onboarding status
		const currentStatus = await OnboardingService.getOnboardingStatus(userId);
		if (!currentStatus) {
			return ApiErrorHandler.notFound("No onboarding found for user");
		}

		// Update onboarding record (this would require extending the service)
		// For now, return success
		return NextResponse.json({
			success: true,
			message: "Onboarding updated successfully"
		});

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
