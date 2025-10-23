import { and, asc, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import {
	BarChart3,
	Clock,
	CreditCard,
	DollarSign,
	Trash2,
	TrendingDown,
} from "lucide-react";
import {
	type Lease,
	type MaintenanceRequest,
	type NewLease,
	type NewMaintenanceRequest,
	type NewProperty,
	type NewPropertyExpense,
	type NewPropertyIncome,
	type NewPropertyROI,
	type NewPropertyUnit,
	type NewTenant,
	type Property,
	type PropertyExpense,
	type PropertyIncome,
	type PropertyROI,
	type PropertyUnit,
	type Tenant,
	leases,
	maintenanceRequests,
	properties,
	propertyExpenses,
	propertyIncome,
	propertyROI,
	propertyUnits,
	tenants,
} from "@/lib/db/schemas/real-estate.schema";

export interface PropertyMetrics {
	totalProperties: number;
	totalUnits: number;
	occupiedUnits: number;
	occupancyRate: number;
	totalMonthlyRent: number;
	totalExpenses: number;
	netIncome: number;
	averageRent: number;
	maintenanceRequests: number;
	pendingMaintenance: number;
}

export interface PropertyROIAnalysis {
	propertyId: string;
	propertyName: string;
	totalInvestment: number;
	totalReturn: number;
	cashOnCashReturn: number;
	capRate: number;
	totalReturn: number;
	appreciation: number;
	occupancyRate: number;
	averageRent: number;
	netIncome: number;
	profitMargin: number;
}

export interface MaintenanceAnalytics {
	totalRequests: number;
	completedRequests: number;
	pendingRequests: number;
	averageCost: number;
	totalCost: number;
	averageResolutionTime: number; // in days
	categoryBreakdown: Array<{
		category: string;
		count: number;
		totalCost: number;
	}>;
	priorityBreakdown: Array<{
		priority: string;
		count: number;
	}>;
}

export interface TenantAnalytics {
	totalTenants: number;
	activeTenants: number;
	averageTenancyLength: number; // in months
	averageRent: number;
	paymentHistory: {
		onTimePayments: number;
		latePayments: number;
		missedPayments: number;
		onTimeRate: number;
	};
	tenantTurnover: {
		moveIns: number;
		moveOuts: number;
		turnoverRate: number;
	};
}

export class PropertyManagementService {
	/**
	 * Create a new property
	 */
	async createProperty(propertyData: NewProperty): Promise<Property> {
		const [newProperty] = await db
			.insert(properties)
			.values(propertyData)
			.returning();
		return newProperty;
	}

	/**
	 * Get all properties for a user
	 */
	async getProperties(
		userId: string,
		filters?: {
			status?: string;
			propertyType?: string;
			city?: string;
		},
	): Promise<Property[]> {
		let query = db
			.select()
			.from(properties)
			.where(eq(properties.userId, userId));

		if (filters?.status) {
			query = query.where(eq(properties.status, filters.status as any));
		}
		if (filters?.propertyType) {
			query = query.where(
				eq(properties.propertyType, filters.propertyType as any),
			);
		}
		if (filters?.city) {
			query = query.where(
				sql`LOWER(${properties.city}) LIKE LOWER(${`%${filters.city}%`})`,
			);
		}

		return await query.orderBy(desc(properties.createdAt));
	}

	/**
	 * Get a specific property by ID
	 */
	async getPropertyById(
		propertyId: string,
		userId: string,
	): Promise<Property | null> {
		const [property] = await db
			.select()
			.from(properties)
			.where(and(eq(properties.id, propertyId), eq(properties.userId, userId)))
			.limit(1);

		return property || null;
	}

	/**
	 * Update a property
	 */
	async updateProperty(
		propertyId: string,
		userId: string,
		updates: Partial<NewProperty>,
	): Promise<Property | null> {
		const [updatedProperty] = await db
			.update(properties)
			.set({ ...updates, updatedAt: new Date() })
			.where(and(eq(properties.id, propertyId), eq(properties.userId, userId)))
			.returning();

		return updatedProperty || null;
	}

	/**
	 * Delete a property
	 */
	async deleteProperty(propertyId: string, userId: string): Promise<boolean> {
		const result = await db
			.delete(properties)
			.where(and(eq(properties.id, propertyId), eq(properties.userId, userId)));

		return result.rowCount > 0;
	}

	/**
	 * Create a property unit
	 */
	async createPropertyUnit(unitData: NewPropertyUnit): Promise<PropertyUnit> {
		const [newUnit] = await db
			.insert(propertyUnits)
			.values(unitData)
			.returning();
		return newUnit;
	}

	/**
	 * Get units for a property
	 */
	async getPropertyUnits(
		propertyId: string,
		userId: string,
	): Promise<PropertyUnit[]> {
		return await db
			.select()
			.from(propertyUnits)
			.innerJoin(properties, eq(propertyUnits.propertyId, properties.id))
			.where(
				and(
					eq(properties.userId, userId),
					eq(propertyUnits.propertyId, propertyId),
				),
			)
			.orderBy(asc(propertyUnits.unitNumber));
	}

	/**
	 * Create a tenant
	 */
	async createTenant(tenantData: NewTenant): Promise<Tenant> {
		const [newTenant] = await db.insert(tenants).values(tenantData).returning();
		return newTenant;
	}

	/**
	 * Get tenants for a property
	 */
	async getPropertyTenants(
		propertyId: string,
		userId: string,
	): Promise<Tenant[]> {
		return await db
			.select()
			.from(tenants)
			.innerJoin(properties, eq(tenants.propertyId, properties.id))
			.where(
				and(eq(properties.userId, userId), eq(tenants.propertyId, propertyId)),
			)
			.orderBy(desc(tenants.createdAt));
	}

	/**
	 * Create a lease agreement
	 */
	async createLease(leaseData: NewLease): Promise<Lease> {
		const [newLease] = await db.insert(leases).values(leaseData).returning();
		return newLease;
	}

	/**
	 * Get leases for a property
	 */
	async getPropertyLeases(
		propertyId: string,
		userId: string,
	): Promise<Lease[]> {
		return await db
			.select()
			.from(leases)
			.innerJoin(properties, eq(leases.propertyId, properties.id))
			.where(
				and(eq(properties.userId, userId), eq(leases.propertyId, propertyId)),
			)
			.orderBy(desc(leases.startDate));
	}

	/**
	 * Create a maintenance request
	 */
	async createMaintenanceRequest(
		requestData: NewMaintenanceRequest,
	): Promise<MaintenanceRequest> {
		const [newRequest] = await db
			.insert(maintenanceRequests)
			.values(requestData)
			.returning();
		return newRequest;
	}

	/**
	 * Get maintenance requests for a property
	 */
	async getPropertyMaintenanceRequests(
		propertyId: string,
		userId: string,
		filters?: {
			status?: string;
			priority?: string;
			category?: string;
		},
	): Promise<MaintenanceRequest[]> {
		let query = db
			.select()
			.from(maintenanceRequests)
			.innerJoin(properties, eq(maintenanceRequests.propertyId, properties.id))
			.where(
				and(
					eq(properties.userId, userId),
					eq(maintenanceRequests.propertyId, propertyId),
				),
			);

		if (filters?.status) {
			query = query.where(
				eq(maintenanceRequests.status, filters.status as any),
			);
		}
		if (filters?.priority) {
			query = query.where(
				eq(maintenanceRequests.priority, filters.priority as any),
			);
		}
		if (filters?.category) {
			query = query.where(eq(maintenanceRequests.category, filters.category));
		}

		return await query.orderBy(desc(maintenanceRequests.requestDate));
	}

	/**
	 * Update maintenance request status
	 */
	async updateMaintenanceRequestStatus(
		requestId: string,
		userId: string,
		status: "pending" | "in_progress" | "completed" | "cancelled" | "on_hold",
		actualCost?: number,
		resolution?: string,
	): Promise<MaintenanceRequest | null> {
		const updates: any = {
			status,
			updatedAt: new Date(),
		};

		if (status === "completed") {
			updates.completedDate = new Date();
		}
		if (actualCost !== undefined) {
			updates.actualCost = actualCost.toString();
		}
		if (resolution) {
			updates.resolution = resolution;
		}

		const [updatedRequest] = await db
			.update(maintenanceRequests)
			.set(updates)
			.where(
				and(
					eq(maintenanceRequests.id, requestId),
					eq(maintenanceRequests.userId, userId),
				),
			)
			.returning();

		return updatedRequest || null;
	}

	/**
	 * Add property expense
	 */
	async addPropertyExpense(
		expenseData: NewPropertyExpense,
	): Promise<PropertyExpense> {
		const [newExpense] = await db
			.insert(propertyExpenses)
			.values(expenseData)
			.returning();
		return newExpense;
	}

	/**
	 * Get property expenses
	 */
	async getPropertyExpenses(
		propertyId: string,
		userId: string,
		filters?: {
			startDate?: Date;
			endDate?: Date;
			category?: string;
		},
	): Promise<PropertyExpense[]> {
		let query = db
			.select()
			.from(propertyExpenses)
			.innerJoin(properties, eq(propertyExpenses.propertyId, properties.id))
			.where(
				and(
					eq(properties.userId, userId),
					eq(propertyExpenses.propertyId, propertyId),
				),
			);

		if (filters?.startDate) {
			query = query.where(gte(propertyExpenses.date, filters.startDate));
		}
		if (filters?.endDate) {
			query = query.where(lte(propertyExpenses.date, filters.endDate));
		}
		if (filters?.category) {
			query = query.where(eq(propertyExpenses.category, filters.category));
		}

		return await query.orderBy(desc(propertyExpenses.date));
	}

	/**
	 * Add property income
	 */
	async addPropertyIncome(
		incomeData: NewPropertyIncome,
	): Promise<PropertyIncome> {
		const [newIncome] = await db
			.insert(propertyIncome)
			.values(incomeData)
			.returning();
		return newIncome;
	}

	/**
	 * Get property income
	 */
	async getPropertyIncome(
		propertyId: string,
		userId: string,
		filters?: {
			startDate?: Date;
			endDate?: Date;
			incomeType?: string;
		},
	): Promise<PropertyIncome[]> {
		let query = db
			.select()
			.from(propertyIncome)
			.innerJoin(properties, eq(propertyIncome.propertyId, properties.id))
			.where(
				and(
					eq(properties.userId, userId),
					eq(propertyIncome.propertyId, propertyId),
				),
			);

		if (filters?.startDate) {
			query = query.where(gte(propertyIncome.date, filters.startDate));
		}
		if (filters?.endDate) {
			query = query.where(lte(propertyIncome.date, filters.endDate));
		}
		if (filters?.incomeType) {
			query = query.where(eq(propertyIncome.incomeType, filters.incomeType));
		}

		return await query.orderBy(desc(propertyIncome.date));
	}

	/**
	 * Get property metrics
	 */
	async getPropertyMetrics(
		userId: string,
		propertyId?: string,
	): Promise<PropertyMetrics> {
		const propertyFilter = propertyId
			? eq(properties.id, propertyId)
			: sql`1=1`;

		// Get property counts
		const propertyCount = await db
			.select({ count: count() })
			.from(properties)
			.where(and(eq(properties.userId, userId), propertyFilter));

		// Get unit counts
		const unitCounts = await db
			.select({
				total: count(),
				occupied: count(sql`CASE WHEN ${propertyUnits.isOccupied} THEN 1 END`),
			})
			.from(propertyUnits)
			.innerJoin(properties, eq(propertyUnits.propertyId, properties.id))
			.where(and(eq(properties.userId, userId), propertyFilter));

		// Get financial metrics
		const financialMetrics = await db
			.select({
				totalRent: sum(properties.monthlyRent),
				totalExpenses: sum(propertyExpenses.amount),
				totalIncome: sum(propertyIncome.amount),
			})
			.from(properties)
			.leftJoin(
				propertyExpenses,
				eq(propertyExpenses.propertyId, properties.id),
			)
			.leftJoin(propertyIncome, eq(propertyIncome.propertyId, properties.id))
			.where(and(eq(properties.userId, userId), propertyFilter));

		// Get maintenance metrics
		const maintenanceMetrics = await db
			.select({
				total: count(),
				pending: count(
					sql`CASE WHEN ${maintenanceRequests.status} = 'pending' THEN 1 END`,
				),
			})
			.from(maintenanceRequests)
			.innerJoin(properties, eq(maintenanceRequests.propertyId, properties.id))
			.where(and(eq(properties.userId, userId), propertyFilter));

		const totalProperties = propertyCount[0]?.count || 0;
		const totalUnits = unitCounts[0]?.total || 0;
		const occupiedUnits = unitCounts[0]?.occupied || 0;
		const occupancyRate =
			totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
		const totalMonthlyRent = Number.parseFloat(
			financialMetrics[0]?.totalRent || "0",
		);
		const totalExpenses = Number.parseFloat(
			financialMetrics[0]?.totalExpenses || "0",
		);
		const totalIncome = Number.parseFloat(
			financialMetrics[0]?.totalIncome || "0",
		);
		const netIncome = totalIncome - totalExpenses;
		const averageRent =
			occupiedUnits > 0 ? totalMonthlyRent / occupiedUnits : 0;
		const maintenanceRequests = maintenanceMetrics[0]?.total || 0;
		const pendingMaintenance = maintenanceMetrics[0]?.pending || 0;

		return {
			totalProperties,
			totalUnits,
			occupiedUnits,
			occupancyRate,
			totalMonthlyRent,
			totalExpenses,
			netIncome,
			averageRent,
			maintenanceRequests,
			pendingMaintenance,
		};
	}

	/**
	 * Calculate property ROI
	 */
	async calculatePropertyROI(
		propertyId: string,
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<PropertyROIAnalysis> {
		const property = await this.getPropertyById(propertyId, userId);
		if (!property) {
			throw new Error("Property not found");
		}

		// Get financial data for the period
		const incomeResult = await db
			.select({ total: sum(propertyIncome.amount) })
			.from(propertyIncome)
			.where(
				and(
					eq(propertyIncome.propertyId, propertyId),
					gte(propertyIncome.date, startDate),
					lte(propertyIncome.date, endDate),
				),
			);

		const expensesResult = await db
			.select({ total: sum(propertyExpenses.amount) })
			.from(propertyExpenses)
			.where(
				and(
					eq(propertyExpenses.propertyId, propertyId),
					gte(propertyExpenses.date, startDate),
					lte(propertyExpenses.date, endDate),
				),
			);

		// Get occupancy data
		const occupancyResult = await db
			.select({
				totalDays: sql<number>`EXTRACT(DAYS FROM ${endDate} - ${startDate})`,
				occupiedDays: sum(
					sql`CASE WHEN ${tenants.status} = 'active' THEN EXTRACT(DAYS FROM ${endDate} - ${startDate}) ELSE 0 END`,
				),
			})
			.from(tenants)
			.where(
				and(
					eq(tenants.propertyId, propertyId),
					gte(tenants.moveInDate, startDate),
					lte(tenants.moveOutDate, endDate),
				),
			);

		const totalIncome = Number.parseFloat(incomeResult[0]?.total || "0");
		const totalExpenses = Number.parseFloat(expensesResult[0]?.total || "0");
		const netIncome = totalIncome - totalExpenses;
		const totalDays = occupancyResult[0]?.totalDays || 0;
		const occupiedDays = occupancyResult[0]?.occupiedDays || 0;
		const occupancyRate = totalDays > 0 ? (occupiedDays / totalDays) * 100 : 0;

		// Calculate ROI metrics
		const purchasePrice = Number.parseFloat(property.purchasePrice || "0");
		const downPayment = Number.parseFloat(property.downPayment || "0");
		const currentValue = Number.parseFloat(
			property.currentValue || property.purchasePrice || "0",
		);

		const cashOnCashReturn =
			downPayment > 0 ? (netIncome / downPayment) * 100 : 0;
		const capRate = currentValue > 0 ? (netIncome / currentValue) * 100 : 0;
		const appreciation = currentValue - purchasePrice;
		const totalReturn = netIncome + appreciation;
		const profitMargin = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

		return {
			propertyId,
			propertyName: property.name,
			totalInvestment: purchasePrice,
			cashOnCashReturn,
			capRate,
			totalReturn,
			appreciation,
			occupancyRate,
			averageRent: Number.parseFloat(property.monthlyRent || "0"),
			netIncome,
			profitMargin,
		};
	}

	/**
	 * Get maintenance analytics
	 */
	async getMaintenanceAnalytics(
		userId: string,
		propertyId?: string,
	): Promise<MaintenanceAnalytics> {
		const propertyFilter = propertyId
			? eq(maintenanceRequests.propertyId, propertyId)
			: sql`1=1`;

		// Get basic metrics
		const basicMetrics = await db
			.select({
				total: count(),
				completed: count(
					sql`CASE WHEN ${maintenanceRequests.status} = 'completed' THEN 1 END`,
				),
				pending: count(
					sql`CASE WHEN ${maintenanceRequests.status} = 'pending' THEN 1 END`,
				),
				totalCost: sum(maintenanceRequests.actualCost),
			})
			.from(maintenanceRequests)
			.innerJoin(properties, eq(maintenanceRequests.propertyId, properties.id))
			.where(and(eq(properties.userId, userId), propertyFilter));

		// Get category breakdown
		const categoryBreakdown = await db
			.select({
				category: maintenanceRequests.category,
				count: count(),
				totalCost: sum(maintenanceRequests.actualCost),
			})
			.from(maintenanceRequests)
			.innerJoin(properties, eq(maintenanceRequests.propertyId, properties.id))
			.where(and(eq(properties.userId, userId), propertyFilter))
			.groupBy(maintenanceRequests.category);

		// Get priority breakdown
		const priorityBreakdown = await db
			.select({
				priority: maintenanceRequests.priority,
				count: count(),
			})
			.from(maintenanceRequests)
			.innerJoin(properties, eq(maintenanceRequests.propertyId, properties.id))
			.where(and(eq(properties.userId, userId), propertyFilter))
			.groupBy(maintenanceRequests.priority);

		const totalRequests = basicMetrics[0]?.total || 0;
		const completedRequests = basicMetrics[0]?.completed || 0;
		const pendingRequests = basicMetrics[0]?.pending || 0;
		const totalCost = Number.parseFloat(basicMetrics[0]?.totalCost || "0");
		const averageCost =
			completedRequests > 0 ? totalCost / completedRequests : 0;

		return {
			totalRequests,
			completedRequests,
			pendingRequests,
			averageCost,
			totalCost,
			averageResolutionTime: 0, // Would need to calculate from completed requests
			categoryBreakdown: categoryBreakdown.map((cat) => ({
				category: cat.category || "Unknown",
				count: cat.count,
				totalCost: Number.parseFloat(cat.totalCost || "0"),
			})),
			priorityBreakdown: priorityBreakdown.map((pri) => ({
				priority: pri.priority,
				count: pri.count,
			})),
		};
	}

	/**
	 * Get tenant analytics
	 */
	async getTenantAnalytics(
		userId: string,
		propertyId?: string,
	): Promise<TenantAnalytics> {
		const propertyFilter = propertyId
			? eq(tenants.propertyId, propertyId)
			: sql`1=1`;

		// Get tenant counts
		const tenantCounts = await db
			.select({
				total: count(),
				active: count(sql`CASE WHEN ${tenants.status} = 'active' THEN 1 END`),
			})
			.from(tenants)
			.innerJoin(properties, eq(tenants.propertyId, properties.id))
			.where(and(eq(properties.userId, userId), propertyFilter));

		// Get payment history (simplified)
		const paymentHistory = await db
			.select({
				onTime: count(
					sql`CASE WHEN ${propertyIncome.paymentStatus} = 'received' THEN 1 END`,
				),
				late: count(
					sql`CASE WHEN ${propertyIncome.paymentStatus} = 'late' THEN 1 END`,
				),
				missed: count(
					sql`CASE WHEN ${propertyIncome.paymentStatus} = 'missed' THEN 1 END`,
				),
			})
			.from(propertyIncome)
			.innerJoin(properties, eq(propertyIncome.propertyId, properties.id))
			.where(and(eq(properties.userId, userId), propertyFilter));

		const totalTenants = tenantCounts[0]?.total || 0;
		const activeTenants = tenantCounts[0]?.active || 0;
		const onTimePayments = paymentHistory[0]?.onTime || 0;
		const latePayments = paymentHistory[0]?.late || 0;
		const missedPayments = paymentHistory[0]?.missed || 0;
		const totalPayments = onTimePayments + latePayments + missedPayments;
		const onTimeRate =
			totalPayments > 0 ? (onTimePayments / totalPayments) * 100 : 0;

		return {
			totalTenants,
			activeTenants,
			averageTenancyLength: 0, // Would need to calculate from lease data
			averageRent: 0, // Would need to calculate from lease data
			paymentHistory: {
				onTimePayments,
				latePayments,
				missedPayments,
				onTimeRate,
			},
			tenantTurnover: {
				moveIns: 0, // Would need to calculate from tenant data
				moveOuts: 0,
				turnoverRate: 0,
			},
		};
	}
}
