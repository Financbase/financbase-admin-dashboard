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
import { DataClassificationService } from '@/lib/services/data-classification-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return ApiErrorHandler.unauthorized();
    }

    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return ApiErrorHandler.badRequest('items must be a non-empty array');
    }

    if (items.length > 100) {
      return ApiErrorHandler.badRequest('Maximum 100 items allowed per bulk request');
    }

    const results = [];
    const errors = [];

    for (const item of items) {
      try {
        const { dataType, dataCategory, dataLocation, dataSource, dataFormat, dataSample, description, tags, metadata } = item;

        if (!dataType || !dataCategory || !dataLocation) {
          errors.push({
            item,
            error: 'Missing required fields: dataType, dataCategory, dataLocation',
          });
          continue;
        }

        const classification = await DataClassificationService.classifyData(orgId, {
          classifiedBy: userId,
          dataType,
          dataCategory,
          dataLocation,
          dataSource,
          dataFormat,
          dataSample,
          description,
          tags,
          metadata,
        });

        results.push(classification);
      } catch (error: any) {
        errors.push({
          item,
          error: error.message || 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processed: results.length,
        failed: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
      },
      requestId,
    }, { status: 200 });
  } catch (error: any) {
    logger.error('Error performing bulk classification:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

