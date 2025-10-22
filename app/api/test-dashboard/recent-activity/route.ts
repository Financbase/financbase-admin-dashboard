import { NextResponse } from 'next/server';

export async function GET() {
	return NextResponse.json({
		activities: [
			{
				id: '1',
				type: 'invoice',
				description: 'Invoice #INV-001 created',
				amount: 1500,
				status: 'Paid',
				createdAt: '2024-01-15T10:30:00Z'
			},
			{
				id: '2',
				type: 'expense',
				description: 'Office Supplies',
				amount: 45,
				status: 'Approved',
				createdAt: '2024-01-14T14:20:00Z'
			},
			{
				id: '3',
				type: 'client',
				description: 'New client added',
				amount: undefined,
				status: 'Active',
				createdAt: '2024-01-13T09:15:00Z'
			}
		]
	});
}
