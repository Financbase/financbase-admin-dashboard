/**
 * Statement Transactions API Route
 * Get statement transactions for a reconciliation session
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { reconciliationMatches, reconciliationSessions } from "@/lib/db/schemas/reconciliation.schema";
import { eq, and, desc } from "drizzle-orm";
import { logger } from '@/lib/logger';

/**
 * GET /api/reconciliation/statement-transactions/[sessionId]
 * Get statement transactions for a reconciliation session
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ sessionId: string }> }
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const { sessionId } = await params;

		if (!sessionId) {
			return NextResponse.json(
				{ error: "Session ID is required" },
				{ status: 400 }
			);
		}

		// Verify session belongs to user
		const [session] = await db
			.select()
			.from(reconciliationSessions)
			.where(
				and(
					eq(reconciliationSessions.id, sessionId),
					eq(reconciliationSessions.userId, userId)
				)
			)
			.limit(1);

		if (!session) {
			return NextResponse.json(
				{ error: "Session not found" },
				{ status: 404 }
			);
		}

		// Get all matches for this session to extract statement transactions
		const matches = await db
			.select()
			.from(reconciliationMatches)
			.where(eq(reconciliationMatches.sessionId, sessionId))
			.orderBy(desc(reconciliationMatches.statementDate));

		// Extract unique statement transactions from matches
		// Group by statementTransactionId to avoid duplicates
		const statementTransactionsMap = new Map<string, {
			id: string;
			amount: number;
			description: string;
			date: Date;
			reference?: string;
		}>();

		for (const match of matches) {
			if (match.statementTransactionId && match.statementAmount) {
				const key = match.statementTransactionId;
				if (!statementTransactionsMap.has(key)) {
					statementTransactionsMap.set(key, {
						id: match.statementTransactionId,
						amount: parseFloat(match.statementAmount.toString()),
						description: match.statementDescription || '',
						date: match.statementDate || new Date(),
						reference: match.statementReference || undefined,
					});
				}
			}
		}

		// Convert map to array
		const statementTransactions = Array.from(statementTransactionsMap.values());

		return NextResponse.json({
			success: true,
			data: statementTransactions,
		});

	} catch (error) {
		logger.error("Get Statement Transactions API Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch statement transactions" },
			{ status: 500 }
		);
	}
}

