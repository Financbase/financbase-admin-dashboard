/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { directFileExports } from "@/lib/db/schemas/direct-file.schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/tax/direct-file/exports
 * Get export history for the current user (metadata only, no PII/FTI)
 */
export async function GET(request: NextRequest) {
	try {
		const user = await currentUser();
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Fetch export metadata for user (no PII/FTI)
		const exports = await db
			.select()
			.from(directFileExports)
			.where(eq(directFileExports.userId, user.id))
			.orderBy(desc(directFileExports.exportDate));

		return NextResponse.json(exports);
	} catch (error) {
		console.error("Error fetching export history:", error);
		return NextResponse.json(
			{ error: "Failed to fetch export history" },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/tax/direct-file/exports
 * Store export metadata (no PII/FTI)
 */
export async function POST(request: NextRequest) {
	try {
		const user = await currentUser();
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { filename, format, fileSize } = body;

		// Validate that no PII/FTI is being stored
		if (!filename || !format || (format !== "mef-xml" && format !== "json")) {
			return NextResponse.json(
				{ error: "Invalid export metadata" },
				{ status: 400 }
			);
		}

		// Store only metadata
		const exportRecord = await db
			.insert(directFileExports)
			.values({
				userId: user.id,
				filename,
				format,
				fileSize: fileSize || null,
				exportDate: new Date(),
			})
			.returning();

		return NextResponse.json(exportRecord[0]);
	} catch (error) {
		console.error("Error storing export metadata:", error);
		return NextResponse.json(
			{ error: "Failed to store export metadata" },
			{ status: 500 }
		);
	}
}

