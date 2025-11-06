/**
 * Test for Advanced Test Data Manager
 * Validates the sophisticated seeding scenarios work correctly
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AdvancedTestDataManager } from './advanced-test-data';
import { testDatabase } from './test-db';
import { TestDataCleanup } from './test-data';

describe('AdvancedTestDataManager', () => {
  beforeAll(async () => {
    await testDatabase.setup();
  });

  afterAll(async () => {
    await TestDataCleanup.deleteTestDataByPrefix('user-');
    await TestDataCleanup.deleteTestDataByPrefix('client-');
    await TestDataCleanup.deleteTestDataByPrefix('lead-');
    await TestDataCleanup.deleteTestDataByPrefix('project-');
    await TestDataCleanup.deleteTestDataByPrefix('txn-');
    await testDatabase.cleanup();
  });

  describe('seedRealisticBusinessScenario', () => {
    it('should create realistic business data with proper relationships', async () => {
      // Clean database first
      await testDatabase.cleanup();

      const result = await AdvancedTestDataManager.seedRealisticBusinessScenario({
        userCount: 2,
        clientCount: 3,
        projectCount: 4,
        transactionCount: 6,
        leadCount: 5,
      });

      expect(result.users).toHaveLength(2);
      expect(result.clients).toHaveLength(3);
      expect(result.projects).toHaveLength(4);
      expect(result.transactions).toHaveLength(6);
      expect(result.leads).toHaveLength(5);

      // Validate data integrity
      const validations = await AdvancedTestDataManager.validateDataIntegrity({
        users: result.users,
        clients: result.clients,
        projects: result.projects.map(p => ({ id: p.id, clientId: p.clientId || '', userId: p.userId })),
      });
      const failedValidations = validations.filter(v => !v.valid);
      expect(failedValidations).toHaveLength(0);
    });

    it('should generate performance report with correct metrics', async () => {
      // Clean database first
      await testDatabase.cleanup();

      const testData = await AdvancedTestDataManager.seedRealisticBusinessScenario({
        userCount: 1,
        clientCount: 2,
        projectCount: 2,
        transactionCount: 3,
        leadCount: 2,
      });

      const report = await AdvancedTestDataManager.generatePerformanceReport(testData);

      expect(report.dataSummary.totalUsers).toBe(1);
      expect(report.dataSummary.totalClients).toBe(2);
      expect(report.dataSummary.totalProjects).toBe(2);
      expect(report.dataSummary.totalTransactions).toBe(3);
      expect(report.dataSummary.totalLeads).toBe(2);
    });
  });

  describe('seedPerformanceTestData', () => {
    it('should scale data based on scaleFactor', async () => {
      // Clean database first
      await testDatabase.cleanup();

      const result = await AdvancedTestDataManager.seedPerformanceTestData({
        scaleFactor: 2,
      });

      // Should create 100 users (50 * 2), 50 clients (25 * 2), etc.
      expect(result.users).toHaveLength(100);
      expect(result.clients).toHaveLength(50);
      expect(result.projects).toHaveLength(80);
      expect(result.transactions).toHaveLength(200);
    });
  });
});