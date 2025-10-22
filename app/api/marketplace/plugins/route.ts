import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Mock marketplace plugins data
		const plugins = [
			{
				id: 1,
				name: 'Stripe Integration',
				description: 'Accept payments directly through your invoices with Stripe payment processing.',
				version: '2.1.0',
				author: 'Financbase Team',
				category: 'integrations',
				tags: ['payments', 'stripe', 'billing'],
				icon: '/icons/stripe.png',
				rating: 4.8,
				reviewCount: 156,
				installationCount: 2847,
				pricingModel: 'free',
				isVerified: true,
				isFeatured: true,
			},
			{
				id: 2,
				name: 'Advanced Reporting',
				description: 'Generate detailed financial reports with custom dashboards and export options.',
				version: '1.5.2',
				author: 'DataViz Solutions',
				category: 'reporting',
				tags: ['reports', 'analytics', 'dashboard'],
				rating: 4.6,
				reviewCount: 89,
				installationCount: 1243,
				pricingModel: 'freemium',
				price: 29,
				isVerified: true,
				isFeatured: false,
			},
			{
				id: 3,
				name: 'Invoice Automation',
				description: 'Automatically send invoices, track payments, and follow up on overdue accounts.',
				version: '3.0.1',
				author: 'AutoFinance Inc',
				category: 'automation',
				tags: ['automation', 'invoices', 'reminders'],
				rating: 4.9,
				reviewCount: 203,
				installationCount: 3892,
				pricingModel: 'subscription',
				price: 19,
				isVerified: true,
				isFeatured: true,
			},
		];

		return NextResponse.json(plugins);
	} catch (error) {
		console.error('Error fetching marketplace plugins:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { name, description, category, version, entryPoint } = body;

		if (!name || !description || !category || !version || !entryPoint) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Mock new plugin submission
		const newPlugin = {
			id: Date.now(),
			userId,
			name,
			description,
			category,
			version,
			entryPoint,
			status: 'pending',
			isVerified: false,
			installationCount: 0,
			rating: 0,
			reviewCount: 0,
			createdAt: new Date().toISOString(),
		};

		return NextResponse.json(newPlugin, { status: 201 });
	} catch (error) {
		console.error('Error submitting plugin:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
