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
import { FreelanceHubService } from '@/lib/services/freelance-hub-service';
import { z } from 'zod';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

const createProjectSchema = z.object({
	clientId: z.string().optional(),
	name: z.string().min(1, 'Project name is required'),
	description: z.string().optional(),
	status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
	priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
	startDate: z.string().datetime().optional(),
	dueDate: z.string().datetime().optional(),
	budget: z.number().min(0).optional(),
	hourlyRate: z.number().min(0).optional(),
	currency: z.string().default('USD'),
	isBillable: z.boolean().default(true),
	allowOvertime: z.boolean().default(false),
	requireApproval: z.boolean().default(false),
	estimatedHours: z.number().min(0).optional(),
	tags: z.array(z.string()).optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
	notes: z.string().optional(),
});

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get list of projects
 *     description: Retrieves a paginated list of projects with optional filtering by status, priority, and client
 *     tags:
 *       - Workflows
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
 *         description: Search term for project name or description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, active, on_hold, completed, cancelled]
 *         description: Filter projects by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter projects by priority
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filter projects by client ID
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
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
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Website Redesign
 *                       status:
 *                         type: string
 *                         enum: [planning, active, on_hold, completed, cancelled]
 *                       priority:
 *                         type: string
 *                         enum: [low, medium, high, urgent]
 *                       budget:
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
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const search = searchParams.get('search') || undefined;
		const status = searchParams.get('status') || undefined;
		const priority = searchParams.get('priority') || undefined;
		const clientId = searchParams.get('clientId') || undefined;

		const result = await FreelanceHubService.getPaginatedProjects(userId, {
			page,
			limit,
			search,
			status,
			priority,
			clientId,
		});

		return NextResponse.json(result);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     description: Creates a new project for time tracking, billing, and task management
 *     tags:
 *       - Workflows
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Website Redesign Project
 *               description:
 *                 type: string
 *                 example: Complete redesign of company website
 *               clientId:
 *                 type: string
 *                 example: client_123
 *               status:
 *                 type: string
 *                 enum: [planning, active, on_hold, completed, cancelled]
 *                 default: planning
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               budget:
 *                 type: number
 *                 example: 50000.00
 *               hourlyRate:
 *                 type: number
 *                 example: 150.00
 *               currency:
 *                 type: string
 *                 default: USD
 *               isBillable:
 *                 type: boolean
 *                 default: true
 *               estimatedHours:
 *                 type: number
 *                 example: 200
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [web-design, frontend, backend]
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
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

		const validatedData = createProjectSchema.parse(body);

		// Convert date strings to Date objects
		const processedData = {
			...validatedData,
			startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
			dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
		};

		const project = await FreelanceHubService.createProject({
			...processedData,
			userId,
		});

		return NextResponse.json({ project }, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
