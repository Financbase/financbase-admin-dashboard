/**
 * Simple Environment Test
 * Verifies that environment variables are loaded correctly
 */

import { describe, it, expect } from 'vitest';

describe('Environment Configuration', () => {
  it('should load environment variables', () => {
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Database URL length:', process.env.DATABASE_URL?.length || 0);

    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.DATABASE_URL).toContain('postgresql://');
  });
});
