import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Navigate to the application
    await page.goto(baseURL!)
    
    // Wait for the application to load
    await page.waitForSelector('body', { timeout: 30000 })
    
    // Check if the application is running
    const title = await page.title()
    if (!title || title.includes('404')) {
      throw new Error('Application is not running or not accessible')
    }
    
    console.log('✅ Application is running and accessible')
    
    // Optional: Set up test data or authentication
    // await setupTestData(page)
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
