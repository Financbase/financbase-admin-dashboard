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
	type Property,
	properties,
	propertyExpenses,
	propertyIncome,
	propertyValuations,
} from "@/lib/db/schemas/real-estate.schema";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import {
	ArrowUpDown,
	Clock,
	DollarSign,
	Filter,
	TrendingDown,
} from "lucide-react";

/**
 * Calculate comprehensive property ROI metrics
 */
export async function calculatePropertyROI(
	propertyId: string,
	userId: string,
): Promise<{
	property: Property;
	financialMetrics: {
		purchasePrice: number;
		currentValue: number;
		totalIncome: number;
		totalExpenses: number;
		netIncome: number;
		roi: number;
		cashFlow: number;
		capRate: number;
		cashOnCashReturn: number;
		appreciation: number;
	};
	incomeMetrics: {
		monthlyIncome: number;
		annualIncome: number;
		incomeGrowth: number;
		occupancyRate: number;
		rentalYield: number;
	};
	expenseMetrics: {
		monthlyExpenses: number;
		annualExpenses: number;
		expenseRatio: number;
		maintenanceRatio: number;
		operatingExpenses: number;
	};
	performanceMetrics: {
		daysOnMarket: number;
		rentalDemand: number;
		marketValue: number;
		pricePerSqFt: number;
		rentPerSqFt: number;
	};
} | null> {
	const db = getDbOrThrow();

	// Get property
	const [property] = await db
		.select()
		.from(properties)
		.where(and(eq(properties.id, propertyId), eq(properties.userId, userId)))
		.limit(1);

	if (!property) return null;

	// Get income data
	const income = await db
		.select()
		.from(propertyIncome)
		.where(eq(propertyIncome.propertyId, propertyId))
		.orderBy(desc(propertyIncome.incomeDate));

	// Get expense data
	const expenses = await db
		.select()
		.from(propertyExpenses)
		.where(eq(propertyExpenses.propertyId, propertyId))
		.orderBy(desc(propertyExpenses.expenseDate));

	// Get valuations
	const valuations = await db
		.select()
		.from(propertyValuations)
		.where(eq(propertyValuations.propertyId, propertyId))
		.orderBy(desc(propertyValuations.valuationDate));

	// Calculate financial metrics
	const purchasePrice = Number(property.purchasePrice || 0);
	const currentValue = Number(property.currentValue || purchasePrice);
	const totalIncome = income.reduce(
		(sum, item) => sum + Number(item.amount),
		0,
	);
	const totalExpenses = expenses.reduce(
		(sum, item) => sum + Number(item.amount),
		0,
	);
	const netIncome = totalIncome - totalExpenses;

	// ROI calculations
	const roi = purchasePrice > 0 ? (netIncome / purchasePrice) * 100 : 0;
	const cashFlow = netIncome;
	const capRate = currentValue > 0 ? (netIncome / currentValue) * 100 : 0;
	const cashOnCashReturn =
		purchasePrice > 0 ? (netIncome / purchasePrice) * 100 : 0;
	const appreciation =
		purchasePrice > 0
			? ((currentValue - purchasePrice) / purchasePrice) * 100
			: 0;

	// Income metrics
	const monthlyIncome = totalIncome / 12; // Assuming annual data
	const annualIncome = totalIncome;
	const incomeGrowth = 0; // Would need historical data to calculate
	const occupancyRate = 100; // Would need vacancy data to calculate
	const rentalYield =
		currentValue > 0 ? (annualIncome / currentValue) * 100 : 0;

	// Expense metrics
	const monthlyExpenses = totalExpenses / 12;
	const annualExpenses = totalExpenses;
	const expenseRatio =
		totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
	const maintenanceRatio =
		(expenses
			.filter(
				(e) => e.category === "maintenance" || e.category === "repairs",
			)
			.reduce((sum, e) => sum + Number(e.amount), 0) /
			totalIncome) *
		100;
	const operatingExpenses = expenses
		.filter((e) =>
			["utilities", "insurance", "taxes", "management"].includes(
				e.category || "",
			),
		)
		.reduce((sum, e) => sum + Number(e.amount), 0);

	// Performance metrics
	const daysOnMarket = 0; // Would need listing data
	const rentalDemand = 100; // Would need market data
	const marketValue = currentValue;
	const squareFootage = Number(property.squareFootage || 0);
	const pricePerSqFt = squareFootage > 0 ? currentValue / squareFootage : 0;
	const rentPerSqFt = squareFootage > 0 ? annualIncome / squareFootage : 0;

	return {
		property,
		financialMetrics: {
			purchasePrice,
			currentValue,
			totalIncome,
			totalExpenses,
			netIncome,
			roi,
			cashFlow,
			capRate,
			cashOnCashReturn,
			appreciation,
		},
		incomeMetrics: {
			monthlyIncome,
			annualIncome,
			incomeGrowth,
			occupancyRate,
			rentalYield,
		},
		expenseMetrics: {
			monthlyExpenses,
			annualExpenses,
			expenseRatio,
			maintenanceRatio,
			operatingExpenses,
		},
		performanceMetrics: {
			daysOnMarket,
			rentalDemand,
			marketValue,
			pricePerSqFt,
			rentPerSqFt,
		},
	};
}

