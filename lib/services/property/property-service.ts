import { getDbOrThrow } from "@/lib/db";
import {
	type Lease,
	type NewLease,
	type NewProperty,
	type NewPropertyExpense,
	type NewPropertyIncome,
	type NewPropertyValuation,
	type NewTenant,
	type Property,
	type PropertyExpense,
	type PropertyIncome,
	type PropertyValuation,
	type Tenant,
	leases,
	properties,
	propertyExpenses,
	propertyIncome,
	propertyValuations,
	tenants,
} from "@/lib/db/schemas/real-estate.schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { DollarSign, Trash2, TrendingDown } from "lucide-react";

/**
 * Create a new property
 */
export async function createProperty(
	userId: string,
	propertyData: Omit<NewProperty, "userId" | "createdAt" | "updatedAt">,
): Promise<Property> {
	const db = getDbOrThrow();

	const [property] = await db
		.insert(properties)
		.values({
			...propertyData,
			userId,
		})
		.returning();

	return property;
}

/**
 * Get all properties for a user
 */
export async function getProperties(
	userId: string,
	options?: {
		status?: string;
		propertyType?: string;
		limit?: number;
		offset?: number;
	},
): Promise<Property[]> {
	const db = getDbOrThrow();

	const conditions = [eq(properties.userId, userId)];

	if (options?.status) {
		conditions.push(eq(properties.status, options.status));
	}

	if (options?.propertyType) {
		conditions.push(eq(properties.propertyType, options.propertyType));
	}

	const whereClause = and(...conditions);

	const result = await db
		.select()
		.from(properties)
		.where(whereClause)
		.orderBy(desc(properties.createdAt))
		.limit(options?.limit || 50)
		.offset(options?.offset || 0);

	return result;
}

/**
 * Get a single property by ID
 */
