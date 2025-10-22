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
      details: error.message 
    }, { status: 500 });
  }
}
