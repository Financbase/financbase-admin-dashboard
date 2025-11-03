#!/usr/bin/env tsx

/**
 * Dashboard Data Seeder for Financbase
 * Seeds realistic dashboard data for a specific Clerk user ID
 * Usage: tsx scripts/seed-dashboard-data.ts <clerkUserId>
 */

import { db } from '../lib/db';
import { clients } from '../lib/db/schemas/clients.schema';
import { invoices } from '../lib/db/schemas/invoices.schema';
import { expenses } from '../lib/db/schemas/expenses.schema';
import { eq, sql } from 'drizzle-orm';

// Configuration
const SEED_CONFIG = {
  clients: 15,
  invoices: 40,
  expenses: 30,
};

// Helper function to generate realistic amounts
function generateAmount(min: number, max: number): string {
  return (Math.random() * (max - min) + min).toFixed(2);
}

// Helper function to generate dates within a range
function generateDateInRange(daysAgo: number, daysRange: number = 0): Date {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - daysAgo);
  
  if (daysRange > 0) {
    const randomDays = Math.floor(Math.random() * daysRange);
    startDate.setDate(startDate.getDate() - randomDays);
  }
  
  return startDate;
}

// Generate invoice number
function generateInvoiceNumber(index: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const seq = String(index + 1).padStart(4, '0');
  return `INV-${year}${month}-${seq}`;
}

// Generate invoice items
function generateInvoiceItems(amount: number): Array<{
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
}> {
  const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
  const items: Array<{ description: string; quantity: string; unitPrice: string; total: string }> = [];
  let remainingAmount = amount;

  for (let i = 0; i < numItems; i++) {
    const isLast = i === numItems - 1;
    const itemAmount = isLast ? remainingAmount : remainingAmount * (0.3 + Math.random() * 0.4);
    const quantity = Math.floor(Math.random() * 5) + 1;
    const unitPrice = (itemAmount / quantity).toFixed(2);
    
    items.push({
      description: `Service ${i + 1} - Professional services`,
      quantity: quantity.toString(),
      unitPrice,
      total: itemAmount.toFixed(2),
    });
    
    remainingAmount -= itemAmount;
  }

  return items;
}

async function seedClientsForUser(userId: string) {
  console.log('🌱 Seeding clients...');

  const clientNames = [
    'Acme Corporation', 'TechStart Inc', 'Digital Solutions', 'Global Industries',
    'Creative Agency', 'Business Partners', 'Strategic Consulting', 'Innovation Labs',
    'Smart Systems', 'Future Tech', 'Elite Services', 'Prime Solutions',
    'Advanced Dynamics', 'Core Business', 'Enterprise Solutions'
  ];

  const industries = ['technology', 'healthcare', 'finance', 'retail', 'consulting', 'manufacturing'];
  const seededClients = [];

  for (let i = 0; i < SEED_CONFIG.clients; i++) {
    const name = clientNames[i] || `Client ${i + 1}`;
    const isActive = Math.random() > 0.2; // 80% active
    
    const clientData = {
      userId,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      company: name,
      address: `${Math.floor(Math.random() * 9999) + 100} Main St`,
      city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
      state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
      zipCode: String(Math.floor(Math.random() * 90000) + 10000),
      country: 'US',
      currency: 'USD',
      paymentTerms: ['15', '30', '45', '60'][Math.floor(Math.random() * 4)],
      status: isActive ? 'active' : 'inactive',
      createdAt: generateDateInRange(365, 60),
    };

    try {
      const [inserted] = await db.insert(clients).values(clientData).returning();
      seededClients.push(inserted);
    } catch (error) {
      console.error(`Error creating client ${i + 1}:`, error);
    }
  }

  console.log(`✅ Created ${seededClients.length} clients`);
  return seededClients;
}

