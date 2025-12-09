/**
 * Financbase Plugin SDK
 * 
 * This SDK provides the necessary APIs and utilities for developing plugins
 * that extend the Financbase platform functionality.
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  hooks?: string[];
  permissions?: string[];
  dependencies?: Record<string, string>;
  settings?: Array<{
    key: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    required: boolean;
    default?: any;
    description?: string;
  }>;
}

export interface PluginContext {
  userId: string;
  organizationId?: string;
  pluginId: number;
  installationId: number;
  settings: Record<string, any>;
  permissions: string[];
}

export interface PluginAPI {
  // Data access methods
  data: {
    getInvoices: (filters?: InvoiceFilters) => Promise<Invoice[]>;
    getExpenses: (filters?: ExpenseFilters) => Promise<Expense[]>;
    getPayments: (filters?: PaymentFilters) => Promise<Payment[]>;
    getCustomers: (filters?: CustomerFilters) => Promise<Customer[]>;
    getReports: (filters?: ReportFilters) => Promise<Report[]>;
  };

  // Data modification methods
  create: {
    createInvoice: (data: CreateInvoiceData) => Promise<Invoice>;
    updateInvoice: (id: string, data: UpdateInvoiceData) => Promise<Invoice>;
    createExpense: (data: CreateExpenseData) => Promise<Expense>;
    updateExpense: (id: string, data: UpdateExpenseData) => Promise<Expense>;
    createPayment: (data: CreatePaymentData) => Promise<Payment>;
    createCustomer: (data: CreateCustomerData) => Promise<Customer>;
  };

  // Notification methods
  notifications: {
    sendEmail: (to: string, subject: string, body: string, options?: EmailOptions) => Promise<void>;
    sendSlackMessage: (channel: string, message: string, options?: SlackOptions) => Promise<void>;
    sendWebhook: (url: string, data: any, options?: WebhookOptions) => Promise<void>;
  };

  // Storage methods
  storage: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
    list: (prefix?: string) => Promise<string[]>;
  };

  // Logging methods
  log: {
    info: (message: string, context?: any) => Promise<void>;
    warn: (message: string, context?: any) => Promise<void>;
    error: (message: string, context?: any) => Promise<void>;
    debug: (message: string, context?: any) => Promise<void>;
  };

  // Utility methods
  utils: {
    formatCurrency: (amount: number, currency?: string) => string;
    formatDate: (date: Date, format?: string) => string;
    generateId: () => string;
    hash: (data: string) => string;
    encrypt: (data: string, key?: string) => string;
    decrypt: (data: string, key?: string) => string;
  };

  // UI methods
  ui: {
    showNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
    openModal: (component: React.ComponentType, props?: any) => void;
    closeModal: () => void;
    navigate: (path: string) => void;
  };
}

// Type definitions
export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: Date;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  name: string;
  type: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

// Filter interfaces
export interface InvoiceFilters {
  status?: string;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
}

export interface ExpenseFilters {
  category?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
}

export interface PaymentFilters {
  status?: string;
  method?: string;
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
}

export interface CustomerFilters {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface ReportFilters {
  type?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Create data interfaces
export interface CreateInvoiceData {
  customerId: string;
  amount: number;
  currency: string;
  dueDate: Date;
  description?: string;
  items?: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
}

export interface UpdateInvoiceData {
  amount?: number;
  currency?: string;
  dueDate?: Date;
  description?: string;
  status?: string;
  taxAmount?: number;
  total?: number;
  metadata?: Record<string, any>;
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: Date;
  receipt?: string;
}

export interface UpdateExpenseData {
  description?: string;
  amount?: number;
  currency?: string;
  category?: string;
  date?: Date;
  status?: string;
  taxAmount?: number;
  metadata?: Record<string, any>;
}

export interface CreatePaymentData {
  invoiceId: string;
  amount: number;
  currency: string;
  method: string;
  reference?: string;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

// Options interfaces
export interface EmailOptions {
  from?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

export interface SlackOptions {
  username?: string;
  icon?: string;
  attachments?: any[];
}

export interface WebhookOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

/**
 * Base Plugin Class
 * 
 * All plugins should extend this class and implement the required methods.
 */
