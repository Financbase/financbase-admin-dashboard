/**
 * Approval Workflows API Routes
 * Bill approval workflows and decision management
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { billPayService } from '@/lib/services/bill-pay/bill-pay-service';
import { auditLogger, AuditEventType, RiskLevel, ComplianceFramework } from '@/lib/services/security/audit-logging-service';

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
