import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AlertService } from '@/lib/services/alert-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    const alertRules = await AlertService.getAlertRules(userId, organizationId || undefined);
    return NextResponse.json(alertRules);
  } catch (error) {
    console.error('Error fetching alert rules:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch alert rules',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

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
      metricName, 
      condition, 
      threshold, 
      severity, 
      channels, 
      cooldownPeriod, 
      maxAlertsPerHour,
      organizationId,
      labels,
      filters
    } = body;

    if (!name || !metricName || !condition || !threshold || !severity) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, metricName, condition, threshold, severity' 
      }, { status: 400 });
    }

    const alertRule = await AlertService.createAlertRule(userId, organizationId, {
      name,
      description: description || '',
      metricName,
      condition,
      threshold,
      severity,
      channels: channels || ['email'],
      cooldownPeriod: cooldownPeriod || 3600,
      maxAlertsPerHour: maxAlertsPerHour || 10,
      labels: labels || {},
      filters: filters || {},
    });

    return NextResponse.json(alertRule, { status: 201 });
  } catch (error) {
    console.error('Error creating alert rule:', error);
    return NextResponse.json({ 
      error: 'Failed to create alert rule',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
