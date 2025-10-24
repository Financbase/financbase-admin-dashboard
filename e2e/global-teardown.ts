import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up after tests...')
  
  // Optional: Clean up test data
  // await cleanupTestData()
  
  // Optional: Generate test reports
  // await generateTestReports()
  
  console.log('✅ Global teardown completed')
}

export default globalTeardown
