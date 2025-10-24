import { db } from "@/lib/db";
import { 
	userOnboarding, 
	onboardingSteps, 
	onboardingAnalytics,
	type UserOnboarding,
	type Persona,
	type StepStatus
} from "@/lib/db/schemas/onboarding.schema";
import { getOnboardingFlow } from "@/lib/data/onboarding-flows";
import { eq, and } from "drizzle-orm";

export interface OnboardingProgress {
	userOnboarding: UserOnboarding;
	steps: Array<{
		id: string;
		userOnboardingId: string;
		stepId: string;
		stepName: string;
		stepOrder: number;
		status: StepStatus;
		isRequired: boolean;
		stepData: Record<string, unknown>;
		startedAt: Date | null;
		completedAt: Date | null;
		skippedAt: Date | null;
		errorMessage: string | null;
		createdAt: Date;
		updatedAt: Date;
	}>;
	currentStep?: {
		id: string;
		userOnboardingId: string;
		stepId: string;
		stepName: string;
		stepOrder: number;
		status: StepStatus;
		isRequired: boolean;
		stepData: Record<string, unknown>;
		startedAt: Date | null;
		completedAt: Date | null;
		skippedAt: Date | null;
		errorMessage: string | null;
		createdAt: Date;
		updatedAt: Date;
	};
	nextStep?: {
		id: string;
		userOnboardingId: string;
		stepId: string;
		stepName: string;
		stepOrder: number;
		status: StepStatus;
		isRequired: boolean;
		stepData: Record<string, unknown>;
		startedAt: Date | null;
		completedAt: Date | null;
		skippedAt: Date | null;
		errorMessage: string | null;
		createdAt: Date;
		updatedAt: Date;
	};
	progress: {
		completed: number;
		total: number;
		percentage: number;
	};
}

export interface StepCompletionData {
	stepId: string;
	stepData: Record<string, unknown>;
	completedAt?: Date;
}

export class OnboardingService {
	/**
	 * Initialize onboarding for a new user
	 */
	static async initializeOnboarding(
		userId: string, 
		persona: Persona
	): Promise<UserOnboarding> {
		try {
			// Get the flow configuration for this persona
			const flow = getOnboardingFlow(persona);
			
			// Create the main onboarding record
			const newOnboarding = await db.insert(userOnboarding).values({
				userId,
				persona,
				status: "in_progress",
				currentStep: flow.steps[0]?.stepId,
				totalSteps: flow.steps.length,
				completedSteps: 0,
				startedAt: new Date(),
				metadata: {
					flowVersion: "1.0.0",
					estimatedTime: flow.estimatedTime
				}
			}).returning();

			// Create step records for each step in the flow
			const stepRecords: NewOnboardingStep[] = flow.steps.map(step => ({
				userOnboardingId: newOnboarding[0].id,
				stepId: step.stepId,
				stepName: step.stepName,
				stepOrder: step.stepOrder,
				status: "not_started",
				isRequired: step.isRequired,
				stepData: {}
			}));

			await db.insert(onboardingSteps).values(stepRecords);

			// Track analytics
			await this.trackOnboardingEvent(userId, persona, "started");

			return newOnboarding[0];
		} catch (error) {
			console.error("Error initializing onboarding:", error);
			throw new Error("Failed to initialize onboarding");
		}
	}

	/**
	 * Get current onboarding status for a user
	 */
	static async getOnboardingStatus(userId: string): Promise<OnboardingProgress | null> {
		try {
			// Get the main onboarding record
			const userOnboardingRecord = await db
				.select()
				.from(userOnboarding)
				.where(eq(userOnboarding.userId, userId))
				.limit(1);

			if (!userOnboardingRecord.length) {
				return null;
			}

			// Get all steps for this onboarding
			const steps = await db
				.select()
				.from(onboardingSteps)
				.where(eq(onboardingSteps.userOnboardingId, userOnboardingRecord[0].id))
				.orderBy(onboardingSteps.stepOrder);

			// Find current step
			const currentStep = steps.find(step => step.status === "in_progress");
			
			// Find next step
			const nextStep = currentStep 
				? steps.find(step => step.stepOrder === currentStep.stepOrder + 1)
				: steps.find(step => step.status === "not_started");

			// Calculate progress
			const completedSteps = steps.filter(step => step.status === "completed").length;
			const totalSteps = steps.length;
			const percentage = Math.round((completedSteps / totalSteps) * 100);

			return {
				userOnboarding: userOnboardingRecord[0],
				steps,
				currentStep,
				nextStep,
				progress: {
					completed: completedSteps,
					total: totalSteps,
					percentage
				}
			};
		} catch (error) {
			console.error("Error getting onboarding status:", error);
			throw new Error("Failed to get onboarding status");
		}
	}

