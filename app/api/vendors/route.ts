/**
 * Vendors API Routes
 * Vendor management, payment preferences, and approval settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { billPayService } from '@/lib/services/bill-pay/bill-pay-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

// GET /api/vendors - Get user's vendors
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Use real service method instead of mock data
    const vendors = await billPayService.getVendors(userId, {
      status: status || undefined,
      category: category || undefined,
      limit,
      offset
    });

    return NextResponse.json({
      vendors: vendors.data,
      total: vendors.total,
      limit,
      offset
    });

  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}

// POST /api/vendors - Create new vendor
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return ApiErrorHandler.badRequest('Invalid JSON in request body');
    }
    const {
      name,
      email,
      phone,
      address,
      taxId,
      paymentTerms,
      category,
      paymentMethods,
      autoPay,
      approvalRequired,
      approvalThreshold
    } = body;

    if (!name || !email) {
      return ApiErrorHandler.badRequest('Name and email are required');
    }

    // Create vendor using service
    const vendor = await billPayService.addVendor(userId, {
      name,
      email,
      phone,
      address,
      taxId,
      paymentTerms,
      category,
      paymentMethods,
      autoPay,
      approvalRequired,
      approvalThreshold
    });

    return NextResponse.json({ vendor }, { status: 201 });

  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
