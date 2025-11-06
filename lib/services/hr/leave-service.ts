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
	leaveTypes, 
	leaveBalances, 
	leaveRequests,
	type LeaveType,
	type NewLeaveType,
	type LeaveBalance,
	type NewLeaveBalance,
	type LeaveRequest,
	type NewLeaveRequest,
} from "@/lib/db/schemas";
import { eq, and, desc, gte, lte, sql, or } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export interface CreateLeaveTypeInput {
	organizationId: string;
	name: string;
	category: "vacation" | "sick_leave" | "personal" | "fmla" | "bereavement" | "jury_duty" | "military" | "unpaid" | "other";
	accrualMethod?: "none" | "fixed" | "per_hour" | "per_week" | "per_month" | "per_year" | "proportional";
	accrualRate?: string;
	maxAccrual?: string;
	initialBalance?: string;
	allowCarryover?: boolean;
	requiresApproval?: boolean;
}

export interface RequestLeaveInput {
	employeeId: string;
	leaveTypeId: string;
	organizationId: string;
	startDate: Date;
	endDate: Date;
	duration: string;
	durationUnit?: "hours" | "days";
	reason?: string;
	notes?: string;
}

export interface ApproveLeaveInput {
	requestId: string;
	approved: boolean;
	rejectionReason?: string;
}

/**
 * Leave Management Service
 */
export class LeaveService {
	/**
	 * Create leave type
	 */
	async createLeaveType(input: CreateLeaveTypeInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const newLeaveType: NewLeaveType = {
			organizationId: input.organizationId,
			name: input.name,
			category: input.category,
			accrualMethod: input.accrualMethod || "none",
			accrualRate: input.accrualRate,
			maxAccrual: input.maxAccrual,
			initialBalance: input.initialBalance || "0",
			allowCarryover: input.allowCarryover || false,
			requiresApproval: input.requiresApproval !== false,
			isActive: true,
		};

		const result = await db.insert(leaveTypes).values(newLeaveType).returning();
		return result[0];
	}

	/**
	 * Get leave types
	 */
	async getLeaveTypes(organizationId: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		return await db
			.select()
			.from(leaveTypes)
			.where(and(eq(leaveTypes.organizationId, organizationId), eq(leaveTypes.isActive, true)))
			.orderBy(desc(leaveTypes.createdAt));
	}

	/**
	 * Request leave
	 */
	async requestLeave(input: RequestLeaveInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Validate leave request using database function
		const validationResult = await sql`
			SELECT validate_leave_request(
				${input.employeeId}::UUID,
				${input.leaveTypeId}::UUID,
				${input.startDate}::TIMESTAMP WITH TIME ZONE,
				${input.endDate}::TIMESTAMP WITH TIME ZONE
			) as validation
		`;

		const validation = validationResult[0]?.validation;
		if (!validation?.valid) {
			throw new Error(validation?.reason || "Leave request validation failed");
		}

		const newRequest: NewLeaveRequest = {
			employeeId: input.employeeId,
			leaveTypeId: input.leaveTypeId,
			organizationId: input.organizationId,
			startDate: input.startDate,
			endDate: input.endDate,
			duration: input.duration,
			durationUnit: input.durationUnit || "hours",
			reason: input.reason,
			notes: input.notes,
			status: "pending",
			requestedBy: userId,
			requestedAt: new Date(),
		};

		const result = await db.insert(leaveRequests).values(newRequest).returning();
		return result[0];
	}

	/**
	 * Approve or reject leave request
	 */
	async approveLeaveRequest(input: ApproveLeaveInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const request = await db
			.select()
			.from(leaveRequests)
			.where(eq(leaveRequests.id, input.requestId))
			.limit(1);

		if (request.length === 0) {
			throw new Error("Leave request not found");
		}

		const updateData: any = {
			updatedAt: new Date(),
		};

		if (input.approved) {
			updateData.status = "approved";
			updateData.approvedBy = userId;
			updateData.approvedAt = new Date();
			
			// Update leave balance
			await sql`
				UPDATE leave_balances
				SET 
					current_balance = current_balance - ${request[0].duration}::NUMERIC,
					used = used + ${request[0].duration}::NUMERIC,
					updated_at = CURRENT_TIMESTAMP
				WHERE employee_id = ${request[0].employeeId}::UUID
					AND leave_type_id = ${request[0].leaveTypeId}::UUID
			`;
		} else {
			updateData.status = "rejected";
			updateData.rejectedBy = userId;
			updateData.rejectedAt = new Date();
			updateData.rejectionReason = input.rejectionReason;
		}

		const result = await db
			.update(leaveRequests)
			.set(updateData)
			.where(eq(leaveRequests.id, input.requestId))
			.returning();

		return result[0];
	}

	/**
	 * Get leave requests
	 */
	async getLeaveRequests(filters?: {
		employeeId?: string;
		organizationId?: string;
		status?: string;
		startDate?: Date;
		endDate?: Date;
	}) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		let query = db.select().from(leaveRequests);
		const conditions = [];

		if (filters?.employeeId) {
			conditions.push(eq(leaveRequests.employeeId, filters.employeeId));
		}
		if (filters?.organizationId) {
			conditions.push(eq(leaveRequests.organizationId, filters.organizationId));
		}
		if (filters?.status) {
			conditions.push(eq(leaveRequests.status, filters.status as any));
		}
		if (filters?.startDate) {
			conditions.push(gte(leaveRequests.startDate, filters.startDate));
		}
		if (filters?.endDate) {
			conditions.push(lte(leaveRequests.endDate, filters.endDate));
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		return await query.orderBy(desc(leaveRequests.requestedAt));
	}

	/**
	 * Get leave balance
	 */
	async getLeaveBalance(employeeId: string, leaveTypeId?: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		let query = db.select().from(leaveBalances);

		const conditions = [eq(leaveBalances.employeeId, employeeId)];
		if (leaveTypeId) {
			conditions.push(eq(leaveBalances.leaveTypeId, leaveTypeId));
		}

		return await query.where(and(...conditions));
	}

	/**
	 * Accrue leave
	 */
	async accrueLeave(employeeId: string, leaveTypeId: string, periodStart: Date, periodEnd: Date) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Use database function to accrue leave
		const result = await sql`
			SELECT accrue_leave(
				${employeeId}::UUID,
				${leaveTypeId}::UUID,
				${periodStart}::TIMESTAMP WITH TIME ZONE,
				${periodEnd}::TIMESTAMP WITH TIME ZONE
			) as accrued
		`;

		return {
			accrued: Number(result[0]?.accrued || 0),
		};
	}

	/**
	 * Get leave calendar
	 */
	async getLeaveCalendar(organizationId: string, startDate: Date, endDate: Date) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		return await db
			.select({
				id: leaveRequests.id,
				employeeId: leaveRequests.employeeId,
				leaveTypeId: leaveRequests.leaveTypeId,
				startDate: leaveRequests.startDate,
				endDate: leaveRequests.endDate,
				status: leaveRequests.status,
				name: leaveTypes.name,
				category: leaveTypes.category,
			})
			.from(leaveRequests)
			.innerJoin(leaveTypes, eq(leaveRequests.leaveTypeId, leaveTypes.id))
			.where(
				and(
					eq(leaveRequests.organizationId, organizationId),
					gte(leaveRequests.startDate, startDate),
					lte(leaveRequests.endDate, endDate),
					or(
						eq(leaveRequests.status, "approved"),
						eq(leaveRequests.status, "pending")
					)
				)
			)
			.orderBy(leaveRequests.startDate);
	}
}

