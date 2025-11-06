/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import { employees, departments, type Employee, type Department } from "@/lib/db/schemas";
import { eq, and, desc, ilike, or, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export interface CreateEmployeeInput {
	userId: string;
	organizationId: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	position: string;
	department: string;
	managerId?: string;
	salary?: string;
	startDate: Date;
	status?: "active" | "on_leave" | "terminated" | "suspended";
	location?: string;
	timezone?: string;
	notes?: string;
	tags?: string[];
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {
	id: string;
}

export interface EmployeeFilters {
	search?: string;
	department?: string;
	status?: string;
	managerId?: string;
}

/**
 * Employees Service - Handles all employee-related operations
 */
export class EmployeesService {
	/**
	 * Get all employees
	 */
	async getAll(filters?: EmployeeFilters) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		let query = db.select().from(employees).where(eq(employees.userId, userId));

		if (filters) {
			if (filters.search) {
				query = query.where(
					and(
						eq(employees.userId, userId),
						or(
							ilike(employees.firstName, `%${filters.search}%`),
							ilike(employees.lastName, `%${filters.search}%`),
							ilike(employees.email, `%${filters.search}%`),
							ilike(employees.position || sql`''`, `%${filters.search}%`)
						)
					)
				);
			}

			if (filters.department) {
				query = query.where(
					and(eq(employees.userId, userId), eq(employees.department, filters.department))
				);
			}

			if (filters.status) {
				query = query.where(
					and(eq(employees.userId, userId), eq(employees.status, filters.status as any))
				);
			}

			if (filters.managerId) {
				query = query.where(
					and(eq(employees.userId, userId), eq(employees.managerId, filters.managerId))
				);
			}
		}

		const results = await query.orderBy(desc(employees.createdAt));
		return results;
	}

	/**
	 * Get employee by ID
	 */
	async getById(id: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const result = await db
			.select()
			.from(employees)
			.where(and(eq(employees.id, id), eq(employees.userId, userId)))
			.limit(1);

		if (result.length === 0) {
			throw new Error("Employee not found");
		}

		return result[0];
	}

	/**
	 * Create a new employee
	 */
	async create(input: CreateEmployeeInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const newEmployee = {
			userId,
			organizationId: input.organizationId,
			firstName: input.firstName,
			lastName: input.lastName,
			email: input.email,
			phone: input.phone,
			position: input.position,
			department: input.department,
			managerId: input.managerId,
			salary: input.salary,
			startDate: input.startDate,
			status: input.status || "active",
			location: input.location,
			timezone: input.timezone || "UTC",
			notes: input.notes,
			tags: input.tags ? JSON.stringify(input.tags) : null,
		};

		const result = await db.insert(employees).values(newEmployee).returning();
		return result[0];
	}

	/**
	 * Update an employee
	 */
	async update(input: UpdateEmployeeInput) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Verify ownership
		await this.getById(input.id);

		const updateData: any = {
			updatedAt: new Date(),
		};

		if (input.firstName !== undefined) updateData.firstName = input.firstName;
		if (input.lastName !== undefined) updateData.lastName = input.lastName;
		if (input.email !== undefined) updateData.email = input.email;
		if (input.phone !== undefined) updateData.phone = input.phone;
		if (input.position !== undefined) updateData.position = input.position;
		if (input.department !== undefined) updateData.department = input.department;
		if (input.managerId !== undefined) updateData.managerId = input.managerId;
		if (input.salary !== undefined) updateData.salary = input.salary;
		if (input.status !== undefined) updateData.status = input.status;
		if (input.location !== undefined) updateData.location = input.location;
		if (input.timezone !== undefined) updateData.timezone = input.timezone;
		if (input.notes !== undefined) updateData.notes = input.notes;
		if (input.tags !== undefined) updateData.tags = JSON.stringify(input.tags);

		const result = await db
			.update(employees)
			.set(updateData)
			.where(and(eq(employees.id, input.id), eq(employees.userId, userId)))
			.returning();

		return result[0];
	}

	/**
	 * Delete an employee
	 */
	async delete(id: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Verify ownership
		await this.getById(id);

		await db
			.delete(employees)
			.where(and(eq(employees.id, id), eq(employees.userId, userId)));

		return { success: true };
	}

	/**
	 * Get employees by department
	 */
	async getByDepartment(department: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const results = await db
			.select()
			.from(employees)
			.where(and(eq(employees.userId, userId), eq(employees.department, department)))
			.orderBy(desc(employees.createdAt));

		return results;
	}

	/**
	 * Get employee performance
	 */
	async getPerformance(id: string) {
		const employee = await this.getById(id);
		return {
			employee,
			performance: employee.performance,
			performanceNotes: employee.performanceNotes,
			lastReviewDate: employee.lastReviewDate,
			nextReviewDate: employee.nextReviewDate,
		};
	}

	/**
	 * Get analytics
	 */
	async getAnalytics() {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const allEmployees = await this.getAll();

		const departmentStats = await db
			.select({
				department: employees.department,
				count: sql<number>`count(*)`.as("count"),
			})
			.from(employees)
			.where(eq(employees.userId, userId))
			.groupBy(employees.department);

		return {
			total: allEmployees.length,
			active: allEmployees.filter((e) => e.status === "active").length,
			onLeave: allEmployees.filter((e) => e.status === "on_leave").length,
			terminated: allEmployees.filter((e) => e.status === "terminated").length,
			departmentBreakdown: departmentStats,
		};
	}

	/**
	 * Department management
	 */
	async createDepartment(organizationId: string, name: string, description?: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const result = await db
			.insert(departments)
			.values({
				organizationId,
				name,
				description,
			})
			.returning();

		return result[0];
	}

	async getDepartments(organizationId: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const results = await db
			.select()
			.from(departments)
			.where(eq(departments.organizationId, organizationId))
			.orderBy(desc(departments.createdAt));

		return results;
	}

	/**
	 * Get payroll summary for employee
	 */
	async getPayrollSummary(employeeId: string, limit: number = 12) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Verify ownership
		await this.getById(employeeId);

		// Import PayrollService to get history
		const { PayrollService } = await import("./payroll-service");
		const payrollService = new PayrollService();
		
		return await payrollService.getEmployeePayrollHistory(employeeId, limit);
	}

	/**
	 * Get leave balance summary
	 */
	async getLeaveBalanceSummary(employeeId: string) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Verify ownership
		await this.getById(employeeId);

		// Import LeaveService
		const { LeaveService } = await import("./leave-service");
		const leaveService = new LeaveService();
		
		return await leaveService.getLeaveBalance(employeeId);
	}

	/**
	 * Get attendance summary
	 */
	async getAttendanceSummary(employeeId: string, startDate?: Date, endDate?: Date) {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Verify ownership
		await this.getById(employeeId);

		// Import AttendanceService
		const { AttendanceService } = await import("./attendance-service");
		const attendanceService = new AttendanceService();
		
		return await attendanceService.getAttendanceStats(employeeId, undefined, startDate, endDate);
	}
}

