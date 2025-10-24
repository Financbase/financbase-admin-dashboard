#!/usr/bin/env tsx

/**
 * Test Data Seeder for Financbase Dashboard
 * Seeds realistic test data for dashboard components and e2e tests
 */

import { db } from '../lib/db';
import * as schema from '../lib/db/schemas/index';
import { sql } from 'drizzle-orm';

// Configuration
const SEED_CONFIG = {
  users: 5,
  clients: 20,
  transactions: 100,
  projects: 15,
  leads: 10,
  expenses: 50,
  invoices: 30,
};

// Helper function to create realistic financial data
function generateRealisticAmount(min: number, max: number, decimals: number = 2): string {
  return (Math.floor(Math.random() * (max - min + 1)) + min).toFixed(decimals);
}

// Helper function to generate realistic dates
function generateRecentDate(daysAgo: number = 90): Date {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (Math.random() * daysAgo * 24 * 60 * 60 * 1000));
  return pastDate;
}

async function seedUsers() {
  console.log('🌱 Seeding users...');

  const users = [];

  for (let i = 0; i < SEED_CONFIG.users; i++) {
    const userData = {
      id: `user_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: `test${i}@example.com`,
      name: `Test User ${i}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=test${i}`,
      role: ['admin', 'user', 'viewer'][Math.floor(Math.random() * 3)] as 'admin' | 'user' | 'viewer',
      isActive: true,
      lastLogin: new Date(),
      createdAt: generateRecentDate(180),
      updatedAt: new Date(),
    };

    await db.insert(schema.users).values(userData);
    users.push(userData);
  }

  console.log(`✅ Created ${users.length} users`);
  return users;
}

async function seedClients(userId: string) {
  console.log('🌱 Seeding clients...');

  const clients = [];

  for (let i = 0; i < SEED_CONFIG.clients; i++) {
    const clientData = {
      id: `client_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      companyName: `Test Company ${i}`,
      contactName: `John Doe ${i}`,
      email: `client${i}@example.com`,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      address: `123 Test St, Test City, TS 12345`,
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'US',
      currency: 'USD',
      paymentTerms: ['15', '30', '45', '60'][Math.floor(Math.random() * 4)],
      taxId: `${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 900000) + 100000}`,
      website: `https://example${i}.com`,
      industry: ['technology', 'healthcare', 'finance', 'retail', 'consulting'][Math.floor(Math.random() * 5)],
      status: ['active', 'inactive', 'prospect'][Math.floor(Math.random() * 3)] as 'active' | 'inactive' | 'prospect',
      notes: `Test client ${i} notes`,
      isActive: Math.random() > 0.2,
      createdAt: generateRecentDate(365),
      updatedAt: new Date(),
    };

    await db.insert(schema.clients).values(clientData);
    clients.push(clientData);
  }

  console.log(`✅ Created ${clients.length} clients`);
  return clients;
}

async function seedTransactions(userId: string) {
  console.log('🌱 Seeding transactions...');

  const transactions = [];
  const statuses = ['completed', 'pending', 'cancelled'];

  for (let i = 0; i < SEED_CONFIG.transactions; i++) {
    const isIncome = Math.random() > 0.4;
    const amount = generateRealisticAmount(
      isIncome ? 1000 : 100,
      isIncome ? 50000 : 10000
    );

    const transactionData = {
      id: `txn_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      transactionNumber: `TXN-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      type: isIncome ? 'income' : 'expense',
      amount,
      currency: 'USD',
      description: `Test transaction ${i}`,
      category: ['sales', 'services', 'products', 'marketing', 'operations', 'other'][Math.floor(Math.random() * 6)],
      status: statuses[Math.floor(Math.random() * statuses.length)] as 'completed' | 'pending' | 'cancelled',
      transactionDate: generateRecentDate(90),
      reference: Math.random().toString(36).substr(2, 10),
      notes: `Transaction notes ${i}`,
      createdAt: generateRecentDate(90),
      updatedAt: new Date(),
    };

    await db.insert(schema.transactions).values(transactionData);
    transactions.push(transactionData);
  }

  console.log(`✅ Created ${transactions.length} transactions`);
  return transactions;
}

