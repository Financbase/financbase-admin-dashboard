/**
 * Approval Workflows API Routes
 * Bill approval workflows and decision management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { billPayService } from '@/lib/services/bill-pay/bill-pay-service';
import { auditLogger } from '@/lib/services/security/audit-logging-service';

// GET /api/approval-workflows - Get approval workflows
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // This would query the database using Drizzle ORM
    const mockWorkflows = [
      {
        id: 'workflow_1',
        name: 'Manager Approval',
        description: 'Standard approval workflow for bills over $1,000',
        steps: [
          {
            id: 'step_1',
            name: 'Manager Review',
            type: 'role',
            role: 'manager',
            order: 1,
            status: 'pending'
          }
        ],
        conditions: {
          amountThreshold: 1000,
          vendorCategories: ['software', 'professional_services'],
          requiredApprovers: []
        },
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'workflow_2',
        name: 'Executive Approval',
        description: 'High-value bill approval requiring executive sign-off',
        steps: [
          {
            id: 'step_1',
            name: 'Manager Review',
            type: 'role',
            role: 'manager',
            order: 1,
            status: 'pending'
          },
          {
            id: 'step_2',
            name: 'Executive Approval',
            type: 'role',
            role: 'executive',
            order: 2,
            status: 'pending'
          }
        ],
        conditions: {
          amountThreshold: 5000,
          vendorCategories: ['all'],
          requiredApprovers: []
        },
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const filteredWorkflows = mockWorkflows.filter(workflow => {
      if (status && workflow.status !== status) return false;
      return true;
    });

    return NextResponse.json({
      workflows: filteredWorkflows.slice(offset, offset + limit),
      total: filteredWorkflows.length,
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

// POST /api/approval-workflows - Create new workflow
export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
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
      eventType: 'approval_workflow_created',
      action: 'workflow_management',
      entityType: 'approval_workflow',
      entityId: workflow.id,
      description: `Approval workflow created: ${name}`,
      riskLevel: 'low',
      metadata: {
        stepCount: steps.length,
        amountThreshold,
        vendorCategories
      },
      complianceFlags: ['soc2']
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
export async function PUT(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pending approvals for current user
    const mockPendingApprovals = [
      {
        id: 'approval_1',
        billId: 'bill_2',
        workflowId: 'workflow_1',
        currentStep: 0,
        status: 'pending',
        initiatedBy: 'user_1',
        initiatedAt: new Date(),
        steps: [
          {
            id: 'step_1',
            name: 'Manager Review',
            type: 'role',
            role: 'manager',
            order: 1,
            status: 'pending'
          }
        ]
      }
    ];

    return NextResponse.json({
      approvals: mockPendingApprovals
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
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { decision, comments } = body;

    if (!decision || !['approve', 'reject'].includes(decision)) {
      return NextResponse.json(
        { error: 'Valid decision (approve or reject) is required' },
        { status: 400 }
      );
    }

    // Process approval using service
    const approval = await billPayService.processApproval(userId, params.id, decision, comments);

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
