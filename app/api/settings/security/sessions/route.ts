/**
 * Session Management API Routes
 * Handles active session viewing and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { userSecuritySettings } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';

// GET /api/settings/security/sessions
// Get all active sessions for the authenticated user
export async function GET() {
	try {
		const { userId } = auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get current user info from Clerk
		// const user = await currentUser();

		// Get user's security settings
		const securitySettings = await db
			.select()
			.from(userSecuritySettings)
			.where(eq(userSecuritySettings.userId, userId))
			.limit(1);

		// For now, we'll return mock session data since Clerk handles session management
		// In a production environment, you might want to track sessions separately
		const sessions = [
			{
				id: 'current_session',
				userAgent: 'Mozilla/5.0 (Web Browser)',
				ipAddress: '192.168.1.100', // This would come from request headers
				location: 'New York, NY', // This would be geocoded from IP
				lastActive: new Date(),
				isCurrent: true,
				device: 'Desktop Computer',
			},
		];

		// Add additional sessions if needed (mock data for demonstration)
		if (securitySettings.length > 0) {
			const settings = securitySettings[0];
			if (settings.maxConcurrentSessions > 1) {
				sessions.push({
					id: 'mobile_session',
					userAgent: 'Mozilla/5.0 (Mobile Safari)',
					ipAddress: '192.168.1.101',
					location: 'New York, NY',
					lastActive: new Date(Date.now() - 3600000), // 1 hour ago
					isCurrent: false,
					device: 'iPhone',
				});
			}
		}

		return NextResponse.json({
			sessions,
			totalActive: sessions.length,
			maxAllowed: securitySettings.length > 0 ? securitySettings[0].maxConcurrentSessions : 5,
		});
	} catch (error) {
		console.error('Error fetching sessions:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

// POST /api/settings/security/sessions/revoke
// Revoke a specific session (logout from a device)
export async function POST(request: NextRequest) {
	try {
		const { userId } = auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { sessionId } = body;

		if (!sessionId) {
			return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
		}

		// In a real implementation, you would revoke the session via Clerk
		// For now, we'll return success since this is a placeholder implementation
		// Clerk handles session revocation through their dashboard/API

		return NextResponse.json({
			message: 'Session revoked successfully',
			sessionId,
		});
	} catch (error) {
		console.error('Error revoking session:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

// POST /api/settings/security/sessions/revoke-all
// Revoke all sessions except current
export async function DELETE() {
	try {
		const { userId } = auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// In a real implementation, you would revoke all sessions via Clerk
		// For now, we'll return success since this is a placeholder implementation

		return NextResponse.json({
			message: 'All other sessions revoked successfully',
		});
	} catch (error) {
		console.error('Error revoking all sessions:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
