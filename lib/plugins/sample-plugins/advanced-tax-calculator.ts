/**
 * Advanced Tax Calculator Plugin
 * 
 * Provides sophisticated tax calculation capabilities including
 * multiple tax rates, tax exemptions, and region-specific rules.
 */

import { BasePlugin, PluginAPI, PluginContext, PluginManifest } from '../plugin-sdk';

export class AdvancedTaxCalculatorPlugin extends BasePlugin {
  private taxRules: Map<string, any> = new Map();
  private exemptions: Map<string, any> = new Map();

  async initialize(): Promise<void> {
    await this.api.log.info('Advanced Tax Calculator plugin initialized');
    
    // Load tax rules and exemptions
    await this.loadTaxRules();
    await this.loadExemptions();
  }

  async cleanup(): Promise<void> {
    await this.api.log.info('Advanced Tax Calculator plugin cleaned up');
    this.taxRules.clear();
    this.exemptions.clear();
  }

  getManifest(): PluginManifest {
    return {
      name: 'Advanced Tax Calculator',
      version: '1.0.0',
      description: 'Advanced tax calculation with multiple rates, exemptions, and region-specific rules',
      author: 'Financbase Team',
      main: 'advanced-tax-calculator.js',
      hooks: ['invoice.created', 'invoice.updated', 'expense.created'],
      permissions: ['read:invoices', 'write:invoices', 'read:expenses', 'write:expenses'],
      dependencies: {},
      settings: [
        {
          key: 'defaultTaxRate',
          type: 'number',
          required: true,
          default: 0.1,
          description: 'Default tax rate (0.1 = 10%)'
        },
        {
          key: 'taxInclusive',
          type: 'boolean',
          required: false,
          default: false,
          description: 'Whether prices include tax'
        },
        {
          key: 'roundTax',
          type: 'boolean',
          required: false,
          default: true,
          description: 'Round tax amounts to nearest cent'
        },
        {
          key: 'showTaxBreakdown',
          type: 'boolean',
          required: false,
          default: true,
          description: 'Show detailed tax breakdown'
        },
        {
          key: 'enableExemptions',
          type: 'boolean',
          required: false,
          default: true,
          description: 'Enable tax exemptions'
        }
      ]
    };
  }

  /**
   * Handle invoice creation - calculate taxes
   */
  async onInvoiceCreated(invoice: any): Promise<void> {
    try {
      const taxCalculation = await this.calculateTaxes(invoice);
      
      if (taxCalculation.totalTax > 0) {
        await this.api.create.updateInvoice(invoice.id, {
          taxAmount: taxCalculation.totalTax,
          taxBreakdown: taxCalculation.breakdown,
          totalAmount: invoice.amount + taxCalculation.totalTax
        });

        await this.api.log.info('Taxes calculated for invoice', {
          invoiceId: invoice.id,
          taxAmount: taxCalculation.totalTax,
          taxRate: taxCalculation.effectiveRate
        });
      }
    } catch (error) {
      await this.api.log.error('Failed to calculate taxes for invoice', { 
        invoiceId: invoice.id,
        error: error.message 
      });
    }
  }

  /**
   * Handle invoice updates - recalculate taxes if needed
   */
  async onInvoiceUpdated(invoice: any): Promise<void> {
    try {
      // Check if tax calculation is needed
      if (this.shouldRecalculateTax(invoice)) {
        const taxCalculation = await this.calculateTaxes(invoice);
        
        await this.api.create.updateInvoice(invoice.id, {
          taxAmount: taxCalculation.totalTax,
          taxBreakdown: taxCalculation.breakdown,
          totalAmount: invoice.amount + taxCalculation.totalTax
        });

        await this.api.log.info('Taxes recalculated for invoice', {
          invoiceId: invoice.id,
          taxAmount: taxCalculation.totalTax
        });
      }
    } catch (error) {
      await this.api.log.error('Failed to recalculate taxes', { 
        invoiceId: invoice.id,
        error: error.message 
      });
    }
  }

