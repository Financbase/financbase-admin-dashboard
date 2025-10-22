import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		return NextResponse.json({ message: 'Invoices API works', userId });
	} catch (error) {
		console.error('Error fetching invoices:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch invoices' },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		return NextResponse.json({ message: 'Invoice created', data: body, userId });
	} catch (error) {
		console.error('Error creating invoice:', error);
		return NextResponse.json(
			{ error: 'Failed to create invoice' },
			{ status: 500 }
		);
	}
}