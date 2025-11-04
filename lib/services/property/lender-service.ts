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
	type Lender,
	type LoanApplication,
	type NewLender,
	type NewLoanApplication,
	lenders,
	loanApplications,
	properties,
} from "@/lib/db/schemas/real-estate-expanded.schema";
import { and, avg, count, desc, eq, sql, sum } from "drizzle-orm";
import { BarChart3, CreditCard } from "lucide-react";

/**
 * Create a new lender profile
 */
export async function createLender(
	userId: string,
	lenderData: Omit<NewLender, "userId" | "createdAt" | "updatedAt">,
): Promise<Lender> {
	const db = getDbOrThrow();

	const [lender] = await db
		.insert(lenders)
		.values({
			...lenderData,
			userId,
		})
		.returning();

	return lender;
}

/**
 * Get lender by user ID
 */
export async function getLender(userId: string): Promise<Lender | null> {
	const db = getDbOrThrow();

	const [lender] = await db
		.select()
		.from(lenders)
		.where(eq(lenders.userId, userId))
		.limit(1);

	return lender || null;
}

/**
 * Create a new loan application
 */
export async function createLoanApplication(
	lenderId: string,
	applicationData: Omit<
		NewLoanApplication,
		"lenderId" | "createdAt" | "updatedAt"
	>,
): Promise<LoanApplication> {
	const db = getDbOrThrow();

	const [application] = await db
		.insert(loanApplications)
		.values({
			...applicationData,
			lenderId,
		})
		.returning();

	return application;
}

/**
 * Get loan applications for a lender
 */
export async function getLenderApplications(
	lenderId: string,
	options?: {
		status?: string;
		loanType?: string;
		limit?: number;
		offset?: number;
	},
): Promise<LoanApplication[]> {
	const db = getDbOrThrow();

	const conditions = [eq(loanApplications.lenderId, lenderId)];

	if (options?.status) {
		conditions.push(eq(loanApplications.status, options.status));
	}

	if (options?.loanType) {
		conditions.push(eq(loanApplications.loanType, options.loanType));
	}

	const whereClause = and(...conditions);

	const result = await db
		.select()
		.from(loanApplications)
		.where(whereClause)
		.orderBy(desc(loanApplications.createdAt))
		.limit(options?.limit || 50)
		.offset(options?.offset || 0);

	return result;
}

/**
 * Get lender performance metrics
 */
export async function getLenderPerformance(
	lenderId: string,
	startDate?: Date,
	endDate?: Date,
): Promise<{
	totalApplications: number;
	approvedApplications: number;
	deniedApplications: number;
	totalLoanVolume: number;
	averageLoanAmount: number;
	approvalRate: number;
	averageCreditScore: number;
	averageDTI: number;
}> {
	const db = getDbOrThrow();

	const conditions = [eq(loanApplications.lenderId, lenderId)];

	if (startDate) {
		conditions.push(sql`${loanApplications.createdAt} >= ${startDate}`);
	}

	if (endDate) {
		conditions.push(sql`${loanApplications.createdAt} <= ${endDate}`);
	}

	const whereClause = and(...conditions);

	// Get application statistics
	const [stats] = await db
		.select({
			totalApplications: count(loanApplications.id),
			approvedApplications: sql<number>`count(CASE WHEN ${loanApplications.status} = 'approved' THEN 1 END)`,
			deniedApplications: sql<number>`count(CASE WHEN ${loanApplications.status} = 'denied' THEN 1 END)`,
			totalLoanVolume: sql<number>`COALESCE(sum(CASE WHEN ${loanApplications.status} = 'approved' THEN ${loanApplications.loanAmount} END), 0)`,
			averageLoanAmount: sql<number>`COALESCE(avg(${loanApplications.loanAmount}), 0)`,
			averageCreditScore: sql<number>`COALESCE(avg(${loanApplications.creditScore}), 0)`,
			averageDTI: sql<number>`COALESCE(avg(${loanApplications.debtToIncomeRatio}), 0)`,
		})
		.from(loanApplications)
		.where(whereClause);

	const totalApplications = Number(stats?.totalApplications || 0);
	const approvedApplications = Number(stats?.approvedApplications || 0);
	const approvalRate =
		totalApplications > 0
			? (approvedApplications / totalApplications) * 100
			: 0;

	return {
		totalApplications,
		approvedApplications,
		deniedApplications: Number(stats?.deniedApplications || 0),
		totalLoanVolume: Number(stats?.totalLoanVolume || 0),
		averageLoanAmount: Number(stats?.averageLoanAmount || 0),
		approvalRate,
		averageCreditScore: Number(stats?.averageCreditScore || 0),
		averageDTI: Number(stats?.averageDTI || 0),
	};
}

/**
 * Update loan application status
 */
