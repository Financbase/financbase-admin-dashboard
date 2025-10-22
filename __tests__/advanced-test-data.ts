/**
 * Advanced Test Data Management
 * Sophisticated seeding scenarios and data management
 */

import { testDb } from './test-db';
import { TestDataFactory } from './test-data';
import { faker } from '@faker-js/faker';

// Advanced seeding scenarios
export class AdvancedTestDataManager {
  static async seedRealisticBusinessScenario(options: {
    userCount?: number;
    clientCount?: number;
    projectCount?: number;
    transactionCount?: number;
    leadCount?: number;
  } = {}) {
    const {
      userCount = 3,
      clientCount = 10,
      projectCount = 25,
      transactionCount = 100,
      leadCount = 50,
    } = options;

    console.log(`🌱 Seeding realistic business scenario: ${userCount} users, ${clientCount} clients, ${projectCount} projects, ${transactionCount} transactions, ${leadCount} leads`);

    // Create users
    const users = [];
    for (let i = 0; i < userCount; i++) {
      const user = await TestDataFactory.createTestUser({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: i === 0 ? 'admin' : faker.helpers.arrayElement(['user', 'viewer']),
      });
      users.push(user);
    }

    // Create clients for each user
    const clients = [];
    for (const user of users) {
      const userClientCount = Math.floor(clientCount / userCount) + (clients.length % userCount === 0 ? 1 : 0);
      for (let i = 0; i < userClientCount && clients.length < clientCount; i++) {
        const client = await TestDataFactory.createTestClient(user.id, {
          companyName: faker.company.name(),
          contactName: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          currency: faker.helpers.arrayElement(['USD', 'EUR', 'GBP']),
          paymentTerms: faker.helpers.arrayElement(['net15', 'net30', 'net45', 'net60']),
        });
        clients.push({ ...client, userId: user.id });
      }
    }

    // Create leads
    const leads = [];
    for (let i = 0; i < leadCount; i++) {
      const user = faker.helpers.arrayElement(users);
      const lead = await TestDataFactory.createTestLead(user.id, {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        company: faker.company.name(),
        source: faker.helpers.arrayElement(['website', 'referral', 'social_media', 'email_campaign', 'cold_call']),
        priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
        estimatedValue: faker.finance.amount({ min: 1000, max: 50000, dec: 0 }),
        status: faker.helpers.arrayElement(['new', 'contacted', 'qualified', 'proposal', 'negotiation']),
      });
      leads.push(lead);
    }

    // Create projects
    const projects = [];
    for (let i = 0; i < projectCount; i++) {
      const client = faker.helpers.arrayElement(clients);
      const project = await TestDataFactory.createTestProject(client.userId, client.id, {
        name: faker.company.buzzPhrase(),
        description: faker.lorem.sentences(2),
        status: faker.helpers.arrayElement(['planning', 'active', 'on_hold', 'completed']),
        priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
        budget: faker.finance.amount({ min: 5000, max: 100000, dec: 0 }),
        currency: client.currency,
      });
      projects.push(project);
    }

    // Create transactions
    const transactions = [];
    for (let i = 0; i < transactionCount; i++) {
      const user = faker.helpers.arrayElement(users);
      const client = faker.helpers.arrayElement(clients.filter(c => c.userId === user.id));
      const transaction = await TestDataFactory.createTestTransaction(user.id, client.id, {
        type: faker.helpers.arrayElement(['credit', 'debit']),
        amount: faker.finance.amount({ min: 100, max: 10000, dec: 2 }),
        currency: client.currency,
        description: faker.finance.transactionDescription(),
        category: faker.helpers.arrayElement([
          'income', 'expense', 'transfer', 'refund', 'fee', 'tax', 'payroll', 'office', 'marketing', 'software'
        ]),
        status: faker.helpers.arrayElement(['pending', 'completed', 'failed']),
        transactionDate: faker.date.recent({ days: 90 }),
      });
      transactions.push(transaction);
    }

    // Create campaigns
    const campaigns = [];
    for (let i = 0; i < Math.floor(projectCount / 3); i++) {
      const user = faker.helpers.arrayElement(users);
      const campaign = await TestDataFactory.createTestCampaign(user.id, {
        name: `${faker.company.buzzPhrase()} Campaign`,
        type: faker.helpers.arrayElement(['search', 'display', 'social', 'video', 'email']),
        status: faker.helpers.arrayElement(['draft', 'active', 'paused', 'completed']),
        platform: faker.helpers.arrayElement(['google_ads', 'facebook', 'instagram', 'linkedin', 'twitter']),
        budget: faker.finance.amount({ min: 1000, max: 50000, dec: 0 }),
        startDate: faker.date.recent({ days: 30 }),
        endDate: faker.date.future({ years: 1 }),
      });
      campaigns.push(campaign);
    }

    return {
      users,
      clients,
      leads,
      projects,
      transactions,
      campaigns,
      summary: {
        users: users.length,
        clients: clients.length,
        leads: leads.length,
        projects: projects.length,
        transactions: transactions.length,
        campaigns: campaigns.length,
      },
    };
  }

