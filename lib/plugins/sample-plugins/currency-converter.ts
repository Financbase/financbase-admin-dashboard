/**
 * Currency Converter Plugin
 * 
 * Automatically converts invoice amounts to different currencies
 * based on current exchange rates.
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { BasePlugin, PluginAPI, PluginContext, PluginManifest } from '../plugin-sdk';

export class CurrencyConverterPlugin extends BasePlugin {
  private exchangeRates: Record<string, number> = {};
  private lastUpdate: Date | null = null;

  async initialize(): Promise<void> {
    await this.api.log.info('Currency Converter plugin initialized');
    
    // Load exchange rates on startup
    await this.loadExchangeRates();
    
    // Set up periodic rate updates (every hour)
    setInterval(() => {
      this.loadExchangeRates();
    }, 60 * 60 * 1000);
  }

  async cleanup(): Promise<void> {
    await this.api.log.info('Currency Converter plugin cleaned up');
  }

  getManifest(): PluginManifest {
    return {
      name: 'Currency Converter',
      version: '1.0.0',
      description: 'Automatically converts invoice amounts to different currencies using real-time exchange rates',
      author: 'Financbase Team',
      main: 'currency-converter.js',
      hooks: ['invoice.created', 'invoice.updated'],
      permissions: ['read:invoices', 'write:invoices'],
      dependencies: {},
      settings: [
        {
          key: 'defaultCurrency',
          type: 'string',
          required: true,
          default: 'USD',
          description: 'Default currency for conversions'
        },
        {
          key: 'autoConvert',
          type: 'boolean',
          required: false,
          default: true,
          description: 'Automatically convert new invoices'
        },
        {
          key: 'updateFrequency',
          type: 'number',
          required: false,
          default: 3600,
          description: 'Exchange rate update frequency in seconds'
        }
      ]
    };
  }

  /**
   * Handle invoice creation - convert to default currency if needed
   */
  async onInvoiceCreated(invoice: any): Promise<void> {
    try {
      const autoConvert = this.context.settings.autoConvert;
      if (!autoConvert) return;

      const defaultCurrency = this.context.settings.defaultCurrency;
      if (invoice.currency === defaultCurrency) return;

      // Convert invoice amount
      const convertedAmount = await this.convertCurrency(
        invoice.amount,
        invoice.currency,
        defaultCurrency
      );

      if (convertedAmount !== invoice.amount) {
        // Update the invoice with converted amount
        await this.api.create.updateInvoice(invoice.id, {
          amount: convertedAmount,
          currency: defaultCurrency
        });

        await this.api.log.info('Invoice converted to default currency', {
          originalAmount: invoice.amount,
          originalCurrency: invoice.currency,
          convertedAmount,
          convertedCurrency: defaultCurrency
        });
      }
    } catch (error) {
      await this.api.log.error('Failed to convert invoice currency', { error: error.message });
    }
  }

  /**
   * Handle invoice updates - check if currency conversion is needed
   */
  async onInvoiceUpdated(invoice: any): Promise<void> {
    try {
      const defaultCurrency = this.context.settings.defaultCurrency;
      if (invoice.currency === defaultCurrency) return;

      // Check if amount or currency changed
      const convertedAmount = await this.convertCurrency(
        invoice.amount,
        invoice.currency,
        defaultCurrency
      );

      if (convertedAmount !== invoice.amount) {
        await this.api.create.updateInvoice(invoice.id, {
          amount: convertedAmount,
          currency: defaultCurrency
        });

        await this.api.log.info('Invoice currency updated', {
          invoiceId: invoice.id,
          convertedAmount,
          convertedCurrency: defaultCurrency
        });
      }
    } catch (error) {
      await this.api.log.error('Failed to update invoice currency', { error: error.message });
    }
  }

  /**
   * Convert currency amount using current exchange rates
   */
  private async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) return amount;

    // Ensure we have fresh exchange rates
    await this.ensureFreshRates();

    const fromRate = this.exchangeRates[fromCurrency] || 1;
    const toRate = this.exchangeRates[toCurrency] || 1;

    // Convert: amount * (toRate / fromRate)
    const convertedAmount = amount * (toRate / fromRate);
    
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Load exchange rates from external API
   */
  private async loadExchangeRates(): Promise<void> {
    try {
      // In a real implementation, this would call an external API
      // For demo purposes, we'll use mock data
      this.exchangeRates = {
        'USD': 1.0,
        'EUR': 0.85,
        'GBP': 0.73,
        'JPY': 110.0,
        'CAD': 1.25,
        'AUD': 1.35,
        'CHF': 0.92,
        'CNY': 6.45,
        'INR': 74.0,
        'BRL': 5.2
      };

      this.lastUpdate = new Date();
      
      await this.api.log.info('Exchange rates updated', {
        ratesCount: Object.keys(this.exchangeRates).length,
        lastUpdate: this.lastUpdate
      });
    } catch (error) {
      await this.api.log.error('Failed to load exchange rates', { error: error.message });
    }
  }

  /**
   * Ensure exchange rates are fresh
   */
  private async ensureFreshRates(): Promise<void> {
    const updateFrequency = this.context.settings.updateFrequency || 3600;
    const now = new Date();
    
    if (!this.lastUpdate || 
        (now.getTime() - this.lastUpdate.getTime()) > (updateFrequency * 1000)) {
      await this.loadExchangeRates();
    }
  }

  /**
   * Get current exchange rate between two currencies
   */
  public async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    await this.ensureFreshRates();
    
    const fromRate = this.exchangeRates[fromCurrency] || 1;
    const toRate = this.exchangeRates[toCurrency] || 1;
    
    return toRate / fromRate;
  }

  /**
   * Get all available currencies
   */
  public getAvailableCurrencies(): string[] {
    return Object.keys(this.exchangeRates);
  }

  /**
   * Get last update time
   */
  public getLastUpdate(): Date | null {
    return this.lastUpdate;
  }
}
