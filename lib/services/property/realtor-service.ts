import { getDbOrThrow } from "@/lib/db";
import {
	type NewPropertyListing,
	type NewRealEstateProfessional,
	type PropertyListing,
	type RealEstateProfessional,
	properties,
	propertyListings,
	realEstateProfessionals,
} from "@/lib/db/schemas/real-estate-expanded.schema";
import { and, count, desc, eq, sql, sum } from "drizzle-orm";
import { BarChart3, TrendingUp } from "lucide-react";

/**
 * Create a new real estate professional profile
 */
export async function createRealEstateProfessional(
	userId: string,
	professionalData: Omit<
		NewRealEstateProfessional,
		"userId" | "createdAt" | "updatedAt"
	>,
): Promise<RealEstateProfessional> {
	const db = getDbOrThrow();

	const [professional] = await db
		.insert(realEstateProfessionals)
		.values({
			...professionalData,
			userId,
		})
		.returning();

	return professional;
}

/**
 * Get real estate professional by user ID
 */
export async function getRealEstateProfessional(
	userId: string,
): Promise<RealEstateProfessional | null> {
	const db = getDbOrThrow();

	const [professional] = await db
		.select()
		.from(realEstateProfessionals)
		.where(eq(realEstateProfessionals.userId, userId))
		.limit(1);

	return professional || null;
}

/**
 * Create a new property listing
 */
export async function createPropertyListing(
	realtorId: string,
	listingData: Omit<
		NewPropertyListing,
		"realtorId" | "createdAt" | "updatedAt"
	>,
): Promise<PropertyListing> {
	const db = getDbOrThrow();

	const [listing] = await db
		.insert(propertyListings)
		.values({
			...listingData,
			realtorId,
		})
		.returning();

	return listing;
}

/**
 * Get listings for a realtor
 */
export async function getRealtorListings(
	realtorId: string,
	options?: {
		status?: string;
		limit?: number;
		offset?: number;
	},
): Promise<PropertyListing[]> {
	const db = getDbOrThrow();

	const conditions = [eq(propertyListings.realtorId, realtorId)];

	if (options?.status) {
		conditions.push(eq(propertyListings.status, options.status));
	}

	const whereClause = and(...conditions);

	const result = await db
		.select()
		.from(propertyListings)
		.where(whereClause)
		.orderBy(desc(propertyListings.createdAt))
		.limit(options?.limit || 50)
		.offset(options?.offset || 0);

	return result;
}

/**
 * Get realtor performance metrics
 */
export async function getRealtorPerformance(
	realtorId: string,
	startDate?: Date,
	endDate?: Date,
): Promise<{
	totalListings: number;
	activeListings: number;
	soldListings: number;
	totalSalesVolume: number;
	averageDaysOnMarket: number;
	commissionEarned: number;
	conversionRate: number;
}> {
	const db = getDbOrThrow();

	const conditions = [eq(propertyListings.realtorId, realtorId)];

	if (startDate) {
		conditions.push(sql`${propertyListings.createdAt} >= ${startDate}`);
	}

	if (endDate) {
		conditions.push(sql`${propertyListings.createdAt} <= ${endDate}`);
	}

	const whereClause = and(...conditions);

	// Get listing counts and sales volume
	const [stats] = await db
		.select({
			totalListings: count(propertyListings.id),
			activeListings: sql<number>`count(CASE WHEN ${propertyListings.status} = 'active' THEN 1 END)`,
			soldListings: sql<number>`count(CASE WHEN ${propertyListings.status} = 'sold' THEN 1 END)`,
			totalSalesVolume: sql<number>`COALESCE(sum(CASE WHEN ${propertyListings.status} = 'sold' THEN ${propertyListings.listingPrice} END), 0)`,
			averageDaysOnMarket: sql<number>`COALESCE(avg(CASE WHEN ${propertyListings.status} = 'sold' THEN ${propertyListings.daysOnMarket} END), 0)`,
			commissionEarned: sql<number>`COALESCE(sum(CASE WHEN ${propertyListings.status} = 'sold' THEN ${propertyListings.listingPrice} * ${propertyListings.commission} / 100 END), 0)`,
		})
		.from(propertyListings)
		.where(whereClause);

	const totalListings = Number(stats?.totalListings || 0);
	const soldListings = Number(stats?.soldListings || 0);
	const conversionRate =
		totalListings > 0 ? (soldListings / totalListings) * 100 : 0;

	return {
		totalListings,
		activeListings: Number(stats?.activeListings || 0),
		soldListings,
		totalSalesVolume: Number(stats?.totalSalesVolume || 0),
		averageDaysOnMarket: Number(stats?.averageDaysOnMarket || 0),
		commissionEarned: Number(stats?.commissionEarned || 0),
		conversionRate,
	};
}

