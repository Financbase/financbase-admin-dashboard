/**
 * Approval Workflows API Routes
 * Bill approval workflows and decision management
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { billPayService } from '@/lib/services/bill-pay/bill-pay-service';
import { auditLogger, AuditEventType, RiskLevel, ComplianceFramework } from '@/lib/services/security/audit-logging-service';

/**
 * @swagger
 * /api/approval-workflows:
 *   get:
 *     summary: Get list of approval workflows
 *     description: Retrieves a paginated list of bill approval workflows configured for the authenticated user
 *     tags:
 *       - Workflows
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter workflows by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of workflows to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of workflows to skip
 *     responses:
 *       200:
 *         description: Approval workflows retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workflows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: workflow_123
 *                       name:
 *                         type: string
 *                         example: High Value Approval Workflow
 *                       description:
 *                         type: string
 *                       steps:
 *                         type: array
 *                         items:
 *                           type: object
 *                       status:
 *                         type: string
 *                         enum: [active, inactive]
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
// GET /api/approval-workflows - Get approval workflows
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query the database using Drizzle ORM
    const workflows = await billPayService.getApprovalWorkflows(userId, {
      status: status || undefined,
      limit,
      offset
    });

    return NextResponse.json({
      workflows: workflows.data,
      total: workflows.total,
      limit,
      offset
    });

  } catch (error) {
    console.error('Failed to fetch approval workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approval workflows' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/approval-workflows:
 *   post:
 *     summary: Create a new approval workflow
 *     description: Creates a new bill approval workflow with configurable steps, thresholds, and conditions
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
 *               - steps
 *             properties:
 *               name:
 *                 type: string
 *                 example: High Value Approval Workflow
 *               description:
 *                 type: string
 *                 example: Multi-step approval for bills over $10,000
 *               amountThreshold:
 *                 type: number
 *                 example: 10000.00
 *                 description: Minimum bill amount to trigger this workflow
 *               vendorCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [supplier, contractor]
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     approverId:
 *                       type: string
 *                     order:
 *                       type: integer
 *                     required:
 *                       type: boolean
 *                 description: Array of approval steps with approvers
 *     responses:
 *       201:
 *         description: Approval workflow created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workflow:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: workflow_123
 *                     name:
 *                       type: string
 *                     steps:
 *                       type: array
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
// POST /api/approval-workflows - Create new workflow
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      amountThreshold,
      vendorCategories,
      steps
    } = body;

    if (!name || !steps || steps.length === 0) {
      return NextResponse.json(
        { error: 'Name and at least one approval step are required' },
        { status: 400 }
      );
    }

    // Create workflow using service (would implement workflow creation)
    const workflow = {
      id: crypto.randomUUID(),
      name,
      description,
      steps: steps.map((step: any, index: number) => ({
        ...step,
        id: crypto.randomUUID(),
        order: index + 1
      })),
      conditions: {
        amountThreshold,
        vendorCategories,
        requiredApprovers: []
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await auditLogger.logEvent({
      userId,
      eventType: AuditEventType.API_ACCESS,
      action: 'workflow_management',
      entityType: 'approval_workflow',
      entityId: workflow.id,
      description: `Approval workflow created: ${name}`,
      riskLevel: RiskLevel.LOW,
      metadata: {
        stepCount: steps.length,
        amountThreshold,
        vendorCategories
      },
      complianceFlags: [ComplianceFramework.SOC2]
    });

    return NextResponse.json({ workflow }, { status: 201 });

  } catch (error) {
    console.error('Failed to create approval workflow:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create workflow' },
      { status: 500 }
    );
  }
}

// GET /api/approvals/pending - Get pending approvals for user
export async function PUT(_request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pending approvals using service method instead of mock data
    const pendingApprovals = await billPayService.getPendingApprovals(userId);

    return NextResponse.json({
      approvals: pendingApprovals
    });

  } catch (error) {
    console.error('Failed to fetch pending approvals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending approvals' },
      { status: 500 }
    );
  }
}

// POST /api/approvals/[id]/decide - Make approval decision
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, decision, comments } = body;

    if (!decision || !['approve', 'reject'].includes(decision)) {
      return NextResponse.json(
        { error: 'Valid decision (approve or reject) is required' },
        { status: 400 }
      );
    }

    // Process approval using service
    const approval = await billPayService.processApproval(userId, id, decision, comments);

    return NextResponse.json({
      success: true,
      approval,
      message: `Bill ${decision === 'approve' ? 'approved' : 'rejected'} successfully`
    });

  } catch (error) {
    console.error('Failed to process approval:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process approval' },
      { status: 500 }
    );
  }
}