async function seedInvoicesForUser(userId: string, clientList: Array<{ id: number; name: string; email: string }>) {
  console.log('🌱 Seeding invoices...');

  if (clientList.length === 0) {
    console.log('⚠️  No clients available, skipping invoice seeding');
    return [];
  }

  const invoiceStatuses: Array<'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'> = [
    'draft', 'sent', 'viewed', 'paid', 'paid', 'paid', 'sent', 'paid', 'overdue', 'paid'
  ]; // More paid invoices for better revenue metrics

  const seededInvoices = [];

  for (let i = 0; i < SEED_CONFIG.invoices; i++) {
    const client = clientList[Math.floor(Math.random() * clientList.length)];
    const baseAmount = parseFloat(generateAmount(500, 25000));
    const taxRate = '0.08';
    const taxAmount = (baseAmount * 0.08).toFixed(2);
    const discountAmount = Math.random() > 0.7 ? generateAmount(0, baseAmount * 0.1) : '0';
    const subtotal = baseAmount.toFixed(2);
    const total = (baseAmount + parseFloat(taxAmount) - parseFloat(discountAmount)).toFixed(2);
    
    const status = invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)];
    const issueDate = generateDateInRange(90, 30);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);
    
    // Paid invoices should have paidDate
    const paidDate = status === 'paid' 
      ? generateDateInRange(30, 30) // Paid within last 30 days
      : null;

    const invoiceData = {
      userId,
      invoiceNumber: generateInvoiceNumber(i),
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientAddress: `${Math.floor(Math.random() * 9999) + 100} Main St, ${client.name}`,
      clientPhone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      currency: 'USD',
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      total,
      status,
      issueDate,
      dueDate,
      paidDate,
      sentDate: status !== 'draft' ? issueDate : null,
      amountPaid: status === 'paid' ? total : '0',
      paymentMethod: status === 'paid' ? ['credit-card', 'bank-transfer', 'check'][Math.floor(Math.random() * 3)] : null,
      notes: `Invoice for ${client.name}`,
      terms: 'Net 30 days',
      items: generateInvoiceItems(parseFloat(total)),
    };

    try {
      const [inserted] = await db.insert(invoices).values(invoiceData).returning();
      seededInvoices.push(inserted);
    } catch (error) {
      console.error(`Error creating invoice ${i + 1}:`, error);
    }
  }

  console.log(`✅ Created ${seededInvoices.length} invoices`);
  return seededInvoices;
}

async function seedExpensesForUser(userId: string) {
  console.log('🌱 Seeding expenses...');

  const expenseCategories = [
    'office-supplies', 'software', 'marketing', 'travel', 'meals',
    'utilities', 'rent', 'insurance', 'professional-services', 'other'
  ];

  const vendors = [
    'Office Depot', 'Microsoft', 'Google Ads', 'Uber', 'Starbucks',
    'Electric Company', 'Landlord Inc', 'Insurance Co', 'Consulting Firm', 'Various'
  ];

  const seededExpenses = [];

  for (let i = 0; i < SEED_CONFIG.expenses; i++) {
    const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    const amount = generateAmount(25, 5000);
    const expenseDate = generateDateInRange(90, 30);
    const status: 'pending' | 'approved' | 'rejected' = Math.random() > 0.1 ? 'approved' : 'pending';

    const expenseData = {
      userId,
      description: `${category.replace('-', ' ')} expense - ${vendor}`,
      amount,
      currency: 'USD',
      date: expenseDate,
      category,
      vendor,
      paymentMethod: ['credit-card', 'bank-transfer', 'cash'][Math.floor(Math.random() * 3)],
      status,
      taxDeductible: Math.random() > 0.3,
      notes: `Expense for ${category}`,
    };

    try {
      const [inserted] = await db.insert(expenses).values(expenseData).returning();
      seededExpenses.push(inserted);
    } catch (error) {
      console.error(`Error creating expense ${i + 1}:`, error);
    }
  }

  console.log(`✅ Created ${seededExpenses.length} expenses`);
  return seededExpenses;
}

