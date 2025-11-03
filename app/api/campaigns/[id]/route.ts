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
  { params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized', code: 'UNAUTHORIZED' },
				{ status: 401 }
			);
		}

		const { id } = await params;
		const campaign = await AdboardService.getCampaignById(id, userId);

		if (!campaign) {
			return NextResponse.json(
				{ error: 'Campaign not found', code: 'NOT_FOUND' },
				{ status: 404 }
			);
		}

		return NextResponse.json({ campaign });
	} catch (error) {
		console.error('Error fetching campaign:', error);
		return NextResponse.json(
			{
				error: 'Failed to fetch campaign',
				details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
				code: 'DATABASE_ERROR',
			},
			{ status: 500 }
		);
	}
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized', code: 'UNAUTHORIZED' },
				{ status: 401 }
			);
		}

		const { id } = await params;
		const body = await request.json();
		const action = body.action;

		if (action === 'update_metrics') {
			// Update campaign metrics
			const validatedData = updateMetricsSchema.parse(body);
			const campaign = await AdboardService.updateCampaignMetrics(id, userId, validatedData);
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

			const campaign = await AdboardService.updateCampaign(id, userId, processedData);
			return NextResponse.json({ campaign });
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.issues },
				{ status: 400 }
			);
		}

		console.error('Error updating campaign:', error);
		return NextResponse.json(
			{
				error: 'Failed to update campaign',
				details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
				code: 'DATABASE_ERROR',
			},
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized', code: 'UNAUTHORIZED' },
				{ status: 401 }
			);
		}

		const { id } = await params;
		const campaign = await AdboardService.getCampaignById(id, userId);

		if (!campaign) {
			return NextResponse.json(
				{ error: 'Campaign not found', code: 'NOT_FOUND' },
				{ status: 404 }
			);
		}

		// Update campaign status to cancelled (soft delete)
		// In production, you might want to implement soft delete with a deleted_at field
		await AdboardService.updateCampaign(id, userId, {
			status: 'cancelled',
		});

		return NextResponse.json({
			message: 'Campaign deleted successfully',
			campaignId: id,
		});
	} catch (error) {
		console.error('Error deleting campaign:', error);

		if (error instanceof Error) {
			return NextResponse.json(
				{
					error: 'Failed to delete campaign',
					details: process.env.NODE_ENV === 'development' ? error.message : undefined,
					code: 'DATABASE_ERROR',
				},
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{
				error: 'Failed to delete campaign',
				code: 'INTERNAL_ERROR',
			},
			{ status: 500 }
		);
	}
}