  /**
   * Handle expense creation - apply tax rules
   */
  async onExpenseCreated(expense: any): Promise<void> {
    try {
      const taxCalculation = await this.calculateExpenseTax(expense);
      
      if (taxCalculation.totalTax > 0) {
        await this.api.create.updateExpense(expense.id, {
          taxAmount: taxCalculation.totalTax,
          taxBreakdown: taxCalculation.breakdown,
          totalAmount: expense.amount + taxCalculation.totalTax
        });

        await this.api.log.info('Taxes calculated for expense', {
          expenseId: expense.id,
          taxAmount: taxCalculation.totalTax
        });
      }
    } catch (error) {
      await this.api.log.error('Failed to calculate taxes for expense', { 
        expenseId: expense.id,
        error: error.message 
      });
    }
  }

  /**
   * Calculate taxes for invoice
   */
  private async calculateTaxes(invoice: any): Promise<any> {
    const breakdown: any[] = [];
    let totalTax = 0;
    let effectiveRate = 0;

    // Get applicable tax rules
    const taxRules = await this.getApplicableTaxRules(invoice);
    
    for (const rule of taxRules) {
      const taxAmount = this.calculateTaxForRule(invoice, rule);
      
      if (taxAmount > 0) {
        breakdown.push({
          name: rule.name,
          rate: rule.rate,
          amount: taxAmount,
          type: rule.type,
          jurisdiction: rule.jurisdiction
        });
        
        totalTax += taxAmount;
      }
    }

    // Calculate effective rate
    if (invoice.amount > 0) {
      effectiveRate = totalTax / invoice.amount;
    }

    return {
      totalTax: this.context.settings.roundTax ? Math.round(totalTax * 100) / 100 : totalTax,
      breakdown,
      effectiveRate,
      taxInclusive: this.context.settings.taxInclusive
    };
  }

  /**
   * Calculate taxes for expense
   */
  private async calculateExpenseTax(expense: any): Promise<any> {
    const breakdown: any[] = [];
    let totalTax = 0;

    // Get applicable tax rules for expense
    const taxRules = await this.getApplicableTaxRules(expense);
    
    for (const rule of taxRules) {
      const taxAmount = this.calculateTaxForRule(expense, rule);
      
      if (taxAmount > 0) {
        breakdown.push({
          name: rule.name,
          rate: rule.rate,
          amount: taxAmount,
          type: rule.type,
          jurisdiction: rule.jurisdiction
        });
        
        totalTax += taxAmount;
      }
    }

    return {
      totalTax: this.context.settings.roundTax ? Math.round(totalTax * 100) / 100 : totalTax,
      breakdown,
      taxInclusive: this.context.settings.taxInclusive
    };
  }

  /**
   * Get applicable tax rules for transaction
   */
  private async getApplicableTaxRules(transaction: any): Promise<any[]> {
    const rules: any[] = [];
    
    // Get rules based on customer location, item categories, etc.
    const customerLocation = await this.getCustomerLocation(transaction.customerId);
    const itemCategories = this.getItemCategories(transaction.items || []);
    
    for (const [ruleId, rule] of this.taxRules) {
      if (this.isRuleApplicable(rule, customerLocation, itemCategories)) {
        rules.push(rule);
      }
    }
    
    return rules;
  }

  /**
   * Calculate tax amount for specific rule
   */
  private calculateTaxForRule(transaction: any, rule: any): number {
    let taxableAmount = transaction.amount;
    
    // Apply exemptions
    if (this.context.settings.enableExemptions) {
      const exemption = this.getApplicableExemption(transaction, rule);
      if (exemption) {
        taxableAmount *= (1 - exemption.rate);
      }
    }
    
    // Calculate tax
    let taxAmount = taxableAmount * rule.rate;
    
    // Apply rule-specific calculations
    if (rule.minimum && taxAmount < rule.minimum) {
      taxAmount = rule.minimum;
    }
    
    if (rule.maximum && taxAmount > rule.maximum) {
      taxAmount = rule.maximum;
    }
    
    return taxAmount;
  }

  /**
   * Check if tax should be recalculated
   */
  private shouldRecalculateTax(transaction: any): boolean {
    // Recalculate if amount, customer, or items changed
    return transaction.amount !== transaction.previousAmount ||
           transaction.customerId !== transaction.previousCustomerId ||
           JSON.stringify(transaction.items) !== JSON.stringify(transaction.previousItems);
  }