async function seedProjects(userId: string, clients: Array<{id: string}>) {
  console.log('🌱 Seeding projects...');

  const projects = [];

  for (let i = 0; i < SEED_CONFIG.projects; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const budget = generateRealisticAmount(5000, 100000);

    const projectData = {
      id: `project_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      clientId: client.id,
      name: `Test Project ${i}`,
      description: `Test project ${i} description`,
      status: ['active', 'completed', 'on-hold', 'cancelled'][Math.floor(Math.random() * 4)] as 'active' | 'completed' | 'on-hold' | 'cancelled',
      priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)] as 'low' | 'medium' | 'high' | 'urgent',
      budget,
      spent: generateRealisticAmount(0, parseFloat(budget) * 0.8),
      startDate: generateRecentDate(180),
      endDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000),
      completionPercentage: Math.floor(Math.random() * 101),
      tags: ['web-design', 'development', 'consulting', 'maintenance'][Math.floor(Math.random() * 4)],
      notes: `Project notes ${i}`,
      createdAt: generateRecentDate(180),
      updatedAt: new Date(),
    };

    await db.insert(schema.projects).values(projectData);
    projects.push(projectData);
  }

  console.log(`✅ Created ${projects.length} projects`);
  return projects;
}

async function seedLeads(userId: string) {
  console.log('🌱 Seeding leads...');

  const leads = [];
  const sources = ['website', 'referral', 'social-media', 'cold-outreach', 'advertising'];
  const priorities = ['low', 'medium', 'high'];

  for (let i = 0; i < SEED_CONFIG.leads; i++) {
    const leadData = {
      id: `lead_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      firstName: `Lead${i}`,
      lastName: `Person${i}`,
      email: `lead${i}@example.com`,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      company: `Lead Company ${i}`,
      jobTitle: `Manager${i}`,
      source: sources[Math.floor(Math.random() * sources.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'][Math.floor(Math.random() * 7)] as 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost',
      estimatedValue: generateRealisticAmount(10000, 200000),
      probability: Math.floor(Math.random() * 90) + 10,
      expectedCloseDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
      notes: `Lead notes ${i}`,
      tags: ['enterprise', 'small-business', 'startup', 'non-profit'][Math.floor(Math.random() * 4)],
      createdAt: generateRecentDate(180),
      updatedAt: new Date(),
    };

    await db.insert(schema.leads).values(leadData);
    leads.push(leadData);
  }

  console.log(`✅ Created ${leads.length} leads`);
  return leads;
}

async function seedExpenses(userId: string) {
  console.log('🌱 Seeding expenses...');

  const expenses = [];
  const expenseCategories = [
    'office-supplies', 'software', 'marketing', 'travel', 'meals',
    'utilities', 'rent', 'insurance', 'professional-services', 'other'
  ];

  for (let i = 0; i < SEED_CONFIG.expenses; i++) {
    const expenseData = {
      id: `expense_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      description: `Test expense ${i}`,
      amount: generateRealisticAmount(50, 5000),
      currency: 'USD',
      category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
      vendor: `Vendor ${i}`,
      date: generateRecentDate(90),
      receipt: `https://example.com/receipt${i}.jpg`,
      paymentMethod: ['credit-card', 'bank-transfer', 'cash', 'check'][Math.floor(Math.random() * 4)],
      notes: `Expense notes ${i}`,
      createdAt: generateRecentDate(90),
      updatedAt: new Date(),
    };

    await db.insert(schema.expenses).values(expenseData);
    expenses.push(expenseData);
  }

  console.log(`✅ Created ${expenses.length} expenses`);
  return expenses;
}

async function seedInvoices(userId: string, clients: Array<{id: string}>) {
  console.log('🌱 Seeding invoices...');

  const invoices = [];

  for (let i = 0; i < SEED_CONFIG.invoices; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const amount = generateRealisticAmount(1000, 25000);

    const invoiceData = {
      id: `invoice_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      clientId: client.id,
      invoiceNumber: `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'][Math.floor(Math.random() * 6)] as 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled',
      issueDate: generateRecentDate(60),
      dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      paidDate: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
      subtotal: amount,
      taxRate: '0.08',
      taxAmount: generateRealisticAmount(0, parseFloat(amount) * 0.15),
      discountAmount: generateRealisticAmount(0, parseFloat(amount) * 0.1),
      total: amount,
      currency: 'USD',
      notes: `Invoice notes ${i}`,
      terms: 'Net 30 days',
      metadata: JSON.stringify({ test: true }),
      createdAt: generateRecentDate(60),
      updatedAt: new Date(),
      contractorId: null,
    };

    await db.insert(schema.invoices).values(invoiceData);
    invoices.push(invoiceData);
  }

  console.log(`✅ Created ${invoices.length} invoices`);
  return invoices;
}

// Main seeding function
async function seedTestData() {
  try {
    console.log('🚀 Starting test data seeding...');
    console.log('📊 Configuration:', SEED_CONFIG);

    // Clear existing test data using proper Drizzle syntax
    console.log('🧹 Clearing existing test data...');
    await db.delete(schema.invoices).where(sql`id LIKE 'invoice_test_%'`);
    await db.delete(schema.expenses).where(sql`id LIKE 'expense_test_%'`);
    await db.delete(schema.leads).where(sql`id LIKE 'lead_test_%'`);
    await db.delete(schema.projects).where(sql`id LIKE 'project_test_%'`);
    await db.delete(schema.transactions).where(sql`id LIKE 'txn_test_%'`);
    await db.delete(schema.clients).where(sql`id LIKE 'client_test_%'`);
    await db.delete(schema.users).where(sql`id LIKE 'user_test_%'`);

    // Seed in order of dependencies
    const users = await seedUsers();
    const primaryUser = users[0];

    const clients = await seedClients(primaryUser.id);
    await seedTransactions(primaryUser.id);
    await seedProjects(primaryUser.id, clients);
    await seedLeads(primaryUser.id);
    await seedExpenses(primaryUser.id);
    await seedInvoices(primaryUser.id, clients);

    console.log('\n🎉 Test data seeding completed successfully!');
    console.log(`📈 Created realistic data for ${users.length} users`);
    console.log(`🏢 ${clients.length} clients with various industries`);
    console.log(`💰 ${SEED_CONFIG.transactions} transactions with realistic amounts`);
    console.log(`📋 ${SEED_CONFIG.projects} projects with budgets and timelines`);
    console.log(`🎯 ${SEED_CONFIG.leads} leads with different priorities`);
    console.log(`🧾 ${SEED_CONFIG.expenses} expenses across categories`);
    console.log(`📄 ${SEED_CONFIG.invoices} invoices with various statuses`);

    console.log('\n✅ Dashboard should now display realistic metrics and data!');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  }
}

// Run the seeder if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestData()
    .then(() => {
      console.log('\n✨ Test data seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedTestData, SEED_CONFIG };
