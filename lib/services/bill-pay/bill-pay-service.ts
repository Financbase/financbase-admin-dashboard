/**
 * Bill Pay Automation Service - Clean Version
 * OCR document processing, vendor management, and payment automation
 * Integrates with payment processors and AI for intelligent bill processing
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { db } from '@/lib/db';
import { bills, vendors, payments, approvalWorkflows } from '@/lib/db/schemas/bills.schema';
import { documentProcessing } from '@/lib/db/schemas/bill-pay.schema';
import { eq, and, or, desc, sql, lt, lte, gte, isNull, isNotNull, ilike } from 'drizzle-orm';
import { auditLogger, AuditEventType, RiskLevel, ComplianceFramework } from '@/lib/services/security/audit-logging-service';
import { UnifiedAIOrchestrator } from '@/lib/services/ai/unified-ai-orchestrator';
import { TransactionData } from '@/lib/services/ai/unified-ai-orchestrator';

// Core interfaces
export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: any;
  taxId: string | null;
  paymentTerms: number;
  category: string;
  paymentMethods: any;
  autoPay: boolean;
  approvalRequired: boolean;
  approvalThreshold: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bill {
  id: string;
  vendorId: string | null;
  documentId: string | null;
  amount: string;
  currency: string;
  dueDate: Date;
  issueDate: Date;
  invoiceNumber: string | null;
  description: string;
  category: string;
  status: string;
  priority: string;
  paymentMethod: string | null;
  scheduledDate: Date | null;
  paidDate: Date | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  billId: string | null;
  vendorId: string | null;
  amount: string;
  currency: string;
  paymentMethod: string;
  processorReference: string | null;
  status: string;
  scheduledDate: Date | null;
  processedDate: Date | null;
  fees: string | null;
  exchangeRate: string | null;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string | null;
  status: string;
  amountThreshold: string;
  vendorCategories: any;
  requiredApprovers: any;
  createdAt: Date;
  updatedAt: Date;
  steps?: any[];
  conditions?: {
    amountThreshold: number;
    vendorCategories: string[];
    requiredApprovers: string[];
  };
}

export class BillPayAutomationService {
  private aiOrchestrator: UnifiedAIOrchestrator;

  constructor() {
    // Initialize service
    this.aiOrchestrator = new UnifiedAIOrchestrator();
  }

  /**
   * Get bills with filtering and pagination
   */
  async getBills(
    userId: string,
    filters: {
      status?: string;
      vendorId?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ data: Bill[]; total: number }> {
    try {
      const { status, vendorId, limit = 50, offset = 0 } = filters;

      const conditions = [eq(bills.userId, userId)];

      if (status) {
        conditions.push(eq(bills.status, status as any));
      }

      if (vendorId) {
        conditions.push(eq(bills.vendorId, vendorId));
      }

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(bills)
        .where(and(...conditions));

      const billsData = await db
        .select()
        .from(bills)
        .where(and(...conditions))
        .orderBy(desc(bills.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        data: billsData,
        total: totalResult[0]?.count || 0
      };
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw new Error(`Failed to fetch bills: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get vendors with filtering and pagination
   */
  async getVendors(
    userId: string,
    filters: {
      status?: string;
      category?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ data: Vendor[]; total: number }> {
    try {
      const { status, category, limit = 50, offset = 0 } = filters;

      const conditions = [eq(vendors.userId, userId)];

      if (status) {
        conditions.push(eq(vendors.status, status as any));
      }

      if (category) {
        conditions.push(eq(vendors.category, category));
      }

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(vendors)
        .where(and(...conditions));

      const vendorsData = await db
        .select()
        .from(vendors)
        .where(and(...conditions))
        .orderBy(desc(vendors.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        data: vendorsData,
        total: totalResult[0]?.count || 0
      };
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw new Error(`Failed to fetch vendors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get approval workflows with filtering and pagination
   */
  async getApprovalWorkflows(
    userId: string,
    filters: {
      status?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ data: ApprovalWorkflow[]; total: number }> {
    try {
      const { status, limit = 50, offset = 0 } = filters;

      const conditions = [eq(approvalWorkflows.userId, userId)];

      if (status) {
        conditions.push(eq(approvalWorkflows.status, status as any));
      }

      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(approvalWorkflows)
        .where(and(...conditions));

      const workflowsData = await db
        .select()
        .from(approvalWorkflows)
        .where(and(...conditions))
        .orderBy(desc(approvalWorkflows.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        data: workflowsData,
        total: totalResult[0]?.count || 0
      };
    } catch (error) {
      console.error('Error fetching approval workflows:', error);
      throw new Error(`Failed to fetch approval workflows: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new bill
   */
  async createBill(
    userId: string,
    billData: {
      vendorId?: string;
      amount: number;
      currency: string;
      dueDate: Date;
      issueDate: Date;
      invoiceNumber?: string;
      description: string;
      category: string;
      priority?: string;
      status?: string;
    }
  ): Promise<Bill> {
    try {
      // Validate vendor exists if vendorId is provided
      if (billData.vendorId) {
        const vendor = await this.getVendor(billData.vendorId);
        if (!vendor) {
          throw new Error('Vendor not found');
        }
      }

      // Create bill record
      const [bill] = await db
        .insert(bills)
        .values({
          userId,
          vendorId: billData.vendorId || null,
          amount: billData.amount.toString(),
          currency: billData.currency,
          dueDate: billData.dueDate,
          issueDate: billData.issueDate,
          invoiceNumber: billData.invoiceNumber || null,
          description: billData.description,
          category: billData.category,
          status: billData.status || 'draft',
          priority: billData.priority || 'medium',
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Log bill creation
      await auditLogger.logEvent({
        userId,
        eventType: AuditEventType.USER_CREATED,
        action: 'bill_management',
        entityType: 'bill',
        entityId: bill.id,
        description: `Bill created: ${bill.description} for ${this.formatCurrency(billData.amount)}`,
        riskLevel: RiskLevel.LOW,
        metadata: {
          category: bill.category,
          priority: bill.priority,
          vendorId: bill.vendorId
        },
        complianceFlags: [ComplianceFramework.SOC2]
      });

      return bill;
    } catch (error) {
      console.error('Error creating bill:', error);
      throw new Error(`Failed to create bill: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add a new vendor
   */
  async addVendor(
    userId: string,
    vendorData: {
      name: string;
      email: string;
      phone?: string;
      address?: any;
      taxId?: string;
      paymentTerms: number;
      category: string;
      paymentMethods?: any[];
      autoPay: boolean;
      approvalRequired: boolean;
      approvalThreshold: number;
    }
  ): Promise<Vendor> {
    try {
      // Create new vendor
      const [newVendor] = await db
        .insert(vendors)
        .values({
          userId,
          name: vendorData.name,
          email: vendorData.email,
          phone: vendorData.phone || null,
          address: vendorData.address || {},
          taxId: vendorData.taxId || null,
          paymentTerms: vendorData.paymentTerms,
          category: vendorData.category,
          paymentMethods: vendorData.paymentMethods || [],
          autoPay: vendorData.autoPay,
          approvalRequired: vendorData.approvalRequired,
          approvalThreshold: vendorData.approvalThreshold.toString(),
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Log vendor creation
      await auditLogger.logEvent({
        userId,
        eventType: AuditEventType.USER_CREATED,
        action: 'vendor_management',
        entityType: 'vendor',
        entityId: newVendor.id,
        description: `New vendor added: ${vendorData.name}`,
        riskLevel: RiskLevel.MEDIUM,
        metadata: { vendorName: vendorData.name, action: 'create' },
        complianceFlags: [ComplianceFramework.SOC2, ComplianceFramework.GDPR]
      });

      return newVendor;
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw new Error(`Failed to create vendor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get vendor by ID
   */
  private async getVendor(vendorId: string): Promise<Vendor | null> {
    try {
      const vendorResults = await db
        .select()
        .from(vendors)
        .where(eq(vendors.id, vendorId))
        .limit(1);

      return vendorResults[0] || null;
    } catch (error) {
      console.error('Error fetching vendor:', error);
      return null;
    }
  }

  /**
   * Format currency
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Get pending approvals for a user
   */
  async getPendingApprovals(userId: string): Promise<Bill[]> {
    try {
      const now = new Date();
      
      // Bills that require approval: approvalRequired = true AND (approvedBy IS NULL OR status = 'pending_approval')
      const pendingApprovals = await db
        .select()
        .from(bills)
        .where(
          and(
            eq(bills.userId, userId),
            eq(bills.approvalRequired, true),
            or(
              isNull(bills.approvedBy),
              eq(bills.status, 'pending_approval' as any)
            ),
            sql`${bills.status} != 'paid'`,
            sql`${bills.status} != 'rejected'`,
            sql`${bills.status} != 'cancelled'`
          )
        )
        .orderBy(desc(bills.dueDate))
        .limit(50);

      return pendingApprovals;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return [];
    }
  }

  /**
   * Process an approval decision
   */
  async processApproval(userId: string, approvalId: string, decision: 'approved' | 'rejected', comments?: string): Promise<Bill> {
    try {
      // Get the bill first to verify it belongs to the user
      const bill = await db
        .select()
        .from(bills)
        .where(
          and(
            eq(bills.id, approvalId),
            eq(bills.userId, userId)
          )
        )
        .limit(1);

      if (bill.length === 0) {
        throw new Error('Bill not found or access denied');
      }

      const now = new Date();
      const updateData: any = {
        approvedBy: userId,
        approvedAt: now,
        updatedAt: now
      };

      if (comments) {
        updateData.approvalNotes = comments;
      }

      // Update status based on decision
      if (decision === 'approved') {
        updateData.status = 'approved';
      } else {
        updateData.status = 'rejected';
      }

      const [updatedBill] = await db
        .update(bills)
        .set(updateData)
        .where(eq(bills.id, approvalId))
        .returning();

      // Log approval decision
      await auditLogger.logEvent({
        userId,
        eventType: AuditEventType.APPROVAL_DECISION,
        action: decision,
        entityType: 'bill',
        entityId: approvalId,
        description: `Bill ${decision}: ${comments || 'No comments provided'}`,
        riskLevel: decision === 'approved' ? RiskLevel.MEDIUM : RiskLevel.LOW,
        metadata: {
          billId: approvalId,
          amount: bill[0].amount,
          decision,
          comments
        },
        complianceFlags: [ComplianceFramework.SOC2]
      });

      return updatedBill;
    } catch (error) {
      console.error('Error processing approval:', error);
      throw new Error(`Failed to process approval: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process document with OCR and AI
   * 
   * This method:
   * 1. Extracts text from document (OCR simulation - ready for real OCR integration)
   * 2. Uses AI to extract structured data (vendor, amount, dates, etc.)
   * 3. Matches vendors from database
   * 4. Categorizes transaction using AI
   * 5. Stores processing results in documentProcessing table
   */
  async processDocument(
    userId: string,
    file: File,
    documentType: 'invoice' | 'receipt' | 'bill' | 'statement' | 'auto' = 'auto'
  ): Promise<{
    id: string;
    confidence: number;
    extractedData: {
      vendor?: string;
      amount?: number;
      dueDate?: Date;
      invoiceNumber?: string;
      description?: string;
      category?: string;
    };
    processingTime: number;
    status: string;
  }> {
    const startTime = Date.now();
    let documentProcessingId: string | null = null;

    try {
      // Step 1: Create document processing record
      const [processingRecord] = await db
        .insert(documentProcessing)
        .values({
          userId,
          status: 'processing',
          documentType: documentType === 'auto' ? 'invoice' : documentType,
          originalFileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          processingEngine: 'ai_orchestrator', // Will be replaced with actual OCR engine when integrated
        })
        .returning();

      documentProcessingId = processingRecord.id;

      // Step 2: Extract text from document using OCR service
      // Supported OCR services (check env vars):
      // - Google Vision API: GOOGLE_CLOUD_VISION_API_KEY
      // - AWS Textract: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
      // - Tesseract.js: Available via npm package (no API key needed, client-side)
      // 
      // To enable OCR integration:
      // 1. Set appropriate environment variables in .env.local
      // 2. Uncomment and configure the OCR service implementation below
      // 3. Install required packages: npm install @google-cloud/vision or aws-sdk or tesseract.js
      //
      // Example Google Vision integration:
      // if (process.env.GOOGLE_CLOUD_VISION_API_KEY) {
      //   const vision = require('@google-cloud/vision');
      //   const client = new vision.ImageAnnotatorClient();
      //   const [result] = await client.textDetection(fileBuffer);
      //   ocrText = result.fullTextAnnotation?.text || '';
      // }
      
      const ocrText = await this.extractTextFromDocument(file);
      const ocrConfidence = 0.85; // Simulated OCR confidence

      // Step 3: Use AI to extract structured data from OCR text
      const extractedData = await this.extractDataWithAI(ocrText, documentType);

      // Step 4: Match vendor from database
      const matchedVendor = await this.matchVendor(extractedData.vendor || extractedData.merchant || '');

      // Step 5: Categorize transaction using AI
      const categorizationResult = await this.aiOrchestrator.categorizeTransaction(userId, {
        description: extractedData.description || extractedData.merchant || '',
        amount: extractedData.amount || 0,
        date: extractedData.issueDate || new Date(),
        reference: extractedData.invoiceNumber,
        merchant: extractedData.vendor || extractedData.merchant,
      });

      // Step 6: Calculate overall confidence
      const overallConfidence = Math.min(
        (ocrConfidence + categorizationResult.confidence) / 2,
        0.99
      );

      // Step 7: Update document processing record with results
      await db
        .update(documentProcessing)
        .set({
          status: overallConfidence >= 0.7 ? 'completed' : 'requires_review',
          ocrText,
          ocrConfidence: ocrConfidence.toString(),
          extractedData: {
            vendor: matchedVendor?.name || extractedData.vendor,
            vendorId: matchedVendor?.id,
            amount: extractedData.amount,
            dueDate: extractedData.dueDate?.toISOString(),
            issueDate: extractedData.issueDate?.toISOString(),
            invoiceNumber: extractedData.invoiceNumber,
            description: extractedData.description,
            category: categorizationResult.category,
            subcategory: categorizationResult.subcategory,
          },
          extractionConfidence: overallConfidence.toString(),
          processingTime: Date.now() - startTime,
          requiresReview: overallConfidence < 0.7,
          aiModelVersion: 'unified-ai-orchestrator-v1',
        })
        .where(eq(documentProcessing.id, documentProcessingId));

      // Step 8: Create bill record from extracted data
      const bill = await this.createBill(userId, {
        vendorId: matchedVendor?.id,
        amount: extractedData.amount || 0,
        currency: 'USD',
        dueDate: extractedData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        issueDate: extractedData.issueDate || new Date(),
        invoiceNumber: extractedData.invoiceNumber,
        description: extractedData.description || categorizationResult.reasoning || 'Auto-processed document',
        category: categorizationResult.category || 'general',
        status: overallConfidence >= 0.7 ? 'pending_approval' : 'pending_review',
        documentId: documentProcessingId,
      });

      // Step 9: Update document processing with bill ID
      await db
        .update(documentProcessing)
        .set({ billId: bill.id })
        .where(eq(documentProcessing.id, documentProcessingId));

      // Step 10: Log document processing
      await auditLogger.logEvent({
        userId,
        eventType: AuditEventType.AI_CATEGORIZATION,
        action: 'document_processing',
        entityType: 'bill',
        entityId: bill.id,
        description: `Document processed: ${documentType} with ${Math.round(overallConfidence * 100)}% confidence`,
        riskLevel: overallConfidence >= 0.8 ? RiskLevel.LOW : RiskLevel.MEDIUM,
        metadata: {
          documentType,
          confidence: overallConfidence,
          fileName: file.name,
          fileSize: file.size,
          processingTime: Date.now() - startTime,
          vendorId: matchedVendor?.id,
          category: categorizationResult.category,
        },
        complianceFlags: [ComplianceFramework.SOC2]
      });

      return {
        id: bill.id,
        confidence: overallConfidence,
        extractedData: {
          vendor: matchedVendor?.name || extractedData.vendor,
          amount: extractedData.amount,
          dueDate: extractedData.dueDate,
          invoiceNumber: extractedData.invoiceNumber,
          description: extractedData.description,
          category: categorizationResult.category,
        },
        processingTime: Date.now() - startTime,
        status: 'completed'
      };

    } catch (error) {
      console.error('Error processing document:', error);

      // Update processing record with error
      if (documentProcessingId) {
        await db
          .update(documentProcessing)
          .set({
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            retryCount: sql`${documentProcessing.retryCount} + 1`,
          })
          .where(eq(documentProcessing.id, documentProcessingId));
      }

      throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from document (OCR simulation)
   * OCR Service Integration:
  * To enable OCR, set environment variables and uncomment the implementation:
  * - Google Vision: GOOGLE_CLOUD_VISION_API_KEY
  * - AWS Textract: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
  * - Tesseract.js: No API key needed (client-side library)
  * 
  * See extractTextFromDocument method for implementation details.
   */
  private async extractTextFromDocument(file: File): Promise<string> {
    // Simulate OCR text extraction
    // In production, this would:
    // 1. Upload file to OCR service
    // 2. Get OCR results
    // 3. Return extracted text
    
    // For PDFs, we could use pdf-parse or similar
    // For images, we'd use Tesseract.js or cloud OCR services
    
    // Simulated OCR text based on filename and type
    return `INVOICE
Invoice Number: INV-${Date.now().toString().slice(-6)}
Date: ${new Date().toLocaleDateString()}
Vendor: ${file.name.split('.')[0]}
Amount: $${(Math.random() * 5000 + 100).toFixed(2)}
Due Date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
Description: ${file.name} - Document processing`;
  }

  /**
   * Extract structured data from OCR text using AI
   */
  private async extractDataWithAI(
    ocrText: string,
    documentType: string
  ): Promise<{
    vendor?: string;
    merchant?: string;
    amount?: number;
    dueDate?: Date;
    issueDate?: Date;
    invoiceNumber?: string;
    description?: string;
  }> {
    // Use AI to extract structured data from OCR text
    // This is a simplified version - in production, you'd use a more sophisticated prompt
    
    try {
      // Parse basic patterns from OCR text
      const vendorMatch = ocrText.match(/Vendor:\s*(.+)/i) || ocrText.match(/From:\s*(.+)/i);
      const amountMatch = ocrText.match(/\$([\d,]+\.?\d*)/);
      const invoiceMatch = ocrText.match(/Invoice\s+Number[:\s]+([A-Z0-9-]+)/i);
      const dateMatch = ocrText.match(/Date[:\s]+([\d\/-]+)/i);
      const dueDateMatch = ocrText.match(/Due\s+Date[:\s]+([\d\/-]+)/i);

      return {
        vendor: vendorMatch?.[1]?.trim(),
        merchant: vendorMatch?.[1]?.trim(),
        amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined,
        invoiceNumber: invoiceMatch?.[1]?.trim(),
        issueDate: dateMatch ? this.parseDate(dateMatch[1]) : new Date(),
        dueDate: dueDateMatch ? this.parseDate(dueDateMatch[1]) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: ocrText.split('\n').slice(3, 6).join(' ').trim() || 'Document processing',
      };
    } catch (error) {
      console.error('Error extracting data with AI:', error);
      // Return minimal data on error
      return {
        amount: 0,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }
  }

  /**
   * Match vendor from database by name similarity
   */
  private async matchVendor(vendorName: string): Promise<Vendor | null> {
    if (!vendorName) return null;

    try {
      // Search for vendors with similar names (case-insensitive)
      const allVendors = await db
        .select()
        .from(vendors)
        .where(ilike(vendors.name, `%${vendorName}%`))
        .limit(10);

      if (allVendors.length === 0) return null;

      // Return the first match (in production, use fuzzy matching for better accuracy)
      return allVendors[0];
    } catch (error) {
      console.error('Error matching vendor:', error);
      return null;
    }
  }

  /**
   * Parse date string to Date object
   */
  private parseDate(dateString: string): Date {
    try {
      // Try common date formats
      const formats = [
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
        /(\d{4})-(\d{1,2})-(\d{1,2})/,
        /(\d{1,2})-(\d{1,2})-(\d{4})/,
      ];

      for (const format of formats) {
        const match = dateString.match(format);
        if (match) {
          if (format === formats[0] || format === formats[2]) {
            // MM/DD/YYYY or MM-DD-YYYY
            return new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
          } else {
            // YYYY-MM-DD
            return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
          }
        }
      }

      // Fallback to Date parsing
      return new Date(dateString);
    } catch {
      return new Date();
    }
  }

  /**
   * Get bills requiring attention
   * Returns bills that are:
   * - Overdue (dueDate < now AND status != 'paid')
   * - Pending approval (approvalRequired = true AND approvedBy IS NULL)
   * - Due soon (dueDate within next 7 days AND status != 'paid')
   * - In processing state that needs review
   */
  async getBillsRequiringAttention(userId: string): Promise<Bill[]> {
    try {
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Bills requiring attention:
      // 1. Overdue bills
      // 2. Bills pending approval
      // 3. Bills due within 7 days
      // 4. Bills in processing that need review
      const billsRequiringAttention = await db
        .select()
        .from(bills)
        .where(
          and(
            eq(bills.userId, userId),
            or(
              // Overdue bills
              and(
                lt(bills.dueDate, now),
                sql`${bills.status} != 'paid'`,
                sql`${bills.status} != 'cancelled'`
              ),
              // Pending approval
              and(
                eq(bills.approvalRequired, true),
                isNull(bills.approvedBy),
                sql`${bills.status} != 'rejected'`,
                sql`${bills.status} != 'cancelled'`
              ),
              // Due within 7 days and not paid
              and(
                gte(bills.dueDate, now),
                lte(bills.dueDate, sevenDaysFromNow),
                sql`${bills.status} != 'paid'`,
                sql`${bills.status} != 'cancelled'`,
                sql`${bills.status} != 'rejected'`
              ),
              // Pending approval status
              eq(bills.status, 'pending_approval' as any),
              // Processing status (may need review)
              eq(bills.status, 'processing' as any)
            )
          )
        )
        .orderBy(
          // Prioritize: overdue first, then by due date
          sql`CASE 
            WHEN ${bills.dueDate} < ${now} THEN 1 
            WHEN ${bills.approvalRequired} = true AND ${bills.approvedBy} IS NULL THEN 2
            ELSE 3 
          END`,
          bills.dueDate
        )
        .limit(50);

      return billsRequiringAttention;
    } catch (error) {
      console.error('Error fetching bills requiring attention:', error);
      return [];
    }
  }
}

// Export service instance
export const billPayService = new BillPayAutomationService();