export async function checkUserHasData(userId: string): Promise<{ hasClients: boolean; hasInvoices: boolean; hasExpenses: boolean }> {
  const [clientCount] = await db.select({ count: sql<number>`count(*)` }).from(clients).where(eq(clients.userId, userId));
  const [invoiceCount] = await db.select({ count: sql<number>`count(*)` }).from(invoices).where(eq(invoices.userId, userId));
  const [expenseCount] = await db.select({ count: sql<number>`count(*)` }).from(expenses).where(eq(expenses.userId, userId));

  return {
    hasClients: Number(clientCount?.count || 0) > 0,
    hasInvoices: Number(invoiceCount?.count || 0) > 0,
    hasExpenses: Number(expenseCount?.count || 0) > 0,
  };
}

async function clearUserData(userId: string) {
  console.log('🧹 Clearing existing user data...');
  
  await db.delete(expenses).where(eq(expenses.userId, userId));
  await db.delete(invoices).where(eq(invoices.userId, userId));
  await db.delete(clients).where(eq(clients.userId, userId));
  
  console.log('✅ Cleared existing user data');
}

export async function seedDashboardDataForUser(
  userId: string,
  options: { clearExisting?: boolean; skipIfExists?: boolean } = {}
) {
  try {
    console.log('🚀 Starting dashboard data seeding...');
    console.log(`👤 User ID: ${userId}`);
    console.log('📊 Configuration:', SEED_CONFIG);

    // Check if user already has data
    const existingData = await checkUserHasData(userId);
    const hasAnyData = existingData.hasClients || existingData.hasInvoices || existingData.hasExpenses;

    if (hasAnyData && options.skipIfExists) {
      console.log('ℹ️  User already has data, skipping seed (use clearExisting option to reseed)');
      return {
        success: true,
        skipped: true,
        message: 'User already has data',
      };
    }

    if (options.clearExisting && hasAnyData) {
      await clearUserData(userId);
    }

    // Seed data in order of dependencies
    const seededClients = await seedClientsForUser(userId);
    
    if (seededClients.length === 0 && !hasAnyData) {
      throw new Error('Failed to seed clients. Cannot proceed with invoices.');
    }

    // Get existing clients if we didn't seed new ones
    let clientsForInvoices = seededClients;
    if (seededClients.length === 0 && hasAnyData && existingData.hasClients) {
      const existingClients = await db.select().from(clients).where(eq(clients.userId, userId)).limit(5);
      clientsForInvoices = existingClients.map(c => ({ id: c.id, name: c.name, email: c.email || '' }));
    }

    await seedInvoicesForUser(userId, clientsForInvoices);
    await seedExpensesForUser(userId);

    console.log('\n🎉 Dashboard data seeding completed successfully!');
    console.log(`🏢 Created ${seededClients.length} clients`);
    console.log(`📄 Created ${SEED_CONFIG.invoices} invoices`);
    console.log(`🧾 Created ${SEED_CONFIG.expenses} expenses`);
    console.log('\n✅ Dashboard should now display populated metrics and data!');

    return {
      success: true,
      skipped: false,
      message: 'Data seeded successfully',
      counts: {
        clients: seededClients.length,
        invoices: SEED_CONFIG.invoices,
        expenses: SEED_CONFIG.expenses,
      },
    };
  } catch (error) {
    console.error('❌ Error seeding dashboard data:', error);
    throw error;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const userId = process.argv[2];
  const clearExisting = process.argv.includes('--clear');
  const skipIfExists = process.argv.includes('--skip-if-exists');

  if (!userId) {
    console.error('❌ Error: Clerk user ID is required');
    console.log('Usage: tsx scripts/seed-dashboard-data.ts <clerkUserId> [--clear] [--skip-if-exists]');
    process.exit(1);
  }

  seedDashboardDataForUser(userId, { clearExisting, skipIfExists })
    .then((result) => {
      console.log('\n✨ Seeding completed!', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { SEED_CONFIG };

