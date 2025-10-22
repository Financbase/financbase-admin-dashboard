/**
 * Simplified Client Service Unit Tests
 * Tests for client management business logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the database
const mockDb = {
  insert: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  query: {
    clients: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
};

vi.mock('@/lib/db', () => ({
  db: mockDb,
}));

// Mock notification service
vi.mock('@/lib/services/notification-service', () => ({
  NotificationHelpers: {
    client: {
      created: vi.fn(),
    },
  },
}));

// Import after mocks
import { createClient, getClientById, getClients, updateClient, getClientStats } from '@/lib/services/client-service';

describe('ClientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createClient', () => {
    it('should create a new client with valid data', async () => {
      const mockClient = {
        id: 'client-123',
        userId: 'user-123',
        companyName: 'Test Company',
        contactName: 'John Doe',
        email: 'john@testcompany.com',
        phone: '+1234567890',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US',
        taxId: 'TAX123',
        currency: 'USD',
        paymentTerms: 'net30',
        notes: 'Test client',
        metadata: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const clientData = {
        userId: 'user-123',
        companyName: 'Test Company',
        contactName: 'John Doe',
        email: 'john@testcompany.com',
        phone: '+1234567890',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US',
        taxId: 'TAX123',
        currency: 'USD',
        paymentTerms: 'net30',
        notes: 'Test client',
        metadata: {},
      };

      // Mock database insert
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockClient]),
        }),
      });

      const result = await createClient(clientData);

      expect(result).toEqual(mockClient);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const clientData = {
        userId: 'user-123',
        companyName: 'Test Company',
        email: 'john@testcompany.com',
      };

      // Mock database to throw error
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      await expect(createClient(clientData)).rejects.toThrow('Database error');
    });
  });

  describe('getClientById', () => {
    it('should return client when found', async () => {
      const mockClient = {
        id: 'client-123',
        userId: 'user-123',
        companyName: 'Test Company',
        email: 'john@testcompany.com',
      };

      mockDb.query.clients.findFirst.mockResolvedValue(mockClient);

      const result = await getClientById('client-123', 'user-123');

      expect(result).toEqual(mockClient);
      expect(mockDb.query.clients.findFirst).toHaveBeenCalled();
    });

    it('should return null when client not found', async () => {
      mockDb.query.clients.findFirst.mockResolvedValue(null);

      const result = await getClientById('non-existent', 'user-123');

      expect(result).toBeNull();
    });
  });

  describe('getClients', () => {
    it('should return clients list', async () => {
      const mockClients = [
        { id: 'client-1', companyName: 'Company 1' },
        { id: 'client-2', companyName: 'Company 2' },
      ];

      mockDb.query.clients.findMany.mockResolvedValue(mockClients);

      const result = await getClients('user-123');

      expect(result).toEqual(mockClients);
      expect(mockDb.query.clients.findMany).toHaveBeenCalled();
    });
  });

  describe('updateClient', () => {
    it('should update client successfully', async () => {
      const mockUpdatedClient = {
        id: 'client-123',
        companyName: 'Updated Company',
        email: 'updated@company.com',
      };

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedClient]),
          }),
        }),
      });

      const result = await updateClient({ 
        id: 'client-123', 
        userId: 'user-123', 
        companyName: 'Updated Company',
        email: 'updated@company.com'
      });

      expect(result).toEqual(mockUpdatedClient);
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('getClientStats', () => {
    it('should return client statistics', async () => {
      const mockStats = {
        totalClients: 10,
        activeClients: 8,
        totalRevenue: 50000,
        averageInvoiceValue: 5000,
        topClients: [],
      };

      // Mock the complex query structure
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 10 }]),
        }),
      });

      // Mock multiple select calls for different stats
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 10 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 8 }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              groupBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        });

      const result = await getClientStats('user-123');

      expect(result).toHaveProperty('totalClients');
      expect(result).toHaveProperty('activeClients');
      expect(result).toHaveProperty('totalRevenue');
      expect(mockDb.select).toHaveBeenCalled();
    });
  });
});