/**
 * Get ROI trends over time
 */
export async function getROITrends(
	propertyId: string,
	userId: string,
	startDate: Date,
	endDate: Date,
): Promise<
	{
		date: string;
		income: number;
		expenses: number;
		netIncome: number;
		roi: number;
		cashFlow: number;
	}[]
> {
	const db = getDbOrThrow();

	// Get daily income
	const incomeData = await db
		.select({
			date: sql<string>`DATE(${propertyIncome.incomeDate})`,
			income: sql<number>`COALESCE(sum(${propertyIncome.amount}), 0)`,
		})
		.from(propertyIncome)
		.innerJoin(properties, eq(propertyIncome.propertyId, properties.id))
		.where(
			and(
				eq(properties.id, propertyId),
				eq(properties.userId, userId),
				gte(propertyIncome.incomeDate, startDate),
				lte(propertyIncome.incomeDate, endDate),
			),
		)
		.groupBy(sql`DATE(${propertyIncome.incomeDate})`);

	// Get daily expenses
	const expenseData = await db
		.select({
			date: sql<string>`DATE(${propertyExpenses.expenseDate})`,
			expenses: sql<number>`COALESCE(sum(${propertyExpenses.amount}), 0)`,
		})
		.from(propertyExpenses)
		.where(
			and(
				eq(propertyExpenses.propertyId, propertyId),
				gte(propertyExpenses.expenseDate, startDate),
				lte(propertyExpenses.expenseDate, endDate),
			),
		)
		.groupBy(sql`DATE(${propertyExpenses.expenseDate})`);

	// Combine data
	const trendsMap = new Map<string, { income: number; expenses: number }>();

	incomeData.forEach((item) => {
		trendsMap.set(item.date, { income: Number(item.income), expenses: 0 });
	});

	expenseData.forEach((item) => {
		const existing = trendsMap.get(item.date) || { income: 0, expenses: 0 };
		trendsMap.set(item.date, { ...existing, expenses: Number(item.expenses) });
	});

	// Convert to array and calculate metrics
	return Array.from(trendsMap.entries())
		.map(([date, data]) => {
			const netIncome = data.income - data.expenses;
			const roi = 0; // Would need property value for accurate ROI
			const cashFlow = netIncome;

			return {
				date,
				income: data.income,
				expenses: data.expenses,
				netIncome,
				roi,
				cashFlow,
			};
		})
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get portfolio performance benchmarks
 */
export async function getPortfolioBenchmarks(
	userId: string,
	propertyType?: string,
): Promise<{
	averageROI: number;
	averageCapRate: number;
	averageCashFlow: number;
	topPerformingProperties: Array<{
		propertyId: string;
		name: string;
		roi: number;
		capRate: number;
		cashFlow: number;
	}>;
}> {
	const db = getDbOrThrow();

	const conditions = [eq(properties.userId, userId)];
	if (propertyType) {
		conditions.push(eq(properties.propertyType, propertyType));
	}

	const whereClause = and(...conditions);

	// Get all properties with their metrics
	const propertyMetrics = await db
		.select({
			propertyId: properties.id,
			name: properties.name,
			purchasePrice: properties.purchasePrice,
			currentValue: properties.currentValue,
		})
		.from(properties)
		.where(whereClause);

	// Calculate metrics for each property
	const propertyStats = await Promise.all(
		propertyMetrics.map(async (property) => {
			const income = await db
				.select()
				.from(propertyIncome)
				.where(eq(propertyIncome.propertyId, property.propertyId));

			const expenses = await db
				.select()
				.from(propertyExpenses)
				.where(eq(propertyExpenses.propertyId, property.propertyId));

			const totalIncome = income.reduce((sum, i) => sum + Number(i.amount), 0);
			const totalExpenses = expenses.reduce(
				(sum, e) => sum + Number(e.amount),
				0,
			);
			const netIncome = totalIncome - totalExpenses;

			const purchasePrice = Number(property.purchasePrice || 0);
			const currentValue = Number(property.currentValue || purchasePrice);

			const roi = purchasePrice > 0 ? (netIncome / purchasePrice) * 100 : 0;
			const capRate = currentValue > 0 ? (netIncome / currentValue) * 100 : 0;
			const cashFlow = netIncome;

			return {
				propertyId: property.propertyId,
				name: property.name,
				roi,
				capRate,
				cashFlow,
			};
		}),
	);

	// Calculate averages
	const averageROI =
		propertyStats.reduce((sum, p) => sum + p.roi, 0) / propertyStats.length ||
		0;
	const averageCapRate =
		propertyStats.reduce((sum, p) => sum + p.capRate, 0) /
			propertyStats.length || 0;
	const averageCashFlow =
		propertyStats.reduce((sum, p) => sum + p.cashFlow, 0) /
			propertyStats.length || 0;

	// Get top performing properties
	const topPerformingProperties = propertyStats
		.sort((a, b) => b.roi - a.roi)
		.slice(0, 5);

	return {
		averageROI,
		averageCapRate,
		averageCashFlow,
		topPerformingProperties,
	};
}