export async function updateLoanApplicationStatus(
	applicationId: string,
	lenderId: string,
	status: string,
	notes?: string,
): Promise<LoanApplication | null> {
	const db = getDbOrThrow();

	const updateData: any = { status };
	if (status === "approved") {
		updateData.approvalDate = new Date();
	}

	const [application] = await db
		.update(loanApplications)
		.set({
			...updateData,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(loanApplications.id, applicationId),
				eq(loanApplications.lenderId, lenderId),
			),
		)
		.returning();

	return application || null;
}

/**
 * Get loan analytics for lender
 */
export async function getLoanAnalytics(
	lenderId: string,
	startDate?: Date,
	endDate?: Date,
): Promise<{
	loanTypeDistribution: Array<{
		loanType: string;
		count: number;
		percentage: number;
		totalVolume: number;
	}>;
	statusDistribution: Array<{
		status: string;
		count: number;
		percentage: number;
	}>;
	monthlyVolume: Array<{
		month: string;
		volume: number;
		applications: number;
	}>;
	creditScoreDistribution: Array<{
		range: string;
		count: number;
		percentage: number;
	}>;
}> {
	const db = getDbOrThrow();

	const conditions = [eq(loanApplications.lenderId, lenderId)];

	if (startDate) {
		conditions.push(sql`${loanApplications.createdAt} >= ${startDate}`);
	}

	if (endDate) {
		conditions.push(sql`${loanApplications.createdAt} <= ${endDate}`);
	}

	const whereClause = and(...conditions);

	// Get loan type distribution
	const loanTypeData = await db
		.select({
			loanType: loanApplications.loanType,
			count: count(loanApplications.id),
			totalVolume: sql<number>`COALESCE(sum(${loanApplications.loanAmount}), 0)`,
		})
		.from(loanApplications)
		.where(whereClause)
		.groupBy(loanApplications.loanType);

	// Get status distribution
	const statusData = await db
		.select({
			status: loanApplications.status,
			count: count(loanApplications.id),
		})
		.from(loanApplications)
		.where(whereClause)
		.groupBy(loanApplications.status);

	// Get monthly volume
	const monthlyData = await db
		.select({
			month: sql<string>`DATE_TRUNC('month', ${loanApplications.createdAt})`,
			volume: sql<number>`COALESCE(sum(CASE WHEN ${loanApplications.status} = 'approved' THEN ${loanApplications.loanAmount} END), 0)`,
			applications: count(loanApplications.id),
		})
		.from(loanApplications)
		.where(whereClause)
		.groupBy(sql`DATE_TRUNC('month', ${loanApplications.createdAt})`)
		.orderBy(sql`DATE_TRUNC('month', ${loanApplications.createdAt})`);

	// Get credit score distribution
	const creditScoreData = await db
		.select({
			range: sql<string>`CASE 
				WHEN ${loanApplications.creditScore} < 580 THEN 'Poor (<580)'
				WHEN ${loanApplications.creditScore} < 670 THEN 'Fair (580-669)'
				WHEN ${loanApplications.creditScore} < 740 THEN 'Good (670-739)'
				WHEN ${loanApplications.creditScore} < 800 THEN 'Very Good (740-799)'
				ELSE 'Excellent (800+)'
			END`,
			count: count(loanApplications.id),
		})
		.from(loanApplications)
		.where(and(whereClause, sql`${loanApplications.creditScore} IS NOT NULL`))
		.groupBy(sql`CASE 
			WHEN ${loanApplications.creditScore} < 580 THEN 'Poor (<580)'
			WHEN ${loanApplications.creditScore} < 670 THEN 'Fair (580-669)'
			WHEN ${loanApplications.creditScore} < 740 THEN 'Good (670-739)'
			WHEN ${loanApplications.creditScore} < 800 THEN 'Very Good (740-799)'
			ELSE 'Excellent (800+)'
		END`);

	const totalApplications = loanTypeData.reduce(
		(sum, item) => sum + Number(item.count),
		0,
	);

	return {
		loanTypeDistribution: loanTypeData.map((item) => ({
			loanType: item.loanType,
			count: Number(item.count),
			percentage:
				totalApplications > 0
					? (Number(item.count) / totalApplications) * 100
					: 0,
			totalVolume: Number(item.totalVolume || 0),
		})),
		statusDistribution: statusData.map((item) => ({
			status: item.status || "unknown",
			count: Number(item.count),
			percentage:
				totalApplications > 0
					? (Number(item.count) / totalApplications) * 100
					: 0,
		})),
		monthlyVolume: monthlyData.map((item) => ({
			month: item.month,
			volume: Number(item.volume || 0),
			applications: Number(item.applications || 0),
		})),
		creditScoreDistribution: creditScoreData.map((item) => ({
			range: item.range,
			count: Number(item.count),
			percentage:
				totalApplications > 0
					? (Number(item.count) / totalApplications) * 100
					: 0,
		})),
	};
}
