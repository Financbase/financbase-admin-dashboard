const fetch = require('node-fetch');

async function testApi() {
  try {
    // Test GET /api/reports
    console.log('Testing GET /api/reports...');
    const getResponse = await fetch('http://localhost:3000/api/reports');
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
