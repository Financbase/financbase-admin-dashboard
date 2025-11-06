import { Clerk } from '@clerk/backend';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testReportsApi() {
  try {
    // Initialize Clerk with your secret key
    const clerk = Clerk({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Get the first user (you might want to adjust this based on your needs)
    const users = await clerk.users.getUserList();
    const userId = users[0]?.id;

    if (!userId) {
      console.error('No users found in Clerk');
      return;
    }

    console.log(`Testing with user ID: ${userId}`);

    // Create a session token for the user
    const token = await clerk.sessions.createToken({
      userId,
      // Set a short expiration for security
      expiresInSeconds: 60 * 5, // 5 minutes
    });

    // Test GET /api/reports
    console.log('\nTesting GET /api/reports...');
    const getResponse = await fetch('http://localhost:3000/api/reports', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
        'Authorization': `Bearer ${token}`,
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

testReportsApi();
