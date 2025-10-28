import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// GET /api/accounts/balances - Get user's account balances
export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Mock account balances data since we don't have a full banking integration
		// In a real app, this would integrate with Plaid, Yodlee, or direct bank APIs
		const balances = {
			checking: {
				balance: 12500.00,
				change: 2.5,
				accountNumber: '****1234',
				bankName: 'Chase Bank'
			},
			savings: {
				balance: 45000.00,
				change: 1.8,
				accountNumber: '****5678',
				bankName: 'Chase Bank'
			},
			investment: {
				balance: 125000.00,
				change: 5.2,
				accountNumber: '****9012',
				bankName: 'Fidelity Investments'
			},
			credit: {
				balance: -2500.00,
				change: -0.5,
				accountNumber: '****3456',
				bankName: 'Capital One'
			}
		};

		return NextResponse.json({ balances });

	} catch (error) {
		console.error('Error fetching account balances:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch account balances' },
			{ status: 500 }
		);
	}
}
