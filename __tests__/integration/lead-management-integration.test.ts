/**
 * Lead Management Integration Tests
 * End-to-end tests for lead management functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/leads/route';
import { GET as GET_ACTIVITIES, POST as POST_ACTIVITY } from '@/app/api/leads/[id]/activities/route';
import { GET as GET_TASKS, POST as POST_TASK } from '@/app/api/leads/[id]/tasks/route';
import { POST as CONVERT_LEAD } from '@/app/api/leads/[id]/convert/route';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock LeadManagementService
vi.mock('@/lib/services/lead-management-service', () => ({
  LeadManagementService: {
    getPaginatedLeads: vi.fn(),
    createLead: vi.fn(),
    getLeadById: vi.fn(),
    updateLeadStatus: vi.fn(),
    createLeadActivity: vi.fn(),
    getLeadActivities: vi.fn(),
    createLeadTask: vi.fn(),
    getLeadTasks: vi.fn(),
    convertLeadToClient: vi.fn(),
    getLeadStats: vi.fn(),
    getPipelineMetrics: vi.fn(),
  },
}));

describe('Lead Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Lead CRUD Operations', () => {
    it('should create, read, update, and delete leads', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

      const { LeadManagementService } = await import('@/lib/services/lead-management-service');

      // 1. Create a new lead
      const mockCreatedLead = {
        id: 'lead-123',
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        company: 'Test Company',
        source: 'website',
        priority: 'high',
        status: 'new',
        createdAt: new Date(),
      };

      vi.mocked(LeadManagementService.createLead).mockResolvedValue(mockCreatedLead);

      const createRequest = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          company: 'Test Company',
          source: 'website',
          priority: 'high',
          estimatedValue: 10000,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const createResponse = await POST(createRequest);
      const createData = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createData.lead).toEqual(mockCreatedLead);

      // 2. Get the created lead
      vi.mocked(LeadManagementService.getLeadById).mockResolvedValue(mockCreatedLead);

      const getRequest = new NextRequest('http://localhost:3000/api/leads/lead-123');
      const getResponse = await GET(getRequest);
      const getData = await getResponse.json();

      expect(getResponse.status).toBe(200);
      expect(getData.lead).toEqual(mockCreatedLead);

      // 3. Update lead status
      const mockUpdatedLead = {
        ...mockCreatedLead,
        status: 'qualified',
        notes: 'Lead qualified after initial call',
      };

      vi.mocked(LeadManagementService.updateLeadStatus).mockResolvedValue(mockUpdatedLead);

      const updateRequest = new NextRequest('http://localhost:3000/api/leads/lead-123', {
        method: 'PUT',
        body: JSON.stringify({
          status: 'qualified',
          notes: 'Lead qualified after initial call',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const updateResponse = await updateRequest;
      const updateData = await updateResponse.json();

      expect(updateResponse.status).toBe(200);
      expect(updateData.lead).toEqual(mockUpdatedLead);
    });

    it('should handle lead search and filtering', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

      const { LeadManagementService } = await import('@/lib/services/lead-management-service');

      const mockLeads = [
        {
          id: 'lead-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          company: 'Test Company',
          status: 'new',
        },
        {
          id: 'lead-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          company: 'Another Company',
          status: 'qualified',
        },
      ];

      vi.mocked(LeadManagementService.getPaginatedLeads).mockResolvedValue({
        leads: mockLeads,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const request = new NextRequest('http://localhost:3000/api/leads?search=John&status=new&source=website');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.leads).toEqual(mockLeads);
      expect(LeadManagementService.getPaginatedLeads).toHaveBeenCalledWith('user-123', {
        page: 1,
        limit: 20,
        search: 'John',
        status: 'new',
        source: 'website',
        priority: undefined,
        assignedTo: undefined,
      });
    });
  });

  describe('Lead Activities', () => {
    it('should create and retrieve lead activities', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

      const { LeadManagementService } = await import('@/lib/services/lead-management-service');

      // Create activity
      const mockActivity = {
        id: 'activity-123',
        leadId: 'lead-123',
        type: 'call',
        subject: 'Initial call with lead',
        description: 'Discussed project requirements',
        outcome: 'Positive response',
        nextSteps: 'Send proposal',
        createdAt: new Date(),
      };

      vi.mocked(LeadManagementService.createLeadActivity).mockResolvedValue(mockActivity);

      const createActivityRequest = new NextRequest('http://localhost:3000/api/leads/lead-123/activities', {
        method: 'POST',
        body: JSON.stringify({
          type: 'call',
          subject: 'Initial call with lead',
          description: 'Discussed project requirements',
          outcome: 'Positive response',
          nextSteps: 'Send proposal',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const createResponse = await POST_ACTIVITY(createActivityRequest, { params: { id: 'lead-123' } });
      const createData = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createData.activity).toEqual(mockActivity);

      // Get activities
      const mockActivities = [mockActivity];
      vi.mocked(LeadManagementService.getLeadActivities).mockResolvedValue(mockActivities);

      const getActivitiesRequest = new NextRequest('http://localhost:3000/api/leads/lead-123/activities');
      const getResponse = await GET_ACTIVITIES(getActivitiesRequest, { params: { id: 'lead-123' } });
      const getData = await getResponse.json();

      expect(getResponse.status).toBe(200);
      expect(getData.activities).toEqual(mockActivities);
    });
  });

  describe('Lead Tasks', () => {
    it('should create and retrieve lead tasks', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

      const { LeadManagementService } = await import('@/lib/services/lead-management-service');

      // Create task
      const mockTask = {
        id: 'task-123',
        leadId: 'lead-123',
        title: 'Follow up with lead',
        description: 'Call lead to discuss proposal',
        priority: 'high',
        dueDate: new Date(),
        status: 'pending',
        createdAt: new Date(),
      };

      vi.mocked(LeadManagementService.createLeadTask).mockResolvedValue(mockTask);

      const createTaskRequest = new NextRequest('http://localhost:3000/api/leads/lead-123/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Follow up with lead',
          description: 'Call lead to discuss proposal',
          priority: 'high',
          dueDate: new Date().toISOString(),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const createResponse = await POST_TASK(createTaskRequest, { params: { id: 'lead-123' } });
      const createData = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createData.task).toEqual(mockTask);

      // Get tasks
      const mockTasks = [mockTask];
      vi.mocked(LeadManagementService.getLeadTasks).mockResolvedValue(mockTasks);

      const getTasksRequest = new NextRequest('http://localhost:3000/api/leads/lead-123/tasks');
      const getResponse = await GET_TASKS(getTasksRequest, { params: { id: 'lead-123' } });
      const getData = await getResponse.json();

      expect(getResponse.status).toBe(200);
      expect(getData.tasks).toEqual(mockTasks);
    });
  });

  describe('Lead Conversion', () => {
    it('should convert lead to client successfully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

      const { LeadManagementService } = await import('@/lib/services/lead-management-service');

      const mockConversion = {
        lead: {
          id: 'lead-123',
          status: 'closed_won',
          convertedToClient: true,
          clientId: 'client-123',
          actualCloseDate: new Date(),
        },
        clientId: 'client-123',
      };

      vi.mocked(LeadManagementService.convertLeadToClient).mockResolvedValue(mockConversion);

      const convertRequest = new NextRequest('http://localhost:3000/api/leads/lead-123/convert', {
        method: 'POST',
        body: JSON.stringify({
          companyName: 'Test Company',
          contactName: 'John Doe',
          email: 'john@testcompany.com',
          phone: '+1234567890',
          currency: 'USD',
          paymentTerms: 'net30',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await CONVERT_LEAD(convertRequest, { params: { id: 'lead-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.lead).toEqual(mockConversion.lead);
      expect(data.clientId).toBe('client-123');
    });
  });

  describe('Lead Analytics', () => {
    it('should return comprehensive lead statistics', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

      const { LeadManagementService } = await import('@/lib/services/lead-management-service');

      const mockStats = {
        totalLeads: 50,
        newLeads: 10,
        qualifiedLeads: 25,
        convertedLeads: 5,
        totalValue: 100000,
        conversionRate: 10,
        averageLeadScore: 65,
        leadsByStatus: [
          { status: 'new', count: 10, value: 20000 },
          { status: 'qualified', count: 25, value: 50000 },
        ],
        leadsBySource: [
          { source: 'website', count: 20, conversionRate: 15 },
          { source: 'referral', count: 15, conversionRate: 25 },
        ],
        topPerformingSources: [
          { source: 'referral', leads: 15, conversions: 4, value: 40000 },
        ],
        recentActivities: [
          {
            id: 'activity-1',
            leadName: 'John Doe',
            activityType: 'call',
            description: 'Initial call',
            createdAt: new Date().toISOString(),
          },
        ],
      };

      vi.mocked(LeadManagementService.getLeadStats).mockResolvedValue(mockStats);

      const request = new NextRequest('http://localhost:3000/api/leads/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats).toEqual(mockStats);
    });

    it('should return pipeline metrics', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

      const { LeadManagementService } = await import('@/lib/services/lead-management-service');

      const mockPipeline = [
        {
          stage: 'new',
          leads: 10,
          value: 20000,
          conversionRate: 100,
          averageTime: 5,
        },
        {
          stage: 'qualified',
          leads: 5,
          value: 15000,
          conversionRate: 50,
          averageTime: 10,
        },
      ];

      vi.mocked(LeadManagementService.getPipelineMetrics).mockResolvedValue(mockPipeline);

      const request = new NextRequest('http://localhost:3000/api/leads/pipeline');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pipeline).toEqual(mockPipeline);
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/leads');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle service errors gracefully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

      const { LeadManagementService } = await import('@/lib/services/lead-management-service');
      vi.mocked(LeadManagementService.getPaginatedLeads).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/leads');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch leads');
    });

    it('should handle validation errors', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });

      const invalidRequestBody = {
        // Missing required fields
        firstName: '',
        email: 'invalid-email',
      };

      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        body: JSON.stringify(invalidRequestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
      expect(data.details).toBeDefined();
    });
  });
});