export abstract class BasePlugin {
  protected api: PluginAPI;
  protected context: PluginContext;

  constructor(api: PluginAPI, context: PluginContext) {
    this.api = api;
    this.context = context;
  }

  /**
   * Initialize the plugin
   * Called when the plugin is first loaded
   */
  abstract initialize(): Promise<void>;

  /**
   * Cleanup the plugin
   * Called when the plugin is unloaded
   */
  abstract cleanup(): Promise<void>;

  /**
   * Get plugin manifest
   */
  abstract getManifest(): PluginManifest;

  /**
   * Handle plugin settings update
   */
  async onSettingsUpdate(newSettings: Record<string, any>): Promise<void> {
    // Override in plugin implementation
  }

  /**
   * Handle plugin activation
   */
  async onActivate(): Promise<void> {
    // Override in plugin implementation
  }

  /**
   * Handle plugin deactivation
   */
  async onDeactivate(): Promise<void> {
    // Override in plugin implementation
  }
}

/**
 * Plugin Development Utilities
 */
export class PluginDevUtils {
  /**
   * Create a new plugin project structure
   */
  static createPluginProject(name: string, description: string): PluginManifest {
    return {
      name,
      version: '1.0.0',
      description,
      author: 'Your Name',
      main: 'index.js',
      hooks: [],
      permissions: [],
      dependencies: {},
      settings: [],
    };
  }

  /**
   * Validate plugin manifest
   */
  static validateManifest(manifest: PluginManifest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!manifest.name) {
      errors.push('Plugin name is required');
    }

    if (!manifest.version) {
      errors.push('Plugin version is required');
    }

    if (!manifest.description) {
      errors.push('Plugin description is required');
    }

    if (!manifest.author) {
      errors.push('Plugin author is required');
    }

    if (!manifest.main) {
      errors.push('Plugin main entry point is required');
    }

