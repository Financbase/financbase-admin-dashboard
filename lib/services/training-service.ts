/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import {
	trainingPrograms,
	learningPaths,
	trainingProgress,
	learningPathProgress,
	type TrainingProgram,
	type LearningPath,
	type TrainingProgress,
	type LearningPathProgress,
	type NewTrainingProgress,
	type NewLearningPathProgress,
} from "@/lib/db/schemas/training.schema";
import { users } from "@/lib/db/schemas/users.schema";
import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";

export class TrainingService {
	/**
	 * Get all active training programs
	 */
	static async getPrograms(): Promise<TrainingProgram[]> {
		try {
			const programs = await db
				.select()
				.from(trainingPrograms)
				.where(eq(trainingPrograms.isActive, true))
				.orderBy(asc(trainingPrograms.order), asc(trainingPrograms.title));

			return programs;
		} catch (error) {
			console.error("Error fetching training programs:", error);
			throw new Error("Failed to fetch training programs");
		}
	}

	/**
	 * Get a specific training program by ID
	 */
	static async getProgramById(programId: string): Promise<TrainingProgram | null> {
		try {
			const [program] = await db
				.select()
				.from(trainingPrograms)
				.where(and(eq(trainingPrograms.id, programId), eq(trainingPrograms.isActive, true)))
				.limit(1);

			return program || null;
		} catch (error) {
			console.error("Error fetching training program:", error);
			throw new Error("Failed to fetch training program");
		}
	}

	/**
	 * Get all active learning paths
	 */
	static async getLearningPaths(): Promise<LearningPath[]> {
		try {
			const paths = await db
				.select()
				.from(learningPaths)
				.where(eq(learningPaths.isActive, true))
				.orderBy(asc(learningPaths.title));

			return paths;
		} catch (error) {
			console.error("Error fetching learning paths:", error);
			throw new Error("Failed to fetch learning paths");
		}
	}

	/**
	 * Get user's training progress for all programs
	 */
	static async getUserProgress(userId: string): Promise<TrainingProgress[]> {
		try {
			// First, get the internal user ID from Clerk ID
			const [user] = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.clerkId, userId))
				.limit(1);

			if (!user) {
				return [];
			}

			const progress = await db
				.select()
				.from(trainingProgress)
				.where(eq(trainingProgress.userId, user.id))
				.orderBy(desc(trainingProgress.updatedAt));

