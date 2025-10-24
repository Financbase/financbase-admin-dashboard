/**
 * Vendors API Routes
 * Vendor management, payment preferences, and approval settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { billPayService } from '@/lib/services/bill-pay/bill-pay-service';

// GET /api/vendors - Get user's vendors
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    console.error('Failed to fetch vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

// POST /api/vendors - Create new vendor
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
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
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
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
    console.error('Failed to create vendor:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create vendor' },
      { status: 500 }
    );
  }
}
