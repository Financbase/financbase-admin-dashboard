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
    const {
      dataType,
      dataCategory,
      dataLocation,
      dataSource,
      dataFormat,
      dataSample,
      description,
      tags,
      metadata,
    } = body;

    if (!dataType || !dataCategory || !dataLocation) {
      return ApiErrorHandler.badRequest('Missing required fields: dataType, dataCategory, dataLocation');
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

    return NextResponse.json({ success: true, data: classification, requestId }, { status: 201 });
  } catch (error: any) {
    logger.error('Error classifying data:', error);
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
    const dataType = searchParams.get('dataType') || undefined;
    const dataCategory = searchParams.get('dataCategory') || undefined;
    const classificationLevel = searchParams.get('classificationLevel') || undefined;
    const containsPII = searchParams.get('containsPII') === 'true' ? true : searchParams.get('containsPII') === 'false' ? false : undefined;
    const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (searchParams.get('report') === 'true') {
      // Generate classification report
      const report = await DataClassificationService.generateClassificationReport(orgId);
      return NextResponse.json({ success: true, data: report, requestId }, { status: 200 });
    }

    const classifications = await DataClassificationService.getDataClassifications(orgId, {
      dataType,
      dataCategory,
      classificationLevel,
      containsPII,
      isActive,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: classifications, requestId }, { status: 200 });
  } catch (error: any) {
    logger.error('Error fetching data classifications:', error);
    return ApiErrorHandler.handle(error, requestId);
  }
}

