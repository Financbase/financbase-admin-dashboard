import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AccountService } from '@/lib/services/account-service';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const stats = await AccountService.getAccountStats(userId);

		return NextResponse.json({ stats });
	} catch (error) {
		console.error('Error fetching account stats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch account stats' },
			{ status: 500 }
		);
	}
}
