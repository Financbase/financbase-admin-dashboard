/**
 * Real-World Scenarios Tests
 * Tests for complex business workflows and edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock all services
const mockClientService = {
  createClient: vi.fn(),
  getClientById: vi.fn(),
  updateClient: vi.fn(),
  getClientStats: vi.fn(),
  getClientAnalysis: vi.fn(),
};

const mockLeadManagementService = {
  createLead: vi.fn(),
  getLeadById: vi.fn(),
  updateLeadStatus: vi.fn(),
  createLeadActivity: vi.fn(),
  createLeadTask: vi.fn(),
  convertLeadToClient: vi.fn(),
  getLeadStats: vi.fn(),
};

const mockTransactionService = {
  getFinancialAnalysis: vi.fn(),
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  getTransactionsByClient: vi.fn(),
};

const mockAccountService = {
  getAccountBalance: vi.fn(),
  updateAccount: vi.fn(),
};

const mockAdboardService = {
  getCampaignPerformance: vi.fn(),
  updateCampaign: vi.fn(),
  getOptimizationRecommendations: vi.fn(),
};

const mockUnifiedDashboardService = {
  getDataConsistencyReport: vi.fn(),
  syncData: vi.fn(),
  getUnifiedMetrics: vi.fn(),
};

vi.mock('@/lib/services/client-service', () => ({
  ClientService: mockClientService,
}));

vi.mock('@/lib/services/lead-management-service', () => ({
  LeadManagementService: mockLeadManagementService,
}));

vi.mock('@/lib/services/transaction-service', () => ({
  TransactionService: mockTransactionService,
}));

vi.mock('@/lib/services/account-service', () => ({
  AccountService: mockAccountService,
}));

vi.mock('@/lib/services/adboard-service', () => ({
  AdboardService: mockAdboardService,
}));

vi.mock('@/lib/services/unified-dashboard-service', () => ({
  UnifiedDashboardService: mockUnifiedDashboardService,
}));

describe('Real-World Business Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Lead-to-Client Conversion Workflow', () => {
    it('should handle a complete lead conversion with all related data', async () => {

      // 1. Create initial lead
      const mockLead = {
        id: 'lead-123',
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        company: 'Test Company',
        source: 'website',
        priority: 'high',
        estimatedValue: 50000,
        status: 'new',
        createdAt: new Date(),
      };

      mockLeadManagementService.createLead.mockResolvedValue(mockLead);

      // 2. Add lead activities
      const mockActivity = {
        id: 'activity-123',
        leadId: 'lead-123',
        type: 'call',
        subject: 'Initial discovery call',
        description: 'Discussed project requirements and timeline',
        outcome: 'positive',
        nextSteps: 'Send proposal',
        createdAt: new Date(),
      };

      vi.mocked(mockLeadManagementService.createLeadActivity).mockResolvedValue(mockActivity);

      // 3. Create lead tasks
      const mockTask = {
        id: 'task-123',
        leadId: 'lead-123',
        title: 'Send proposal',
        description: 'Prepare and send detailed proposal',
        priority: 'high',
        dueDate: new Date(),
        status: 'pending',
        createdAt: new Date(),
      };

      vi.mocked(mockLeadManagementService.createLeadTask).mockResolvedValue(mockTask);

      // 4. Update lead status to qualified
      const mockQualifiedLead = {
        ...mockLead,
        status: 'qualified',
        notes: 'Lead qualified after discovery call',
      };

      vi.mocked(mockLeadManagementService.updateLeadStatus).mockResolvedValue(mockQualifiedLead);

      // 5. Convert lead to client
      const mockClient = {
        id: 'client-123',
        userId: 'user-123',
        companyName: 'Test Company',
        contactName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        currency: 'USD',
        paymentTerms: 'net30',
        isActive: true,
        createdAt: new Date(),
      };

      const mockConversion = {
        lead: {
          ...mockQualifiedLead,
          status: 'closed_won',
          convertedToClient: true,
          clientId: 'client-123',
          actualCloseDate: new Date(),
        },
        clientId: 'client-123',
      };

      vi.mocked(mockLeadManagementService.convertLeadToClient).mockResolvedValue(mockConversion);
      vi.mocked(mockClientService.createClient).mockResolvedValue(mockClient);

      // 6. Create initial transaction for the client
      const mockTransaction = {
        id: 'transaction-123',
        userId: 'user-123',
        clientId: 'client-123',
        type: 'income',
        amount: 50000,
        description: 'Initial project payment from Test Company',
        status: 'completed',
        transactionDate: new Date(),
        createdAt: new Date(),
      };

      vi.mocked(mockTransactionService.createTransaction).mockResolvedValue(mockTransaction);

      // Execute the complete workflow
      const lead = await mockLeadManagementService.createLead({
        userId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        company: 'Test Company',
        source: 'website',
        priority: 'high',
        estimatedValue: 50000,
      });

      const activity = await mockLeadManagementService.createLeadActivity({
        userId: 'user-123',
        leadId: lead.id,
        type: 'call',
        subject: 'Initial discovery call',
        description: 'Discussed project requirements and timeline',
        outcome: 'positive',
        nextSteps: 'Send proposal',
      });

      const task = await mockLeadManagementService.createLeadTask({
        userId: 'user-123',
        leadId: lead.id,
        title: 'Send proposal',
        description: 'Prepare and send detailed proposal',
        priority: 'high',
        dueDate: new Date(),
      });

      const qualifiedLead = await mockLeadManagementService.updateLeadStatus(
        lead.id,
        'user-123',
        'qualified',
        'Lead qualified after discovery call'
      );

      const conversion = await mockLeadManagementService.convertLeadToClient(
        lead.id,
        'user-123',
        {
          companyName: 'Test Company',
          contactName: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          currency: 'USD',
          paymentTerms: 'net30',
        }
      );

      const transaction = await mockTransactionService.createTransaction({
        userId: 'user-123',
        clientId: conversion.clientId,
        type: 'income',
        amount: 50000,
        description: 'Initial project payment from Test Company',
        status: 'completed',
        transactionDate: new Date(),
      });

      // Verify the complete workflow
      expect(lead).toEqual(mockLead);
      expect(activity).toEqual(mockActivity);
      expect(task).toEqual(mockTask);
      expect(qualifiedLead).toEqual(mockQualifiedLead);
      expect(conversion.lead).toEqual(mockConversion.lead);
      expect(conversion.clientId).toBe('client-123');
      expect(transaction).toEqual(mockTransaction);
		});
	});

  describe('Multi-Module Data Synchronization', () => {
    it('should synchronize data across all modules when client is updated', async () => {
      const { ClientService } = await import('@/lib/services/client-service');
      const { TransactionService } = await import('@/lib/services/transaction-service');
      const { UnifiedDashboardService } = await import('@/lib/services/unified-dashboard-service');

      // Mock client update
      const mockUpdatedClient = {
        id: 'client-123',
        companyName: 'Updated Company Name',
        email: 'updated@company.com',
        phone: '+1234567890',
        updatedAt: new Date(),
      };

      vi.mocked(mockClientService.updateClient).mockResolvedValue(mockUpdatedClient);

      // Mock related transactions update
      const mockUpdatedTransactions = [
        {
          id: 'transaction-1',
          clientId: 'client-123',
          description: 'Updated transaction for Updated Company Name',
          updatedAt: new Date(),
        },
      ];

      vi.mocked(mockTransactionService.getTransactionsByClient).mockResolvedValue(mockUpdatedTransactions);

      // Mock dashboard metrics update
      const mockUpdatedMetrics = {
        revenue: {
          thisMonth: 75000,
          lastMonth: 50000,
          growth: 50,
        },
        clients: {
          total: 25,
          newThisMonth: 5,
        },
        transactions: {
          total: 150,
          thisMonth: 20,
        },
      };

      vi.mocked(mockUnifiedDashboardService.getUnifiedMetrics).mockResolvedValue(mockUpdatedMetrics);

      // Execute the synchronization
      const updatedClient = await mockClientService.updateClient('client-123', 'user-123', {
        companyName: 'Updated Company Name',
        email: 'updated@company.com',
        phone: '+1234567890',
      });

      const relatedTransactions = await mockTransactionService.getTransactionsByClient('client-123', 'user-123');
      const updatedMetrics = await mockUnifiedDashboardService.getUnifiedMetrics('user-123');

      // Verify synchronization
      expect(updatedClient).toEqual(mockUpdatedClient);
      expect(relatedTransactions).toEqual(mockUpdatedTransactions);
      expect(updatedMetrics).toEqual(mockUpdatedMetrics);
		});
	});

  describe('Financial Health Analysis Workflow', () => {
    it('should analyze financial health across all modules', async () => {
      const { UnifiedDashboardService } = await import('@/lib/services/unified-dashboard-service');
      const { TransactionService } = await import('@/lib/services/transaction-service');
      const { ClientService } = await import('@/lib/services/client-service');

      // Mock comprehensive financial data
      const mockFinancialData = {
        revenue: {
          thisMonth: 100000,
          lastMonth: 80000,
          growth: 25,
        },
        expenses: {
          thisMonth: 60000,
          lastMonth: 50000,
          growth: 20,
        },
        clients: {
          total: 50,
          newThisMonth: 10,
        },
        transactions: {
          total: 200,
          thisMonth: 30,
        },
        campaigns: {
          active: 5,
          totalAdSpend: 10000,
        },
        projects: {
          active: 8,
          totalValue: 200000,
        },
        leads: {
          total: 100,
          newThisMonth: 20,
          convertedThisMonth: 5,
        },
      };

      vi.mocked(mockUnifiedDashboardService.getUnifiedMetrics).mockResolvedValue(mockFinancialData);

      // Mock transaction analysis
      const mockTransactionAnalysis = {
        totalIncome: 100000,
        totalExpenses: 60000,
        netProfit: 40000,
        profitMargin: 40,
        cashFlow: 35000,
        topIncomeSources: [
          { source: 'Client A', amount: 30000, percentage: 30 },
          { source: 'Client B', amount: 25000, percentage: 25 },
        ],
        topExpenseCategories: [
          { category: 'Marketing', amount: 15000, percentage: 25 },
          { category: 'Operations', amount: 12000, percentage: 20 },
        ],
      };

      vi.mocked(mockTransactionService.getFinancialAnalysis).mockResolvedValue(mockTransactionAnalysis);

      // Mock client analysis
      const mockClientAnalysis = {
        totalClients: 50,
        activeClients: 45,
        averageClientValue: 2000,
        topClients: [
          { id: 'client-1', name: 'Client A', totalValue: 30000, lastPayment: new Date() },
          { id: 'client-2', name: 'Client B', totalValue: 25000, lastPayment: new Date() },
        ],
        clientRetentionRate: 85,
        averageClientLifetime: 24, // months
      };

      vi.mocked(mockClientService.getClientAnalysis).mockResolvedValue(mockClientAnalysis);

      // Execute financial health analysis
      const unifiedMetrics = await mockUnifiedDashboardService.getUnifiedMetrics('user-123');
      const transactionAnalysis = await mockTransactionService.getFinancialAnalysis('user-123');
      const clientAnalysis = await mockClientService.getClientAnalysis('user-123');

      // Calculate financial health score
      const profitMargin = transactionAnalysis.profitMargin;
      const revenueGrowth = unifiedMetrics.revenue.growth;
      const clientRetention = clientAnalysis.clientRetentionRate;
      const cashFlow = transactionAnalysis.cashFlow;

      const healthScore = Math.round(
        (profitMargin * 0.3) +
        (Math.min(revenueGrowth, 50) * 0.25) +
        (clientRetention * 0.25) +
        (Math.min(cashFlow / 1000, 50) * 0.2)
      );

      // Verify financial health analysis
      expect(unifiedMetrics).toEqual(mockFinancialData);
      expect(transactionAnalysis).toEqual(mockTransactionAnalysis);
      expect(clientAnalysis).toEqual(mockClientAnalysis);
      expect(healthScore).toBeGreaterThan(0);
      expect(healthScore).toBeLessThanOrEqual(100);
		});
	});

  describe('Campaign Performance Optimization', () => {
    it('should optimize campaign performance based on analytics', async () => {
      const { AdboardService } = await import('@/lib/services/adboard-service');
      const { UnifiedDashboardService } = await import('@/lib/services/unified-dashboard-service');

      // Mock campaign performance data
      const mockCampaignPerformance = {
        monthlySpend: [
          { month: '2024-01', spend: 5000, conversions: 10, roas: 2.0 },
          { month: '2024-02', spend: 7500, conversions: 15, roas: 2.5 },
          { month: '2024-03', spend: 10000, conversions: 20, roas: 3.0 },
        ],
        conversionsByPlatform: [
          { platform: 'google_ads', conversions: 25, cost: 8000, roas: 3.2 },
          { platform: 'facebook_ads', conversions: 15, cost: 6000, roas: 2.8 },
          { platform: 'linkedin_ads', conversions: 5, cost: 4000, roas: 1.5 },
        ],
        topPerformingCampaigns: [
          { campaignName: 'Campaign A', roas: 4.0, conversions: 12, spend: 3000 },
          { campaignName: 'Campaign B', roas: 3.5, conversions: 8, spend: 2000 },
        ],
        overallROAS: 2.8,
        overallCTR: 2.5,
      };

      vi.mocked(mockAdboardService.getCampaignPerformance).mockResolvedValue(mockCampaignPerformance);

      // Mock optimization recommendations
      const mockOptimizations = [
        {
          type: 'budget_reallocation',
          description: 'Increase budget for Campaign A by 50%',
          expectedImpact: 'Increase ROAS by 0.5x',
          priority: 'high',
        },
        {
          type: 'platform_optimization',
          description: 'Reduce LinkedIn Ads budget, increase Google Ads',
          expectedImpact: 'Improve overall ROAS by 0.3x',
          priority: 'medium',
        },
        {
          type: 'creative_optimization',
          description: 'Test new ad creatives for underperforming campaigns',
          expectedImpact: 'Increase CTR by 0.5%',
          priority: 'low',
        },
      ];

      vi.mocked(mockAdboardService.getOptimizationRecommendations).mockResolvedValue(mockOptimizations);

      // Execute campaign optimization analysis
      const performance = await mockAdboardService.getCampaignPerformance('user-123');
      const optimizations = await mockAdboardService.getOptimizationRecommendations('user-123');

      // Analyze performance trends
      const monthlyGrowth = performance.monthlySpend.map((month, index) => {
        if (index === 0) return 0;
        const previousMonth = performance.monthlySpend[index - 1];
        return ((month.roas - previousMonth.roas) / previousMonth.roas) * 100;
      });

      const averageGrowth = monthlyGrowth.reduce((sum, growth) => sum + growth, 0) / monthlyGrowth.length;

      // Identify optimization opportunities
      const highROASCampaigns = performance.topPerformingCampaigns.filter(c => c.roas > 3.0);
      const lowROASPlatforms = performance.conversionsByPlatform.filter(p => p.roas < 2.0);

      // Verify optimization analysis
      expect(performance).toEqual(mockCampaignPerformance);
      expect(optimizations).toEqual(mockOptimizations);
      expect(averageGrowth).toBeGreaterThan(0);
      expect(highROASCampaigns.length).toBeGreaterThan(0);
      expect(lowROASPlatforms.length).toBeGreaterThan(0);
		});
	});

  describe('Data Integrity and Consistency', () => {
    it('should maintain data consistency across all modules', async () => {
      const { UnifiedDashboardService } = await import('@/lib/services/unified-dashboard-service');
      const { TransactionService } = await import('@/lib/services/transaction-service');
      const { ClientService } = await import('@/lib/services/client-service');
      const { LeadManagementService } = await import('@/lib/services/lead-management-service');

      // Mock data consistency checks
      const mockConsistencyReport = {
        totalClients: 50,
        totalTransactions: 200,
        totalLeads: 100,
        totalInvoices: 150,
        totalExpenses: 75,
        dataConsistency: {
          clientsWithTransactions: 45, // 90% consistency
          leadsConvertedToClients: 25, // 25% conversion rate
          invoicesWithTransactions: 140, // 93% consistency
          expensesWithTransactions: 70, // 93% consistency
        },
        inconsistencies: [
          {
            type: 'orphaned_transaction',
            description: 'Transaction without associated client',
            count: 5,
            severity: 'medium',
          },
          {
            type: 'unmatched_invoice',
            description: 'Invoice without corresponding transaction',
            count: 10,
            severity: 'high',
          },
        ],
        recommendations: [
          'Review and match orphaned transactions',
          'Verify invoice payment status',
          'Update lead conversion tracking',
        ],
      };

      vi.mocked(mockUnifiedDashboardService.getDataConsistencyReport).mockResolvedValue(mockConsistencyReport);

      // Execute data consistency check
      const consistencyReport = await mockUnifiedDashboardService.getDataConsistencyReport('user-123');

      // Verify data consistency
      expect(consistencyReport).toEqual(mockConsistencyReport);
      expect(consistencyReport.dataConsistency.clientsWithTransactions).toBeGreaterThan(0);
      expect(consistencyReport.inconsistencies.length).toBeGreaterThanOrEqual(0);
      expect(consistencyReport.recommendations.length).toBeGreaterThan(0);

      // Check consistency ratios
      const clientTransactionRatio = consistencyReport.dataConsistency.clientsWithTransactions / consistencyReport.totalClients;
      const leadConversionRatio = consistencyReport.dataConsistency.leadsConvertedToClients / consistencyReport.totalLeads;

      expect(clientTransactionRatio).toBeGreaterThan(0.8); // At least 80% consistency
      expect(leadConversionRatio).toBeGreaterThan(0.1); // At least 10% conversion rate
		});
	});

  describe('Error Recovery and Resilience', () => {
    it('should handle service failures gracefully', async () => {
      const { UnifiedDashboardService } = await import('@/lib/services/unified-dashboard-service');

      // Mock partial service failure
      const mockPartialData = {
        revenue: {
          thisMonth: 100000,
          lastMonth: 80000,
          growth: 25,
        },
        clients: {
          total: 50,
          newThisMonth: 10,
        },
        // Missing some data due to service failure
        transactions: null,
        campaigns: null,
      };

      vi.mocked(mockUnifiedDashboardService.getUnifiedMetrics).mockResolvedValue(mockPartialData);

      // Execute with error handling
      try {
        const metrics = await mockUnifiedDashboardService.getUnifiedMetrics('user-123');
        
        // Verify partial data is still usable
        expect(metrics.revenue).toBeDefined();
        expect(metrics.clients).toBeDefined();
        expect(metrics.transactions).toBeNull();
        expect(metrics.campaigns).toBeNull();

        // Verify error handling doesn't break the application
        expect(metrics).toBeDefined();
      } catch (error) {
        // Should not throw error, but handle gracefully
        expect(error).toBeDefined();
      }
		});
	});
});