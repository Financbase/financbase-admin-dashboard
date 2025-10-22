import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TransactionService } from '@/lib/services/transaction-service';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const stats = await TransactionService.getStats(userId);

		return NextResponse.json({ stats });
	} catch (error) {
		console.error('Error fetching transaction stats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch transaction statistics' },
			{ status: 500 }
		);
	}
}
