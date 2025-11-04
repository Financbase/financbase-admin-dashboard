import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AlertService } from '@/lib/services/alert-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const ruleId = parseInt(id);
    if (isNaN(ruleId)) {
      return ApiErrorHandler.badRequest('Invalid rule ID');
    }

    const alertRules = await AlertService.getAlertRules(userId);
    const rule = alertRules.find(r => r.id === ruleId);

    if (!rule) {
      return ApiErrorHandler.notFound('Alert rule not found');
    }

    return NextResponse.json(rule);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const ruleId = parseInt(id);
    if (isNaN(ruleId)) {
      return ApiErrorHandler.badRequest('Invalid rule ID');
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }
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
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  const { id } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const ruleId = parseInt(id);
    if (isNaN(ruleId)) {
      return ApiErrorHandler.badRequest('Invalid rule ID');
    }

    const deleted = await AlertService.deleteAlertRule(ruleId, userId);
    if (!deleted) {
      return ApiErrorHandler.notFound('Alert rule not found');
    }

    return NextResponse.json({ message: 'Alert rule deleted successfully' });
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
