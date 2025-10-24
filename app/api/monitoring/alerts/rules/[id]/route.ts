import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AlertService } from '@/lib/services/alert-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ruleId = parseInt(params.id);
    if (isNaN(ruleId)) {
      return NextResponse.json({ error: 'Invalid rule ID' }, { status: 400 });
    }

    const alertRules = await AlertService.getAlertRules(userId);
    const rule = alertRules.find(r => r.id === ruleId);

    if (!rule) {
      return NextResponse.json({ error: 'Alert rule not found' }, { status: 404 });
    }

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Error fetching alert rule:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch alert rule',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ruleId = parseInt(params.id);
    if (isNaN(ruleId)) {
      return NextResponse.json({ error: 'Invalid rule ID' }, { status: 400 });
    }

    const body = await request.json();
    const updates = {};

    // Only update provided fields
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.metricName !== undefined) updates.metricName = body.metricName;
    if (body.condition !== undefined) updates.condition = body.condition;
    if (body.threshold !== undefined) updates.threshold = body.threshold;
    if (body.severity !== undefined) updates.severity = body.severity;
    if (body.channels !== undefined) updates.channels = body.channels;
    if (body.cooldownPeriod !== undefined) updates.cooldownPeriod = body.cooldownPeriod;
    if (body.maxAlertsPerHour !== undefined) updates.maxAlertsPerHour = body.maxAlertsPerHour;
    if (body.isActive !== undefined) updates.isActive = body.isActive;
    if (body.labels !== undefined) updates.labels = body.labels;
    if (body.filters !== undefined) updates.filters = body.filters;

    const updatedRule = await AlertService.updateAlertRule(ruleId, userId, updates);
    return NextResponse.json(updatedRule);
  } catch (error) {
    console.error('Error updating alert rule:', error);
    return NextResponse.json({ 
      error: 'Failed to update alert rule',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ruleId = parseInt(params.id);
    if (isNaN(ruleId)) {
      return NextResponse.json({ error: 'Invalid rule ID' }, { status: 400 });
    }

    const deleted = await AlertService.deleteAlertRule(ruleId, userId);
    if (!deleted) {
      return NextResponse.json({ error: 'Alert rule not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Alert rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert rule:', error);
    return NextResponse.json({ 
      error: 'Failed to delete alert rule',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
