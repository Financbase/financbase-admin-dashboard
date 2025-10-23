/**
 * Vendors API Routes
 * Vendor management, payment preferences, and approval settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { billPayService } from '@/lib/services/bill-pay/bill-pay-service';
import { auditLogger } from '@/lib/services/security/audit-logging-service';

// GET /api/vendors - Get user's vendors
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // This would query the database using Drizzle ORM
    const mockVendors = [
      {
        id: 'vendor_1',
        name: 'Office Supplies Co',
        email: 'billing@officesupplies.com',
        phone: '+1-555-0123',
        address: {
          street: '123 Business Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US'
        },
        taxId: '12-3456789',
        paymentTerms: 30,
        category: 'office_supplies',
        paymentMethods: [
          {
            id: 'pm_1',
            type: 'bank_account',
            details: {
              accountNumber: '****1234',
              routingNumber: '****5678',
              bankName: 'Chase Bank'
            },
            isDefault: true,
            status: 'active'
          }
        ],
        autoPay: false,
        approvalRequired: true,
        approvalThreshold: 1000,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'vendor_2',
        name: 'Software Solutions Inc',
        email: 'accounts@softwaresolutions.com',
        paymentTerms: 15,
        category: 'software',
        paymentMethods: [
          {
            id: 'pm_2',
            type: 'stripe',
            details: {
              stripeAccountId: 'acct_123456789'
            },
            isDefault: true,
            status: 'active'
          }
        ],
        autoPay: true,
        approvalRequired: false,
        approvalThreshold: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const filteredVendors = mockVendors.filter(vendor => {
      if (status && vendor.status !== status) return false;
      if (category && vendor.category !== category) return false;
      return true;
    });

    return NextResponse.json({
      vendors: filteredVendors.slice(offset, offset + limit),
      total: filteredVendors.length,
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
    const { userId } = getAuth(request);
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
      approvalThreshold,
      status: 'pending'
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
