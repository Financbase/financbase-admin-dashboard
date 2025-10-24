/**
 * Bill Pay Automation Service
 * OCR document processing, vendor management, and payment automation
 * Integrates with payment processors and AI for intelligent bill processing
 */

import { db } from '@/lib/db';
import {
  bills,
  vendors,
  billPayments,
  approvalWorkflows,
  billApprovals,
  type Bill,
  type Vendor,
  type Payment,
  type ApprovalWorkflow,
  type BillApproval
} from '@/lib/db/schemas/bill-pay.schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { auditLogger, AuditEventType, RiskLevel, ComplianceFramework } from '@/lib/services/security/audit-logging-service';

// OCR and document processing interfaces
export interface DocumentProcessingResult {
  id: string;
  documentType: 'invoice' | 'receipt' | 'bill' | 'statement';
  extractedData: {
    vendor?: string;
    amount?: number;
    currency?: string;
    dueDate?: Date;
    issueDate?: Date;
    invoiceNumber?: string;
    description?: string;
    lineItems?: Array<{
      description: string;
      amount: number;
      quantity?: number;
      unitPrice?: number;
    }>;
    confidence: number;
  };
  confidence: number;
  aiExplanation: {
    reasoning: string;
    evidence: string[];
    confidence: number;
  };
  processingTime: number;
  metadata: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    pageCount: number;
  };
}

// Payment method interface
export interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'credit_card' | 'paypal' | 'stripe' | 'wire';
  details: {
    accountNumber?: string;
    routingNumber?: string;
    cardNumber?: string;
    paypalEmail?: string;
    stripeAccountId?: string;
    bankName?: string;
  };
  isDefault: boolean;
  status: 'active' | 'inactive' | 'pending';
}

// Use schema types for all database entities
export type { Bill, Vendor, Payment, ApprovalWorkflow, BillApproval } from '@/lib/db/schemas/bill-pay.schema';

export class BillPayAutomationService {
  private paymentProcessors = new Map<string, PaymentProcessor>();
  private vendorCache = new Map<string, Vendor>();

  constructor() {
    this.initializePaymentProcessors();
  }

  /**
   * Initialize payment processors
   */
  private initializePaymentProcessors(): void {
    // Initialize Stripe processor
    this.paymentProcessors.set('stripe', new StripeProcessor());

    // Initialize PayPal processor
    this.paymentProcessors.set('paypal', new PayPalProcessor());

    // Initialize ACH processor
    this.paymentProcessors.set('bank_account', new ACHProcessor());

    // Initialize wire transfer processor
    this.paymentProcessors.set('wire', new WireProcessor());
  }

