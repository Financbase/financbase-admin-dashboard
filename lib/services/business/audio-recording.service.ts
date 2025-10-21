import { freelanceDb } from "@/lib/db/connection-freelance";
import {
	type NewTimesheetEntry,
	type TimesheetEntry,
	timesheetEntries,
} from "@/lib/db/schemas/freelance.schema";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, gte, inArray, isNull, lte, sql } from "drizzle-orm";
import { Code, Puzzle, Server, Trash2, XCircle } from "lucide-react";

export interface AudioRecordingData {
	timesheetEntryId: string;
	audioUrl: string;
	duration: number;
	transcript?: string;
	metadata?: Record<string, any>;
}

export interface AudioRecordingFilters {
	timesheetEntryId?: string;
	userId?: string;
	dateFrom?: Date;
	dateTo?: Date;
	hasAudio?: boolean;
}

export class AudioRecordingService {
	/**
	 * Create a new audio recording for a timesheet entry
	 */
	async createAudioRecording(data: AudioRecordingData) {
		try {
			const { userId } = auth();
			if (!userId) {
				throw new Error("Unauthorized");
			}

			const result = await freelanceDb
				.update(timesheetEntries)
				.set({
					audioUrl: data.audioUrl,
					audioDuration: data.duration,
					audioTranscript: data.transcript,
					audioMetadata: data.metadata,
					updatedAt: new Date(),
				})
				.where(eq(timesheetEntries.id, data.timesheetEntryId))
				.returning();

			if (result.length === 0) {
				throw new Error("Timesheet entry not found");
			}

			return result[0];
		} catch (error) {
			console.error("Error creating audio recording:", error);
			throw error;
		}
	}

	/**
	 * Get audio recordings for a timesheet entry
	 */
	async getAudioRecording(timesheetEntryId: string) {
		try {
			const { userId } = auth();
			if (!userId) {
				throw new Error("Unauthorized");
			}

			const result = await freelanceDb
				.select({
					id: timesheetEntries.id,
					audioUrl: timesheetEntries.audioUrl,
					audioDuration: timesheetEntries.audioDuration,
					audioTranscript: timesheetEntries.audioTranscript,
					audioMetadata: timesheetEntries.audioMetadata,
					createdAt: timesheetEntries.createdAt,
					updatedAt: timesheetEntries.updatedAt,
				})
				.from(timesheetEntries)
				.where(eq(timesheetEntries.id, timesheetEntryId))
				.limit(1);

			return result[0] || null;
		} catch (error) {
			console.error("Error getting audio recording:", error);
			throw error;
		}
	}

	/**
	 * Get all audio recordings with filters
	 */
	async getAudioRecordings(filters: AudioRecordingFilters = {}) {
		try {
			const { userId } = auth();
			if (!userId) {
				throw new Error("Unauthorized");
			}

			const query = freelanceDb
				.select({
					id: timesheetEntries.id,
					timesheetId: timesheetEntries.timesheetId,
					audioUrl: timesheetEntries.audioUrl,
					audioDuration: timesheetEntries.audioDuration,
					audioTranscript: timesheetEntries.audioTranscript,
					audioMetadata: timesheetEntries.audioMetadata,
					createdAt: timesheetEntries.createdAt,
					updatedAt: timesheetEntries.updatedAt,
				})
				.from(timesheetEntries)
				.where(
					and(
						filters.timesheetEntryId
							? eq(timesheetEntries.id, filters.timesheetEntryId)
							: undefined,
						filters.userId
							? eq(timesheetEntries.userId, filters.userId)
							: undefined,
						filters.dateFrom
							? gte(timesheetEntries.createdAt, filters.dateFrom)
							: undefined,
						filters.dateTo
							? lte(timesheetEntries.createdAt, filters.dateTo)
							: undefined,
						filters.hasAudio !== undefined
							? filters.hasAudio
								? sql`audio_url IS NOT NULL`
								: sql`audio_url IS NULL`
							: undefined,
					),
				)
				.orderBy(desc(timesheetEntries.createdAt));

			const result = await query;
			return result;
		} catch (error) {
			console.error("Error getting audio recordings:", error);
			throw error;
		}
	}