	/**
	 * Complete a specific onboarding step
	 */
	static async completeStep(
		userId: string, 
		stepId: string, 
		stepData: Record<string, unknown>
	): Promise<{
		id: string;
		userOnboardingId: string;
		stepId: string;
		stepName: string;
		stepOrder: number;
		status: StepStatus;
		isRequired: boolean;
		stepData: Record<string, unknown>;
		startedAt: Date | null;
		completedAt: Date | null;
		skippedAt: Date | null;
		errorMessage: string | null;
		createdAt: Date;
		updatedAt: Date;
	}> {
		try {
			// Get the user's onboarding record
			const userOnboardingRecord = await db
				.select()
				.from(userOnboarding)
				.where(eq(userOnboarding.userId, userId))
				.limit(1);

			if (!userOnboardingRecord.length) {
				throw new Error("Onboarding not found");
			}

			// Update the step
			const updatedStep = await db
				.update(onboardingSteps)
				.set({
					status: "completed",
					stepData,
					completedAt: new Date(),
					updatedAt: new Date()
				})
				.where(and(
					eq(onboardingSteps.userOnboardingId, userOnboardingRecord[0].id),
					eq(onboardingSteps.stepId, stepId)
				))
				.returning();

			// Update the main onboarding record
			const newCompletedSteps = userOnboardingRecord[0].completedSteps + 1;
			const isComplete = newCompletedSteps >= userOnboardingRecord[0].totalSteps;

			await db
				.update(userOnboarding)
				.set({
					completedSteps: newCompletedSteps,
					status: isComplete ? "completed" : "in_progress",
					completedAt: isComplete ? new Date() : undefined,
					currentStep: isComplete ? null : await this.getNextStepId(userId),
					updatedAt: new Date()
				})
				.where(eq(userOnboarding.userId, userId));

			// Track analytics
			await this.trackOnboardingEvent(userId, userOnboardingRecord[0].persona, "step_completed", stepId);

			// If onboarding is complete, track completion
			if (isComplete) {
				await this.trackOnboardingEvent(userId, userOnboardingRecord[0].persona, "completed");
			}

			return updatedStep[0];
		} catch (error) {
			console.error("Error completing step:", error);
			throw new Error("Failed to complete step");
		}
	}

	/**
	 * Skip a specific onboarding step
	 */
	static async skipStep(userId: string, stepId: string): Promise<{
		id: string;
		userOnboardingId: string;
		stepId: string;
		stepName: string;
		stepOrder: number;
		status: StepStatus;
		isRequired: boolean;
		stepData: Record<string, unknown>;
		startedAt: Date | null;
		completedAt: Date | null;
		skippedAt: Date | null;
		errorMessage: string | null;
		createdAt: Date;
		updatedAt: Date;
	}> {
		try {
			// Get the user's onboarding record
			const userOnboardingRecord = await db
				.select()
				.from(userOnboarding)
				.where(eq(userOnboarding.userId, userId))
				.limit(1);

			if (!userOnboardingRecord.length) {
				throw new Error("Onboarding not found");
			}

			// Update the step
			const updatedStep = await db
				.update(onboardingSteps)
				.set({
					status: "skipped",
					skippedAt: new Date(),
					updatedAt: new Date()
				})
				.where(and(
					eq(onboardingSteps.userOnboardingId, userOnboardingRecord[0].id),
					eq(onboardingSteps.stepId, stepId)
				))
				.returning();

			// Update current step to next available step
			await db
				.update(userOnboarding)
				.set({
					currentStep: await this.getNextStepId(userId),
					updatedAt: new Date()
				})
				.where(eq(userOnboarding.userId, userId));

			// Track analytics
			await this.trackOnboardingEvent(userId, userOnboardingRecord[0].persona, "step_skipped", stepId);

			return updatedStep[0];
		} catch (error) {
			console.error("Error skipping step:", error);
			throw new Error("Failed to skip step");
		}
	}