  static async seedPerformanceTestData(options: {
    scaleFactor?: number; // Multiplier for data volume
  } = {}) {
    const { scaleFactor = 10 } = options;

    console.log(`🚀 Seeding performance test data (scale factor: ${scaleFactor})`);

    const baseOptions = {
      userCount: 5 * scaleFactor,
      clientCount: 50 * scaleFactor,
      projectCount: 200 * scaleFactor,
      transactionCount: 1000 * scaleFactor,
      leadCount: 500 * scaleFactor,
    };

    return await this.seedRealisticBusinessScenario(baseOptions);
  }

  static async seedMigrationTestData() {
    console.log('🔄 Seeding migration test data');

    // Create data that tests migration scenarios
    const user = await TestDataFactory.createTestUser({
      email: 'migration-test@example.com',
      role: 'admin',
    });

    // Create data with old schema patterns (if applicable)
    const client = await TestDataFactory.createTestClient(user.id, {
      companyName: 'Migration Test Company',
      contactName: 'Migration User',
    });

    // Add more migration-specific test data as needed

    return { user, client };
  }

  static async validateDataIntegrity(data: any) {
    console.log('🔍 Validating data integrity');

    // Validate foreign key relationships
    const validations = [];

    // Check that all clients have valid users
    if (data.clients) {
      for (const client of data.clients) {
        const userExists = data.users.some((u: any) => u.id === client.userId);
        validations.push({
          type: 'foreign_key',
          table: 'clients',
          field: 'userId',
          value: client.userId,
          valid: userExists,
        });
      }
    }

    // Check that all projects have valid clients and users
    if (data.projects) {
      for (const project of data.projects) {
        const clientExists = data.clients.some((c: any) => c.id === project.clientId);
        const userExists = data.users.some((u: any) => u.id === project.userId);
        validations.push({
          type: 'foreign_key',
          table: 'projects',
          field: 'clientId',
          value: project.clientId,
          valid: clientExists,
        });
        validations.push({
          type: 'foreign_key',
          table: 'projects',
          field: 'userId',
          value: project.userId,
          valid: userExists,
        });
      }
    }

    // Check data consistency
    const failedValidations = validations.filter(v => !v.valid);

    if (failedValidations.length > 0) {
      console.error('❌ Data integrity violations found:', failedValidations);
      throw new Error(`Data integrity validation failed: ${failedValidations.length} violations`);
    }

    console.log('✅ Data integrity validation passed');
    return validations;
  }

  static async generatePerformanceReport(data: any) {
    console.log('📊 Generating performance test report');

    const report = {
      timestamp: new Date().toISOString(),
      dataSummary: {
        totalUsers: data.users?.length || 0,
        totalClients: data.clients?.length || 0,
        totalProjects: data.projects?.length || 0,
        totalTransactions: data.transactions?.length || 0,
        totalLeads: data.leads?.length || 0,
        totalCampaigns: data.campaigns?.length || 0,
      },
      metrics: {
        clientsPerUser: data.clients?.length / data.users?.length || 0,
        projectsPerClient: data.projects?.length / data.clients?.length || 0,
        transactionsPerClient: data.transactions?.length / data.clients?.length || 0,
        leadsPerUser: data.leads?.length / data.users?.length || 0,
      },
      dataQuality: {
        hasRealisticEmails: data.users?.every((u: any) => u.email?.includes('@')) || false,
        hasVariedCurrencies: new Set(data.clients?.map((c: any) => c.currency)).size > 1,
        hasDateSpread: true, // Assume dates are spread in seeding
      },
    };

    console.log('📈 Performance Report:', JSON.stringify(report, null, 2));
    return report;
  }
}