	/**
	 * Update an existing audio recording
	 */
	async updateAudioRecording(
		timesheetEntryId: string,
		updates: Partial<AudioRecordingData>,
	) {
		try {
			const { userId } = auth();
			if (!userId) {
				throw new Error("Unauthorized");
			}

			const updateData: any = {
				updatedAt: new Date(),
			};

			if (updates.audioUrl !== undefined)
				updateData.audioUrl = updates.audioUrl;
			if (updates.duration !== undefined)
				updateData.audioDuration = updates.duration;
			if (updates.transcript !== undefined)
				updateData.audioTranscript = updates.transcript;
			if (updates.metadata !== undefined)
				updateData.audioMetadata = updates.metadata;

			const result = await freelanceDb
				.update(timesheetEntries)
				.set(updateData)
				.where(eq(timesheetEntries.id, timesheetEntryId))
				.returning();

			if (result.length === 0) {
				throw new Error("Audio recording not found");
			}

			return result[0];
		} catch (error) {
			console.error("Error updating audio recording:", error);
			throw error;
		}
	}

	/**
	 * Delete an audio recording (soft delete by clearing audio fields)
	 */
	async deleteAudioRecording(timesheetEntryId: string) {
		try {
			const { userId } = auth();
			if (!userId) {
				throw new Error("Unauthorized");
			}

			const result = await freelanceDb
				.update(timesheetEntries)
				.set({
					audioUrl: null,
					audioDuration: null,
					audioTranscript: null,
					audioMetadata: null,
					updatedAt: new Date(),
				})
				.where(eq(timesheetEntries.id, timesheetEntryId))
				.returning();

			if (result.length === 0) {
				throw new Error("Audio recording not found");
			}

			return result[0];
		} catch (error) {
			console.error("Error deleting audio recording:", error);
			throw error;
		}
	}

	/**
	 * Get audio recording statistics for a user
	 */
	async getAudioRecordingStats(userId: string, dateFrom?: Date, dateTo?: Date) {
		try {
			const { userId: currentUserId } = auth();
			if (!currentUserId) {
				throw new Error("Unauthorized");
			}

			const whereConditions = [eq(timesheetEntries.userId, userId)];

			if (dateFrom)
				whereConditions.push(gte(timesheetEntries.createdAt, dateFrom));
			if (dateTo) whereConditions.push(lte(timesheetEntries.createdAt, dateTo));

			const result = await freelanceDb
				.select({
					totalRecordings: sql<number>`count(*)::int`,
					totalDuration: sql<number>`coalesce(sum(audio_duration), 0)::int`,
					avgDuration: sql<number>`coalesce(avg(audio_duration), 0)::numeric`,
					withTranscript: sql<number>`count(case when audio_transcript is not null then 1 end)::int`,
				})
				.from(timesheetEntries)
				.where(and(...whereConditions, sql`audio_url IS NOT NULL`));

			return (
				result[0] || {
					totalRecordings: 0,
					totalDuration: 0,
					avgDuration: 0,
					withTranscript: 0,
				}
			);
		} catch (error) {
			console.error("Error getting audio recording stats:", error);
			throw error;
		}
	}

	/**
	 * Generate presigned URL for audio upload (placeholder for cloud storage integration)
	 */
	async generateAudioUploadUrl(fileName: string, fileType: string) {
		try {
			const { userId } = auth();
			if (!userId) {
				throw new Error("Unauthorized");
			}

			// This would integrate with your cloud storage service (AWS S3, Cloudflare R2, etc.)
			// For now, return a placeholder structure
			const uploadUrl = `/api/audio/upload?fileName=${encodeURIComponent(fileName)}&fileType=${encodeURIComponent(fileType)}`;

			return {
				uploadUrl,
				fileName,
				fileType,
				expiresAt: new Date(Date.now() + 3600000), // 1 hour
			};
		} catch (error) {
			console.error("Error generating audio upload URL:", error);
			throw error;
		}
	}
}
