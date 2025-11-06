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
	attendanceRecords, 
	timeCards,
	type AttendanceRecord,
	type NewAttendanceRecord,
	type TimeCard,
	type NewTimeCard,
} from "@/lib/db/schemas";
import { eq, and, desc, gte, lte, sql, isNull, or } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export interface ClockInInput {
	employeeId?: string;
	contractorId?: string;
	organizationId: string;
	location?: { latitude?: number; longitude?: number; address?: string; ip?: string };
	method?: "web" | "mobile" | "kiosk" | "biometric" | "api" | "manual";
	notes?: string;
}

export interface ClockOutInput {
	attendanceRecordId: string;
	location?: { latitude?: number; longitude?: number; address?: string; ip?: string };
	method?: "web" | "mobile" | "kiosk" | "biometric" | "api" | "manual";
	notes?: string;
}

/**
 * Attendance Service
 */
export class AttendanceService {
	/**
	 * Clock in
	 */
	async clockIn(input: ClockInInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		if (!input.employeeId && !input.contractorId) {
			throw new Error("Either employeeId or contractorId is required");
		}

		// Check if already clocked in
		const existingRecord = await db
			.select()
			.from(attendanceRecords)
			.where(
				and(
					or(
						input.employeeId ? eq(attendanceRecords.employeeId, input.employeeId) : sql`1=0`,
						input.contractorId ? eq(attendanceRecords.contractorId, input.contractorId) : sql`1=0`
					),
					isNull(attendanceRecords.clockOutTime),
					eq(attendanceRecords.date, new Date().toISOString().split('T')[0])
				)
			)
			.limit(1);

		if (existingRecord.length > 0) {
			throw new Error("Already clocked in for today");
		}

		const newRecord: NewAttendanceRecord = {
			employeeId: input.employeeId,
			contractorId: input.contractorId,
			organizationId: input.organizationId,
			clockInTime: new Date(),
			date: new Date(),
			status: "present",
			clockInLocation: input.location ? JSON.stringify(input.location) : null,
			clockInMethod: input.method || "web",
			notes: input.notes,
		};

		const result = await db.insert(attendanceRecords).values(newRecord).returning();
		return result[0];
	}

	/**
	 * Clock out
	 */
	async clockOut(input: ClockOutInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const record = await db
			.select()
			.from(attendanceRecords)
			.where(eq(attendanceRecords.id, input.attendanceRecordId))
			.limit(1);

		if (record.length === 0) {
			throw new Error("Attendance record not found");
		}

		if (record[0].clockOutTime) {
			throw new Error("Already clocked out");
		}

		const clockOutTime = new Date();
		const clockInTime = record[0].clockInTime ? new Date(record[0].clockInTime) : clockOutTime;
		const duration = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60); // Hours

		const updateData: any = {
			clockOutTime,
			duration: duration.toString(),
			clockOutLocation: input.location ? JSON.stringify(input.location) : null,
			clockOutMethod: input.method || "web",
			updatedAt: new Date(),
		};

		if (input.notes) {
			updateData.notes = input.notes;
		}

		const result = await db
			.update(attendanceRecords)
			.set(updateData)
			.where(eq(attendanceRecords.id, input.attendanceRecordId))
			.returning();

