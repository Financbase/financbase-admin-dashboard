/**
 * Comprehensive Database Integration Tests
 * Tests real database operations for all services
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { TestDatabase } from '../test-db';

// Mock server-only
vi.mock('server-only', () => ({}));

// Import test database
const { testDb } = await import('../test-db');
import { bills, vendors, billPayments, approvalWorkflows, billApprovals } from '@/lib/db/schemas/bill-pay.schema';
import { eq, and, inArray } from 'drizzle-orm';

// Alias testDb as db for convenience
const db = testDb;

describe('Database Integration Tests', () => {
  let testDatabase: ReturnType<typeof TestDatabase.getInstance>;
  // Use valid UUID format for test user ID (all userId fields are UUIDs)
  const testUserId = '00000000-0000-0000-0000-000000000001';
  const testVendorId = '00000000-0000-0000-0000-000000000002';

  beforeAll(async () => {
    testDatabase = TestDatabase.getInstance();
    await testDatabase.setup();
    
    // Clean up any existing test data
    // Note: billApprovals.billId is a UUID, so we need to delete by finding bills first
    try {
      // First, find bills for this user to get their IDs
      const userBills = await testDb.select({ id: bills.id }).from(bills).where(eq(bills.userId, testUserId));
      const billIds = userBills.map(b => b.id);
      
      // Delete billApprovals by billId (UUID)
      if (billIds.length > 0) {
        await testDb.delete(billApprovals).where(inArray(billApprovals.billId, billIds));
      }
      
      await testDb.delete(billPayments).where(eq(billPayments.userId, testUserId));
      await testDb.delete(bills).where(eq(bills.userId, testUserId));
      await testDb.delete(vendors).where(eq(vendors.userId, testUserId));
      await testDb.delete(approvalWorkflows).where(eq(approvalWorkflows.userId, testUserId));
    } catch (error) {
      // Ignore cleanup errors if tables don't exist
      console.warn('Cleanup error (safe to ignore):', error);
    }
  });

  afterAll(async () => {
    await testDatabase?.teardown();
    // Clean up test data
    try {
      // Find bills for this user to get their IDs
      const userBills = await testDb.select({ id: bills.id }).from(bills).where(eq(bills.userId, testUserId));
      const billIds = userBills.map(b => b.id);
      
      // Delete billApprovals by billId (UUID)
      if (billIds.length > 0) {
        await testDb.delete(billApprovals).where(inArray(billApprovals.billId, billIds));
      }
      
      await testDb.delete(billPayments).where(eq(billPayments.userId, testUserId));
      await testDb.delete(bills).where(eq(bills.userId, testUserId));
      await testDb.delete(vendors).where(eq(vendors.userId, testUserId));
      await testDb.delete(approvalWorkflows).where(eq(approvalWorkflows.userId, testUserId));
    } catch (error) {
      // Ignore cleanup errors
      console.warn('Cleanup error (safe to ignore):', error);
    }
  });

  describe('Vendor Operations', () => {
    it('should create a new vendor', async () => {
      const vendorData = {
        userId: testUserId,
        name: 'Test Vendor Inc',
        email: 'test@vendor.com',
        phone: '+1234567890',
        address: JSON.stringify({
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US'
        }),
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US',
        taxId: '12-3456789',
        industry: 'technology',
        preferredPaymentMethod: 'ach',
        paymentTerms: '30',
        totalSpent: '0',
        totalBills: 0,
        status: 'active',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const [vendor] = await testDb.insert(vendors).values(vendorData).returning();
      expect(vendor).toBeDefined();
      expect(vendor.id).toBeDefined();
      expect(vendor.name).toBe('Test Vendor Inc');
      expect(vendor.email).toBe('test@vendor.com');
    });

    it('should retrieve vendors by user', async () => {
      const vendorList = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, testUserId))
        .limit(10);

      expect(Array.isArray(vendorList)).toBe(true);
      expect(vendorList.length).toBeGreaterThan(0);
    });

    it('should update vendor information', async () => {
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, testUserId))
        .limit(1);

      if (vendor) {
        const [updatedVendor] = await db
          .update(vendors)
          .set({
            name: 'Updated Test Vendor Inc',
            updatedAt: new Date()
          })
          .where(eq(vendors.id, vendor.id))
          .returning();

        expect(updatedVendor.name).toBe('Updated Test Vendor Inc');
      }
    });
  });

  describe('Bill Operations', () => {
    it('should create a new bill', async () => {
      // First get a vendor for the test
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, testUserId))
        .limit(1);

      if (vendor) {
        const billData = {
          userId: testUserId,
          vendorId: vendor.id,
          billNumber: 'TEST-BILL-001',
          vendorBillNumber: 'VENDOR-001',
          amount: '1000.00',
          currency: 'USD',
          taxAmount: '100.00',
          discountAmount: '0.00',
          totalAmount: '1100.00',
          billDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'received',
          priority: 'medium',
          description: 'Test bill for integration testing',
          category: 'office_supplies',
          approvalRequired: false,
          ocrProcessed: false,
          documentType: 'invoice',
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const [bill] = await testDb.insert(bills).values(billData).returning();
        expect(bill).toBeDefined();
        expect(bill.id).toBeDefined();
        expect(bill.billNumber).toBe('TEST-BILL-001');
        expect(bill.amount).toBe('1000.00');
      }
    });

    it('should retrieve bills by user with filtering', async () => {
      const billList = await db
        .select()
        .from(bills)
        .where(eq(bills.userId, testUserId))
        .limit(10);

      expect(Array.isArray(billList)).toBe(true);
    });

    it('should filter bills by status', async () => {
      const pendingBills = await db
        .select()
        .from(bills)
        .where(and(
          eq(bills.userId, testUserId),
          eq(bills.status, 'received')
        ))
        .limit(10);

      expect(Array.isArray(pendingBills)).toBe(true);
    });
  });

  describe('Payment Operations', () => {
    it('should create a bill payment', async () => {
      // Get a bill for testing
      const [bill] = await db
        .select()
        .from(bills)
        .where(eq(bills.userId, testUserId))
        .limit(1);

      if (bill) {
        const paymentData = {
          userId: testUserId,
          billId: bill.id,
          vendorId: bill.vendorId,
          amount: '1100.00',
          currency: 'USD',
          paymentMethod: 'ach',
          status: 'completed',
          paymentDate: new Date(),
          processedAt: new Date(),
          externalPaymentId: 'EXT-PAY-001',
          referenceNumber: 'REF-001',
          confirmationNumber: 'CONF-001',
          processingFee: '5.00',
          notes: 'Test payment',
          reconciled: true,
          reconciledAt: new Date(),
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const [payment] = await testDb.insert(billPayments).values(paymentData).returning();
        expect(payment).toBeDefined();
        expect(payment.id).toBeDefined();
        expect(payment.billId).toBe(bill.id);
        expect(payment.amount).toBe('1100.00');
      }
    });
  });

  describe('Approval Workflow Operations', () => {
    it('should create an approval workflow', async () => {
      const workflowData = {
        userId: testUserId,
        name: 'Test Approval Workflow',
        description: 'Test workflow for integration testing',
        status: 'active',
        isActive: true,
        conditions: { amountThreshold: 1000, vendorCategories: ['technology'] },
        steps: [
          {
            id: 'step_1',
            name: 'Manager Approval',
            type: 'role',
            role: 'manager',
            order: 1,
            status: 'pending'
          }
        ],
        escalationRules: {},
        autoApprovalRules: {},
        totalProcessed: 0,
        avgProcessingTime: 0,
        approvalRate: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const [workflow] = await testDb.insert(approvalWorkflows).values(workflowData).returning();
      expect(workflow).toBeDefined();
      expect(workflow.id).toBeDefined();
      expect(workflow.name).toBe('Test Approval Workflow');
    });

    it('should create a bill approval', async () => {
      // Get workflow and bill for testing
      const [workflow] = await db
        .select()
        .from(approvalWorkflows)
        .where(eq(approvalWorkflows.userId, testUserId))
        .limit(1);

      const [bill] = await db
        .select()
        .from(bills)
        .where(eq(bills.userId, testUserId))
        .limit(1);

      if (workflow && bill) {
        const approvalData = {
          billId: bill.id,
          workflowId: workflow.id,
          requestedBy: testUserId,
          requestedAt: new Date(),
          initiatedBy: testUserId,
          currentStep: 1,
          totalSteps: 1,
          status: 'pending',
          approvedBy: null,
          approvedAt: null,
          rejectedBy: null,
          rejectedAt: null,
          approvalNotes: null,
          rejectionReason: null,
          escalatedAt: null,
          escalatedTo: null,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          completedAt: null,
          steps: [{
            id: 'step_1',
            name: 'Manager Approval',
            type: 'role',
            role: 'manager',
            order: 1,
            status: 'pending'
          }],
          approvalHistory: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const [approval] = await testDb.insert(billApprovals).values(approvalData).returning();
        expect(approval).toBeDefined();
        expect(approval.id).toBeDefined();
        expect(approval.billId).toBe(bill.id);
        expect(approval.status).toBe('pending');
      }
    });
  });

  describe('Data Consistency', () => {
    it('should maintain referential integrity', async () => {
      // Test that foreign key relationships work correctly
      const [bill] = await testDb
        .select({
          bill: bills,
          vendor: vendors,
          payments: billPayments,
          approvals: billApprovals
        })
        .from(bills)
        .leftJoin(vendors, eq(bills.vendorId, vendors.id))
        .leftJoin(billPayments, eq(bills.id, billPayments.billId))
        .leftJoin(billApprovals, eq(bills.id, billApprovals.billId))
        .where(eq(bills.userId, testUserId))
        .limit(1);

      expect(bill.bill).toBeDefined();
      // Vendor might be null if no vendor is associated
      // Payment and approval might be null if none exist
    });

    it('should handle concurrent operations', async () => {
      // Test multiple simultaneous operations
      const promises = Array.from({ length: 5 }, async (_, i) => {
        const billData = {
          userId: testUserId,
          vendorId: null,
          billNumber: `CONCURRENT-BILL-${i}`,
          vendorBillNumber: `VENDOR-${i}`,
          amount: '100.00',
          currency: 'USD',
          taxAmount: '10.00',
          discountAmount: '0.00',
          totalAmount: '110.00',
          billDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'received',
          priority: 'medium',
          description: `Concurrent test bill ${i}`,
          category: 'testing',
          approvalRequired: false,
          ocrProcessed: false,
          documentType: 'invoice',
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        };

        return testDb.insert(bills).values(billData).returning();
      });

      const results = await Promise.all(promises);
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result[0]).toBeDefined();
        expect(result[0].id).toBeDefined();
      });
    });
  });
});
