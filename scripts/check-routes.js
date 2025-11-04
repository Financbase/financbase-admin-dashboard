const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3002';
const publicRoutes = [
  '/',
  '/about',
  '/analytics',
  '/blog',
  '/careers',
  '/contact',
  '/docs',
  '/guides',
  '/home',
  '/legal',
  '/pricing',
  '/privacy',
  '/security',
  '/support',
  '/team-collaboration',
  '/terms',
];

async function checkRoutes() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Starting public routes check...\n');
  
  for (const route of publicRoutes) {
    const url = `${BASE_URL}${route}`;
    console.log(`Checking: ${url}`);
    
    try {
      // Check if the page loads without server errors
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      
      if (!response) {
        console.error(`❌ No response for: ${url}`);
        continue;
      }
      
      const status = response.status();
      
      if (status >= 400) {
        console.error(`❌ ${status} error for: ${url}`);
        continue;
      }
      
      // Check for 404 text on the page
      const notFoundText = await page.getByText('404', { exact: false }).count();
      const errorText = await page.getByText('error', { exact: false }).count();
      
      if (notFoundText > 0) {
        console.error(`❌ Found 404 text on: ${url}`);
      } else if (errorText > 0) {
        console.error(`❌ Found error text on: ${url}`);
      } else {
        console.log(`✅ Success: ${url}`);
      }
      
      // Check for broken images
      const images = await page.$$eval('img', imgs => 
        imgs.map(img => ({
          src: img.src,
          naturalWidth: img.naturalWidth
        }))
      );
      
      for (const img of images) {
        if (img.naturalWidth === 0) {
          console.error(`❌ Broken image found: ${img.src} on ${url}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error checking ${url}:`, error.message);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  await browser.close();
  console.log('\nPublic routes check completed.');
}

checkRoutes().catch(console.error);