		return result[0];
	}

	/**
	 * Get attendance records
	 */
	async getAttendanceRecords(filters?: {
		employeeId?: string;
		contractorId?: string;
		organizationId?: string;
		startDate?: Date;
		endDate?: Date;
		status?: string;
	}) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		let query = db.select().from(attendanceRecords);
		const conditions = [];

		if (filters?.employeeId) {
			conditions.push(eq(attendanceRecords.employeeId, filters.employeeId));
		}
		if (filters?.contractorId) {
			conditions.push(eq(attendanceRecords.contractorId, filters.contractorId));
		}
		if (filters?.organizationId) {
			conditions.push(eq(attendanceRecords.organizationId, filters.organizationId));
		}
		if (filters?.startDate) {
			conditions.push(gte(attendanceRecords.date, filters.startDate));
		}
		if (filters?.endDate) {
			conditions.push(lte(attendanceRecords.date, filters.endDate));
		}
		if (filters?.status) {
			conditions.push(eq(attendanceRecords.status, filters.status as any));
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		return await query.orderBy(desc(attendanceRecords.date), desc(attendanceRecords.clockInTime));
	}

	/**
	 * Create time card
	 */
	async createTimeCard(input: {
		employeeId?: string;
		contractorId?: string;
		organizationId: string;
		payPeriodStart: Date;
		payPeriodEnd: Date;
		payFrequency: "weekly" | "biweekly" | "semimonthly" | "monthly";
	}) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Use database function to generate time card
		const result = await sql`
			SELECT generate_time_card(
				${input.employeeId || null}::UUID,
				${input.contractorId || null}::UUID,
				${input.payPeriodStart}::TIMESTAMP WITH TIME ZONE,
				${input.payPeriodEnd}::TIMESTAMP WITH TIME ZONE,
				${input.payFrequency}::TEXT
			) as time_card_id
		`;

		const timeCardId = result[0]?.time_card_id;

		if (!timeCardId) {
			throw new Error("Failed to generate time card");
		}

		return await db
			.select()
			.from(timeCards)
			.where(eq(timeCards.id, timeCardId))
			.limit(1)
			.then(r => r[0]);
	}

	/**
	 * Submit time card
	 */
	async submitTimeCard(timeCardId: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const result = await db
			.update(timeCards)
			.set({
				status: "submitted",
				submittedBy: userId,
				submittedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(timeCards.id, timeCardId))
			.returning();

		return result[0];
	}

	/**
	 * Approve time card
	 */
	async approveTimeCard(timeCardId: string, rejected?: boolean, rejectionReason?: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const updateData: any = {
			updatedAt: new Date(),
		};

		if (rejected) {
			updateData.status = "rejected";
			updateData.rejectedBy = userId;
			updateData.rejectedAt = new Date();
			updateData.rejectionReason = rejectionReason;
		} else {
			updateData.status = "approved";
			updateData.approvedBy = userId;
			updateData.approvedAt = new Date();
		}

		const result = await db
			.update(timeCards)
			.set(updateData)
			.where(eq(timeCards.id, timeCardId))
			.returning();

		return result[0];
	}

	/**
	 * Get time cards
	 */
	async getTimeCards(filters?: {
		employeeId?: string;
		contractorId?: string;
		organizationId?: string;
		status?: string;
		payPeriodStart?: Date;
		payPeriodEnd?: Date;
	}) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		let query = db.select().from(timeCards);
		const conditions = [];

		if (filters?.employeeId) {
			conditions.push(eq(timeCards.employeeId, filters.employeeId));
		}
		if (filters?.contractorId) {
			conditions.push(eq(timeCards.contractorId, filters.contractorId));
		}
		if (filters?.organizationId) {
			conditions.push(eq(timeCards.organizationId, filters.organizationId));
		}
		if (filters?.status) {
			conditions.push(eq(timeCards.status, filters.status as any));
		}
		if (filters?.payPeriodStart) {
			conditions.push(gte(timeCards.payPeriodStart, filters.payPeriodStart));
		}
		if (filters?.payPeriodEnd) {
			conditions.push(lte(timeCards.payPeriodEnd, filters.payPeriodEnd));
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		return await query.orderBy(desc(timeCards.payPeriodEnd));
	}

	/**
	 * Calculate overtime
	 */
	async calculateOvertime(employeeId: string, contractorId: string, payPeriodStart: Date, payPeriodEnd: Date) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Use database function
		const result = await sql`
			SELECT calculate_overtime(
				${employeeId || null}::UUID,
				${contractorId || null}::UUID,
				${payPeriodStart}::TIMESTAMP WITH TIME ZONE,
				${payPeriodEnd}::TIMESTAMP WITH TIME ZONE
			) as overtime_hours
		`;

		return {
			overtimeHours: Number(result[0]?.overtime_hours || 0),
		};
	}

	/**
	 * Get attendance statistics
	 */
	async getAttendanceStats(employeeId?: string, contractorId?: string, startDate?: Date, endDate?: Date) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		let query = db.select({
			totalRecords: sql<number>`COUNT(*)`,
			totalHours: sql<number>`COALESCE(SUM(${attendanceRecords.duration}), 0)`,
			presentDays: sql<number>`COUNT(CASE WHEN ${attendanceRecords.status} = 'present' THEN 1 END)`,
			absentDays: sql<number>`COUNT(CASE WHEN ${attendanceRecords.status} = 'absent' THEN 1 END)`,
			lateDays: sql<number>`COUNT(CASE WHEN ${attendanceRecords.status} = 'late' THEN 1 END)`,
		}).from(attendanceRecords);

		const conditions = [];
		if (employeeId) {
			conditions.push(eq(attendanceRecords.employeeId, employeeId));
		}
		if (contractorId) {
			conditions.push(eq(attendanceRecords.contractorId, contractorId));
		}
		if (startDate) {
			conditions.push(gte(attendanceRecords.date, startDate));
		}
		if (endDate) {
			conditions.push(lte(attendanceRecords.date, endDate));
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		const result = await query;

		return {
			totalRecords: Number(result[0]?.totalRecords || 0),
			totalHours: Number(result[0]?.totalHours || 0),
			presentDays: Number(result[0]?.presentDays || 0),
			absentDays: Number(result[0]?.absentDays || 0),
			lateDays: Number(result[0]?.lateDays || 0),
		};
	}
}