    // Validate version format
    if (manifest.version && !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      errors.push('Plugin version must be in format x.y.z');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate plugin boilerplate code
   */
  static generateBoilerplate(manifest: PluginManifest): string {
    return `
import { BasePlugin, PluginAPI, PluginContext } from '@financbase/plugin-sdk';

export class ${manifest.name.replace(/[^a-zA-Z0-9]/g, '')}Plugin extends BasePlugin {
  constructor(api: PluginAPI, context: PluginContext) {
    super(api, context);
  }

  async initialize(): Promise<void> {
    // Initialize your plugin here
    await this.api.log.info('${manifest.name} plugin initialized');
  }

  async cleanup(): Promise<void> {
    // Cleanup your plugin here
    await this.api.log.info('${manifest.name} plugin cleaned up');
  }

  getManifest() {
    return {
      name: '${manifest.name}',
      version: '${manifest.version}',
      description: '${manifest.description}',
      author: '${manifest.author}',
      main: '${manifest.main}',
      hooks: [],
      permissions: [],
      dependencies: {},
      settings: [],
    };
  }

  // Add your plugin hooks here
  async onInvoiceCreated(invoice: any) {
    // Handle invoice creation
  }

  async onPaymentReceived(payment: any) {
    // Handle payment received
  }
}
`;
  }
}

/**
 * Plugin Hooks
 * 
 * These are the available hooks that plugins can implement
 */
export const PluginHooks = {
  // Invoice hooks
  INVOICE_CREATED: 'invoice.created',
  INVOICE_UPDATED: 'invoice.updated',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_OVERDUE: 'invoice.overdue',

  // Payment hooks
  PAYMENT_RECEIVED: 'payment.received',
  PAYMENT_FAILED: 'payment.failed',

  // Expense hooks
  EXPENSE_CREATED: 'expense.created',
  EXPENSE_APPROVED: 'expense.approved',
  EXPENSE_REJECTED: 'expense.rejected',

  // Customer hooks
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',

  // Report hooks
  REPORT_GENERATED: 'report.generated',

  // System hooks
  PLUGIN_ACTIVATED: 'plugin.activated',
  PLUGIN_DEACTIVATED: 'plugin.deactivated',
  SETTINGS_UPDATED: 'settings.updated',
} as const;

/**
 * Plugin Permissions
 * 
 * These are the available permissions that plugins can request
 */
export const PluginPermissions = {
  // Data access permissions
  READ_INVOICES: 'read:invoices',
  WRITE_INVOICES: 'write:invoices',
  READ_EXPENSES: 'read:expenses',
  WRITE_EXPENSES: 'write:expenses',
  READ_PAYMENTS: 'read:payments',
  WRITE_PAYMENTS: 'write:payments',
  READ_CUSTOMERS: 'read:customers',
  WRITE_CUSTOMERS: 'write:customers',
  READ_REPORTS: 'read:reports',
  WRITE_REPORTS: 'write:reports',

  // Notification permissions
  SEND_EMAIL: 'send:email',
  SEND_SLACK: 'send:slack',
  SEND_WEBHOOK: 'send:webhook',

  // Storage permissions
  READ_STORAGE: 'read:storage',
  WRITE_STORAGE: 'write:storage',

  // System permissions
  READ_SETTINGS: 'read:settings',
  WRITE_SETTINGS: 'write:settings',
  READ_LOGS: 'read:logs',
} as const;

/**
 * Plugin Development Guide
 */
export const PluginDevGuide = {
  gettingStarted: `
# Getting Started with Financbase Plugin Development

## Prerequisites
- Node.js 18+ 
- npm or yarn
- Basic knowledge of TypeScript/JavaScript

## Creating Your First Plugin

1. Create a new directory for your plugin
2. Initialize with npm: \`npm init -y\`
3. Install the Financbase Plugin SDK: \`npm install @financbase/plugin-sdk\`
4. Create your plugin file (e.g., index.js)

## Plugin Structure

\`\`\`javascript
import { BasePlugin } from '@financbase/plugin-sdk';

export class MyPlugin extends BasePlugin {
  async initialize() {
    // Plugin initialization
  }

  async cleanup() {
    // Plugin cleanup
  }

  getManifest() {
    return {
      name: 'My Plugin',
      version: '1.0.0',
      description: 'A sample plugin',
      author: 'Your Name',
      main: 'index.js',
      hooks: ['invoice.created'],
      permissions: ['read:invoices'],
    };
  }
}
\`\`\`

## Testing Your Plugin

Use the plugin development environment to test your plugin before publishing.
  `,

  bestPractices: `
# Plugin Development Best Practices

## Security
- Always validate input data
- Use the provided encryption utilities for sensitive data
- Request only the permissions you need
- Never store sensitive data in plain text

## Performance
- Use async/await for all operations
- Implement proper error handling
- Avoid blocking operations
- Use the storage API for caching

## User Experience
- Provide clear error messages
- Use the notification system for user feedback
- Implement proper loading states
- Follow the Financbase design guidelines

## Code Quality
- Use TypeScript for better type safety
- Write comprehensive tests
- Document your code
- Follow the plugin naming conventions
  `,

  publishing: `
# Publishing Your Plugin

## Preparation
1. Test your plugin thoroughly
2. Update your plugin manifest
3. Create comprehensive documentation
4. Prepare screenshots and descriptions

## Publishing Process
1. Submit your plugin for review
2. Wait for approval (usually 1-2 business days)
3. Your plugin will be available in the marketplace
4. Monitor user feedback and ratings

## Maintenance
- Keep your plugin updated
- Respond to user feedback
- Fix bugs promptly
- Add new features based on user requests
  `,
};
