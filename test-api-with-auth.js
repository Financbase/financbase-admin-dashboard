// This script requires you to manually get the __session cookie from your browser's developer tools
// and paste it in the AUTH_TOKEN constant below

const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE'; // Replace with your actual auth token

async function testApi() {
  try {
    // Test GET /api/reports
    console.log('Testing GET /api/reports...');
    const getResponse = await fetch('http://localhost:3000/api/reports', {
      headers: {
        'Cookie': `__session=${AUTH_TOKEN}`
      }
    });
    
    console.log(`Status: ${getResponse.status} ${getResponse.statusText}`);
    
    if (!getResponse.ok) {
      const error = await getResponse.text();
      console.error('Error response:', error);
      return;
    }
    
    const data = await getResponse.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    // Test POST /api/reports
    console.log('\nTesting POST /api/reports...');
    const postResponse = await fetch('http://localhost:3000/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `__session=${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        name: 'Test Report',
        type: 'test',
        config: {},
        isFavorite: false,
        isPublic: false
      })
    });
    
    console.log(`Status: ${postResponse.status} ${postResponse.statusText}`);
    
    if (!postResponse.ok) {
      const error = await postResponse.text();
      console.error('Error response:', error);
      return;
    }
    
    const newReport = await postResponse.json();
    console.log('Created report:', JSON.stringify(newReport, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testApi();
