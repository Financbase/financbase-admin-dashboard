/**
 * Comprehensive Test Data Seeder
 * Creates realistic test data for dashboard components and testing scenarios
 */

import { faker } from '@faker-js/faker';
import { db } from '@/lib/db';
import { 
  clients, 
  leads, 
  transactions, 
  accounts, 
  expenses, 
  invoices, 
  projects, 
  properties,
  campaigns,
  reports,
  notifications,
  aiConversations,
  aiMessages,
  collaborationSessions,
  timeEntries,
  tenants,
  payments
} from '@/lib/schema';

export interface TestDataConfig {
  clientCount: number;
  leadCount: number;
  transactionCount: number;
  accountCount: number;
  expenseCount: number;
  invoiceCount: number;
  projectCount: number;
  propertyCount: number;
  campaignCount: number;
  reportCount: number;
  includeEdgeCases: boolean;
  realisticData: boolean;
}

export class TestDataSeeder {
  private config: TestDataConfig;

  constructor(config: Partial<TestDataConfig> = {}) {
    this.config = {
      clientCount: 50,
      leadCount: 100,
      transactionCount: 500,
      accountCount: 20,
      expenseCount: 200,
      invoiceCount: 150,
      projectCount: 30,
      propertyCount: 15,
      campaignCount: 25,
      reportCount: 40,
      includeEdgeCases: true,
      realisticData: true,
      ...config
    };
  }

  /**
   * Seed all test data
   */
  async seedAll(): Promise<void> {
    console.log('🌱 Starting comprehensive test data seeding...');
    
    try {
      // Seed in dependency order
      await this.seedClients();
      await this.seedLeads();
      await this.seedAccounts();
      await this.seedTransactions();
      await this.seedExpenses();
      await this.seedInvoices();
      await this.seedProjects();
      await this.seedProperties();
      await this.seedCampaigns();
      await this.seedReports();
      await this.seedNotifications();
      await this.seedAIConversations();
      await this.seedCollaborationSessions();
      await this.seedTimeEntries();
      await this.seedTenants();
      await this.seedPayments();

      console.log('✅ Test data seeding completed successfully');
    } catch (error) {
      console.error('❌ Test data seeding failed:', error);
      throw error;
    }
  }

  /**
   * Seed client data with realistic business information
   */
  private async seedClients(): Promise<void> {
    console.log(`👥 Seeding ${this.config.clientCount} clients...`);
    
    const clientData = Array.from({ length: this.config.clientCount }, () => ({
      id: faker.string.uuid(),
      name: faker.company.name(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
      businessType: faker.helpers.arrayElement(['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship']),
      industry: faker.helpers.arrayElement(['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Services']),
      annualRevenue: faker.number.int({ min: 50000, max: 10000000 }),
      employeeCount: faker.number.int({ min: 1, max: 500 }),
      status: faker.helpers.arrayElement(['active', 'inactive', 'prospect']),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
      notes: faker.lorem.paragraph(),
      tags: faker.helpers.arrayElements(['vip', 'enterprise', 'startup', 'enterprise', 'government'], { min: 0, max: 3 }),
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 }),
    }));

