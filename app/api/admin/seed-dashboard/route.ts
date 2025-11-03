import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { seedDashboardDataForUser } from '@/scripts/seed-dashboard-data';

/**
 * POST /api/admin/seed-dashboard
 * Seeds dashboard data for the authenticated user
 * Supports optional userId or email parameter for admin/testing
 */
export async function POST(request: Request) {
	try {
		const body = await request.json().catch(() => ({}));
		const { userId: providedUserId, email, clearExisting = false, skipIfExists = true } = body;

		// Allow userId or email to be provided directly (for admin/testing) or use authenticated user
		let userId = providedUserId;
		
		// If email is provided, look up the user ID from Clerk
		if (!userId && email) {
			try {
				const client = await clerkClient();
				// According to Clerk docs: emailAddress is an array parameter
				const { data: users, totalCount } = await client.users.getUserList({ 
					emailAddress: [email] 
				});
				
				if (users && users.length > 0) {
					userId = users[0].id;
					console.log(`Found user ID ${userId} for email ${email} (total matches: ${totalCount})`);
				} else {
					return NextResponse.json(
						{ error: 'User not found', message: `No user found with email ${email}` },
						{ status: 404 }
					);
				}
			} catch (error) {
				console.error('Error looking up user by email:', error);
				return NextResponse.json(
					{ 
						error: 'Failed to lookup user', 
						message: error instanceof Error ? error.message : 'Unknown error',
						details: error instanceof Error ? error.stack : undefined
					},
					{ status: 500 }
				);
			}
		}
		
		if (!userId) {
			const { userId: authUserId } = await auth();
			userId = authUserId;
		}

		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized', message: 'You must be authenticated or provide a userId/email' },
				{ status: 401 }
			);
		}

		console.log(`🌱 Seeding dashboard data for user: ${userId}`);

		const result = await seedDashboardDataForUser(userId, {
			clearExisting,
			skipIfExists,
		});

		return NextResponse.json({
			success: true,
			message: result.message,
			data: result.counts,
			skipped: result.skipped,
		});
	} catch (error) {
		console.error('❌ Error seeding dashboard data:', error);
		
		return NextResponse.json(
			{
				error: 'Failed to seed dashboard data',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

/**
 * GET /api/admin/seed-dashboard
 * Check if user has data and return status
 */
export async function GET() {
	try {
		const { userId } = await auth();
		
		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const { checkUserHasData } = await import('@/scripts/seed-dashboard-data');
		const dataStatus = await checkUserHasData(userId);

		return NextResponse.json({
			hasData: dataStatus.hasClients || dataStatus.hasInvoices || dataStatus.hasExpenses,
			details: dataStatus,
		});
	} catch (error) {
		console.error('❌ Error checking data status:', error);
		
		return NextResponse.json(
			{
				error: 'Failed to check data status',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

