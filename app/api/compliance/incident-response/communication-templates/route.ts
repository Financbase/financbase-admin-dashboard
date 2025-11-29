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
import { IncidentResponseService } from '@/lib/services/incident-response-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { db } from '@/lib/db';
import { irCommunicationTemplates } from '@/lib/db/schemas/incident-response.schema';
import { eq, and, desc } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    const {
      name,
      templateType,
      subject,
      body: templateBody,
      placeholders,
      incidentType,
      severity,
      audience,
      tags,
    } = body;

    if (!name || !templateType || !templateBody || !audience) {
      return ApiErrorHandler.badRequest('Missing required fields: name, templateType, body, audience');
    }

    // Insert communication template into database
    const [template] = await db.insert(irCommunicationTemplates).values({
      organizationId: orgId,
      createdBy: userId,
      name,
      templateType,
      subject: subject || null,
      body: templateBody,
      placeholders: placeholders || [],
      incidentType: incidentType || null,
      severity: severity || null,
      audience,
      tags: tags || [],
      isActive: true,
      usageCount: 0,
    }).returning();

    return NextResponse.json({ success: true, data: template, requestId }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating communication template:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const templateType = searchParams.get('templateType') || undefined;
    const incidentType = searchParams.get('incidentType') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const audience = searchParams.get('audience') || undefined;
    const isActive = searchParams.get('isActive');

    // Build where conditions
    const conditions = [eq(irCommunicationTemplates.organizationId, orgId)];
    
    if (templateType) {
      conditions.push(eq(irCommunicationTemplates.templateType, templateType));
    }
    
    if (incidentType) {
      conditions.push(eq(irCommunicationTemplates.incidentType, incidentType as any));
    }
    
    if (severity) {
      conditions.push(eq(irCommunicationTemplates.severity, severity as any));
    }
    
    if (audience) {
      conditions.push(eq(irCommunicationTemplates.audience, audience));
    }
    
    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(irCommunicationTemplates.isActive, isActive === 'true'));
    }

    // Query templates from database
    const templates = await db
      .select()
      .from(irCommunicationTemplates)
      .where(and(...conditions))
      .orderBy(desc(irCommunicationTemplates.createdAt));

    return NextResponse.json({ success: true, data: templates, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching communication templates:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

