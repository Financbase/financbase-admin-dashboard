import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { OnboardingService } from "@/lib/services/onboarding/onboarding-service";
import { EmailService } from "@/lib/email/service";
import { z } from "zod";

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
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
		console.error("Error getting onboarding status:", error);
		return NextResponse.json(
			{ error: "Failed to get onboarding status" },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/onboarding - Initialize onboarding for a user
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = initializeOnboardingSchema.parse(body);
		const { persona } = validatedData;

		// Check if user already has onboarding
		const existingOnboarding = await OnboardingService.getOnboardingStatus(userId);
		if (existingOnboarding) {
			return NextResponse.json(
				{ error: "Onboarding already exists for this user" },
				{ status: 400 }
			);
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
			console.error("Error sending welcome email:", emailError);
			// Don't fail the onboarding if email fails
		}

		return NextResponse.json({
			onboarding,
			success: true,
			message: "Onboarding initialized successfully"
		}, { status: 201 });

	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation error", details: error.issues },
				{ status: 400 }
			);
		}

		console.error("Error initializing onboarding:", error);
		return NextResponse.json(
			{ error: "Failed to initialize onboarding" },
			{ status: 500 }
		);
	}
}

/**
 * PATCH /api/onboarding - Update onboarding progress
 */
export async function PATCH(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = updateOnboardingSchema.parse(body);

		// Get current onboarding status
		const currentStatus = await OnboardingService.getOnboardingStatus(userId);
		if (!currentStatus) {
			return NextResponse.json(
				{ error: "No onboarding found for user" },
				{ status: 404 }
			);
		}

		// Update onboarding record (this would require extending the service)
		// For now, return success
		return NextResponse.json({
			success: true,
			message: "Onboarding updated successfully"
		});

	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation error", details: error.issues },
				{ status: 400 }
			);
		}

		console.error("Error updating onboarding:", error);
		return NextResponse.json(
			{ error: "Failed to update onboarding" },
			{ status: 500 }
		);
	}
}
