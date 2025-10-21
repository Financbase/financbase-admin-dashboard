import {
	employeePerformanceReviews,
	employeeSkills,
	employees,
} from "@/drizzle/schema/employees";
import { getDbOrThrow } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, gte, ilike, lte, sql } from "drizzle-orm";
import { Search, Server, Trash2, UserCog } from "lucide-react";

export interface CreateEmployeeInput {
	employeeId: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	department?: string;
	position?: string;
	employmentType?: string;
	status?: "active" | "inactive" | "on-leave" | "terminated";
	hireDate: Date;
	salary?: number;
	managerId?: string;
	avatar?: string;
	address?: string;
	emergencyContact?: string;
	skills?: string[];
	performanceRating?: number;
}

export interface UpdateEmployeeInput {
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	department?: string;
	position?: string;
	employmentType?: string;
	status?: "active" | "inactive" | "on-leave" | "terminated";
	salary?: number;
	managerId?: string;
	avatar?: string;
	address?: string;
	emergencyContact?: string;
	skills?: string[];
	performanceRating?: number;
}

export interface EmployeeFilters {
	search?: string;
	department?: string;
	status?: string;
	employmentType?: string;
	managerId?: string;
	hireDateFrom?: Date;
	hireDateTo?: Date;
}

export interface EmployeeStats {
	total: number;
	active: number;
	inactive: number;
	onLeave: number;
	terminated: number;
	newHiresThisMonth: number;
	avgPerformanceRating: number;
}

/**
 * Employee Service - Handles all employee-related operations
 */
export class EmployeeService {
	private db = getDbOrThrow();

	/**
	 * Create a new employee
	 */
	async createEmployee(input: CreateEmployeeInput) {
		const { userId } = auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const newEmployee = {
			employeeId: input.employeeId,
			firstName: input.firstName,
			lastName: input.lastName,
			email: input.email,
			phone: input.phone,
			department: input.department,
			position: input.position,
			employmentType: input.employmentType,
			status: input.status || "active",
			hireDate: input.hireDate,
			salary: input.salary?.toString(),
			managerId: input.managerId,
			avatar: input.avatar,
			address: input.address,
			emergencyContact: input.emergencyContact,
			skills: input.skills,
			performanceRating: input.performanceRating?.toString(),
		};

		const [employee] = await this.db
			.insert(employees)
			.values(newEmployee)
			.returning();

		// Add skills if provided
		if (input.skills && input.skills.length > 0) {
			const skillInserts = input.skills.map((skillName) => ({
				employeeId: employee.id,
				skillName,
			}));
			await this.db.insert(employeeSkills).values(skillInserts);
		}

		return employee;
	}

