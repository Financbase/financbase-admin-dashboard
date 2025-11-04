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
import { ReconciliationService } from "@/lib/reconciliation/reconciliation-service";
import { AIMatchingEngine } from "@/lib/reconciliation/ai-matching-engine";
import { db } from "@/lib/db";
import { reconciliationSessions, reconciliationMatches } from "@/lib/db/schemas/reconciliation.schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/reconciliation/sessions
 * Get all reconciliation sessions for the authenticated user
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const sessions = await db
			.select()
			.from(reconciliationSessions)
			.where(eq(reconciliationSessions.userId, userId))
			.orderBy(desc(reconciliationSessions.createdAt));

		return NextResponse.json({
			success: true,
			data: sessions,
		});

	} catch (error) {
		console.error("Reconciliation Sessions API Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch reconciliation sessions" },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/reconciliation/sessions
 * Create a new reconciliation session
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const {
			accountId,
			name,
			description,
			type,
			startDate,
			endDate,
			statementBalance,
		} = body;

		if (!accountId || !name || !startDate || !endDate) {
			return NextResponse.json(
				{ error: "Missing required fields: accountId, name, startDate, endDate" },
				{ status: 400 }
			);
		}

		const newSession = await ReconciliationService.createReconciliationSession({
			userId,
			accountId,
			name,
			description,
			type: type || "bank_statement",
			startDate: new Date(startDate),
			endDate: new Date(endDate),
			statementBalance: statementBalance ? Number(statementBalance) : undefined,
		});

		return NextResponse.json({
			success: true,
			data: newSession[0],
		});

	} catch (error) {
		console.error("Create Reconciliation Session API Error:", error);
		return NextResponse.json(
			{ error: "Failed to create reconciliation session" },
			{ status: 500 }
		);
	}
}
