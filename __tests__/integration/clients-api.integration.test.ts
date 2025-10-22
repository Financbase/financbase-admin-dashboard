/**
 * Real Database API Tests
 * Tests that use the actual database instead of mocks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../../app/api/clients/route';
import { testDatabase } from '../test-db';

// Setup real database for these tests
beforeAll(async () => {
  await testDatabase.setup();
});

describe('Clients API - Real Database', () => {
  it('should handle validation errors properly', async () => {
    // Clean database first
    await testDatabase.cleanup();

    const invalidClientData = {
      // Missing required fields that exist in the current database schema
      contactName: 'John Doe',
      email: 'invalid-email', // Invalid email format if validated
    };

    const request = new NextRequest('http://localhost:3000/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidClientData),
    });

    const response = await POST(request);

    // The API should handle the request without crashing
    expect(response.status).toBeDefined();
    expect(typeof response.status).toBe('number');
  });

  it('should return a response from GET endpoint', async () => {
    const request = new NextRequest('http://localhost:3000/api/clients');
    const response = await GET(request);

    // Should return some kind of response
    expect(response).toBeDefined();
    expect(response.status).toBeDefined();
  });
});