/**
 * Update listing status
 */
export async function updateListingStatus(
	listingId: string,
	realtorId: string,
	status: string,
	price?: number,
): Promise<PropertyListing | null> {
	const db = getDbOrThrow();

	const updateData: any = { status };
	if (price) {
		updateData.listingPrice = price;
	}

	const [listing] = await db
		.update(propertyListings)
		.set({
			...updateData,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(propertyListings.id, listingId),
				eq(propertyListings.realtorId, realtorId),
			),
		)
		.returning();

	return listing || null;
}

/**
 * Get market analytics for realtor
 */
export async function getMarketAnalytics(
	realtorId: string,
	startDate?: Date,
	endDate?: Date,
): Promise<{
	priceTrends: Array<{
		month: string;
		averagePrice: number;
		listingsCount: number;
	}>;
	propertyTypeDistribution: Array<{
		propertyType: string;
		count: number;
		percentage: number;
	}>;
	statusDistribution: Array<{
		status: string;
		count: number;
		percentage: number;
	}>;
}> {
	const db = getDbOrThrow();

	const conditions = [eq(propertyListings.realtorId, realtorId)];

	if (startDate) {
		conditions.push(sql`${propertyListings.createdAt} >= ${startDate}`);
	}

	if (endDate) {
		conditions.push(sql`${propertyListings.createdAt} <= ${endDate}`);
	}

	const whereClause = and(...conditions);

	// Get price trends by month
	const priceTrends = await db
		.select({
			month: sql<string>`DATE_TRUNC('month', ${propertyListings.createdAt})`,
			averagePrice: sql<number>`avg(${propertyListings.listingPrice})`,
			listingsCount: count(propertyListings.id),
		})
		.from(propertyListings)
		.where(whereClause)
		.groupBy(sql`DATE_TRUNC('month', ${propertyListings.createdAt})`)
		.orderBy(sql`DATE_TRUNC('month', ${propertyListings.createdAt})`);

	// Get property type distribution
	const propertyTypeData = await db
		.select({
			propertyType: properties.propertyType,
			count: count(propertyListings.id),
		})
		.from(propertyListings)
		.innerJoin(properties, eq(propertyListings.propertyId, properties.id))
		.where(whereClause)
		.groupBy(properties.propertyType);

	// Get status distribution
	const statusData = await db
		.select({
			status: propertyListings.status,
			count: count(propertyListings.id),
		})
		.from(propertyListings)
		.where(whereClause)
		.groupBy(propertyListings.status);

	const totalListings = propertyTypeData.reduce(
		(sum, item) => sum + Number(item.count),
		0,
	);

	return {
		priceTrends: priceTrends.map((item) => ({
			month: item.month,
			averagePrice: Number(item.averagePrice || 0),
			listingsCount: Number(item.listingsCount || 0),
		})),
		propertyTypeDistribution: propertyTypeData.map((item) => ({
			propertyType: item.propertyType,
			count: Number(item.count),
			percentage:
				totalListings > 0 ? (Number(item.count) / totalListings) * 100 : 0,
		})),
		statusDistribution: statusData.map((item) => ({
			status: item.status || "unknown",
			count: Number(item.count),
			percentage:
				totalListings > 0 ? (Number(item.count) / totalListings) * 100 : 0,
		})),
	};
}
