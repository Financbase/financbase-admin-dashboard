/**
 * Test Bill Pay APIs with real data
 * This script tests the Bill Pay service with actual database operations
 */

const { billPayService } = require('./lib/services/bill-pay/bill-pay-service');

async function testBillPayAPIs() {
  console.log('🧪 Testing Bill Pay APIs with real data...\n');
  
  const testUserId = '550e8400-e29b-41d4-a716-446655440000';
  
  try {
    // Test 1: Get vendors
    console.log('📋 Test 1: Getting vendors...');
    const vendors = await billPayService.getVendors(testUserId, {
      limit: 10,
      offset: 0
    });
    console.log(`✅ Found ${vendors.total} vendors`);
    console.log(`   First vendor: ${vendors.data[0]?.name || 'None'}`);
    
    // Test 2: Get bills
    console.log('\n📋 Test 2: Getting bills...');
    const bills = await billPayService.getBills(testUserId, {
      limit: 10,
      offset: 0
    });
    console.log(`✅ Found ${bills.total} bills`);
    console.log(`   First bill: ${bills.data[0]?.description || 'None'} - $${bills.data[0]?.amount || '0'}`);
    
    // Test 3: Get bills requiring attention
    console.log('\n📋 Test 3: Getting bills requiring attention...');
    const attentionBills = await billPayService.getBillsRequiringAttention(testUserId);
    console.log(`✅ Bills requiring attention:`);
    console.log(`   Overdue: ${attentionBills.overdue.length}`);
    console.log(`   Pending approval: ${attentionBills.pendingApproval.length}`);
    console.log(`   Scheduled today: ${attentionBills.scheduledToday.length}`);
    console.log(`   Disputed: ${attentionBills.disputed.length}`);
    
    // Test 4: Get approval workflows
    console.log('\n📋 Test 4: Getting approval workflows...');
    const workflows = await billPayService.getApprovalWorkflows(testUserId, {
      limit: 10,
      offset: 0
    });
    console.log(`✅ Found ${workflows.total} approval workflows`);
    
    // Test 5: Get pending approvals
    console.log('\n📋 Test 5: Getting pending approvals...');
    const pendingApprovals = await billPayService.getPendingApprovals(testUserId);
    console.log(`✅ Found ${pendingApprovals.length} pending approvals`);
    
    console.log('\n🎉 All Bill Pay API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the tests
testBillPayAPIs();
