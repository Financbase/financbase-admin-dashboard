/**
 * Very Simple Lead Management Service Tests
 * Just test that the service can be imported and functions exist
 */

import { describe, it, expect } from 'vitest';

describe('LeadManagementService', () => {
  it('should be importable', async () => {
    const service = await import('@/lib/services/lead-management-service');
    expect(service).toBeDefined();
  });

  it('should have LeadManagementService export', async () => {
    const { LeadManagementService } = await import('@/lib/services/lead-management-service');
    expect(LeadManagementService).toBeDefined();
    expect(typeof LeadManagementService).toBe('object');
  });

  it('should have required service methods', async () => {
    const { LeadManagementService } = await import('@/lib/services/lead-management-service');
    
    expect(typeof LeadManagementService.createLead).toBe('function');
    expect(typeof LeadManagementService.getLeadById).toBe('function');
    expect(typeof LeadManagementService.updateLeadStatus).toBe('function');
    expect(typeof LeadManagementService.createLeadActivity).toBe('function');
    expect(typeof LeadManagementService.createLeadTask).toBe('function');
    expect(typeof LeadManagementService.getLeadStats).toBe('function');
    expect(typeof LeadManagementService.convertLeadToClient).toBe('function');
  });
});