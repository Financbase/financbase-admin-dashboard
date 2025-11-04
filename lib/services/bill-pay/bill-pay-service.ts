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
import { eq, and, or, desc, sql, lt, lte, gte, isNull, isNotNull } from 'drizzle-orm';
import { auditLogger, AuditEventType, RiskLevel, ComplianceFramework } from '@/lib/services/security/audit-logging-service';

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
  constructor() {
    // Initialize service
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
    try {
      // Simulate OCR and AI processing
      // In a real implementation, this would:
      // 1. Upload file to OCR service
      // 2. Extract text using OCR
      // 3. Parse with AI models
      // 4. Match vendors
      // 5. Categorize transaction

      const mockExtractedData = {
        vendor: 'Sample Vendor',
        amount: 1250.00,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        invoiceNumber: 'INV-001',
        description: 'Sample invoice processing',
        category: 'office_supplies'
      };

      const mockConfidence = 0.95;
      const mockProcessingTime = 1250; // milliseconds

      // Create bill record from extracted data
      const bill = await this.createBill(userId, {
        vendorId: undefined, // Would be matched from vendor database
        amount: mockExtractedData.amount,
        currency: 'USD',
        dueDate: mockExtractedData.dueDate,
        issueDate: new Date(),
        invoiceNumber: mockExtractedData.invoiceNumber,
        description: mockExtractedData.description || 'Auto-processed document',
        category: mockExtractedData.category || 'general',
        status: 'pending_approval'
      });

      // Log document processing
      await auditLogger.logEvent({
        userId,
        eventType: AuditEventType.AI_CATEGORIZATION,
        action: 'document_processing',
        entityType: 'bill',
        entityId: bill.id,
        description: `Document processed: ${documentType} with ${Math.round(mockConfidence * 100)}% confidence`,
        riskLevel: RiskLevel.LOW,
        metadata: {
          documentType,
          confidence: mockConfidence,
          fileName: file.name,
          fileSize: file.size,
          processingTime: mockProcessingTime
        },
        complianceFlags: [ComplianceFramework.SOC2]
      });

      return {
        id: bill.id,
        confidence: mockConfidence,
        extractedData: mockExtractedData,
        processingTime: mockProcessingTime,
        status: 'completed'
      };

    } catch (error) {
      console.error('Error processing document:', error);
      throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
