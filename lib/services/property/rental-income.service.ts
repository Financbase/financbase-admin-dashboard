import { and, asc, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import {
	ArrowUpDown,
	BarChart3,
	Clock,
	CreditCard,
	DollarSign,
	FileText,
	Filter,
} from "lucide-react";
import { db } from "../../db/index";
import {
	type Lease,
	type NewPropertyIncome,
	type Property,
	type PropertyIncome,
	type PropertyUnit,
	type Tenant,
	leases,
	properties,
	propertyExpenses,
	propertyIncome,
	propertyUnits,
	tenants,
} from "@/lib/db/schemas/real-estate.schema";

export interface RentalIncomeSummary {
	propertyId: string;
	propertyName: string;
	totalMonthlyRent: number;
	collectedRent: number;
	pendingRent: number;
	lateRent: number;
	occupancyRate: number;
	averageRent: number;
	rentGrowth: number;
	collectionRate: number;
}

export interface TenantPaymentHistory {
	tenantId: string;
	tenantName: string;
	propertyName: string;
	monthlyRent: number;
	paymentHistory: Array<{
		month: string;
		amount: number;
		dueDate: Date;
		paidDate?: Date;
		status: "paid" | "late" | "missed";
		daysLate?: number;
	}>;
	onTimeRate: number;
	averageDaysLate: number;
	totalLateFees: number;
}

export interface RentRoll {
	propertyId: string;
	propertyName: string;
	units: Array<{
		unitId: string;
		unitNumber: string;
		tenantName: string;
		monthlyRent: number;
		leaseStart: Date;
		leaseEnd: Date;
		status: "occupied" | "vacant" | "pending";
		lastPayment?: Date;
		balance: number;
	}>;
	totalUnits: number;
	occupiedUnits: number;
	vacantUnits: number;
	totalMonthlyRent: number;
	collectedRent: number;
	occupancyRate: number;
}

export interface RentCollectionAnalytics {
	totalProperties: number;
	totalUnits: number;
	occupiedUnits: number;
	totalMonthlyRent: number;
	collectedRent: number;
	pendingRent: number;
	lateRent: number;
	missedRent: number;
	collectionRate: number;
	averageDaysLate: number;
	totalLateFees: number;
	occupancyRate: number;
	rentGrowth: number;
	tenantTurnover: number;
	averageTenancyLength: number;
}

export interface RentOptimization {
	propertyId: string;
	propertyName: string;
	currentRent: number;
	marketRent: number;
	rentGap: number;
	rentGapPercentage: number;
	optimizationPotential: number;
	recommendedRent: number;
	riskLevel: "low" | "medium" | "high";
	factors: string[];
}

export class RentalIncomeService {
	/**
	 * Record rent payment
	 */
	async recordRentPayment(
		incomeData: NewPropertyIncome,
	): Promise<PropertyIncome> {
		const [newIncome] = await db
			.insert(propertyIncome)
			.values(incomeData)
			.returning();
		return newIncome;
	}

	/**
	 * Get rental income summary for a property
	 */
	async getRentalIncomeSummary(
		propertyId: string,
		userId: string,
		period?: {
			startDate: Date;
			endDate: Date;
		},
	): Promise<RentalIncomeSummary> {
		const startDate =
			period?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const endDate = period?.endDate || new Date();

		// Get property details
		const property = await db
			.select()
			.from(properties)
			.where(and(eq(properties.id, propertyId), eq(properties.userId, userId)))
			.limit(1);

		if (!property.length) {
			throw new Error("Property not found");
		}

		// Get income data for the period
		const incomeData = await db
			.select({
				total: sum(propertyIncome.amount),
				collected: sum(
					sql`CASE WHEN ${propertyIncome.paymentStatus} = 'received' THEN ${propertyIncome.amount} ELSE 0 END`,
				),
				pending: sum(
					sql`CASE WHEN ${propertyIncome.paymentStatus} = 'pending' THEN ${propertyIncome.amount} ELSE 0 END`,
				),
				late: sum(
					sql`CASE WHEN ${propertyIncome.paymentStatus} = 'late' THEN ${propertyIncome.amount} ELSE 0 END`,
				),
			})
			.from(propertyIncome)
			.where(
				and(
					eq(propertyIncome.propertyId, propertyId),
					eq(propertyIncome.incomeType, "rent"),
					gte(propertyIncome.date, startDate),
					lte(propertyIncome.date, endDate),
				),
			);

		// Get occupancy data
		const occupancyData = await db
			.select({
				totalUnits: count(),
				occupiedUnits: count(
					sql`CASE WHEN ${propertyUnits.isOccupied} = true THEN 1 END`,
				),
				totalRent: sum(propertyUnits.monthlyRent),
			})
			.from(propertyUnits)
			.where(eq(propertyUnits.propertyId, propertyId));

		// Get previous period for growth calculation
		const previousStartDate = new Date(
			startDate.getTime() - (endDate.getTime() - startDate.getTime()),
		);
		const previousIncomeData = await db
			.select({ total: sum(propertyIncome.amount) })
			.from(propertyIncome)
			.where(
				and(
					eq(propertyIncome.propertyId, propertyId),
					eq(propertyIncome.incomeType, "rent"),
					gte(propertyIncome.date, previousStartDate),
					lte(propertyIncome.date, startDate),
				),
			);

		const totalMonthlyRent = Number.parseFloat(
			occupancyData[0]?.totalRent || "0",
		);
		const collectedRent = Number.parseFloat(incomeData[0]?.collected || "0");
		const pendingRent = Number.parseFloat(incomeData[0]?.pending || "0");
		const lateRent = Number.parseFloat(incomeData[0]?.late || "0");
		const totalUnits = occupancyData[0]?.totalUnits || 0;
		const occupiedUnits = occupancyData[0]?.occupiedUnits || 0;
		const occupancyRate =
			totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
		const averageRent =
			occupiedUnits > 0 ? totalMonthlyRent / occupiedUnits : 0;
		const collectionRate =
			totalMonthlyRent > 0 ? (collectedRent / totalMonthlyRent) * 100 : 0;

		const currentPeriodIncome = Number.parseFloat(incomeData[0]?.total || "0");
		const previousPeriodIncome = Number.parseFloat(
			previousIncomeData[0]?.total || "0",
		);
		const rentGrowth =
			previousPeriodIncome > 0
				? ((currentPeriodIncome - previousPeriodIncome) /
						previousPeriodIncome) *
					100
				: 0;

		return {
			propertyId,
			propertyName: property[0].name,
			totalMonthlyRent,
			collectedRent,
			pendingRent,
			lateRent,
			occupancyRate,
			averageRent,
			rentGrowth,
			collectionRate,
		};
	}

	/**
	 * Get tenant payment history
	 */
	async getTenantPaymentHistory(
		tenantId: string,
		userId: string,
		months = 12,
	): Promise<TenantPaymentHistory> {
		// Get tenant details
		const tenant = await db
			.select()
			.from(tenants)
			.innerJoin(properties, eq(tenants.propertyId, properties.id))
			.where(and(eq(tenants.id, tenantId), eq(properties.userId, userId)))
			.limit(1);

		if (!tenant.length) {
			throw new Error("Tenant not found");
		}

		const tenantData = tenant[0];
		const monthlyRent = Number.parseFloat(
			tenantData.tenants.monthlyRent || "0",
		);

		// Get payment history for the last N months
		const paymentHistory = [];
		const now = new Date();

		for (let i = months - 1; i >= 0; i--) {
			const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
			const dueDate = new Date(
				monthStart.getFullYear(),
				monthStart.getMonth(),
				1,
			); // 1st of month

			// Get payment for this month
			const payment = await db
				.select()
				.from(propertyIncome)
				.where(
					and(
						eq(propertyIncome.tenantId, tenantId),
						eq(propertyIncome.incomeType, "rent"),
						gte(propertyIncome.date, monthStart),
						lte(propertyIncome.date, monthEnd),
					),
				)
				.limit(1);

			let status: "paid" | "late" | "missed" = "missed";
			let paidDate: Date | undefined;
			let daysLate: number | undefined;

			if (payment.length > 0) {
				const paymentData = payment[0];
				paidDate = paymentData.receivedDate || paymentData.date;
				status = paymentData.paymentStatus === "received" ? "paid" : "late";

				if (paidDate && status === "late") {
					daysLate = Math.ceil(
						(paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
					);
				}
			}

			paymentHistory.push({
				month: monthStart.toISOString().slice(0, 7),
				amount: payment.length > 0 ? Number.parseFloat(payment[0].amount) : 0,
				dueDate,
				paidDate,
				status,
				daysLate,
			});
		}

		// Calculate statistics
		const paidPayments = paymentHistory.filter(
			(p) => p.status === "paid",
		).length;
		const onTimeRate = (paidPayments / months) * 100;
		const latePayments = paymentHistory.filter((p) => p.status === "late");
		const averageDaysLate =
			latePayments.length > 0
				? latePayments.reduce((sum, p) => sum + (p.daysLate || 0), 0) /
					latePayments.length
				: 0;

		// Get late fees
		const lateFeesResult = await db
			.select({ total: sum(propertyIncome.amount) })
			.from(propertyIncome)
			.where(
				and(
					eq(propertyIncome.tenantId, tenantId),
					eq(propertyIncome.incomeType, "late_fee"),
					gte(
						propertyIncome.date,
						new Date(now.getFullYear(), now.getMonth() - months, 1),
					),
				),
			);

		const totalLateFees = Number.parseFloat(lateFeesResult[0]?.total || "0");

		return {
			tenantId,
			tenantName: `${tenantData.tenants.firstName} ${tenantData.tenants.lastName}`,
			propertyName: tenantData.properties.name,
			monthlyRent,
			paymentHistory,
			onTimeRate,
			averageDaysLate,
			totalLateFees,
		};
	}

	/**
	 * Get rent roll for a property
	 */
	async getRentRoll(propertyId: string, userId: string): Promise<RentRoll> {
		// Get property details
		const property = await db
			.select()
			.from(properties)
			.where(and(eq(properties.id, propertyId), eq(properties.userId, userId)))
			.limit(1);

		if (!property.length) {
			throw new Error("Property not found");
		}

		// Get units with tenant information
		const unitsWithTenants = await db
			.select({
				unitId: propertyUnits.id,
				unitNumber: propertyUnits.unitNumber,
				monthlyRent: propertyUnits.monthlyRent,
				isOccupied: propertyUnits.isOccupied,
				tenantId: tenants.id,
				tenantFirstName: tenants.firstName,
				tenantLastName: tenants.lastName,
				leaseStart: leases.startDate,
				leaseEnd: leases.endDate,
				leaseStatus: leases.status,
			})
			.from(propertyUnits)
			.leftJoin(
				tenants,
				and(eq(tenants.unitId, propertyUnits.id), eq(tenants.status, "active")),
			)
			.leftJoin(
				leases,
				and(eq(leases.tenantId, tenants.id), eq(leases.status, "active")),
			)
			.where(eq(propertyUnits.propertyId, propertyId));

		const units = unitsWithTenants.map((unit) => {
			let status: "occupied" | "vacant" | "pending" = "vacant";
			let tenantName = "";
			let leaseStart: Date | undefined;
			let leaseEnd: Date | undefined;
			let lastPayment: Date | undefined;
			const balance = 0;

			if (unit.isOccupied && unit.tenantId) {
				status = "occupied";
				tenantName = `${unit.tenantFirstName} ${unit.tenantLastName}`;
				leaseStart = unit.leaseStart;
				leaseEnd = unit.leaseEnd;
				// Would need to get last payment and balance from payment history
			}

			return {
				unitId: unit.unitId,
				unitNumber: unit.unitNumber,
				tenantName,
				monthlyRent: Number.parseFloat(unit.monthlyRent || "0"),
				leaseStart: leaseStart || new Date(),
				leaseEnd: leaseEnd || new Date(),
				status,
				lastPayment,
				balance,
			};
		});

		const totalUnits = units.length;
		const occupiedUnits = units.filter((u) => u.status === "occupied").length;
		const vacantUnits = units.filter((u) => u.status === "vacant").length;
		const totalMonthlyRent = units.reduce(
			(sum, unit) => sum + unit.monthlyRent,
			0,
		);
		const collectedRent = 0; // Would need to calculate from payment history
		const occupancyRate =
			totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

		return {
			propertyId,
			propertyName: property[0].name,
			units,
			totalUnits,
			occupiedUnits,
			vacantUnits,
			totalMonthlyRent,
			collectedRent,
			occupancyRate,
		};
	}

	/**
	 * Get rent collection analytics
	 */
	async getRentCollectionAnalytics(
		userId: string,
		period?: {
			startDate: Date;
			endDate: Date;
		},
	): Promise<RentCollectionAnalytics> {
		const startDate =
			period?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const endDate = period?.endDate || new Date();

		// Get portfolio-wide metrics
		const portfolioMetrics = await db
			.select({
				totalProperties: count(sql`DISTINCT ${properties.id}`),
				totalUnits: count(sql`DISTINCT ${propertyUnits.id}`),
				occupiedUnits: count(
					sql`CASE WHEN ${propertyUnits.isOccupied} = true THEN 1 END`,
				),
				totalRent: sum(propertyUnits.monthlyRent),
			})
			.from(properties)
			.leftJoin(propertyUnits, eq(propertyUnits.propertyId, properties.id))
			.where(eq(properties.userId, userId));

		// Get income metrics
		const incomeMetrics = await db
			.select({
				total: sum(propertyIncome.amount),
				collected: sum(
					sql`CASE WHEN ${propertyIncome.paymentStatus} = 'received' THEN ${propertyIncome.amount} ELSE 0 END`,
				),
				pending: sum(
					sql`CASE WHEN ${propertyIncome.paymentStatus} = 'pending' THEN ${propertyIncome.amount} ELSE 0 END`,
				),
				late: sum(
					sql`CASE WHEN ${propertyIncome.paymentStatus} = 'late' THEN ${propertyIncome.amount} ELSE 0 END`,
				),
				missed: sum(
					sql`CASE WHEN ${propertyIncome.paymentStatus} = 'missed' THEN ${propertyIncome.amount} ELSE 0 END`,
				),
			})
			.from(propertyIncome)
			.innerJoin(properties, eq(propertyIncome.propertyId, properties.id))
			.where(
				and(
					eq(properties.userId, userId),
					eq(propertyIncome.incomeType, "rent"),
					gte(propertyIncome.date, startDate),
					lte(propertyIncome.date, endDate),
				),
			);

		// Get late fees
		const lateFeesResult = await db
			.select({ total: sum(propertyIncome.amount) })
			.from(propertyIncome)
			.innerJoin(properties, eq(propertyIncome.propertyId, properties.id))
			.where(
				and(
					eq(properties.userId, userId),
					eq(propertyIncome.incomeType, "late_fee"),
					gte(propertyIncome.date, startDate),
					lte(propertyIncome.date, endDate),
				),
			);

		const totalProperties = portfolioMetrics[0]?.totalProperties || 0;
		const totalUnits = portfolioMetrics[0]?.totalUnits || 0;
		const occupiedUnits = portfolioMetrics[0]?.occupiedUnits || 0;
		const totalMonthlyRent = Number.parseFloat(
			portfolioMetrics[0]?.totalRent || "0",
		);
		const collectedRent = Number.parseFloat(incomeMetrics[0]?.collected || "0");
		const pendingRent = Number.parseFloat(incomeMetrics[0]?.pending || "0");
		const lateRent = Number.parseFloat(incomeMetrics[0]?.late || "0");
		const missedRent = Number.parseFloat(incomeMetrics[0]?.missed || "0");
		const totalLateFees = Number.parseFloat(lateFeesResult[0]?.total || "0");

		const collectionRate =
			totalMonthlyRent > 0 ? (collectedRent / totalMonthlyRent) * 100 : 0;
		const occupancyRate =
			totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

		// Calculate rent growth (simplified)
		const previousPeriodStart = new Date(
			startDate.getTime() - (endDate.getTime() - startDate.getTime()),
		);
		const previousIncomeResult = await db
			.select({ total: sum(propertyIncome.amount) })
			.from(propertyIncome)
			.innerJoin(properties, eq(propertyIncome.propertyId, properties.id))
			.where(
				and(
					eq(properties.userId, userId),
					eq(propertyIncome.incomeType, "rent"),
					gte(propertyIncome.date, previousPeriodStart),
					lte(propertyIncome.date, startDate),
				),
			);

		const currentIncome = Number.parseFloat(incomeMetrics[0]?.total || "0");
		const previousIncome = Number.parseFloat(
			previousIncomeResult[0]?.total || "0",
		);
		const rentGrowth =
			previousIncome > 0
				? ((currentIncome - previousIncome) / previousIncome) * 100
				: 0;

		return {
			totalProperties,
			totalUnits,
			occupiedUnits,
			totalMonthlyRent,
			collectedRent,
			pendingRent,
			lateRent,
			missedRent,
			collectionRate,
			averageDaysLate: 0, // Would need to calculate from payment history
			totalLateFees,
			occupancyRate,
			rentGrowth,
			tenantTurnover: 0, // Would need to calculate from tenant data
			averageTenancyLength: 0, // Would need to calculate from lease data
		};
	}

	/**
	 * Get rent optimization recommendations
	 */
	async getRentOptimization(userId: string): Promise<RentOptimization[]> {
		const propertiesList = await db
			.select()
			.from(properties)
			.where(eq(properties.userId, userId));

		const optimizations: RentOptimization[] = [];

		for (const property of propertiesList) {
			const currentRent = Number.parseFloat(property.monthlyRent || "0");
			const currentValue = Number.parseFloat(
				property.currentValue || property.purchasePrice || "0",
			);

			// Simplified market rent calculation (would need real market data)
			const marketRent = currentRent * 1.05; // Assume 5% below market
			const rentGap = marketRent - currentRent;
			const rentGapPercentage =
				currentRent > 0 ? (rentGap / currentRent) * 100 : 0;

			let riskLevel: "low" | "medium" | "high" = "low";
			const factors: string[] = [];

			if (rentGapPercentage > 20) {
				riskLevel = "high";
				factors.push("Significantly below market rent");
			} else if (rentGapPercentage > 10) {
				riskLevel = "medium";
				factors.push("Moderately below market rent");
			}

			if (
				Number.parseFloat(property.currentValue || "0") >
				Number.parseFloat(property.purchasePrice || "0")
			) {
				factors.push("Property appreciation supports rent increase");
			}

			const optimizationPotential = Math.max(0, rentGap);
			const recommendedRent = Math.min(
				marketRent,
				currentRent + currentRent * 0.1,
			); // Max 10% increase

			optimizations.push({
				propertyId: property.id,
				propertyName: property.name,
				currentRent,
				marketRent,
				rentGap,
				rentGapPercentage,
				optimizationPotential,
				recommendedRent,
				riskLevel,
				factors,
			});
		}

		return optimizations.sort(
			(a, b) => b.optimizationPotential - a.optimizationPotential,
		);
	}

	/**
	 * Generate rent collection report
	 */
	async generateRentCollectionReport(
		userId: string,
		propertyId?: string,
		period?: {
			startDate: Date;
			endDate: Date;
		},
	): Promise<{
		summary: RentCollectionAnalytics;
		propertySummaries: RentalIncomeSummary[];
		tenantHistories: TenantPaymentHistory[];
		optimizations: RentOptimization[];
	}> {
		const summary = await this.getRentCollectionAnalytics(userId, period);

		const propertiesList = propertyId
			? [propertyId]
			: (
					await db
						.select({ id: properties.id })
						.from(properties)
						.where(eq(properties.userId, userId))
				).map((p) => p.id);

		const propertySummaries = await Promise.all(
			propertiesList.map((id) =>
				this.getRentalIncomeSummary(id, userId, period),
			),
		);

		// Get tenant histories for active tenants
		const activeTenants = await db
			.select({ id: tenants.id })
			.from(tenants)
			.innerJoin(properties, eq(tenants.propertyId, properties.id))
			.where(
				and(
					eq(properties.userId, userId),
					eq(tenants.status, "active"),
					propertyId ? eq(tenants.propertyId, propertyId) : sql`1=1`,
				),
			);

		const tenantHistories = await Promise.all(
			activeTenants.map((tenant) =>
				this.getTenantPaymentHistory(tenant.id, userId),
			),
		);

		const optimizations = await this.getRentOptimization(userId);

		return {
			summary,
			propertySummaries,
			tenantHistories,
			optimizations,
		};
	}
}
