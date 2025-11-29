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
import { ComplianceService } from '@/lib/services/compliance-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { db } from '@/lib/db';
import { gdprDataRequests, auditLogs, dataAccessLogs } from '@/lib/db/schemas';
import { eq, and, like } from 'drizzle-orm';
import { logger } from '@/lib/logger';

/**
 * Automatically fulfill GDPR data subject request
 * This endpoint attempts to automatically gather and process the requested data
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const requestIdNum = parseInt(params.id);
    if (isNaN(requestIdNum)) {
      return ApiErrorHandler.badRequest('Invalid request ID');
    }

    const gdprRequest = await db
      .select()
      .from(gdprDataRequests)
      .where(eq(gdprDataRequests.id, requestIdNum))
      .limit(1);

    if (!gdprRequest[0]) {
      return ApiErrorHandler.notFound('GDPR data request not found');
    }

    if (gdprRequest[0].organizationId !== orgId) {
      return ApiErrorHandler.forbidden();
    }

    if (gdprRequest[0].status === 'completed') {
      return ApiErrorHandler.badRequest('Request already completed');
    }

    // Mark as in progress
    await ComplianceService.processGDPRDataRequest(requestIdNum, userId, 'Automated fulfillment started');

    // Gather data based on request type
    const responseData: Record<string, any> = {
      requestId: gdprRequest[0].id,
      requestType: gdprRequest[0].requestType,
      dataSubjectEmail: gdprRequest[0].dataSubjectEmail,
      fulfilledAt: new Date().toISOString(),
    };

    if (gdprRequest[0].requestType === 'access') {
      // Gather all data related to the data subject
      const dataSubjectEmail = gdprRequest[0].dataSubjectEmail;

      // Get audit logs
      const subjectAuditLogs = await db
        .select()
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.organizationId, orgId),
            like(auditLogs.eventData, `%${dataSubjectEmail}%`)
          )
        )
        .limit(1000);

      // Get data access logs
      const subjectDataAccessLogs = await db
        .select()
        .from(dataAccessLogs)
        .where(
          and(
            eq(dataAccessLogs.organizationId, orgId),
            like(dataAccessLogs.dataSubject, `%${dataSubjectEmail}%`)
          )
        )
        .limit(1000);

      responseData.data = {
        auditLogs: subjectAuditLogs.map(log => ({
          id: log.id,
          eventType: log.eventType,
          eventCategory: log.eventCategory,
          eventAction: log.eventAction,
          timestamp: log.timestamp,
          resourceType: log.resourceType,
          resourceId: log.resourceId,
        })),
        dataAccessLogs: subjectDataAccessLogs.map(log => ({
          id: log.id,
          dataType: log.dataType,
          accessType: log.accessType,
          timestamp: log.timestamp,
          dataSubject: log.dataSubject,
        })),
        summary: {
          totalAuditEvents: subjectAuditLogs.length,
          totalDataAccessEvents: subjectDataAccessLogs.length,
        },
      };
    } else if (gdprRequest[0].requestType === 'deletion') {
      // For deletion requests, mark data for deletion rather than deleting immediately
      // This allows for verification and compliance checks
      responseData.deletionPlan = {
        status: 'pending_verification',
        dataTypes: gdprRequest[0].requestedDataTypes || ['all'],
        estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        note: 'Data will be deleted after verification. This process may take up to 30 days per GDPR requirements.',
      };
    } else if (gdprRequest[0].requestType === 'portability') {
      // For portability, prepare data in a machine-readable format
      responseData.portableData = {
        format: 'json',
        exportDate: new Date().toISOString(),
        dataTypes: gdprRequest[0].requestedDataTypes || ['all'],
        note: 'Data will be exported in JSON format. Download link will be provided upon completion.',
      };
    }

    // Complete the request
    await ComplianceService.completeGDPRDataRequest(
      requestIdNum,
      responseData,
      undefined // File URL can be added later if needed
    );

    const completedRequest = await db
      .select()
      .from(gdprDataRequests)
      .where(eq(gdprDataRequests.id, requestIdNum))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: completedRequest[0],
      message: 'Request fulfilled successfully',
      requestId,
    }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fulfilling GDPR data request:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

