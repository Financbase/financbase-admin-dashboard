/**
 * Bill Pay Automation Service - Clean Version
 * OCR document processing, vendor management, and payment automation
 * Integrates with payment processors and AI for intelligent bill processing
 */

import { db } from '@/lib/db';
import { bills, vendors, payments, approvalWorkflows } from '@/lib/db/schemas/bills.schema';
import { eq, and, desc, sql } from 'drizzle-orm';
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
}

// Export service instance
export const billPayService = new BillPayAutomationService();