	/**
	 * Skip entire onboarding process
	 */
	static async skipOnboarding(userId: string): Promise<UserOnboarding> {
		try {
			const updatedOnboarding = await db
				.update(userOnboarding)
				.set({
					status: "skipped",
					skippedAt: new Date(),
					updatedAt: new Date()
				})
				.where(eq(userOnboarding.userId, userId))
				.returning();

			// Track analytics
			if (updatedOnboarding[0]) {
				await this.trackOnboardingEvent(userId, updatedOnboarding[0].persona, "abandoned");
			}

			return updatedOnboarding[0];
		} catch (error) {
			console.error("Error skipping onboarding:", error);
			throw new Error("Failed to skip onboarding");
		}
	}

	/**
	 * Get persona flow configuration
	 */
	static getPersonaFlow(persona: Persona) {
		return getOnboardingFlow(persona);
	}

	/**
	 * Check if onboarding is complete
	 */
	static async isOnboardingComplete(userId: string): Promise<boolean> {
		try {
			const userOnboardingRecord = await db
				.select()
				.from(userOnboarding)
				.where(eq(userOnboarding.userId, userId))
				.limit(1);

			return userOnboardingRecord.length > 0 && userOnboardingRecord[0].status === "completed";
		} catch (error) {
			console.error("Error checking onboarding completion:", error);
			return false;
		}
	}

	/**
	 * Get next step ID for a user
	 */
	private static async getNextStepId(userId: string): Promise<string | null> {
		try {
			const userOnboardingRecord = await db
				.select()
				.from(userOnboarding)
				.where(eq(userOnboarding.userId, userId))
				.limit(1);

			if (!userOnboardingRecord.length) {
				return null;
			}

			const nextStep = await db
				.select()
				.from(onboardingSteps)
				.where(and(
					eq(onboardingSteps.userOnboardingId, userOnboardingRecord[0].id),
					eq(onboardingSteps.status, "not_started")
				))
				.orderBy(onboardingSteps.stepOrder)
				.limit(1);

			return nextStep[0]?.stepId || null;
		} catch (error) {
			console.error("Error getting next step:", error);
			return null;
		}
	}

	/**
	 * Track onboarding analytics events
	 */
	private static async trackOnboardingEvent(
		userId: string,
		persona: Persona,
		eventType: "started" | "step_completed" | "step_skipped" | "completed" | "abandoned",
		stepId?: string,
		stepName?: string,
		timeSpent?: number,
		metadata?: Record<string, unknown>
	): Promise<void> {
		try {
			await db.insert(onboardingAnalytics).values({
				userId,
				persona,
				eventType,
				stepId,
				stepName,
				timeSpent,
				metadata: metadata || {}
			});
		} catch (error) {
			console.error("Error tracking onboarding event:", error);
			// Don't throw error for analytics failures
		}
	}

	/**
	 * Get onboarding analytics for a persona
	 */
	static async getOnboardingAnalytics(): Promise<{
		totalStarted: number;
		totalCompleted: number;
		completionRate: number;
		averageTimeToComplete: number;
		stepCompletionRates: Record<string, number>;
	}> {
		try {
			// This would be implemented with proper analytics queries
			// For now, return mock data
			return {
				totalStarted: 0,
				totalCompleted: 0,
				completionRate: 0,
				averageTimeToComplete: 0,
				stepCompletionRates: {}
			};
		} catch (error) {
			console.error("Error getting onboarding analytics:", error);
			throw new Error("Failed to get onboarding analytics");
		}
	}
}
