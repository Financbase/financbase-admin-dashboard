import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PaymentService } from '@/lib/services/payment-service';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const stats = await PaymentService.getPaymentStats(userId);

		return NextResponse.json({ stats });
	} catch (error) {
		console.error('Error fetching payment stats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch payment stats' },
			{ status: 500 }
		);
	}
}