    await db.insert(clients).values(clientData);
    console.log(`✅ Seeded ${clientData.length} clients`);
  }

  /**
   * Seed lead data with realistic sales pipeline information
   */
  private async seedLeads(): Promise<void> {
    console.log(`🎯 Seeding ${this.config.leadCount} leads...`);
    
    const leadData = Array.from({ length: this.config.leadCount }, () => ({
      id: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      company: faker.company.name(),
      jobTitle: faker.person.jobTitle(),
      industry: faker.helpers.arrayElement(['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing']),
      source: faker.helpers.arrayElement(['Website', 'Referral', 'Cold Call', 'Trade Show', 'Social Media', 'Email Campaign']),
      status: faker.helpers.arrayElement(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
      estimatedValue: faker.number.int({ min: 1000, max: 100000 }),
      probability: faker.number.int({ min: 10, max: 90 }),
      expectedCloseDate: faker.date.future({ years: 1 }),
      notes: faker.lorem.paragraph(),
      tags: faker.helpers.arrayElements(['hot', 'warm', 'cold', 'enterprise', 'startup'], { min: 0, max: 2 }),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 30 }),
    }));

    await db.insert(leads).values(leadData);
    console.log(`✅ Seeded ${leadData.length} leads`);
  }

  /**
   * Seed account data with realistic financial account information
   */
  private async seedAccounts(): Promise<void> {
    console.log(`🏦 Seeding ${this.config.accountCount} accounts...`);
    
    const accountData = Array.from({ length: this.config.accountCount }, () => ({
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement([
        'Business Checking',
        'Business Savings',
        'Credit Card',
        'Line of Credit',
        'Investment Account',
        'Payroll Account',
        'Tax Account',
        'Emergency Fund'
      ]),
      type: faker.helpers.arrayElement(['checking', 'savings', 'credit', 'investment', 'loan']),
      bankName: faker.helpers.arrayElement(['Chase', 'Bank of America', 'Wells Fargo', 'Capital One', 'PNC', 'US Bank']),
      accountNumber: faker.finance.accountNumber(),
      routingNumber: faker.finance.routingNumber(),
      balance: faker.number.float({ min: -50000, max: 1000000, fractionDigits: 2 }),
      currency: 'USD',
      status: faker.helpers.arrayElement(['active', 'inactive', 'closed']),
      isReconciled: faker.datatype.boolean(),
      lastReconciledAt: faker.date.recent({ days: 30 }),
      notes: faker.lorem.sentence(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }));

    await db.insert(accounts).values(accountData);
    console.log(`✅ Seeded ${accountData.length} accounts`);
  }

  /**
   * Seed transaction data with realistic financial transactions
   */
  private async seedTransactions(): Promise<void> {
    console.log(`💰 Seeding ${this.config.transactionCount} transactions...`);
    
    const transactionData = Array.from({ length: this.config.transactionCount }, () => {
      const amount = faker.number.float({ min: 1, max: 50000, fractionDigits: 2 });
      const isIncome = faker.datatype.boolean({ probability: 0.3 });
      
      return {
        id: faker.string.uuid(),
        accountId: faker.string.uuid(), // This would be linked to actual account IDs in real implementation
        clientId: faker.string.uuid(), // This would be linked to actual client IDs in real implementation
        type: faker.helpers.arrayElement(['income', 'expense', 'transfer', 'refund', 'fee']),
        category: isIncome 
          ? faker.helpers.arrayElement(['Sales', 'Service Revenue', 'Interest', 'Investment', 'Refund'])
          : faker.helpers.arrayElement(['Office Supplies', 'Software', 'Marketing', 'Travel', 'Utilities', 'Rent']),
        description: faker.lorem.sentence(),
        amount: isIncome ? amount : -amount,
        currency: 'USD',
        status: faker.helpers.arrayElement(['pending', 'completed', 'failed', 'cancelled']),
        paymentMethod: faker.helpers.arrayElement(['credit_card', 'bank_transfer', 'check', 'cash', 'paypal']),
        reference: faker.finance.transactionDescription(),
        tags: faker.helpers.arrayElements(['business', 'personal', 'tax-deductible', 'recurring'], { min: 0, max: 2 }),
        notes: faker.lorem.paragraph(),
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: faker.date.recent({ days: 7 }),
      };
    });

    await db.insert(transactions).values(transactionData);
    console.log(`✅ Seeded ${transactionData.length} transactions`);
  }

  /**
   * Seed expense data with realistic business expenses
   */
  private async seedExpenses(): Promise<void> {
    console.log(`🧾 Seeding ${this.config.expenseCount} expenses...`);
    
    const expenseData = Array.from({ length: this.config.expenseCount }, () => ({
      id: faker.string.uuid(),
      clientId: faker.string.uuid(),
      category: faker.helpers.arrayElement(['Travel', 'Meals', 'Office Supplies', 'Software', 'Marketing', 'Professional Services']),
      description: faker.lorem.sentence(),
      amount: faker.number.float({ min: 10, max: 5000, fractionDigits: 2 }),
      currency: 'USD',
      status: faker.helpers.arrayElement(['pending', 'approved', 'rejected', 'reimbursed']),
      receiptUrl: faker.image.url(),
      vendor: faker.company.name(),
      date: faker.date.past({ years: 1 }),
      approvedBy: faker.person.fullName(),
      approvedAt: faker.date.recent({ days: 30 }),
      notes: faker.lorem.paragraph(),
      tags: faker.helpers.arrayElements(['urgent', 'tax-deductible', 'recurring', 'one-time'], { min: 0, max: 2 }),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }));

    await db.insert(expenses).values(expenseData);
    console.log(`✅ Seeded ${expenseData.length} expenses`);
  }

  /**
   * Seed invoice data with realistic billing information
   */
  private async seedInvoices(): Promise<void> {
    console.log(`📄 Seeding ${this.config.invoiceCount} invoices...`);
    
    const invoiceData = Array.from({ length: this.config.invoiceCount }, () => {
      const subtotal = faker.number.float({ min: 100, max: 50000, fractionDigits: 2 });
      const taxRate = 0.08; // 8% tax
      const tax = subtotal * taxRate;
      const total = subtotal + tax;
      
      return {
        id: faker.string.uuid(),
        clientId: faker.string.uuid(),
        invoiceNumber: faker.finance.accountNumber(),
        status: faker.helpers.arrayElement(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
        subtotal,
        tax,
        total,
        currency: 'USD',
        dueDate: faker.date.future({ years: 1 }),
        paidAt: faker.date.recent({ days: 30 }),
        notes: faker.lorem.paragraph(),
        terms: 'Net 30',
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: faker.date.recent({ days: 7 }),
      };
    });

    await db.insert(invoices).values(invoiceData);
    console.log(`✅ Seeded ${invoiceData.length} invoices`);
  }

  /**
   * Seed project data with realistic project information
   */
  private async seedProjects(): Promise<void> {
    console.log(`📋 Seeding ${this.config.projectCount} projects...`);
    
    const projectData = Array.from({ length: this.config.projectCount }, () => ({
      id: faker.string.uuid(),
      clientId: faker.string.uuid(),
      name: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      status: faker.helpers.arrayElement(['planning', 'active', 'on-hold', 'completed', 'cancelled']),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
      startDate: faker.date.past({ years: 1 }),
      endDate: faker.date.future({ years: 1 }),
      budget: faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 }),
      actualCost: faker.number.float({ min: 500, max: 80000, fractionDigits: 2 }),
      progress: faker.number.int({ min: 0, max: 100 }),
      tags: faker.helpers.arrayElements(['urgent', 'high-value', 'strategic', 'maintenance'], { min: 0, max: 2 }),
      notes: faker.lorem.paragraph(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }));

    await db.insert(projects).values(projectData);
    console.log(`✅ Seeded ${projectData.length} projects`);
  }

  /**
   * Seed property data for real estate management
   */
  private async seedProperties(): Promise<void> {
    console.log(`🏠 Seeding ${this.config.propertyCount} properties...`);
    
    const propertyData = Array.from({ length: this.config.propertyCount }, () => ({
      id: faker.string.uuid(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      type: faker.helpers.arrayElement(['residential', 'commercial', 'industrial', 'retail']),
      status: faker.helpers.arrayElement(['available', 'rented', 'maintenance', 'sold']),
      rentAmount: faker.number.float({ min: 500, max: 10000, fractionDigits: 2 }),
      purchasePrice: faker.number.float({ min: 100000, max: 2000000, fractionDigits: 2 }),
      squareFootage: faker.number.int({ min: 500, max: 10000 }),
      bedrooms: faker.number.int({ min: 1, max: 5 }),
      bathrooms: faker.number.int({ min: 1, max: 4 }),
      yearBuilt: faker.number.int({ min: 1950, max: 2023 }),
      notes: faker.lorem.paragraph(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }));

    await db.insert(properties).values(propertyData);
    console.log(`✅ Seeded ${propertyData.length} properties`);
  }

  /**
   * Seed campaign data for advertising management
   */
  private async seedCampaigns(): Promise<void> {
    console.log(`📢 Seeding ${this.config.campaignCount} campaigns...`);
    
    const campaignData = Array.from({ length: this.config.campaignCount }, () => ({
      id: faker.string.uuid(),
      name: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      status: faker.helpers.arrayElement(['draft', 'active', 'paused', 'completed', 'cancelled']),
      type: faker.helpers.arrayElement(['search', 'display', 'social', 'video', 'email']),
      platform: faker.helpers.arrayElement(['Google', 'Facebook', 'LinkedIn', 'Twitter', 'Instagram']),
      budget: faker.number.float({ min: 100, max: 50000, fractionDigits: 2 }),
      spent: faker.number.float({ min: 50, max: 40000, fractionDigits: 2 }),
      startDate: faker.date.past({ years: 1 }),
      endDate: faker.date.future({ years: 1 }),
      impressions: faker.number.int({ min: 1000, max: 1000000 }),
      clicks: faker.number.int({ min: 10, max: 10000 }),
      conversions: faker.number.int({ min: 1, max: 100 }),
      ctr: faker.number.float({ min: 0.01, max: 0.1, fractionDigits: 4 }),
      cpc: faker.number.float({ min: 0.5, max: 10, fractionDigits: 2 }),
      roas: faker.number.float({ min: 1, max: 10, fractionDigits: 2 }),
      tags: faker.helpers.arrayElements(['high-performing', 'low-budget', 'seasonal', 'brand'], { min: 0, max: 2 }),
      notes: faker.lorem.paragraph(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }));

    await db.insert(campaigns).values(campaignData);
    console.log(`✅ Seeded ${campaignData.length} campaigns`);
  }

  /**
   * Seed report data for analytics and reporting
   */
  private async seedReports(): Promise<void> {
    console.log(`📊 Seeding ${this.config.reportCount} reports...`);
    
    const reportData = Array.from({ length: this.config.reportCount }, () => ({
      id: faker.string.uuid(),
      name: faker.lorem.words(3),
      type: faker.helpers.arrayElement(['financial', 'performance', 'analytics', 'compliance', 'custom']),
      status: faker.helpers.arrayElement(['draft', 'generating', 'completed', 'failed']),
      format: faker.helpers.arrayElement(['pdf', 'excel', 'csv', 'html']),
      schedule: faker.helpers.arrayElement(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'on-demand']),
      lastGenerated: faker.date.recent({ days: 30 }),
      nextScheduled: faker.date.future({ years: 1 }),
      parameters: JSON.stringify({
        dateRange: { start: faker.date.past({ years: 1 }), end: faker.date.recent() },
        filters: { status: 'active', category: 'business' }
      }),
      fileUrl: faker.image.url(),
      size: faker.number.int({ min: 1000, max: 10000000 }),
      tags: faker.helpers.arrayElements(['automated', 'manual', 'critical', 'archived'], { min: 0, max: 2 }),
      notes: faker.lorem.paragraph(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }));

    await db.insert(reports).values(reportData);
    console.log(`✅ Seeded ${reportData.length} reports`);
  }

  /**
   * Seed notification data for user notifications
   */
  private async seedNotifications(): Promise<void> {
    console.log(`🔔 Seeding notifications...`);
    
    const notificationData = Array.from({ length: 50 }, () => ({
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      type: faker.helpers.arrayElement(['info', 'warning', 'error', 'success']),
      title: faker.lorem.sentence(),
      message: faker.lorem.paragraph(),
      isRead: faker.datatype.boolean(),
      priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
      category: faker.helpers.arrayElement(['system', 'billing', 'security', 'feature']),
      actionUrl: faker.internet.url(),
      metadata: JSON.stringify({ source: 'system', timestamp: Date.now() }),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }));

    await db.insert(notifications).values(notificationData);
    console.log(`✅ Seeded ${notificationData.length} notifications`);
  }

  /**
   * Seed AI conversation data for AI assistant testing
   */
  private async seedAIConversations(): Promise<void> {
    console.log(`🤖 Seeding AI conversations...`);
    
    const conversationData = Array.from({ length: 20 }, () => ({
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      title: faker.lorem.words(3),
      status: faker.helpers.arrayElement(['active', 'archived', 'deleted']),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }));

    await db.insert(aiConversations).values(conversationData);

    // Seed AI messages for each conversation
    const messageData = conversationData.flatMap(conversation => 
      Array.from({ length: faker.number.int({ min: 2, max: 10 }) }, () => ({
        id: faker.string.uuid(),
        conversationId: conversation.id,
        role: faker.helpers.arrayElement(['user', 'assistant']),
        content: faker.lorem.paragraph(),
        metadata: JSON.stringify({ tokens: faker.number.int({ min: 10, max: 1000 }) }),
        createdAt: faker.date.past({ years: 1 }),
      }))
    );

    await db.insert(aiMessages).values(messageData);
    console.log(`✅ Seeded ${conversationData.length} conversations and ${messageData.length} messages`);
  }

  /**
   * Seed collaboration session data
   */
  private async seedCollaborationSessions(): Promise<void> {
    console.log(`🤝 Seeding collaboration sessions...`);
    
    const sessionData = Array.from({ length: 15 }, () => ({
      id: faker.string.uuid(),
      name: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      status: faker.helpers.arrayElement(['active', 'paused', 'completed', 'cancelled']),
      participants: faker.helpers.arrayElements(['user1', 'user2', 'user3', 'user4'], { min: 2, max: 4 }),
      maxParticipants: faker.number.int({ min: 2, max: 10 }),
      startDate: faker.date.past({ years: 1 }),
      endDate: faker.date.future({ years: 1 }),
      tags: faker.helpers.arrayElements(['urgent', 'brainstorming', 'review', 'planning'], { min: 0, max: 2 }),
      notes: faker.lorem.paragraph(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }));

    await db.insert(collaborationSessions).values(sessionData);
    console.log(`✅ Seeded ${sessionData.length} collaboration sessions`);
  }

  /**
   * Seed time entry data for project tracking
   */
  private async seedTimeEntries(): Promise<void> {
    console.log(`⏰ Seeding time entries...`);
    
    const timeEntryData = Array.from({ length: 200 }, () => ({
      id: faker.string.uuid(),
      projectId: faker.string.uuid(),
      userId: faker.string.uuid(),
      description: faker.lorem.sentence(),
      hours: faker.number.float({ min: 0.5, max: 8, fractionDigits: 2 }),
      date: faker.date.past({ years: 1 }),
      billable: faker.datatype.boolean(),
      rate: faker.number.float({ min: 25, max: 200, fractionDigits: 2 }),
      status: faker.helpers.arrayElement(['draft', 'submitted', 'approved', 'rejected']),
      tags: faker.helpers.arrayElements(['development', 'meeting', 'research', 'testing'], { min: 0, max: 2 }),
      notes: faker.lorem.paragraph(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }));

    await db.insert(timeEntries).values(timeEntryData);
    console.log(`✅ Seeded ${timeEntryData.length} time entries`);
  }

  /**
   * Seed tenant data for property management
   */
  private async seedTenants(): Promise<void> {
    console.log(`🏠 Seeding tenants...`);
    
    const tenantData = Array.from({ length: 30 }, () => ({
      id: faker.string.uuid(),
      propertyId: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      status: faker.helpers.arrayElement(['active', 'inactive', 'pending', 'evicted']),
      leaseStartDate: faker.date.past({ years: 1 }),
      leaseEndDate: faker.date.future({ years: 1 }),
      rentAmount: faker.number.float({ min: 500, max: 5000, fractionDigits: 2 }),
      securityDeposit: faker.number.float({ min: 500, max: 3000, fractionDigits: 2 }),
      emergencyContact: faker.person.fullName(),
      emergencyPhone: faker.phone.number(),
      notes: faker.lorem.paragraph(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }));

    await db.insert(tenants).values(tenantData);
    console.log(`✅ Seeded ${tenantData.length} tenants`);
  }

  /**
   * Seed payment data for financial transactions
   */
  private async seedPayments(): Promise<void> {
    console.log(`💳 Seeding payments...`);
    
    const paymentData = Array.from({ length: 300 }, () => ({
      id: faker.string.uuid(),
      clientId: faker.string.uuid(),
      invoiceId: faker.string.uuid(),
      amount: faker.number.float({ min: 100, max: 10000, fractionDigits: 2 }),
      currency: 'USD',
      method: faker.helpers.arrayElement(['credit_card', 'bank_transfer', 'check', 'cash', 'paypal']),
      status: faker.helpers.arrayElement(['pending', 'completed', 'failed', 'refunded']),
      reference: faker.finance.transactionDescription(),
      processedAt: faker.date.recent({ days: 30 }),
      notes: faker.lorem.sentence(),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }));

    await db.insert(payments).values(paymentData);
    console.log(`✅ Seeded ${paymentData.length} payments`);
  }

  /**
   * Clear all test data
   */
  async clearAll(): Promise<void> {
    console.log('🧹 Clearing all test data...');
    
    try {
      // Clear in reverse dependency order
      await db.delete(payments);
      await db.delete(tenants);
      await db.delete(timeEntries);
      await db.delete(collaborationSessions);
      await db.delete(aiMessages);
      await db.delete(aiConversations);
      await db.delete(notifications);
      await db.delete(reports);
      await db.delete(campaigns);
      await db.delete(properties);
      await db.delete(projects);
      await db.delete(invoices);
      await db.delete(expenses);
      await db.delete(transactions);
      await db.delete(accounts);
      await db.delete(leads);
      await db.delete(clients);

      console.log('✅ All test data cleared');
    } catch (error) {
      console.error('❌ Failed to clear test data:', error);
      throw error;
    }
  }

  /**
   * Get data statistics
   */
  async getStats(): Promise<Record<string, number>> {
    const stats = {
      clients: await db.select().from(clients).then(rows => rows.length),
      leads: await db.select().from(leads).then(rows => rows.length),
      transactions: await db.select().from(transactions).then(rows => rows.length),
      accounts: await db.select().from(accounts).then(rows => rows.length),
      expenses: await db.select().from(expenses).then(rows => rows.length),
      invoices: await db.select().from(invoices).then(rows => rows.length),
      projects: await db.select().from(projects).then(rows => rows.length),
      properties: await db.select().from(properties).then(rows => rows.length),
      campaigns: await db.select().from(campaigns).then(rows => rows.length),
      reports: await db.select().from(reports).then(rows => rows.length),
    };

    return stats;
  }
}

// Export default seeder instance
export const testDataSeeder = new TestDataSeeder();

// Export seeder class for custom configurations
export { TestDataSeeder };