	/**
	 * Get employees with filters and pagination
	 */
	async getEmployees(filters: EmployeeFilters = {}, page = 1, limit = 20) {
		const { userId } = auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		let query = this.db.select().from(employees);

		// Apply filters
		const conditions = [];

		if (filters.search) {
			conditions.push(
				sql`(${employees.firstName} || ' ' || ${employees.lastName} || ' ' || ${employees.email}) ILIKE ${`%${filters.search}%`}`,
			);
		}

		if (filters.department) {
			conditions.push(eq(employees.department, filters.department));
		}

		if (filters.status) {
			conditions.push(eq(employees.status, filters.status));
		}

		if (filters.employmentType) {
			conditions.push(eq(employees.employmentType, filters.employmentType));
		}

		if (filters.managerId) {
			conditions.push(eq(employees.managerId, filters.managerId));
		}

		if (filters.hireDateFrom) {
			conditions.push(gte(employees.hireDate, filters.hireDateFrom));
		}

		if (filters.hireDateTo) {
			conditions.push(lte(employees.hireDate, filters.hireDateTo));
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		// Apply pagination
		const offset = (page - 1) * limit;
		const results = await query
			.limit(limit)
			.offset(offset)
			.orderBy(desc(employees.createdAt));

		// Get total count for pagination
		let countQuery = this.db
			.select({ count: sql<number>`count(*)` })
			.from(employees);

		if (conditions.length > 0) {
			countQuery = countQuery.where(and(...conditions));
		}

		const [{ count }] = await countQuery;

		return {
			employees: results,
			pagination: {
				page,
				limit,
				totalCount: count,
				totalPages: Math.ceil(count / limit),
				hasNextPage: page < Math.ceil(count / limit),
				hasPreviousPage: page > 1,
			},
		};
	}

	/**
	 * Get a single employee by ID
	 */
	async getEmployeeById(id: number) {
		const [employee] = await this.db
			.select()
			.from(employees)
			.where(eq(employees.id, id))
			.limit(1);

		if (!employee) {
			return null;
		}

		// Get skills
		const skills = await this.db
			.select()
			.from(employeeSkills)
			.where(eq(employeeSkills.employeeId, id));

		return {
			...employee,
			skills: skills.map((s) => s.skillName),
		};
	}

	/**
	 * Update an employee
	 */
	async updateEmployee(id: number, input: UpdateEmployeeInput) {
		const { userId } = auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Check if employee exists
		const existingEmployee = await this.getEmployeeById(id);
		if (!existingEmployee) {
			throw new Error("Employee not found");
		}

		// Update employee data
		const updateData: any = { ...input };
		if (input.salary !== undefined) {
			updateData.salary = input.salary?.toString();
		}
		if (input.performanceRating !== undefined) {
			updateData.performanceRating = input.performanceRating?.toString();
		}

		const [updatedEmployee] = await this.db
			.update(employees)
			.set(updateData)
			.where(eq(employees.id, id))
			.returning();

		// Update skills if provided
		if (input.skills !== undefined) {
			// Remove existing skills
			await this.db
				.delete(employeeSkills)
				.where(eq(employeeSkills.employeeId, id));

			// Add new skills
			if (input.skills.length > 0) {
				const skillInserts = input.skills.map((skillName) => ({
					employeeId: id,
					skillName,
				}));
				await this.db.insert(employeeSkills).values(skillInserts);
			}
		}

		return updatedEmployee;
	}

	/**
	 * Delete/deactivate an employee
	 */
	async deleteEmployee(id: number) {
		const { userId } = auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Check if employee exists
		const existingEmployee = await this.getEmployeeById(id);
		if (!existingEmployee) {
			throw new Error("Employee not found");
		}

		// Soft delete by setting status to terminated
		await this.db
			.update(employees)
			.set({ status: "terminated" })
			.where(eq(employees.id, id));
	}

	/**
	 * Get employee statistics
	 */
	async getEmployeeStats(filters: EmployeeFilters = {}) {
		const { userId } = auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		let query = this.db
			.select({
				status: employees.status,
				count: sql<number>`count(*)`,
				avgRating: sql<number>`AVG(CAST(${employees.performanceRating} AS DECIMAL))`,
			})
			.from(employees);

		// Apply filters
		const conditions = [];

		if (filters.department) {
			conditions.push(eq(employees.department, filters.department));
		}

		if (filters.employmentType) {
			conditions.push(eq(employees.employmentType, filters.employmentType));
		}

		if (filters.hireDateFrom) {
			conditions.push(gte(employees.hireDate, filters.hireDateFrom));
		}

		if (filters.hireDateTo) {
			conditions.push(lte(employees.hireDate, filters.hireDateTo));
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		query = query.groupBy(employees.status);

		const results = await query;

		// Calculate stats
		const stats: EmployeeStats = {
			total: 0,
			active: 0,
			inactive: 0,
			onLeave: 0,
			terminated: 0,
			newHiresThisMonth: 0,
			avgPerformanceRating: 0,
		};

		let totalRating = 0;
		let ratingCount = 0;

		results.forEach((result) => {
			const count = result.count || 0;
			stats.total += count;

			switch (result.status) {
				case "active":
					stats.active = count;
					break;
				case "inactive":
					stats.inactive = count;
					break;
				case "on-leave":
					stats.onLeave = count;
					break;
				case "terminated":
					stats.terminated = count;
					break;
			}

			if (result.avgRating) {
				totalRating += result.avgRating * count;
				ratingCount += count;
			}
		});

		stats.avgPerformanceRating =
			ratingCount > 0 ? totalRating / ratingCount : 0;

		// Calculate new hires this month
		const thisMonth = new Date();
		thisMonth.setDate(1);
		thisMonth.setHours(0, 0, 0, 0);

		const [{ newHiresCount }] = await this.db
			.select({ newHiresCount: sql<number>`count(*)` })
			.from(employees)
			.where(gte(employees.hireDate, thisMonth));

		stats.newHiresThisMonth = newHiresCount || 0;

		return stats;
	}

	/**
	 * Export employees to CSV format
	 */
	async exportEmployees(filters: EmployeeFilters = {}) {
		const { userId } = auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const employees = await this.getEmployees(filters, 1, 1000); // Get all for export

		const csvHeaders = [
			"Employee ID",
			"First Name",
			"Last Name",
			"Email",
			"Phone",
			"Department",
			"Position",
			"Employment Type",
			"Status",
			"Hire Date",
			"Salary",
			"Manager ID",
			"Skills",
			"Performance Rating",
		];

		const csvRows = employees.employees.map((emp) => [
			emp.employeeId,
			emp.firstName,
			emp.lastName,
			emp.email,
			emp.phone || "",
			emp.department || "",
			emp.position || "",
			emp.employmentType || "",
			emp.status,
			emp.hireDate.toISOString().split("T")[0],
			emp.salary || "",
			emp.managerId || "",
			(emp.skills || []).join("; "),
			emp.performanceRating || "",
		]);

		return {
			headers: csvHeaders,
			rows: csvRows,
		};
	}

	/**
	 * Get employees by manager
	 */
	async getEmployeesByManager(managerId: string) {
		const { userId } = auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		return await this.db
			.select()
			.from(employees)
			.where(eq(employees.managerId, managerId))
			.orderBy(employees.firstName, employees.lastName);
	}

	/**
	 * Update employee skills
	 */
	async updateEmployeeSkills(employeeId: number, skills: string[]) {
		const { userId } = auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Remove existing skills
		await this.db
			.delete(employeeSkills)
			.where(eq(employeeSkills.employeeId, employeeId));

		// Add new skills
		if (skills.length > 0) {
			const skillInserts = skills.map((skillName) => ({
				employeeId,
				skillName,
			}));
			await this.db.insert(employeeSkills).values(skillInserts);
		}
	}

	/**
	 * Get employee performance history
	 */
	async getEmployeePerformanceHistory(employeeId: number) {
		const { userId } = auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		return await this.db
			.select()
			.from(employeePerformanceReviews)
			.where(eq(employeePerformanceReviews.employeeId, employeeId))
			.orderBy(desc(employeePerformanceReviews.reviewDate));
	}

	/**
	 * Add performance review
	 */
	async addPerformanceReview(
		employeeId: number,
		reviewData: {
			reviewDate: Date;
			reviewerId: string;
			overallRating: number;
			comments?: string;
			goals?: string;
		},
	) {
		const { userId } = auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const [review] = await this.db
			.insert(employeePerformanceReviews)
			.values({
				employeeId,
				reviewDate: reviewData.reviewDate,
				reviewerId: reviewData.reviewerId,
				overallRating: reviewData.overallRating.toString(),
				comments: reviewData.comments,
				goals: reviewData.goals,
			})
			.returning();

		return review;
	}
}
