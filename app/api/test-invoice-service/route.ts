/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test if we can import the InvoiceService
    const { InvoiceService } = await import('@/lib/services/invoice-service');
    return NextResponse.json({ 
      message: 'InvoiceService imported successfully',
      service: typeof InvoiceService
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to import InvoiceService',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
