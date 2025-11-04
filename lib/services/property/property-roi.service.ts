/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { and, asc, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import {
	ArrowUpDown,
	Banknote,
	Clock,
	CreditCard,
	DollarSign,
	XCircle,
} from "lucide-react";
import { db } from "../db/connection";
import {
	type NewPropertyROI,
	type Property,
	type PropertyROI as PropertyROIType,
	leases,
	properties,
	propertyExpenses,
	propertyIncome,
	propertyROI,
	propertyUnits,
	tenants,
} from "@/lib/db/schemas/real-estate.schema";

export interface ROIComparison {
	propertyId: string;
	propertyName: string;
	cashOnCashReturn: number;
	capRate: number;
	totalReturn: number;
	netIncome: number;
	appreciation: number;
	occupancyRate: number;
	rank: number;
}

export interface PortfolioROI {
	totalProperties: number;
	totalInvestment: number;
	totalReturn: number;
	averageCashOnCashReturn: number;
	averageCapRate: number;
	totalAppreciation: number;
	portfolioValue: number;
	overallROI: number;
	bestPerformer: ROIComparison;
	worstPerformer: ROIComparison;
}

export interface CashFlowAnalysis {
	propertyId: string;
	propertyName: string;
	monthlyIncome: number;
	monthlyExpenses: number;
	monthlyCashFlow: number;
	annualCashFlow: number;
	cashFlowYield: number;
	breakEvenOccupancy: number;
	monthsToRecover: number;
}

export interface InvestmentMetrics {
	propertyId: string;
	propertyName: string;
	purchasePrice: number;
	downPayment: number;
	loanAmount: number;
	monthlyPayment: number;
	grossRentMultiplier: number;
	pricePerSquareFoot: number;
	rentPerSquareFoot: number;
	debtServiceCoverageRatio: number;
	loanToValueRatio: number;
}

export interface MarketAnalysis {
	propertyId: string;
	propertyName: string;
	currentValue: number;
	purchasePrice: number;
	appreciation: number;
	appreciationRate: number;
	marketValuePerSquareFoot: number;
	comparableProperties: number;
	marketTrend: "appreciating" | "stable" | "depreciating";
	timeOnMarket: number; // in days
}

export class PropertyROIService {
	/**
	 * Calculate comprehensive ROI for a property
	 */
	async calculatePropertyROI(
		propertyId: string,
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<PropertyROIType> {
		const property = await db
			.select()
			.from(properties)
			.where(and(eq(properties.id, propertyId), eq(properties.userId, userId)))
			.limit(1);

		if (!property.length) {
			throw new Error("Property not found");
		}

		const prop = property[0];

		// Get income for the period
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

		// Get expenses for the period
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
			.where(eq(tenants.propertyId, propertyId));

		const totalIncome = Number.parseFloat(incomeResult[0]?.total || "0");
		const totalExpenses = Number.parseFloat(expensesResult[0]?.total || "0");
		const netIncome = totalIncome - totalExpenses;
		const totalDays = occupancyResult[0]?.totalDays || 0;
		const occupiedDays = occupancyResult[0]?.occupiedDays || 0;
		const occupancyRate = totalDays > 0 ? (occupiedDays / totalDays) * 100 : 0;

		// Calculate ROI metrics
		const purchasePrice = Number.parseFloat(prop.purchasePrice || "0");
		const downPayment = Number.parseFloat(prop.downPayment || "0");
		const currentValue = Number.parseFloat(
			prop.currentValue || prop.purchasePrice || "0",
		);

		const cashOnCashReturn =
			downPayment > 0 ? (netIncome / downPayment) * 100 : 0;
		const capRate = currentValue > 0 ? (netIncome / currentValue) * 100 : 0;
		const appreciation = currentValue - purchasePrice;
		const totalReturn = netIncome + appreciation;

		// Create ROI record
		const roiData: NewPropertyROI = {
			userId,
			propertyId,
			periodStart: startDate,
			periodEnd: endDate,
			totalIncome: totalIncome.toString(),
			totalExpenses: totalExpenses.toString(),
			netIncome: netIncome.toString(),
			cashOnCashReturn: cashOnCashReturn.toString(),
			capRate: capRate.toString(),
			totalReturn: totalReturn.toString(),
			beginningValue: purchasePrice.toString(),
			endingValue: currentValue.toString(),
			appreciation: appreciation.toString(),
			occupancyRate: occupancyRate.toString(),
			averageRent: Number.parseFloat(prop.monthlyRent || "0").toString(),
		};

		const [newROI] = await db.insert(propertyROI).values(roiData).returning();
		return newROI;
	}

	/**
	 * Get ROI comparison across all properties
	 */
	async getROIComparison(
		userId: string,
		period?: {
			startDate: Date;
			endDate: Date;
		},
	): Promise<ROIComparison[]> {
		const startDate =
			period?.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
		const endDate = period?.endDate || new Date();

		// Get all properties with their ROI data
		const propertiesWithROI = await db
			.select({
				propertyId: properties.id,
				propertyName: properties.name,
				purchasePrice: properties.purchasePrice,
				downPayment: properties.downPayment,
				currentValue: properties.currentValue,
				monthlyRent: properties.monthlyRent,
			})
			.from(properties)
			.where(eq(properties.userId, userId));

		const comparisons: ROIComparison[] = [];

		for (const property of propertiesWithROI) {
			// Calculate ROI for this property
			const roi = await this.calculatePropertyROI(
				property.propertyId,
				userId,
				startDate,
				endDate,
			);

			comparisons.push({
				propertyId: property.propertyId,
				propertyName: property.propertyName,
				cashOnCashReturn: Number.parseFloat(roi.cashOnCashReturn || "0"),
				capRate: Number.parseFloat(roi.capRate || "0"),
				totalReturn: Number.parseFloat(roi.totalReturn || "0"),
				netIncome: Number.parseFloat(roi.netIncome || "0"),
				appreciation: Number.parseFloat(roi.appreciation || "0"),
				occupancyRate: Number.parseFloat(roi.occupancyRate || "0"),
				rank: 0, // Will be set after sorting
			});
		}

		// Sort by total return and assign ranks
		comparisons.sort((a, b) => b.totalReturn - a.totalReturn);
		comparisons.forEach((comp, index) => {
			comp.rank = index + 1;
		});

		return comparisons;
	}

	/**
	 * Get portfolio ROI overview
	 */
	async getPortfolioROI(
		userId: string,
		period?: {
			startDate: Date;
			endDate: Date;
		},
	): Promise<PortfolioROI> {
		const startDate =
			period?.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
		const endDate = period?.endDate || new Date();

		// Get all properties
		const allProperties = await db
			.select()
			.from(properties)
			.where(eq(properties.userId, userId));

		let totalInvestment = 0;
		let totalReturn = 0;
		let totalAppreciation = 0;
		let portfolioValue = 0;
		const roiComparisons: ROIComparison[] = [];

		for (const property of allProperties) {
			const roi = await this.calculatePropertyROI(
				property.id,
				userId,
				startDate,
				endDate,
			);

			totalInvestment += Number.parseFloat(property.purchasePrice || "0");
			totalReturn += Number.parseFloat(roi.totalReturn || "0");
			totalAppreciation += Number.parseFloat(roi.appreciation || "0");
			portfolioValue += Number.parseFloat(
				property.currentValue || property.purchasePrice || "0",
			);

			roiComparisons.push({
				propertyId: property.id,
				propertyName: property.name,
				cashOnCashReturn: Number.parseFloat(roi.cashOnCashReturn || "0"),
				capRate: Number.parseFloat(roi.capRate || "0"),
				totalReturn: Number.parseFloat(roi.totalReturn || "0"),
				netIncome: Number.parseFloat(roi.netIncome || "0"),
				appreciation: Number.parseFloat(roi.appreciation || "0"),
				occupancyRate: Number.parseFloat(roi.occupancyRate || "0"),
				rank: 0,
			});
		}

		const averageCashOnCashReturn =
			roiComparisons.length > 0
				? roiComparisons.reduce((sum, comp) => sum + comp.cashOnCashReturn, 0) /
					roiComparisons.length
				: 0;

		const averageCapRate =
			roiComparisons.length > 0
				? roiComparisons.reduce((sum, comp) => sum + comp.capRate, 0) /
					roiComparisons.length
				: 0;

		const overallROI =
			totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;

		// Sort to find best and worst performers
		roiComparisons.sort((a, b) => b.totalReturn - a.totalReturn);
		const bestPerformer = roiComparisons[0];
		const worstPerformer = roiComparisons[roiComparisons.length - 1];

		return {
			totalProperties: allProperties.length,
			totalInvestment,
			totalReturn,
			averageCashOnCashReturn,
			averageCapRate,
			totalAppreciation,
			portfolioValue,
			overallROI,
			bestPerformer: bestPerformer || ({} as ROIComparison),
			worstPerformer: worstPerformer || ({} as ROIComparison),
		};
	}

	/**
	 * Get cash flow analysis for properties
	 */
	async getCashFlowAnalysis(
		userId: string,
		propertyId?: string,
	): Promise<CashFlowAnalysis[]> {
		const propertyFilter = propertyId
			? eq(properties.id, propertyId)
			: sql`1=1`;

		const propertiesList = await db
			.select()
			.from(properties)
			.where(and(eq(properties.userId, userId), propertyFilter));

		const cashFlowAnalyses: CashFlowAnalysis[] = [];

		for (const property of propertiesList) {
			// Get monthly income and expenses
			const monthlyIncome = Number.parseFloat(property.monthlyRent || "0");

			// Get average monthly expenses
			const expensesResult = await db
				.select({ average: sql<number>`AVG(${propertyExpenses.amount})` })
				.from(propertyExpenses)
				.where(
					and(
						eq(propertyExpenses.propertyId, property.id),
						gte(
							propertyExpenses.date,
							new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
						),
					),
				);

			const monthlyExpenses = Number.parseFloat(
				expensesResult[0]?.average || "0",
			);
			const monthlyCashFlow = monthlyIncome - monthlyExpenses;
			const annualCashFlow = monthlyCashFlow * 12;
			const cashFlowYield =
				Number.parseFloat(property.purchasePrice || "0") > 0
					? (annualCashFlow /
							Number.parseFloat(property.purchasePrice || "0")) *
						100
					: 0;

			// Calculate break-even occupancy
			const breakEvenOccupancy =
				monthlyExpenses > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;

			// Calculate months to recover investment
			const monthsToRecover =
				monthlyCashFlow > 0
					? Number.parseFloat(property.purchasePrice || "0") / monthlyCashFlow
					: 0;

			cashFlowAnalyses.push({
				propertyId: property.id,
				propertyName: property.name,
				monthlyIncome,
				monthlyExpenses,
				monthlyCashFlow,
				annualCashFlow,
				cashFlowYield,
				breakEvenOccupancy,
				monthsToRecover,
			});
		}

		return cashFlowAnalyses;
	}

	/**
	 * Get investment metrics for properties
	 */
	async getInvestmentMetrics(
		userId: string,
		propertyId?: string,
	): Promise<InvestmentMetrics[]> {
		const propertyFilter = propertyId
			? eq(properties.id, propertyId)
			: sql`1=1`;

		const propertiesList = await db
			.select()
			.from(properties)
			.where(and(eq(properties.userId, userId), propertyFilter));

		const investmentMetrics: InvestmentMetrics[] = [];

		for (const property of propertiesList) {
			const purchasePrice = Number.parseFloat(property.purchasePrice || "0");
			const downPayment = Number.parseFloat(property.downPayment || "0");
			const loanAmount = Number.parseFloat(property.loanAmount || "0");
			const monthlyRent = Number.parseFloat(property.monthlyRent || "0");
			const squareFootage = property.squareFootage || 0;

			// Calculate monthly payment (simplified)
			const interestRate =
				Number.parseFloat(property.interestRate || "0") / 100;
			const loanTerm = property.loanTerm || 360; // 30 years default
			const monthlyPayment =
				loanAmount > 0 && interestRate > 0
					? (loanAmount *
							(interestRate / 12) *
							(1 + interestRate / 12) ** loanTerm) /
						((1 + interestRate / 12) ** loanTerm - 1)
					: 0;

			// Calculate metrics
			const grossRentMultiplier =
				monthlyRent > 0 ? purchasePrice / (monthlyRent * 12) : 0;
			const pricePerSquareFoot =
				squareFootage > 0 ? purchasePrice / squareFootage : 0;
			const rentPerSquareFoot =
				squareFootage > 0 ? monthlyRent / squareFootage : 0;
			const debtServiceCoverageRatio =
				monthlyPayment > 0 ? monthlyRent / monthlyPayment : 0;
			const loanToValueRatio =
				purchasePrice > 0 ? (loanAmount / purchasePrice) * 100 : 0;

			investmentMetrics.push({
				propertyId: property.id,
				propertyName: property.name,
				purchasePrice,
				downPayment,
				loanAmount,
				monthlyPayment,
				grossRentMultiplier,
				pricePerSquareFoot,
				rentPerSquareFoot,
				debtServiceCoverageRatio,
				loanToValueRatio,
			});
		}

		return investmentMetrics;
	}

	/**
	 * Get market analysis for properties
	 */
	async getMarketAnalysis(
		userId: string,
		propertyId?: string,
	): Promise<MarketAnalysis[]> {
		const propertyFilter = propertyId
			? eq(properties.id, propertyId)
			: sql`1=1`;

		const propertiesList = await db
			.select()
			.from(properties)
			.where(and(eq(properties.userId, userId), propertyFilter));

		const marketAnalyses: MarketAnalysis[] = [];

		for (const property of propertiesList) {
			const purchasePrice = Number.parseFloat(property.purchasePrice || "0");
			const currentValue = Number.parseFloat(
				property.currentValue || property.purchasePrice || "0",
			);
			const squareFootage = property.squareFootage || 0;
			const purchaseDate = property.purchaseDate || new Date();

			const appreciation = currentValue - purchasePrice;
			const timeSincePurchase =
				(Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365); // years
			const appreciationRate =
				timeSincePurchase > 0
					? (appreciation / purchasePrice / timeSincePurchase) * 100
					: 0;

			const marketValuePerSquareFoot =
				squareFootage > 0 ? currentValue / squareFootage : 0;

			// Determine market trend based on appreciation rate
			let marketTrend: "appreciating" | "stable" | "depreciating";
			if (appreciationRate > 5) marketTrend = "appreciating";
			else if (appreciationRate < -2) marketTrend = "depreciating";
			else marketTrend = "stable";

			const timeOnMarket = 0; // Would need to track listing dates

			marketAnalyses.push({
				propertyId: property.id,
				propertyName: property.name,
				currentValue,
				purchasePrice,
				appreciation,
				appreciationRate,
				marketValuePerSquareFoot,
				comparableProperties: 0, // Would need market data
				marketTrend,
				timeOnMarket,
			});
		}

		return marketAnalyses;
	}

	/**
	 * Get ROI trends over time
	 */
	async getROITrends(
		userId: string,
		propertyId: string,
		months = 12,
	): Promise<
		Array<{
			month: string;
			cashOnCashReturn: number;
			capRate: number;
			netIncome: number;
			appreciation: number;
		}>
	> {
		const trends = [];
		const now = new Date();

		for (let i = months - 1; i >= 0; i--) {
			const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

			try {
				const roi = await this.calculatePropertyROI(
					propertyId,
					userId,
					startDate,
					endDate,
				);

				trends.push({
					month: startDate.toISOString().slice(0, 7), // YYYY-MM format
					cashOnCashReturn: Number.parseFloat(roi.cashOnCashReturn || "0"),
					capRate: Number.parseFloat(roi.capRate || "0"),
					netIncome: Number.parseFloat(roi.netIncome || "0"),
					appreciation: Number.parseFloat(roi.appreciation || "0"),
				});
			} catch (error) {
				// Skip months with no data
				trends.push({
					month: startDate.toISOString().slice(0, 7),
					cashOnCashReturn: 0,
					capRate: 0,
					netIncome: 0,
					appreciation: 0,
				});
			}
		}

		return trends;
	}
}