			return progress;
		} catch (error) {
			console.error("Error fetching user training progress:", error);
			throw new Error("Failed to fetch training progress");
		}
	}

	/**
	 * Get user's progress for a specific program
	 */
	static async getProgramProgress(
		userId: string,
		programId: string,
	): Promise<TrainingProgress | null> {
		try {
			// First, get the internal user ID from Clerk ID
			const [user] = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.clerkId, userId))
				.limit(1);

			if (!user) {
				return null;
			}

			const [progress] = await db
				.select()
				.from(trainingProgress)
				.where(
					and(
						eq(trainingProgress.userId, user.id),
						eq(trainingProgress.programId, programId),
					),
				)
				.limit(1);

			return progress || null;
		} catch (error) {
			console.error("Error fetching program progress:", error);
			throw new Error("Failed to fetch program progress");
		}
	}

	/**
	 * Update or create training progress
	 */
	static async updateProgress(
		userId: string,
		programId: string,
		data: {
			status?: "not_started" | "in_progress" | "completed";
			progress?: number;
		},
	): Promise<TrainingProgress> {
		try {
			// First, get the internal user ID from Clerk ID
			const [user] = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.clerkId, userId))
				.limit(1);

			if (!user) {
				throw new Error("User not found");
			}

			// Check if progress exists
			const existing = await this.getProgramProgress(userId, programId);

			if (existing) {
				// Update existing progress
				const updateData: Partial<TrainingProgress> = {
					updatedAt: new Date(),
				};

				if (data.status) {
					updateData.status = data.status;
					if (data.status === "in_progress" && !existing.startedAt) {
						updateData.startedAt = new Date();
					}
					if (data.status === "completed") {
						updateData.completedAt = new Date();
						updateData.progress = 100;
					}
				}

				if (data.progress !== undefined) {
					updateData.progress = data.progress.toString();
					if (data.progress >= 100) {
						updateData.status = "completed";
						updateData.completedAt = new Date();
					} else if (data.progress > 0 && existing.status === "not_started") {
						updateData.status = "in_progress";
						updateData.startedAt = new Date();
					}
				}

				updateData.lastAccessedAt = new Date();

				const [updated] = await db
					.update(trainingProgress)
					.set(updateData)
					.where(
						and(
							eq(trainingProgress.userId, user.id),
							eq(trainingProgress.programId, programId),
						),
					)
					.returning();

				return updated;
			} else {
				// Create new progress
				const newProgress: NewTrainingProgress = {
					userId: user.id,
					programId,
					status: data.status || "in_progress",
					progress: (data.progress || 0).toString(),
					startedAt: data.status === "in_progress" || data.progress ? new Date() : undefined,
					lastAccessedAt: new Date(),
					completedAt: data.status === "completed" ? new Date() : undefined,
				};

				const [created] = await db
					.insert(trainingProgress)
					.values(newProgress)
					.returning();

				return created;
			}
		} catch (error) {
			console.error("Error updating training progress:", error);
			throw new Error("Failed to update training progress");
		}
	}

	/**
	 * Get user's learning path progress
	 */
	static async getLearningPathProgress(
		userId: string,
		pathId: string,
	): Promise<LearningPathProgress | null> {
		try {
			// First, get the internal user ID from Clerk ID
			const [user] = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.clerkId, userId))
				.limit(1);

			if (!user) {
				return null;
			}

			const [progress] = await db
				.select()
				.from(learningPathProgress)
				.where(
					and(
						eq(learningPathProgress.userId, user.id),
						eq(learningPathProgress.pathId, pathId),
					),
				)
				.limit(1);

			return progress || null;
		} catch (error) {
			console.error("Error fetching learning path progress:", error);
			throw new Error("Failed to fetch learning path progress");
		}
	}

	/**
	 * Get user's overall training statistics
	 */
	static async getTrainingStats(userId: string): Promise<{
		totalPrograms: number;
		completedPrograms: number;
		inProgressPrograms: number;
		notStartedPrograms: number;
		overallProgress: number;
	}> {
		try {
			// First, get the internal user ID from Clerk ID
			const [user] = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.clerkId, userId))
				.limit(1);

			if (!user) {
				return {
					totalPrograms: 0,
					completedPrograms: 0,
					inProgressPrograms: 0,
					notStartedPrograms: 0,
					overallProgress: 0,
				};
			}

			// Get all active programs
			const allPrograms = await this.getPrograms();
			const totalPrograms = allPrograms.length;

			// Get user's progress
			const userProgress = await this.getUserProgress(userId);

			const completedPrograms = userProgress.filter(
				(p) => p.status === "completed",
			).length;
			const inProgressPrograms = userProgress.filter(
				(p) => p.status === "in_progress",
			).length;
			const notStartedPrograms = totalPrograms - completedPrograms - inProgressPrograms;

			// Calculate overall progress
			const totalProgress = userProgress.reduce((sum, p) => {
				return sum + Number.parseFloat(p.progress || "0");
			}, 0);
			const overallProgress =
				totalPrograms > 0 ? Math.round(totalProgress / totalPrograms) : 0;

			return {
				totalPrograms,
				completedPrograms,
				inProgressPrograms,
				notStartedPrograms,
				overallProgress,
			};
		} catch (error) {
			console.error("Error fetching training stats:", error);
			throw new Error("Failed to fetch training statistics");
		}
	}

	/**
	 * Get programs with user progress
	 */
	static async getProgramsWithProgress(userId: string): Promise<
		Array<TrainingProgram & { progress?: TrainingProgress }>
	> {
		try {
			const programs = await this.getPrograms();
			const userProgress = await this.getUserProgress(userId);

			// Create a map of programId -> progress
			const progressMap = new Map(
				userProgress.map((p) => [p.programId, p]),
			);

			// Combine programs with their progress
			return programs.map((program) => ({
				...program,
				progress: progressMap.get(program.id),
			}));
		} catch (error) {
			console.error("Error fetching programs with progress:", error);
			throw new Error("Failed to fetch programs with progress");
		}
	}

	/**
	 * Get learning paths with user progress
	 */
	static async getLearningPathsWithProgress(userId: string): Promise<
		Array<LearningPath & { progress?: LearningPathProgress }>
	> {
		try {
			const paths = await this.getLearningPaths();
			const [user] = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.clerkId, userId))
				.limit(1);

			if (!user) {
				return paths.map((path) => ({ ...path }));
			}

			const pathProgress = await db
				.select()
				.from(learningPathProgress)
				.where(eq(learningPathProgress.userId, user.id));

			// Create a map of pathId -> progress
			const progressMap = new Map(
				pathProgress.map((p) => [p.pathId, p]),
			);

			// Combine paths with their progress
			return paths.map((path) => ({
				...path,
				progress: progressMap.get(path.id),
			}));
		} catch (error) {
			console.error("Error fetching learning paths with progress:", error);
			throw new Error("Failed to fetch learning paths with progress");
		}
	}
}