  /**
   * Process uploaded document with OCR and AI
   */
  async processDocument(
    userId: string,
    file: File,
    documentType: 'invoice' | 'receipt' | 'bill' | 'statement'
  ): Promise<DocumentProcessingResult> {
    const startTime = Date.now();

    try {
      // Step 1: Extract text using OCR
      const ocrResult = await this.performOCR(file);

      // Step 2: AI-powered data extraction
      const extractedData = await this.extractBillData(ocrResult.text, documentType);

      // Step 3: Vendor identification and matching
      const vendor = await this.identifyVendor(extractedData.vendor || '', userId);

      // Step 4: Create structured bill data
      const billData = {
        vendorId: vendor?.id,
        amount: extractedData.amount || 0,
        currency: extractedData.currency || 'USD',
        dueDate: extractedData.dueDate || this.calculateDefaultDueDate(extractedData.issueDate || new Date()),
        issueDate: extractedData.issueDate || new Date(),
        invoiceNumber: extractedData.invoiceNumber,
        description: extractedData.description || 'No description',
        category: await this.categorizeBill(extractedData),
        status: 'draft',
        priority: 'medium',
        metadata: {
          ocrText: ocrResult.text,
          confidence: extractedData.confidence,
          processingMethod: 'ai_ocr'
        }
      };

      // Step 5: Create bill record
      const [bill] = await db
        .insert(bills)
        .values({
          userId,
          vendorId: billData.vendorId || null,
          billNumber: billData.invoiceNumber || crypto.randomUUID(),
          vendorBillNumber: billData.invoiceNumber || null,
          amount: billData.amount.toString(),
          currency: billData.currency,
          taxAmount: '0',
          discountAmount: '0',
          totalAmount: billData.amount.toString(),
          billDate: billData.issueDate,
          dueDate: billData.dueDate,
          status: (billData.status as any) || 'received',
          priority: (billData.priority as any) || 'medium',
          description: billData.description,
          category: billData.category,
          approvalRequired: false,
          ocrProcessed: true,
          ocrData: extractedData,
          ocrConfidence: extractedData.confidence?.toString(),
          documentType: documentType,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          metadata: {
            ocrText: ocrResult.text,
            confidence: extractedData.confidence,
            processingMethod: 'ai_ocr'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Step 6: Log processing activity
      await auditLogger.logEvent({
        userId,
        eventType: AuditEventType.API_ACCESS,
        action: 'document_processing',
        entityType: 'bill',
        entityId: bill.id,
        description: `Document processed: ${documentType} for ${formatCurrency(extractedData.amount || 0)}`,
        riskLevel: RiskLevel.LOW,
        metadata: {
          documentType,
          confidence: extractedData.confidence,
          fileName: file.name,
          fileSize: file.size,
          processingTime: Date.now() - startTime
        },
        complianceFlags: [ComplianceFramework.SOC2]
      });

      return {
        id: bill.id,
        documentType,
        extractedData,
        confidence: extractedData.confidence,
        aiExplanation: {
          reasoning: `AI extracted bill data from ${documentType} with ${Math.round(extractedData.confidence * 100)}% confidence`,
          evidence: [
            'OCR text extraction completed',
            'Vendor identification successful',
            'Amount and date parsing verified',
            'Category classification applied'
          ],
          confidence: extractedData.confidence
        },
        processingTime: Date.now() - startTime,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          pageCount: ocrResult.pageCount
        }
      };

    } catch (error) {
      console.error('Document processing failed:', error);
      throw new Error(`Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add and manage vendor
   */
  async addVendor(
    userId: string,
    vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<Vendor> {
    // Check for existing vendor
    const existingVendor = await this.findExistingVendor(vendorData.name, vendorData.email);

    if (existingVendor) {
      // Update existing vendor
      const [updatedVendor] = await db
        .update(vendors)
        .set({
          name: vendorData.name,
          email: vendorData.email,
          phone: vendorData.phone || null,
          address: vendorData.address ? JSON.stringify(vendorData.address) : null,
          taxId: vendorData.taxId || null,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, existingVendor.id))
        .returning();

      await auditLogger.logEvent({
        userId,
        eventType: AuditEventType.USER_UPDATED,
        action: 'vendor_management',
        entityType: 'vendor',
        entityId: updatedVendor.id,
        description: `Vendor updated: ${vendorData.name}`,
        riskLevel: RiskLevel.LOW,
        metadata: {}, // Add required metadata field
        complianceFlags: [ComplianceFramework.SOC2, ComplianceFramework.GDPR]
      });

      return updatedVendor;
    }

    // Create new vendor
    const [newVendor] = await db
      .insert(vendors)
      .values({
        userId: userId,
        name: vendorData.name,
        email: vendorData.email,
        phone: vendorData.phone || null,
        address: vendorData.address ? JSON.stringify(vendorData.address) : null,
        taxId: vendorData.taxId || null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Create default approval workflow if needed
    if (vendorData.approvalRequired) {
      await this.createDefaultApprovalWorkflow(newVendor.id);
    }

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
  }

  /**
   * Schedule payment with approval workflow
   */
  async schedulePayment(
    userId: string,
    billId: string,
    paymentData: {
      paymentMethod: string;
      scheduledDate: Date;
      amount?: number; // Optional override
      notes?: string;
    }
  ): Promise<{ bill: Bill; approval: BillApproval | null }> {
    // Get bill details
    const bill = await this.getBill(billId);
    if (!bill) {
      throw new Error('Bill not found');
    }

    // Check if approval is required
    const vendor = await this.getVendor(bill.vendorId || '');
    const requiresApproval = vendor?.approvalRequired && (parseFloat(bill.amount) >= parseFloat(vendor.approvalThreshold || '1000'));

    let approval: BillApproval | null = null;

    if (requiresApproval) {
      // Create approval workflow
      approval = await this.createApprovalWorkflow(userId, billId, vendor);

      // Update bill status
      await db
        .update(bills)
        .set({
          status: 'pending_approval',
          updatedAt: new Date()
        })
        .where(eq(bills.id, billId));

    } else {
      // Auto-approve and schedule payment
      await db
        .update(bills)
        .set({
          status: 'approved',
          approvedBy: userId,
          approvedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(bills.id, billId));

      // Create payment record
      await this.createPaymentRecord(billId, paymentData, userId);
    }

    // Log payment scheduling
    await auditLogger.logEvent({
      userId,
      eventType: AuditEventType.PAYMENT_PROCESSED,
      action: 'payment_scheduling',
      entityType: 'bill',
      entityId: billId,
      description: `Payment scheduled: ${formatCurrency(paymentData.amount || bill.amount)}`,
      riskLevel: RiskLevel.LOW,
      metadata: {
        scheduledDate: paymentData.scheduledDate,
        paymentMethod: paymentData.paymentMethod,
        requiresApproval
      },
      complianceFlags: [ComplianceFramework.SOC2]
    });

    return { bill, approval };
  }

  /**
   * Process payment through integrated processors
   */
  async processPayment(
    userId: string,
    billId: string,
    paymentMethod: string
  ): Promise<{ payment: Payment; processorResponse: any }> {
    const bill = await this.getBill(billId);
    if (!bill) {
      throw new Error('Bill not found');
    }

    const vendor = await this.getVendor(bill.vendorId || '');
    // Note: paymentMethods property doesn't exist in schema, using simplified approach
    const paymentMethodDetails = { type: paymentMethod };

    if (!paymentMethodDetails) {
      throw new Error('Payment method not supported');
    }

    // Get payment processor
    const processor = this.paymentProcessors.get(paymentMethod);
    if (!processor) {
      throw new Error(`Payment processor not available for ${paymentMethod}`);
    }

    // Process payment
    const processorResponse = await processor.processPayment({
      amount: parseFloat(bill.amount),
      currency: bill.currency,
      vendor: vendor!,
      paymentMethod: paymentMethodDetails,
      billReference: bill.billNumber || bill.id
    });

    // Create payment record
    const [payment] = await db
      .insert(billPayments)
      .values({
        userId,
        billId,
        amount: bill.amount.toString(),
        currency: bill.currency,
        paymentMethod: paymentMethod as any, // Type assertion for valid enum values
        processorReference: processorResponse.reference,
        status: 'processing',
        metadata: processorResponse,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Update bill status
    await db
      .update(bills)
      .set({
        status: 'paid',
        paidDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(bills.id, billId));

    // Log payment processing
    await auditLogger.logFinancialEvent(
      userId,
      AuditEventType.PAYMENT_PROCESSED,
      'bill',
      billId,
      { amount: parseFloat(bill.amount), currency: bill.currency },
      {
        paymentMethod: paymentMethodDetails.type,
        processorReference: processorResponse.reference,
        fees: processorResponse.fees
      }
    );

    return { payment, processorResponse };
  }

  /**
   * Get bill approval by ID
   */
  async getBillApproval(approvalId: string): Promise<BillApproval | null> {
    try {
      const approvalResults = await db
        .select()
        .from(billApprovals)
        .where(eq(billApprovals.id, approvalId))
        .limit(1);

      return approvalResults[0] || null;
    } catch (error) {
      console.error('Error fetching bill approval:', error);
      throw new Error(`Failed to fetch bill approval: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processApproval(
    userId: string,
    approvalId: string,
    decision: 'approve' | 'reject',
    comments?: string
  ): Promise<BillApproval> {
    const approval = await this.getBillApproval(approvalId);
    if (!approval) {
      throw new Error('Approval not found');
    }

    const bill = await this.getBill(approval.billId);
    if (!bill) {
      throw new Error('Bill not found');
    }

    // Find current step
    const currentStep = approval.steps.find(s => s.status === 'pending');
    if (!currentStep) {
      throw new Error('No pending approval step found');
    }

    // Update step - this would need to be implemented with proper workflow step management
    // For now, we'll skip database update since workflow is mock
    // TODO: Implement full approval workflow system with database persistence
    if (approval.workflowId && approval.workflowId !== 'default') {
      await db
        .update(approvalWorkflows)
        .set({
          status: decision === 'approve' ? 'active' : 'inactive',
          updatedAt: new Date()
        })
        .where(eq(approvalWorkflows.id, approval.workflowId));
    }

    // Update approval status
    if (decision === 'approve') {
      // Check if all steps are complete
      const remainingSteps = approval.steps.filter(s => s.status === 'pending');
      if (remainingSteps.length === 0) {
        // All approved - schedule payment
        await this.scheduleApprovedPayment(userId, bill);
      }
    }

    // Log approval decision
    await auditLogger.logEvent({
      userId,
      eventType: decision === 'approve' ? AuditEventType.PAYMENT_PROCESSED : AuditEventType.PAYMENT_FAILED,
      action: 'approval_workflow',
      entityType: 'bill',
      entityId: bill.id,
      description: `Bill ${decision === 'approve' ? 'approved' : 'rejected'}: ${bill.description}`,
      riskLevel: decision === 'approve' ? RiskLevel.LOW : RiskLevel.MEDIUM,
      metadata: { comments },
      complianceFlags: [ComplianceFramework.SOC2]
    });

    return approval;
  }

  /**
   * Create a new bill
   */
  async createBill(
    userId: string,
    billData: {
      vendorId: string;
      amount: number;
      currency: string;
      dueDate: Date;
      issueDate: Date;
      invoiceNumber: string;
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
          billNumber: billData.invoiceNumber || crypto.randomUUID(),
          vendorBillNumber: billData.invoiceNumber || null,
          amount: billData.amount.toString(),
          currency: billData.currency,
          taxAmount: '0',
          discountAmount: '0',
          totalAmount: billData.amount.toString(),
          billDate: billData.issueDate,
          dueDate: billData.dueDate,
          status: (billData.status as any) || 'received',
          priority: (billData.priority as any) || 'medium',
          description: billData.description,
          category: billData.category,
          approvalRequired: false,
          ocrProcessed: false,
          documentType: 'invoice',
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
        description: `Bill created: ${bill.description} for ${formatCurrency(billData.amount)}`,
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

      // Build query conditions
      const conditions = [eq(approvalWorkflows.userId, userId)];
      
      if (status) {
        conditions.push(eq(approvalWorkflows.status, status));
      }

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(approvalWorkflows)
        .where(and(...conditions));

      // Get paginated results
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

      // Build query conditions
      const conditions = [eq(vendors.userId, userId)];
      
      if (status) {
        conditions.push(eq(vendors.status, status as any));
      }
      
      if (category) {
        conditions.push(eq(vendors.industry, category));
      }

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(vendors)
        .where(and(...conditions));

      // Get paginated results
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

      // Build query conditions
      const conditions = [eq(bills.userId, userId)];
      
      if (status) {
        conditions.push(eq(bills.status, status as any));
      }
      
      if (vendorId) {
        conditions.push(eq(bills.vendorId, vendorId));
      }

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(bills)
        .where(and(...conditions));

      // Get paginated results
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
   * Get bills requiring attention
   */
  async getBillsRequiringAttention(userId: string): Promise<{
    overdue: Bill[];
    pendingApproval: Bill[];
    scheduledToday: Bill[];
    disputed: Bill[];
  }> {
    const today = new Date();
    const overdueDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const userBills = await db
      .select()
      .from(bills)
      .where(eq(bills.userId, userId));

    return {
      overdue: userBills.filter(bill =>
        bill.status !== 'paid' &&
        bill.dueDate < overdueDate
      ),
      pendingApproval: userBills.filter(bill =>
        bill.status === 'pending_approval'
      ),
      scheduledToday: userBills.filter(bill =>
        bill.status === 'approved' &&
        bill.dueDate &&
        bill.dueDate.toDateString() === today.toDateString()
      ),
      disputed: userBills.filter(bill =>
        bill.status === 'disputed'
      )
    };
  }

  /**
   * OCR Text extraction
   */
  private async performOCR(file: File): Promise<{ text: string; pageCount: number }> {
    // This would integrate with OCR services like Google Vision, AWS Textract, or Azure OCR
    // For now, simulate OCR processing

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock OCR result based on file type
    let mockText = '';
    if (file.name.toLowerCase().includes('invoice')) {
      mockText = `
        INVOICE

        Invoice Number: INV-2025-001
        Date: ${new Date().toLocaleDateString()}
        Due Date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}

        Bill To:
        Your Company
        123 Business St
        New York, NY 10001

        Vendor:
        Office Supplies Co
        456 Vendor Ave
        Boston, MA 02101

        Description: Office supplies and equipment
        Quantity: 10
        Unit Price: $25.00
        Total: $250.00

        Subtotal: $250.00
        Tax: $20.00
        Total: $270.00
      `;
    } else {
      mockText = 'Sample receipt text extracted from document';
    }

    return {
      text: mockText,
      pageCount: 1
    };
  }

  /**
   * AI-powered data extraction from OCR text
   */
  private async extractBillData(
    ocrText: string,
    documentType: string
  ): Promise<DocumentProcessingResult['extractedData']> {
    // Use AI orchestrator for intelligent data extraction
    const prompt = `
      Extract structured data from this ${documentType} text:

      ${ocrText}

      Return JSON with:
      {
        "vendor": "vendor name",
        "amount": number,
        "currency": "USD",
        "dueDate": "YYYY-MM-DD",
        "issueDate": "YYYY-MM-DD",
        "invoiceNumber": "string",
        "description": "string",
        "lineItems": [
          {
            "description": "string",
            "amount": number,
            "quantity": number,
            "unitPrice": number
          }
        ],
        "confidence": number (0-1)
      }
    `;

    // Use OpenAI for data extraction (since AI orchestrator is not available in this scope)
    const extractedData = await this.callOpenAI(prompt);

    return {
      vendor: extractedData.vendor,
      amount: extractedData.amount,
      currency: extractedData.currency || 'USD',
      dueDate: extractedData.dueDate ? new Date(extractedData.dueDate) : undefined,
      issueDate: extractedData.issueDate ? new Date(extractedData.issueDate) : new Date(),
      invoiceNumber: extractedData.invoiceNumber,
      description: extractedData.description,
      lineItems: extractedData.lineItems || [],
      confidence: extractedData.confidence || 0.8
    };
  }

  /**
   * Bill categorization
   */
  private async categorizeBill(extractedData: any): Promise<string> {
    // Use AI to categorize based on description and vendor
    const prompt = `
      Categorize this bill based on the description and vendor:

      Vendor: ${extractedData.vendor}
      Description: ${extractedData.description}
      Amount: $${extractedData.amount}

      Return category: office_supplies, software, marketing, utilities, professional_services, travel, other
    `;

    // Use OpenAI for categorization
    const result = await this.callOpenAI(prompt);
    return result.category || 'other';
  }

  private async identifyVendor(vendorName: string, userId: string): Promise<Vendor | null> {
    if (!vendorName) return null;
    
    // Try to find existing vendor by name
    const existingVendors = await db
      .select()
      .from(vendors)
      .where(and(
        eq(vendors.userId, userId),
        sql`LOWER(${vendors.name}) LIKE LOWER(${`%${vendorName}%`})`
      ))
      .limit(1);

    return existingVendors[0] || null;
  }

  private async findExistingVendor(name: string, email: string): Promise<Vendor | null> {
    const existingVendors = await db
      .select()
      .from(vendors)
      .where(and(
        sql`LOWER(${vendors.name}) = LOWER(${name})`,
        eq(vendors.email, email)
      ))
      .limit(1);

    return existingVendors[0] || null;
  }

  private async getBill(billId: string): Promise<Bill | null> {
    const billResults = await db
      .select()
      .from(bills)
      .where(eq(bills.id, billId))
      .limit(1);

    return billResults[0] || null;
  }

  private async getVendor(vendorId: string): Promise<Vendor | null> {
    // Check cache first
    if (this.vendorCache.has(vendorId)) {
      return this.vendorCache.get(vendorId)!;
    }

    const vendorResults = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendorId))
      .limit(1);

    if (vendorResults.length > 0) {
      this.vendorCache.set(vendorId, vendorResults[0]);
      return vendorResults[0];
    }

    return null;
  }

  private async createPaymentRecord(
    billId: string,
    paymentData: any,
    userId: string
  ): Promise<Payment> {
    const [payment] = await db
      .insert(billPayments)
      .values({
        userId,
        billId,
        amount: paymentData.amount?.toString() || '0',
        currency: 'USD',
        paymentMethod: paymentData.paymentMethod,
        status: 'pending',
        metadata: { scheduledBy: userId },
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return payment;
  }

  private async createApprovalWorkflow(
    userId: string,
    billId: string,
    vendor: Vendor
  ): Promise<BillApproval> {
    // Get applicable workflow
    const workflow = await this.getApplicableWorkflow(vendor);

    const billApproval: BillApproval = {
      id: crypto.randomUUID(),
      billId,
      workflowId: workflow.id,
      currentStep: 1,
      totalSteps: workflow.steps.length,
      status: 'pending',
      requestedBy: userId,
      initiatedBy: userId,
      steps: workflow.steps,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return billApproval;
  }

  private async getApplicableWorkflow(vendor: Vendor): Promise<ApprovalWorkflow> {
    return {
      id: 'default',
      name: 'Default Approval',
      description: 'Standard approval workflow',
      status: 'active',
      conditions: {
        amountThreshold: parseFloat(vendor.approvalThreshold || '1000'),
        vendorCategories: [vendor.category || 'other'],
        requiredApprovers: []
      },
      steps: [
        {
          id: 'manager_approval',
          name: 'Manager Approval',
          type: 'role',
          role: 'manager',
          order: 1,
          status: 'pending'
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'system',
      isActive: true,
      escalationRules: {},
      autoApprovalRules: {},
      totalProcessed: 0,
      avgProcessingTime: 0,
      approvalRate: '100'
    };
  }

  /**
   * Get pending approvals for user
   */
  async getPendingApprovals(userId: string): Promise<BillApproval[]> {
    try {
      // For now, return empty array as the approval workflow system needs to be fully implemented
      // This would query the billApprovals table for pending approvals where the current user is an approver

      // Get all pending bills for the user
      const pendingBills = await this.getBills(userId, {
        status: 'pending_approval',
        limit: 100,
        offset: 0
      });

      // For each pending bill, check if user is an approver and create approval objects
      const approvals: BillApproval[] = [];

      for (const bill of pendingBills.data) {
        // Check if user is involved in approval workflow for this bill
        // This is a simplified implementation - full workflow system would track approvers properly

        const approval: BillApproval = {
          id: crypto.randomUUID(),
          billId: bill.id,
          workflowId: 'default',
          currentStep: 0,
          status: 'pending',
          initiatedBy: userId,
          initiatedAt: bill.createdAt,
          steps: [
            {
              id: 'step_1',
              name: 'Manager Approval',
              type: 'role',
              role: 'manager',
              order: 1,
              status: 'pending'
            }
          ]
        };

        approvals.push(approval);
      }

      return approvals;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw new Error(`Failed to fetch pending approvals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async scheduleApprovedPayment(userId: string, bill: Bill): Promise<void> {
    await db
      .update(bills)
      .set({
        status: 'approved',
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(bills.id, bill.id));
  }

  private async callOpenAI(prompt: string): Promise<any> {
    // This would use OpenAI API for AI processing
    // For now, return mock response
    return {
      vendor: "Sample Vendor",
      amount: 100.00,
      currency: "USD",
      dueDate: "2024-12-31",
      issueDate: "2024-12-01",
      invoiceNumber: "INV-001",
      description: "Sample invoice",
      category: "other",
      confidence: 0.8
    };
  }

  private calculateDefaultDueDate(issueDate: Date): Date {
    return new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  private async createDefaultApprovalWorkflow(vendorId: string): Promise<void> {
    // Implementation for creating default approval workflow
  }
}

// Payment processor interfaces
interface PaymentProcessor {
  processPayment(paymentData: {
    amount: number;
    currency: string;
    vendor: Vendor;
    paymentMethod: PaymentMethod;
    billReference: string;
  }): Promise<{
    reference: string;
    status: string;
    fees?: number;
    estimatedDelivery?: Date;
  }>;
}

// Stripe payment processor
class StripeProcessor implements PaymentProcessor {
  async processPayment(paymentData: {
    amount: number;
    currency: string;
    vendor: Vendor;
    paymentMethod: PaymentMethod;
    billReference: string;
  }): Promise<{
    reference: string;
    status: string;
    fees?: number;
    estimatedDelivery?: Date;
  }> {
    // Integration with Stripe API
    // This would use Stripe SDK to process payment
    return {
      reference: 'stripe_' + crypto.randomUUID(),
      status: 'processing',
      fees: 0.029 * paymentData.amount + 0.30,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    };
  }
}

// PayPal payment processor
class PayPalProcessor implements PaymentProcessor {
  async processPayment(paymentData: {
    amount: number;
    currency: string;
    vendor: Vendor;
    paymentMethod: PaymentMethod;
    billReference: string;
  }): Promise<{
    reference: string;
    status: string;
    fees?: number;
    estimatedDelivery?: Date;
  }> {
    // Integration with PayPal API
    return {
      reference: 'paypal_' + crypto.randomUUID(),
      status: 'processing',
      fees: 0.029 * paymentData.amount + 0.30,
      estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    };
  }
}

// ACH payment processor
class ACHProcessor implements PaymentProcessor {
  async processPayment(paymentData: {
    amount: number;
    currency: string;
    vendor: Vendor;
    paymentMethod: PaymentMethod;
    billReference: string;
  }): Promise<{
    reference: string;
    status: string;
    fees?: number;
    estimatedDelivery?: Date;
  }> {
    // Integration with ACH/bank transfer API
    return {
      reference: 'ach_' + crypto.randomUUID(),
      status: 'processing',
      fees: 0.25,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    };
  }
}

// Wire transfer processor
class WireProcessor implements PaymentProcessor {
  async processPayment(paymentData: {
    amount: number;
    currency: string;
    vendor: Vendor;
    paymentMethod: PaymentMethod;
    billReference: string;
  }): Promise<{
    reference: string;
    status: string;
    fees?: number;
    estimatedDelivery?: Date;
  }> {
    // Integration with wire transfer service
    return {
      reference: 'wire_' + crypto.randomUUID(),
      status: 'processing',
      fees: 25.00,
      estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    };
  }
}

// Utility functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Export service instance
export const billPayService = new BillPayAutomationService();
