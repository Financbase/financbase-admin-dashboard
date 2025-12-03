/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { LeadManagementService } from '@/lib/services/lead-management-service';
import { z } from 'zod';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

const createLeadSchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	email: z.string().email('Valid email is required'),
	phone: z.string().optional(),
	company: z.string().optional(),
	jobTitle: z.string().optional(),
	website: z.string().url().optional().or(z.literal('')),
	source: z.enum(['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'trade_show', 'advertisement', 'partner', 'other']),
	priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
	estimatedValue: z.number().min(0).optional(),
	probability: z.number().min(0).max(100).optional(),
	expectedCloseDate: z.string().datetime().optional(),
	assignedTo: z.string().optional(),
	tags: z.array(z.string()).optional(),
	notes: z.string().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Get list of leads
 *     description: Retrieves a paginated list of sales leads with optional filtering by status, source, priority, and assignment
 *     tags:
 *       - Analytics
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for lead name, email, or company
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, contacted, qualified, proposal, negotiation, closed_won, closed_lost, nurturing]
 *         description: Filter leads by status
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [website, referral, social_media, email_campaign, cold_call, trade_show, advertisement, partner, other]
 *         description: Filter leads by source
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter leads by priority
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter leads by assigned user ID
 *     responses:
 *       200:
 *         description: Leads retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: lead_123
 *                       firstName:
 *                         type: string
 *                         example: John
 *                       lastName:
 *                         type: string
 *                         example: Doe
 *                       email:
 *                         type: string
 *                         format: email
 *                       company:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [new, contacted, qualified, proposal, negotiation, closed_won, closed_lost, nurturing]
 *                       source:
 *                         type: string
 *                       estimatedValue:
 *                         type: number
 *                         example: 50000.00
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		// Authenticate user
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const search = searchParams.get('search') || undefined;
		const status = searchParams.get('status') || undefined;
		const source = searchParams.get('source') || undefined;
		const priority = searchParams.get('priority') || undefined;
		const assignedTo = searchParams.get('assignedTo') || undefined;

		const result = await LeadManagementService.getPaginatedLeads(userId, {
			page,
			limit,
			search,
			status,
			source,
			priority,
			assignedTo,
		});

		return NextResponse.json(result);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * @swagger
 * /api/leads:
 *   post:
 *     summary: Create a new lead
 *     description: Creates a new sales lead with contact information, source tracking, and pipeline management
 *     tags:
 *       - Analytics
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - source
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 example: +1-555-0123
 *               company:
 *                 type: string
 *                 example: Acme Corp
 *               jobTitle:
 *                 type: string
 *                 example: CEO
 *               website:
 *                 type: string
 *                 format: uri
 *               source:
 *                 type: string
 *                 enum: [website, referral, social_media, email_campaign, cold_call, trade_show, advertisement, partner, other]
 *                 example: website
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               estimatedValue:
 *                 type: number
 *                 example: 50000.00
 *               probability:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 75
 *               expectedCloseDate:
 *                 type: string
 *                 format: date-time
 *               assignedTo:
 *                 type: string
 *                 description: User ID to assign the lead to
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [enterprise, saas]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lead created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lead:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: lead_123
 *                     firstName:
 *                       type: string
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		// Authenticate user
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const validatedData = createLeadSchema.parse(body);

		// Convert date strings to Date objects
		const processedData = {
			...validatedData,
			expectedCloseDate: validatedData.expectedCloseDate ? new Date(validatedData.expectedCloseDate) : undefined,
		};

		const lead = await LeadManagementService.createLead({
			...processedData,
			userId,
		});

		return NextResponse.json({ lead }, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
