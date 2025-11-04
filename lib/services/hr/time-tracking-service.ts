/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { getDbOrThrow } from "@/lib/db";
import {
	type NewTimeEntry,
	type TimeEntry,
	timeEntries,
} from "@/lib/db/schema";
import { and, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { Clock, Trash2 } from "lucide-react";

export interface StartTimeEntryInput {
	userId: string;
	clientId?: string;
	projectId?: string;
	description: string;
	hourlyRate?: number;
	isBillable?: boolean;
}

export interface UpdateTimeEntryInput {
	description?: string;
	clientId?: string;
	projectId?: string;
	hourlyRate?: number;
	isBillable?: boolean;
	notes?: string;
}

/**
 * Start a new time entry
 */
export async function startTimeEntry(
	input: StartTimeEntryInput,
): Promise<TimeEntry> {
	// Check if there's already a running timer for this user
	const _db = getDbOrThrow();
	const q1: any = _db
		.select()
		.from(timeEntries)
		.where(
			and(eq(timeEntries.userId, input.userId), isNull(timeEntries.endTime)),
		)
		.limit(1);
	const [runningEntry] = await q1;

	if (runningEntry) {
		throw new Error(
			"You already have a timer running. Stop it before starting a new one.",
		);
	}

	const q2Db = getDbOrThrow();
	const [entry] = await q2Db
		.insert(timeEntries)
		.values({
			userId: input.userId,
			clientId: input.clientId,
			projectId: input.projectId,
			description: input.description,
			startTime: new Date(),
			endTime: null,
			duration: null,
			hourlyRate: input.hourlyRate ? input.hourlyRate.toString() : null,
			amount: null,
			isBillable: input.isBillable !== false,
			isBilled: false,
			invoiceId: null,
			notes: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning();

	return entry as TimeEntry;
}

/**
 * Stop a running time entry
 */
export async function stopTimeEntry(
	entryId: string,
	userId: string,
): Promise<TimeEntry | null> {
	const db3 = getDbOrThrow();
	const q3: any = db3
		.select()
		.from(timeEntries)
		.where(
			and(
				eq(timeEntries.id, entryId),
				eq(timeEntries.userId, userId),
				isNull(timeEntries.endTime),
			),
		)
		.limit(1);
	const [entry] = await q3;

	if (!entry) {
		return null;
	}

	const endTime = new Date();
	const startTime = new Date(entry.startTime);
	const durationSeconds = Math.floor(
		(endTime.getTime() - startTime.getTime()) / 1000,
	);

	// Calculate amount if hourly rate is set
	let amount: string | null = null;
	if (entry.hourlyRate) {
		const hours = durationSeconds / 3600;
		const rate = Number.parseFloat(entry.hourlyRate);
		amount = (hours * rate).toFixed(2);
	}

	const db4 = getDbOrThrow();
	const [updated] = await db4
		.update(timeEntries)
		.set({
			endTime,
			duration: durationSeconds,
			amount,
			updatedAt: new Date(),
		})
		.where(eq(timeEntries.id, entryId))
		.returning();

	return (updated as TimeEntry) || null;
}

/**
 * Get currently running time entry for a user
 */
export async function getRunningTimeEntry(
	userId: string,
): Promise<TimeEntry | null> {
	const db5 = getDbOrThrow();
	const q5: any = db5
		.select()
		.from(timeEntries)
		.where(and(eq(timeEntries.userId, userId), isNull(timeEntries.endTime)))
		.limit(1);
	const [entry] = await q5;

	return entry || null;
}

/**
 * Get time entry by ID
 */
export async function getTimeEntryById(
	entryId: string,
	userId: string,
): Promise<TimeEntry | null> {
	const db6 = getDbOrThrow();
	const q6: any = db6
		.select()
		.from(timeEntries)
		.where(and(eq(timeEntries.id, entryId), eq(timeEntries.userId, userId)))
		.limit(1);
	const [entry] = await q6;

	return entry || null;
}

/**
 * List time entries for a user
 */
export async function listTimeEntries(params: {
	userId: string;
	page?: number;
	limit?: number;
	clientId?: string;
	projectId?: string;
	startDate?: Date;
	endDate?: Date;
	isBillable?: boolean;
	isBilled?: boolean;
}): Promise<{ entries: TimeEntry[]; total: number }> {
	const page = params.page || 1;
	const limit = params.limit || 20;
	const offset = (page - 1) * limit;

	const conditions = [eq(timeEntries.userId, params.userId)];

	if (params.clientId) {
		conditions.push(eq(timeEntries.clientId, params.clientId));
	}

	if (params.projectId) {
		conditions.push(eq(timeEntries.projectId, params.projectId));
	}

	if (params.startDate) {
		conditions.push(gte(timeEntries.startTime, params.startDate));
	}

	if (params.endDate) {
		conditions.push(lte(timeEntries.startTime, params.endDate));
	}

	if (params.isBillable !== undefined) {
		conditions.push(eq(timeEntries.isBillable, params.isBillable));
	}

	if (params.isBilled !== undefined) {
		conditions.push(eq(timeEntries.isBilled, params.isBilled));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const db7 = getDbOrThrow();
	const qData: any = db7
		.select()
		.from(timeEntries)
		.where(whereClause)
		.orderBy(desc(timeEntries.startTime))
		.limit(limit)
		.offset(offset);
	const qCount: any = db7
		.select({ count: sql<number>`count(*)` })
		.from(timeEntries)
		.where(whereClause);
	const [data, countResult] = await Promise.all([qData, qCount]);

	return {
		entries: data,
		total: Number(countResult[0]?.count || 0),
	};
}

/**
 * Update time entry
 */
export async function updateTimeEntry(
	entryId: string,
	userId: string,
	input: UpdateTimeEntryInput,
): Promise<TimeEntry | null> {
	const updateData: Partial<NewTimeEntry> = {
		updatedAt: new Date(),
	};

	if (input.description) updateData.description = input.description;
	if (input.clientId !== undefined) updateData.clientId = input.clientId;
	if (input.projectId !== undefined) updateData.projectId = input.projectId;
	if (input.hourlyRate !== undefined)
		updateData.hourlyRate = input.hourlyRate.toString();
	if (input.isBillable !== undefined) updateData.isBillable = input.isBillable;
	if (input.notes !== undefined) updateData.notes = input.notes;

	const db8 = getDbOrThrow();
	const [updated] = await db8
		.update(timeEntries)
		.set(updateData)
		.where(and(eq(timeEntries.id, entryId), eq(timeEntries.userId, userId)))
		.returning();

	return updated || null;
}

/**
 * Delete time entry
 */
export async function deleteTimeEntry(
	entryId: string,
	userId: string,
): Promise<boolean> {
	const db9 = getDbOrThrow();
	const result = await db9
		.delete(timeEntries)
		.where(
			and(
				eq(timeEntries.id, entryId),
				eq(timeEntries.userId, userId),
				eq(timeEntries.isBilled, false), // Only allow deleting unbilled entries
			),
		)
		.returning();

	return result.length > 0;
}

/**
 * Get total billable hours and amount
 */
export async function getBillableStats(
	userId: string,
	startDate?: Date,
	endDate?: Date,
): Promise<{
	totalHours: number;
	billableHours: number;
	unbilledAmount: number;
}> {
	const conditions = [eq(timeEntries.userId, userId)];

	if (startDate) {
		conditions.push(gte(timeEntries.startTime, startDate));
	}

	if (endDate) {
		conditions.push(lte(timeEntries.startTime, endDate));
	}

	const whereClause = and(...conditions);

	const db10 = getDbOrThrow();
	const [stats] = await db10
		.select({
			totalHours: sql<number>`COALESCE(sum(${timeEntries.duration}) / 3600.0, 0)`,
			billableHours: sql<number>`COALESCE(sum(CASE WHEN ${timeEntries.isBillable} = true THEN ${timeEntries.duration} ELSE 0 END) / 3600.0, 0)`,
			unbilledAmount: sql<number>`COALESCE(sum(CASE WHEN ${timeEntries.isBillable} = true AND ${timeEntries.isBilled} = false THEN CAST(${timeEntries.amount} AS DECIMAL) ELSE 0 END), 0)`,
		})
		.from(timeEntries)
		.where(whereClause);

	return {
		totalHours: Number(stats?.totalHours || 0),
		billableHours: Number(stats?.billableHours || 0),
		unbilledAmount: Number(stats?.unbilledAmount || 0),
	};
}

/**
 * Get time entries ready to be invoiced
 */
export async function getUnbilledTimeEntries(
	userId: string,
	clientId?: string,
): Promise<TimeEntry[]> {
	const conditions = [
		eq(timeEntries.userId, userId),
		eq(timeEntries.isBillable, true),
		eq(timeEntries.isBilled, false),
		isNull(timeEntries.invoiceId),
	];

	if (clientId) {
		conditions.push(eq(timeEntries.clientId, clientId));
	}

	const db11 = getDbOrThrow();
	const q11: any = db11
		.select()
		.from(timeEntries)
		.where(and(...conditions))
		.orderBy(timeEntries.startTime);
	const entries = await q11;

	return entries;
}

/**
 * Mark time entries as billed
 */
export async function markTimeEntriesAsBilled(
	entryIds: string[],
	userId: string,
	invoiceId: string,
): Promise<number> {
	if (entryIds.length === 0) return 0;

	const db12 = getDbOrThrow();
	const result = await db12
		.update(timeEntries)
		.set({
			isBilled: true,
			invoiceId,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(timeEntries.userId, userId),
				sql`${timeEntries.id} = ANY(${entryIds})`,
			),
		)
		.returning();

	return result.length;
}
