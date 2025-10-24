/**
 * Document Processing API Route
 * OCR and AI-powered document processing for bills, invoices, and receipts
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { billPayService } from '@/lib/services/bill-pay/bill-pay-service';
import { auditLogger, AuditEventType, RiskLevel, ComplianceFramework } from '@/lib/services/security/audit-logging-service';

// POST /api/bills/process - Process uploaded document
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string || 'auto';
    const vendorId = formData.get('vendorId') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as string || 'medium';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPG, PNG, GIF, WebP, or PDF files.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Process document with AI
    const result = await billPayService.processDocument(userId, file, documentType as any);

    // Log document processing
    await auditLogger.logEvent({
      userId,
      eventType: AuditEventType.AI_CATEGORIZATION,
      action: 'document_processing',
      entityType: 'bill',
      entityId: result.id,
      description: `Document processed: ${documentType} with ${Math.round(result.confidence * 100)}% confidence`,
      riskLevel: RiskLevel.LOW,
      metadata: {
        documentType,
        confidence: result.confidence,
        fileName: file.name,
        fileSize: file.size,
        processingTime: result.processingTime
      },
      complianceFlags: [ComplianceFramework.SOC2]
    });

    return NextResponse.json({
      success: true,
      result,
      message: `Document processed successfully with ${Math.round(result.confidence * 100)}% confidence`
    });

  } catch (error) {
    console.error('Document processing failed:', error);

    await auditLogger.logEvent({
      userId: 'unknown', // Will be set from auth if available
      eventType: AuditEventType.SECURITY_VIOLATION,
      action: 'document_processing',
      entityType: 'system',
      description: `Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      riskLevel: RiskLevel.MEDIUM,
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      complianceFlags: [ComplianceFramework.SOC2]
    });

    return NextResponse.json(
      { error: 'Document processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/bills/process/status/[id] - Get processing status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This would check processing status in database
    // For now, return mock status
    return NextResponse.json({
      status: 'completed',
      progress: 100,
      result: {
        id: id,
        confidence: 0.95,
        extractedData: {
          vendor: 'Sample Vendor',
          amount: 1250.00,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          description: 'Sample invoice processing'
        }
      }
    });

  } catch (error) {
    console.error('Failed to get processing status:', error);
    return NextResponse.json(
      { error: 'Failed to get processing status' },
      { status: 500 }
    );
  }
}
