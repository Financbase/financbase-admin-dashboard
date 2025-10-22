/**
 * Test Data Seeders
 * Utilities for seeding realistic test data in the database
 */

import { testDb } from './test-db';
import * as schema from '../lib/db/schemas/index';
import { eq, sql as dsql } from 'drizzle-orm';

// Test data factories
export class TestDataFactory {
  static async createTestUser(overrides: Partial<typeof schema.users.$inferInsert> = {}) {
    const userData = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: 'test@example.com',
      name: 'Test User',
      isActive: true,
      role: 'user' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };

    // Use schema-aware Drizzle insert
    const [user] = await testDb.insert(schema.users).values(userData).returning();
    return user;
  }

  static async createTestClient(userId: string, overrides: Partial<typeof schema.clients.$inferInsert> = {}) {
    const clientData = {
      id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      companyName: 'Test Company Inc.',
      contactName: 'John Doe',
      email: `client-${Date.now()}@example.com`,
      phone: '+1234567890',
      currency: 'USD',
      paymentTerms: 'net30',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };

    await testDb.insert(schema.clients).values(clientData);
    return clientData;
  }

  static async createTestLead(userId: string, overrides: Partial<typeof schema.leads.$inferInsert> = {}) {
    const leadData = {
      id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      firstName: 'Jane',
      lastName: 'Smith',
      email: `lead-${Date.now()}@example.com`,
      company: 'Prospect Company',
      source: 'website' as const,
      priority: 'high' as const,
      estimatedValue: '50000',
      status: 'new' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };

    await testDb.insert(schema.leads).values(leadData);
    return leadData;
  }

  static async createTestTransaction(userId: string, clientId: string, overrides: Partial<typeof schema.transactions.$inferInsert> = {}) {
    const transactionData = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      transactionNumber: `TXN-${Date.now()}`,
      type: 'income' as const, // Updated to use income instead of credit
      amount: 10000.00, // Store as number, not string
      currency: 'USD',
      description: 'Test transaction',
      category: 'income' as const,
      status: 'completed' as const,
      transactionDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };

    await testDb.insert(schema.transactions).values(transactionData);
    return transactionData;
  }

  static async createTestProject(userId: string, clientId: string, overrides: Partial<typeof schema.projects.$inferInsert> = {}) {
    const projectData = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      clientId,
      name: 'Test Project',
      description: 'A test project for development',
      status: 'active' as const,
      budget: '25000.00',
      startDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };

    await testDb.insert(schema.projects).values(projectData);
    return projectData;
  }

  static async createTestCampaign(userId: string, overrides: Partial<typeof schema.campaigns.$inferInsert> = {}) {
    const campaignData = {
      id: `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      name: 'Test Campaign',
      type: 'search' as const,
      status: 'active' as const,
      platform: 'google_ads',
      budget: '5000.00',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };

    await testDb.insert(schema.campaigns).values(campaignData);
    return campaignData;
  }

  // Bulk seeding utilities
  static async seedBasicTestData(userId?: string) {
    // Create a test user if not provided
    const testUser = userId ? { id: userId } : await this.createTestUser();

    // Create test client
    const testClient = await this.createTestClient(testUser.id);

    // Create test lead
    const testLead = await this.createTestLead(testUser.id);

    // Create test transaction
    const testTransaction = await this.createTestTransaction(testUser.id, testClient.id);

    // Create test project
    const testProject = await this.createTestProject(testUser.id, testClient.id);

    // Create test campaign
    const testCampaign = await this.createTestCampaign(testUser.id);

    return {
      user: testUser,
      client: testClient,
      lead: testLead,
      transaction: testTransaction,
      project: testProject,
      campaign: testCampaign,
    };
  }

  static async seedComplexTestData(userId?: string) {
    const basicData = await this.seedBasicTestData(userId);

    // Add more complex relationships
    const { user, client, lead, project } = basicData;

    // Create lead activities
    const leadActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      leadId: lead.id,
      userId: user.id,
      type: 'call' as const,
      subject: 'Initial discovery call',
      description: 'Discussed project requirements',
      outcome: 'positive',
      nextSteps: 'Send proposal',
      createdAt: new Date(),
    };
    await testDb.insert(schema.leadActivities).values(leadActivity);

    // Create lead task
    const leadTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      leadId: lead.id,
      userId: user.id,
      title: 'Send proposal',
      description: 'Prepare and send detailed proposal',
      priority: 'high' as const,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'pending' as const,
      createdAt: new Date(),
    };
    await testDb.insert(schema.leadTasks).values(leadTask);

    // Create project tasks
    const projectTask = {
      id: `ptask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId: project.id,
      userId: user.id,
      title: 'Initial development',
      description: 'Start development work',
      priority: 'high' as const,
      status: 'in_progress' as const,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
    await testDb.insert(schema.tasks).values(projectTask);

    return {
      ...basicData,
      leadActivity,
      leadTask,
      projectTask,
    };
  }
}

// Test data cleanup utilities
export class TestDataCleanup {
  static async deleteUser(userId: string) {
    // Delete in reverse dependency order
    await testDb.delete(schema.leadTasks).where(eq(schema.leadTasks.userId, userId));
    await testDb.delete(schema.leadActivities).where(eq(schema.leadActivities.userId, userId));
    await testDb.delete(schema.leads).where(eq(schema.leads.userId, userId));
    await testDb.delete(schema.transactions).where(eq(schema.transactions.userId, userId));
    await testDb.delete(schema.tasks).where(eq(schema.tasks.userId, userId));
    await testDb.delete(schema.projects).where(eq(schema.projects.userId, userId));
    await testDb.delete(schema.clients).where(eq(schema.clients.userId, userId));
    await testDb.delete(schema.campaigns).where(eq(schema.campaigns.userId, userId));
    await testDb.delete(schema.ads).where(eq(schema.ads.userId, userId));
    await testDb.delete(schema.adGroups).where(eq(schema.adGroups.userId, userId));
    // Analytics doesn't have userId field, skip
    await testDb.delete(schema.activities).where(eq(schema.activities.userId, userId));
    await testDb.delete(schema.accounts).where(eq(schema.accounts.userId, userId));
    await testDb.delete(schema.paymentMethods).where(eq(schema.paymentMethods.userId, userId));
    await testDb.delete(schema.organizations).where(eq(schema.organizations.ownerId, userId));
    await testDb.delete(schema.organizationMembers).where(eq(schema.organizationMembers.userId, userId));
    await testDb.delete(schema.users).where(eq(schema.users.id, userId));
  }

  static async deleteTestDataByPrefix(prefix: string) {
    // Delete records where ID starts with the prefix
    const tablesToClean = [
      'lead_tasks',
      'lead_activities',
      'leads',
      'transactions',
      'tasks',
      'projects',
      'clients',
      'campaigns',
      'ads',
      'ad_groups',
      'activities',
      'accounts',
      'payment_methods',
      'organizations',
      'organization_members',
      'users',
    ];

    for (const tableName of tablesToClean) {
      try {
        await testDb.execute(dsql.raw(`DELETE FROM "${tableName}" WHERE id LIKE '${prefix}%'`));
      } catch (error) {
        // Ignore constraint errors during cleanup
        console.warn(`Could not delete from ${tableName}:`, error);
      }
    }
  }
}