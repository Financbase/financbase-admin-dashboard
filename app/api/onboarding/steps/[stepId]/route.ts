import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { OnboardingService } from "@/lib/services/onboarding/onboarding-service";
import { EmailService } from "@/lib/email/service";
import { z } from "zod";

// Validation schemas
const completeStepSchema = z.object({
	stepData: z.record(z.any()).optional(),
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
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { stepId } = await params;
		const body = await request.json();
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
				console.error("Error sending milestone email:", emailError);
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
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation error", details: error.issues },
				{ status: 400 }
			);
		}

		console.error("Error completing step:", error);
		return NextResponse.json(
			{ error: "Failed to complete step" },
			{ status: 500 }
		);
	}
}

/**
 * PATCH /api/onboarding/steps/[stepId] - Skip a specific onboarding step
 */
export async function PATCH(
	request: NextRequest,
	{ params }: RouteParams
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { stepId } = await params;
		const body = await request.json();
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
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation error", details: error.issues },
				{ status: 400 }
			);
		}

		console.error("Error skipping step:", error);
		return NextResponse.json(
			{ error: "Failed to skip step" },
			{ status: 500 }
		);
	}
}

/**
 * GET /api/onboarding/steps/[stepId] - Get step details
 */
export async function GET(
	request: NextRequest,
	{ params }: RouteParams
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { stepId } = await params;

		// Get onboarding status to find the step
		const onboardingStatus = await OnboardingService.getOnboardingStatus(userId);
		if (!onboardingStatus) {
			return NextResponse.json(
				{ error: "No onboarding found for user" },
				{ status: 404 }
			);
		}

		// Find the specific step
		const step = onboardingStatus.steps.find(s => s.stepId === stepId);
		if (!step) {
			return NextResponse.json(
				{ error: "Step not found" },
				{ status: 404 }
			);
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
		console.error("Error getting step details:", error);
		return NextResponse.json(
			{ error: "Failed to get step details" },
			{ status: 500 }
		);
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
