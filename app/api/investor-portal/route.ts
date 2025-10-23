import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { investorPortals, customReports, investorAccessLogs } from '@/lib/db/schemas';
import { eq, and, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET /api/investor-portal - List user's investor portals
export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const portals = await db
			.select()
			.from(investorPortals)
			.where(eq(investorPortals.userId, userId))
			.orderBy(investorPortals.createdAt);

		// Add access statistics for each portal
		const portalsWithStats = await Promise.all(
			portals.map(async (portal) => {
				// Count access logs for this portal
				const accessCount = await db
					.select({ count: sql<number>`count(*)` })
					.from(investorAccessLogs)
					.where(eq(investorAccessLogs.portalId, portal.id));

				// Get last access
				const lastAccess = await db
					.select()
					.from(investorAccessLogs)
					.where(eq(investorAccessLogs.portalId, portal.id))
					.orderBy(investorAccessLogs.accessedAt)
					.limit(1);

				return {
					...portal,
					accessCount: Number(accessCount[0]?.count || 0),
					lastAccessed: lastAccess[0]?.accessedAt,
				};
			})
		);

		return NextResponse.json(portalsWithStats);
	} catch (error) {
		console.error('Error fetching investor portals:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

// POST /api/investor-portal - Create new investor portal
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const {
			name,
			description,
			logo,
			primaryColor = '#3b82f6',
			allowedMetrics = [],
			allowedReports = [],
			expiresAt,
		} = body;

		if (!name) {
			return NextResponse.json({ error: 'Portal name is required' }, { status: 400 });
		}

		// Generate unique access token
		const accessToken = nanoid(32);

		// Validate allowed reports exist and belong to user
		if (allowedReports.length > 0) {
			const validReports = await db
				.select()
				.from(customReports)
				.where(and(
					eq(customReports.userId, userId),
					sql`${customReports.id} = ANY(${allowedReports})`
				));

			if (validReports.length !== allowedReports.length) {
				return NextResponse.json({ error: 'Invalid report IDs' }, { status: 400 });
			}
		}

		const newPortal = await db.insert(investorPortals).values({
			userId,
			name,
			description,
			logo,
			primaryColor,
			allowedMetrics,
			allowedReports,
			accessToken,
			expiresAt: expiresAt ? new Date(expiresAt) : null,
			isActive: true,
		}).returning();

		return NextResponse.json(newPortal[0], { status: 201 });
	} catch (error) {
		console.error('Error creating investor portal:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
