import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AdboardService } from '@/lib/services/adboard-service';
import { z } from 'zod';

const updateCampaignSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	type: z.enum(['search', 'display', 'social', 'video', 'email', 'retargeting', 'affiliate']).optional(),
	platform: z.string().optional(),
	audience: z.string().optional(),
	keywords: z.array(z.string()).optional(),
	demographics: z.record(z.unknown()).optional(),
	budget: z.number().min(0).optional(),
	dailyBudget: z.number().min(0).optional(),
	bidStrategy: z.string().optional(),
	maxBid: z.number().min(0).optional(),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	tags: z.array(z.string()).optional(),
	metadata: z.record(z.unknown()).optional(),
	notes: z.string().optional(),
});

const updateMetricsSchema = z.object({
	impressions: z.number().min(0).optional(),
	clicks: z.number().min(0).optional(),
	conversions: z.number().min(0).optional(),
	spend: z.number().min(0).optional(),
	revenue: z.number().min(0).optional(),
});

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const campaign = await AdboardService.getCampaignById(params.id, userId);

		if (!campaign) {
			return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
		}

		return NextResponse.json({ campaign });
	} catch (error) {
		console.error('Error fetching campaign:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch campaign' },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const action = body.action;

		if (action === 'update_metrics') {
			// Update campaign metrics
			const validatedData = updateMetricsSchema.parse(body);
			const campaign = await AdboardService.updateCampaignMetrics(params.id, userId, validatedData);
			return NextResponse.json({ campaign });
		} else {
			// Update campaign details
			const validatedData = updateCampaignSchema.parse(body);
			
			// Convert date strings to Date objects
			const processedData = {
				...validatedData,
				startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
				endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
			};

			const campaign = await AdboardService.updateCampaign(params.id, userId, processedData);
			return NextResponse.json({ campaign });
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.errors },
				{ status: 400 }
			);
		}

		console.error('Error updating campaign:', error);
		return NextResponse.json(
			{ error: 'Failed to update campaign' },
			{ status: 500 }
		);
	}
}