  /**
   * Load tax rules from storage
   */
  private async loadTaxRules(): Promise<void> {
    try {
      // Load from storage or use default rules
      const storedRules = await this.api.storage.get('tax_rules');
      
      if (storedRules) {
        this.taxRules = new Map(Object.entries(storedRules));
      } else {
        // Load default tax rules
        await this.loadDefaultTaxRules();
      }
      
      await this.api.log.info('Tax rules loaded', {
        ruleCount: this.taxRules.size
      });
    } catch (error) {
      await this.api.log.error('Failed to load tax rules', { error: error.message });
      await this.loadDefaultTaxRules();
    }
  }

  /**
   * Load default tax rules
   */
  private async loadDefaultTaxRules(): Promise<void> {
    const defaultRules = {
      'us_sales_tax': {
        name: 'US Sales Tax',
        rate: 0.08,
        type: 'sales',
        jurisdiction: 'US',
        applicableStates: ['CA', 'NY', 'TX', 'FL'],
        minimum: 0,
        maximum: null
      },
      'eu_vat': {
        name: 'EU VAT',
        rate: 0.20,
        type: 'vat',
        jurisdiction: 'EU',
        applicableCountries: ['DE', 'FR', 'IT', 'ES'],
        minimum: 0,
        maximum: null
      },
      'canada_gst': {
        name: 'Canada GST',
        rate: 0.05,
        type: 'gst',
        jurisdiction: 'CA',
        applicableProvinces: ['ON', 'BC', 'AB'],
        minimum: 0,
        maximum: null
      }
    };

    this.taxRules = new Map(Object.entries(defaultRules));
  }

  /**
   * Load exemptions from storage
   */
  private async loadExemptions(): Promise<void> {
    try {
      const storedExemptions = await this.api.storage.get('tax_exemptions');
      
      if (storedExemptions) {
        this.exemptions = new Map(Object.entries(storedExemptions));
      }
      
      await this.api.log.info('Tax exemptions loaded', {
        exemptionCount: this.exemptions.size
      });
    } catch (error) {
      await this.api.log.error('Failed to load tax exemptions', { error: error.message });
    }
  }

  /**
   * Get customer location
   */
  private async getCustomerLocation(customerId: string): Promise<string> {
    try {
      const customer = await this.api.data.getCustomers({ id: customerId });
      return customer[0]?.address?.country || 'US';
    } catch (error) {
      return 'US'; // Default location
    }
  }

  /**
   * Get item categories from transaction
   */
  private getItemCategories(items: any[]): string[] {
    return items.map(item => item.category || 'general');
  }

  /**
   * Check if rule is applicable
   */
  private isRuleApplicable(rule: any, location: string, categories: string[]): boolean {
    // Check jurisdiction
    if (rule.jurisdiction && rule.jurisdiction !== location) {
      return false;
    }
    
    // Check applicable states/countries
    if (rule.applicableStates && !rule.applicableStates.includes(location)) {
      return false;
    }
    
    if (rule.applicableCountries && !rule.applicableCountries.includes(location)) {
      return false;
    }
    
    // Check category restrictions
    if (rule.excludedCategories && categories.some(cat => rule.excludedCategories.includes(cat))) {
      return false;
    }
    
    return true;
  }

  /**
   * Get applicable exemption
   */
  private getApplicableExemption(transaction: any, rule: any): any {
    for (const [exemptionId, exemption] of this.exemptions) {
      if (exemption.ruleId === rule.id && 
          exemption.customerId === transaction.customerId &&
          exemption.isActive) {
        return exemption;
      }
    }
    return null;
  }

  /**
   * Add custom tax rule
   */
  public async addTaxRule(rule: any): Promise<void> {
    try {
      const ruleId = this.api.utils.generateId();
      this.taxRules.set(ruleId, { ...rule, id: ruleId });
      
      // Save to storage
      const rulesObject = Object.fromEntries(this.taxRules);
      await this.api.storage.set('tax_rules', rulesObject);
      
      await this.api.log.info('Custom tax rule added', { ruleId, ruleName: rule.name });
    } catch (error) {
      await this.api.log.error('Failed to add tax rule', { error: error.message });
      throw error;
    }
  }

  /**
   * Get all tax rules
   */
  public getTaxRules(): any[] {
    return Array.from(this.taxRules.values());
  }

  /**
   * Calculate tax for specific amount and rule
   */
  public async calculateTaxForAmount(amount: number, ruleId: string): Promise<number> {
    const rule = this.taxRules.get(ruleId);
    if (!rule) {
      throw new Error('Tax rule not found');
    }
    
    return this.calculateTaxForRule({ amount }, rule);
  }
}