export async function getProperty(
	propertyId: string,
	userId: string,
): Promise<Property | null> {
	const db = getDbOrThrow();

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
export async function updateProperty(
	propertyId: string,
	userId: string,
	updateData: Partial<
		Omit<Property, "id" | "userId" | "createdAt" | "updatedAt">
	>,
): Promise<Property | null> {
	const db = getDbOrThrow();

	const [property] = await db
		.update(properties)
		.set({
			...updateData,
			updatedAt: new Date(),
		})
		.where(and(eq(properties.id, propertyId), eq(properties.userId, userId)))
		.returning();

	return property || null;
}

/**
 * Delete a property
 */
export async function deleteProperty(
	propertyId: string,
	userId: string,
): Promise<boolean> {
	const db = getDbOrThrow();

	const result = await db
		.delete(properties)
		.where(and(eq(properties.id, propertyId), eq(properties.userId, userId)));

	return result.rowCount > 0;
}

/**
 * Get property ROI data
 */
export async function getPropertyROI(
	propertyId: string,
	userId: string,
): Promise<{
	property: Property;
	totalIncome: number;
	totalExpenses: number;
	netIncome: number;
	roi: number;
	cashFlow: number;
	capRate: number;
	income: PropertyIncome[];
	expenses: PropertyExpense[];
	tenants: Tenant[];
	leases: Lease[];
} | null> {
	const db = getDbOrThrow();

	// Get property
	const property = await getProperty(propertyId, userId);
	if (!property) return null;

	// Get income
	const income = await db
		.select()
		.from(propertyIncome)
		.where(eq(propertyIncome.propertyId, propertyId))
		.orderBy(desc(propertyIncome.incomeDate));

	// Get expenses
	const expenses = await db
		.select()
		.from(propertyExpenses)
		.where(eq(propertyExpenses.propertyId, propertyId))
		.orderBy(desc(propertyExpenses.expenseDate));

	// Get tenants
	const tenants = await db
		.select()
		.from(tenants)
		.where(eq(tenants.propertyId, propertyId));

	// Get leases
	const leases = await db
		.select()
		.from(leases)
		.where(eq(leases.propertyId, propertyId));

	// Calculate totals
	const totalIncome = income.reduce(
		(sum, item) => sum + Number(item.amount),
		0,
	);
	const totalExpenses = expenses.reduce(
		(sum, item) => sum + Number(item.amount),
		0,
	);
	const netIncome = totalIncome - totalExpenses;

	// Calculate ROI and metrics
	const purchasePrice = Number(property.purchasePrice || 0);
	const roi = purchasePrice > 0 ? (netIncome / purchasePrice) * 100 : 0;
	const cashFlow = netIncome;
	const currentValue = Number(property.currentValue || purchasePrice);
	const capRate = currentValue > 0 ? (netIncome / currentValue) * 100 : 0;

	return {
		property,
		totalIncome,
		totalExpenses,
		netIncome,
		roi,
		cashFlow,
		capRate,
		income,
		expenses,
		tenants,
		leases,
	};
}

/**
 * Add property income
 */
export async function addPropertyIncome(
	propertyId: string,
	userId: string,
	incomeData: Omit<NewPropertyIncome, "propertyId" | "createdAt" | "updatedAt">,
): Promise<PropertyIncome> {
	const db = getDbOrThrow();

	// Verify property belongs to user
	const property = await getProperty(propertyId, userId);
	if (!property) {
		throw new Error("Property not found");
	}

	const [income] = await db
		.insert(propertyIncome)
		.values({
			...incomeData,
			propertyId,
		})
		.returning();

	return income;
}

/**
 * Add property expense
 */
export async function addPropertyExpense(
	propertyId: string,
	userId: string,
	expenseData: Omit<
		NewPropertyExpense,
		"propertyId" | "createdAt" | "updatedAt"
	>,
): Promise<PropertyExpense> {
	const db = getDbOrThrow();

	// Verify property belongs to user
	const property = await getProperty(propertyId, userId);
	if (!property) {
		throw new Error("Property not found");
	}

	const [expense] = await db
		.insert(propertyExpenses)
		.values({
			...expenseData,
			propertyId,
		})
		.returning();

	return expense;
}

/**
 * Get property statistics
 */
export async function getPropertyStats(
	userId: string,
	startDate?: Date,
	endDate?: Date,
): Promise<{
	totalProperties: number;
	activeProperties: number;
	totalValue: number;
	totalIncome: number;
	totalExpenses: number;
	netIncome: number;
	averageROI: number;
}> {
	const db = getDbOrThrow();

	const conditions = [eq(properties.userId, userId)];

	if (startDate) {
		conditions.push(sql`${properties.createdAt} >= ${startDate}`);
	}

	if (endDate) {
		conditions.push(sql`${properties.createdAt} <= ${endDate}`);
	}

	const whereClause = and(...conditions);

	const [stats] = await db
		.select({
			totalProperties: sql<number>`count(*)`,
			activeProperties: sql<number>`count(CASE WHEN ${properties.status} = 'active' THEN 1 END)`,
			totalValue: sql<number>`COALESCE(sum(${properties.currentValue}), 0)`,
		})
		.from(properties)
		.where(whereClause);

	// Get income and expense totals
	const [financialStats] = await db
		.select({
			totalIncome: sql<number>`COALESCE(sum(${propertyIncome.amount}), 0)`,
			totalExpenses: sql<number>`COALESCE(sum(${propertyExpenses.amount}), 0)`,
		})
		.from(properties)
		.leftJoin(propertyIncome, eq(properties.id, propertyIncome.propertyId))
		.leftJoin(propertyExpenses, eq(properties.id, propertyExpenses.propertyId))
		.where(whereClause);

	const totalIncome = Number(financialStats?.totalIncome || 0);
	const totalExpenses = Number(financialStats?.totalExpenses || 0);
	const netIncome = totalIncome - totalExpenses;
	const totalValue = Number(stats?.totalValue || 0);
	const averageROI = totalValue > 0 ? (netIncome / totalValue) * 100 : 0;

	return {
		totalProperties: Number(stats?.totalProperties || 0),
		activeProperties: Number(stats?.activeProperties || 0),
		totalValue: totalValue,
		totalIncome: totalIncome,
		totalExpenses: totalExpenses,
		netIncome: netIncome,
		averageROI: averageROI,
	};
}
