import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { OnboardingService } from "@/lib/services/onboarding/onboarding-service";
import { z } from "zod";

// Validation schema
const skipOnboardingSchema = z.object({
	reason: z.string().optional(),
	feedback: z.string().optional()
});

/**
 * POST /api/onboarding/skip - Skip entire onboarding process
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = skipOnboardingSchema.parse(body);
		const { reason, feedback } = validatedData;

		// Check if user has onboarding to skip
		const onboardingStatus = await OnboardingService.getOnboardingStatus(userId);
		if (!onboardingStatus) {
			return NextResponse.json(
				{ error: "No onboarding found for user" },
				{ status: 404 }
			);
		}

		// Skip the entire onboarding
		const skippedOnboarding = await OnboardingService.skipOnboarding(userId);

		// Log the skip reason for analytics
		console.log(`User ${userId} skipped onboarding. Reason: ${reason || 'Not provided'}`);
		if (feedback) {
			console.log(`User feedback: ${feedback}`);
		}

		return NextResponse.json({
			onboarding: skippedOnboarding,
			success: true,
			message: "Onboarding skipped successfully"
		});

	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation error", details: error.issues },
				{ status: 400 }
			);
		}

		console.error("Error skipping onboarding:", error);
		return NextResponse.json(
			{ error: "Failed to skip onboarding" },
			{ status: 500 }
		);
	}
}
