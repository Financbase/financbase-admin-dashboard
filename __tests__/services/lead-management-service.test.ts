/**
 * Simplified Lead Management Service Unit Tests
 * Tests for lead management business logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the database
const mockDb = {
  insert: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  query: {
    leads: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    leadActivities: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    leadTasks: {
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
    sendLeadCreated: vi.fn(),
    sendLeadActivityCreated: vi.fn(),
    sendLeadTaskCreated: vi.fn(),
  },
}));

// Import after mocks
import { 
  createLead, 
  getLeadById, 
  updateLeadStatus, 
  createLeadActivity, 
  createLeadTask, 
  getLeadStats, 
  convertLeadToClient 
} from '@/lib/services/lead-management-service';

describe('LeadManagementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createLead', () => {
    it('should create a new lead with valid data', async () => {
      const mockLead = {
        id: 'lead-123',
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        company: 'Test Company',
        source: 'website',
        priority: 'high',
        leadScore: '75',
        estimatedValue: '10000',
        probability: '80',
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const leadData = {
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        company: 'Test Company',
        source: 'website' as const,
        priority: 'high' as const,
        estimatedValue: 10000,
        probability: 80,
      };

      // Mock database insert
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockLead]),
        }),
      });

      const result = await createLead(leadData);

      expect(result).toEqual(mockLead);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const leadData = {
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        source: 'website' as const,
      };

      // Mock database to throw error
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      await expect(createLead(leadData)).rejects.toThrow('Failed to create lead');
    });
  });

  describe('getLeadById', () => {
    it('should return lead when found', async () => {
      const mockLead = {
        id: 'lead-123',
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: 'new',
      };

      mockDb.query.leads.findFirst.mockResolvedValue(mockLead);

      const result = await getLeadById('lead-123', 'user-123');

      expect(result).toEqual(mockLead);
      expect(mockDb.query.leads.findFirst).toHaveBeenCalled();
    });

    it('should return null when lead not found', async () => {
      mockDb.query.leads.findFirst.mockResolvedValue(null);

      const result = await getLeadById('non-existent', 'user-123');

      expect(result).toBeNull();
    });
  });

  describe('updateLeadStatus', () => {
    it('should update lead status successfully', async () => {
      const mockUpdatedLead = {
        id: 'lead-123',
        status: 'qualified',
        notes: 'Lead qualified after initial call',
      };

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedLead]),
          }),
        }),
      });

      const result = await updateLeadStatus('lead-123', 'user-123', 'qualified', 'Lead qualified after initial call');

      expect(result).toEqual(mockUpdatedLead);
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('createLeadActivity', () => {
    it('should create lead activity successfully', async () => {
      const mockActivity = {
        id: 'activity-123',
        leadId: 'lead-123',
        type: 'call',
        subject: 'Initial call with lead',
        description: 'Discussed project requirements',
        outcome: 'Positive response',
        nextSteps: 'Send proposal',
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockActivity]),
        }),
      });

      // Mock the update call for lead contact info
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      const activityData = {
        userId: 'user-123',
        leadId: 'lead-123',
        type: 'call' as const,
        subject: 'Initial call with lead',
        description: 'Discussed project requirements',
        outcome: 'Positive response',
        nextSteps: 'Send proposal',
      };

      const result = await createLeadActivity(activityData);

      expect(result).toEqual(mockActivity);
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('createLeadTask', () => {
    it('should create lead task successfully', async () => {
      const mockTask = {
        id: 'task-123',
        leadId: 'lead-123',
        title: 'Follow up with lead',
        description: 'Call lead to discuss proposal',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(),
      };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockTask]),
        }),
      });

      const taskData = {
        userId: 'user-123',
        leadId: 'lead-123',
        title: 'Follow up with lead',
        description: 'Call lead to discuss proposal',
        priority: 'high' as const,
        dueDate: new Date(),
      };

      const result = await createLeadTask(taskData);

      expect(result).toEqual(mockTask);
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('getLeadStats', () => {
    it('should return lead statistics', async () => {
      const mockStats = {
        totalLeads: 50,
        newLeads: 10,
        qualifiedLeads: 15,
        convertedLeads: 5,
        totalValue: 100000,
        conversionRate: 10,
        averageLeadScore: 75,
        leadsByStatus: [],
        leadsBySource: [],
        topPerformingSources: [],
        recentActivities: [],
      };

      // Mock the complex query structure
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ 
            totalLeads: 50,
            newLeads: 10,
            qualifiedLeads: 15,
            convertedLeads: 5,
            totalValue: 100000,
            averageLeadScore: 75
          }]),
        }),
      });

      // Mock additional select calls
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              groupBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              groupBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }),
        });

      const result = await getLeadStats('user-123');

      expect(result).toHaveProperty('totalLeads');
      expect(result).toHaveProperty('conversionRate');
      expect(result).toHaveProperty('leadsByStatus');
      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe('convertLeadToClient', () => {
    it('should convert lead to client successfully', async () => {
      const mockUpdatedLead = {
        id: 'lead-123',
        status: 'closed_won',
        convertedToClient: true,
        clientId: 'client-123',
      };

      const mockClient = {
        id: 'client-123',
        companyName: 'Test Company',
        email: 'john@example.com',
      };

      // Mock client creation
      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockClient]),
        }),
      });

      // Mock lead update
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedLead]),
          }),
        }),
      });

      // Mock activity creation
      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'activity-123',
            type: 'conversion',
            subject: 'Lead converted to client',
          }]),
        }),
      });

      const clientData = {
        companyName: 'Test Company',
        email: 'john@example.com',
      };

      const result = await convertLeadToClient('lead-123', 'user-123', clientData);

      expect(result.lead).toEqual(mockUpdatedLead);
      expect(result.clientId).toBe('client-123');
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });
});
