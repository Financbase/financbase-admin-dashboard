import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AIMatchingEngine } from "@/lib/reconciliation/ai-matching-engine";
import { ReconciliationService } from "@/lib/reconciliation/reconciliation-service";
import { db } from "@/lib/db";
import { reconciliationMatches } from "@/lib/db/schemas/reconciliation.schema";
import { eq, inArray } from "drizzle-orm";

/**
 * POST /api/reconciliation/match
 * Find and create transaction matches for a reconciliation session
 */
export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { sessionId, statementTransactions } = body;

		if (!sessionId || !statementTransactions || !Array.isArray(statementTransactions)) {
			return NextResponse.json(
				{ error: "Missing required fields: sessionId, statementTransactions" },
				{ status: 400 }
			);
		}

		// Find optimal matches using AI
		const matchResult = await AIMatchingEngine.findOptimalMatches({
			sessionId,
			statementTransactions,
		});

		// Save matches to database
		if (matchResult.matches.length > 0) {
			const matchesToSave = matchResult.matches.map(match => ({
				sessionId,
				statementTransactionId: match.statementTransaction.id,
				statementAmount: match.statementTransaction.amount.toString(),
				statementDescription: match.statementTransaction.description,
				statementDate: match.statementTransaction.date,
				statementReference: match.statementTransaction.reference,
				bookTransactionId: match.bookTransaction.id,
				bookAmount: match.bookTransaction.amount.toString(),
				bookDescription: match.bookTransaction.description,
				bookDate: match.bookTransaction.date,
				bookReference: match.bookTransaction.reference,
				status: "matched" as const,
				confidence: match.confidence,
				confidenceScore: match.score * 100,
				matchCriteria: match.criteria,
				matchReason: match.reason,
			}));

			await db.insert(reconciliationMatches).values(matchesToSave);
		}

		return NextResponse.json({
			success: true,
			data: {
				matches: matchResult.matches,
				unmatchedStatements: matchResult.unmatchedStatements,
				unmatchedBooks: matchResult.unmatchedBooks,
				confidence: matchResult.confidence,
				aiInsights: matchResult.aiInsights,
			},
		});

	} catch (error) {
		console.error("Transaction Matching API Error:", error);
		return NextResponse.json(
			{ error: "Failed to find transaction matches" },
			{ status: 500 }
		);
	}
}

/**
 * GET /api/reconciliation/match/[sessionId]
 * Get existing matches for a reconciliation session
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { sessionId: string } }
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const { sessionId } = params;

		if (!sessionId) {
			return NextResponse.json(
				{ error: "Session ID is required" },
				{ status: 400 }
			);
		}

		// Get existing matches
		const matches = await db
			.select()
			.from(reconciliationMatches)
			.where(eq(reconciliationMatches.sessionId, sessionId))
			.orderBy(desc(reconciliationMatches.confidenceScore));

		// Get unmatched statement transactions (would need additional context)
		// Get unmatched book transactions (would need additional context)

		return NextResponse.json({
			success: true,
			data: {
				matches,
				unmatchedStatements: [],
				unmatchedBooks: [],
			},
		});

	} catch (error) {
		console.error("Get Matches API Error:", error);
		return NextResponse.json(
			{ error: "Failed to get transaction matches" },
			{ status: 500 }
		);
	}
}
