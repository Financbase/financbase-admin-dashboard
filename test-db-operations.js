import { db } from './lib/db/index.js';
import { bills, vendors, billPayments, approvalWorkflows, billApprovals } from './lib/db/schemas/bill-pay.schema.js';
import { eq, and } from 'drizzle-orm';

async function testDatabaseOperations() {
  console.log('🧪 Testing Database Operations...');

  try {
    // Test 1: Basic connection
    console.log('📡 Testing basic connection...');
    const connectionTest = await db.execute('SELECT 1 as test');
    console.log('✅ Connection successful:', connectionTest);

    // Test 2: Query vendors table
    console.log('📋 Testing vendors table...');
    const vendorsTest = await db.select().from(vendors).limit(1);
    console.log('✅ Vendors query successful:', vendorsTest.length, 'records');

    // Test 3: Query bills table
    console.log('📋 Testing bills table...');
    const billsTest = await db.select().from(bills).limit(1);
    console.log('✅ Bills query successful:', billsTest.length, 'records');

    // Test 4: Query payments table
    console.log('📋 Testing bill payments table...');
    const paymentsTest = await db.select().from(billPayments).limit(1);
    console.log('✅ Bill payments query successful:', paymentsTest.length, 'records');

    // Test 5: Query approval workflows table
    console.log('📋 Testing approval workflows table...');
    const workflowsTest = await db.select().from(approvalWorkflows).limit(1);
    console.log('✅ Approval workflows query successful:', workflowsTest.length, 'records');

    // Test 6: Query bill approvals table
    console.log('📋 Testing bill approvals table...');
    const approvalsTest = await db.select().from(billApprovals).limit(1);
    console.log('✅ Bill approvals query successful:', approvalsTest.length, 'records');

    // Test 7: Test insert operation (create a test vendor)
    console.log('➕ Testing insert operation...');
    const testVendor = {
      userId: 'test-user-12345',
      name: 'Test Vendor Integration',
      email: 'integration@test.com',
      phone: '+1234567890',
      address: JSON.stringify({
        street: '123 Test Integration St',
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

    const [newVendor] = await db.insert(vendors).values(testVendor).returning();
    console.log('✅ Insert operation successful:', newVendor.id);

    // Test 8: Test update operation
    console.log('🔄 Testing update operation...');
    const [updatedVendor] = await db
      .update(vendors)
      .set({
        name: 'Updated Test Vendor Integration',
        updatedAt: new Date()
      })
      .where(eq(vendors.id, newVendor.id))
      .returning();
    console.log('✅ Update operation successful:', updatedVendor.name);

    // Test 9: Test delete operation
    console.log('🗑️ Testing delete operation...');
    await db.delete(vendors).where(eq(vendors.id, newVendor.id));
    console.log('✅ Delete operation successful');

    // Test 10: Test complex query with joins
    console.log('🔗 Testing complex queries...');
    const complexQuery = await db
      .select({
        vendorCount: vendors.id,
        billCount: bills.id
      })
      .from(vendors)
      .leftJoin(bills, eq(vendors.id, bills.vendorId))
      .limit(5);
    console.log('✅ Complex query successful:', complexQuery.length, 'records');

    console.log('🎉 All database operations completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

// Run the test
testDatabaseOperations().then(success => {
  console.log('📊 Test result:', success ? 'PASSED' : 'FAILED');
  process.exit(success ? 0 : 1);
});
