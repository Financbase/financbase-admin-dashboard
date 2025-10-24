/**
 * Invoice PDF Customizer Plugin
 * 
 * Allows users to customize invoice PDF templates with their branding,
 * colors, and layout preferences.
 */

import { BasePlugin, PluginAPI, PluginContext, PluginManifest } from '../plugin-sdk';

export class InvoicePdfCustomizerPlugin extends BasePlugin {
  private templateCache: Map<string, any> = new Map();

  async initialize(): Promise<void> {
    await this.api.log.info('Invoice PDF Customizer plugin initialized');
    
    // Load default templates
    await this.loadDefaultTemplates();
  }

  async cleanup(): Promise<void> {
    await this.api.log.info('Invoice PDF Customizer plugin cleaned up');
    this.templateCache.clear();
  }

  getManifest(): PluginManifest {
    return {
      name: 'Invoice PDF Customizer',
      version: '1.0.0',
      description: 'Customize invoice PDF templates with your branding and layout preferences',
      author: 'Financbase Team',
      main: 'invoice-pdf-customizer.js',
      hooks: ['invoice.created', 'invoice.updated'],
      permissions: ['read:invoices', 'write:invoices'],
      dependencies: {},
      settings: [
        {
          key: 'defaultTemplate',
          type: 'string',
          required: true,
          default: 'modern',
          description: 'Default template style'
        },
        {
          key: 'companyLogo',
          type: 'string',
          required: false,
          description: 'Company logo URL'
        },
        {
          key: 'primaryColor',
          type: 'string',
          required: false,
          default: '#3B82F6',
          description: 'Primary brand color'
        },
        {
          key: 'secondaryColor',
          type: 'string',
          required: false,
          default: '#6B7280',
          description: 'Secondary brand color'
        },
        {
          key: 'fontFamily',
          type: 'string',
          required: false,
          default: 'Inter',
          description: 'Font family for invoices'
        },
        {
          key: 'showPaymentTerms',
          type: 'boolean',
          required: false,
          default: true,
          description: 'Show payment terms on invoice'
        },
        {
          key: 'showTaxBreakdown',
          type: 'boolean',
          required: false,
          default: true,
          description: 'Show tax breakdown'
        }
      ]
    };
  }

  /**
   * Handle invoice creation - apply custom template
   */
  async onInvoiceCreated(invoice: any): Promise<void> {
    try {
      // Generate custom PDF for the invoice
      const pdfUrl = await this.generateCustomPdf(invoice);
      
      // Store PDF URL in invoice metadata
      await this.api.create.updateInvoice(invoice.id, {
        customPdfUrl: pdfUrl
      });

      await this.api.log.info('Custom PDF generated for invoice', {
        invoiceId: invoice.id,
        pdfUrl
      });
    } catch (error) {
      await this.api.log.error('Failed to generate custom PDF', { error: error.message });
    }
  }

  /**
   * Handle invoice updates - regenerate PDF if needed
   */
  async onInvoiceUpdated(invoice: any): Promise<void> {
    try {
      // Check if invoice data that affects PDF has changed
      const shouldRegenerate = this.shouldRegeneratePdf(invoice);
      
      if (shouldRegenerate) {
        const pdfUrl = await this.generateCustomPdf(invoice);
        
        await this.api.create.updateInvoice(invoice.id, {
          customPdfUrl: pdfUrl
        });

        await this.api.log.info('Custom PDF regenerated for invoice', {
          invoiceId: invoice.id,
          pdfUrl
        });
      }
    } catch (error) {
      await this.api.log.error('Failed to regenerate custom PDF', { error: error.message });
    }
  }

  /**
   * Generate custom PDF for invoice
   */
  private async generateCustomPdf(invoice: any): Promise<string> {
    try {
      const template = await this.getTemplate(invoice);
      const pdfData = await this.renderPdf(invoice, template);
      
      // In a real implementation, this would upload to storage
      const pdfUrl = `https://storage.financbase.com/invoices/${invoice.id}/custom.pdf`;
      
      return pdfUrl;
    } catch (error) {
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  /**
   * Get template for invoice
   */
  private async getTemplate(invoice: any): Promise<any> {
    const templateName = this.context.settings.defaultTemplate || 'modern';
    
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName);
    }

    const template = await this.loadTemplate(templateName);
    this.templateCache.set(templateName, template);
    
    return template;
  }

  /**
   * Load template from storage or default templates
   */
  private async loadTemplate(templateName: string): Promise<any> {
    try {
      // Try to load from user's custom templates first
      const customTemplate = await this.api.storage.get(`template_${templateName}`);
      if (customTemplate) {
        return customTemplate;
      }

      // Fall back to default templates
      return this.getDefaultTemplate(templateName);
    } catch (error) {
      await this.api.log.warn('Failed to load custom template, using default', { templateName });
      return this.getDefaultTemplate(templateName);
    }
  }

  /**
   * Get default template
   */
  private getDefaultTemplate(templateName: string): any {
    const defaultTemplates = {
      modern: {
        name: 'Modern',
        layout: 'single-column',
        header: {
          showLogo: true,
          showCompanyInfo: true,
          showInvoiceNumber: true
        },
        body: {
          showItems: true,
          showSubtotal: true,
          showTax: true,
          showTotal: true
        },
        footer: {
          showPaymentTerms: true,
          showThankYou: true
        },
        colors: {
          primary: this.context.settings.primaryColor || '#3B82F6',
          secondary: this.context.settings.secondaryColor || '#6B7280'
        },
        fonts: {
          primary: this.context.settings.fontFamily || 'Inter',
          size: '14px'
        }
      },
      classic: {
        name: 'Classic',
        layout: 'two-column',
        header: {
          showLogo: true,
          showCompanyInfo: true,
          showInvoiceNumber: true
        },
        body: {
          showItems: true,
          showSubtotal: true,
          showTax: true,
          showTotal: true
        },
        footer: {
          showPaymentTerms: true,
          showThankYou: true
        },
        colors: {
          primary: '#1F2937',
          secondary: '#6B7280'
        },
        fonts: {
          primary: 'Times New Roman',
          size: '12px'
        }
      },
      minimal: {
        name: 'Minimal',
        layout: 'single-column',
        header: {
          showLogo: false,
          showCompanyInfo: true,
          showInvoiceNumber: true
        },
        body: {
          showItems: true,
          showSubtotal: true,
          showTax: false,
          showTotal: true
        },
        footer: {
          showPaymentTerms: false,
          showThankYou: false
        },
        colors: {
          primary: '#000000',
          secondary: '#666666'
        },
        fonts: {
          primary: 'Helvetica',
          size: '12px'
        }
      }
    };

    return defaultTemplates[templateName] || defaultTemplates.modern;
  }

  /**
   * Render PDF with template
   */
  private async renderPdf(invoice: any, template: any): Promise<Buffer> {
    // In a real implementation, this would use a PDF generation library like Puppeteer or PDFKit
    // For demo purposes, we'll return a mock PDF buffer
    
    const pdfData = {
      template,
      invoice,
      settings: this.context.settings,
      timestamp: new Date().toISOString()
    };

    // Mock PDF generation
    return Buffer.from(JSON.stringify(pdfData));
  }

  /**
   * Check if PDF should be regenerated
   */
  private shouldRegeneratePdf(invoice: any): boolean {
    // Regenerate if amount, currency, or items changed
    return invoice.amount !== invoice.previousAmount ||
           invoice.currency !== invoice.previousCurrency ||
           JSON.stringify(invoice.items) !== JSON.stringify(invoice.previousItems);
  }

  /**
   * Load default templates
   */
  private async loadDefaultTemplates(): Promise<void> {
    const templates = ['modern', 'classic', 'minimal'];
    
    for (const templateName of templates) {
      const template = this.getDefaultTemplate(templateName);
      this.templateCache.set(templateName, template);
    }

    await this.api.log.info('Default templates loaded', {
      templateCount: templates.length
    });
  }

  /**
   * Save custom template
   */
  public async saveCustomTemplate(templateName: string, template: any): Promise<void> {
    try {
      await this.api.storage.set(`template_${templateName}`, template);
      this.templateCache.set(templateName, template);
      
      await this.api.log.info('Custom template saved', { templateName });
    } catch (error) {
      await this.api.log.error('Failed to save custom template', { 
        templateName, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get available templates
   */
  public getAvailableTemplates(): string[] {
    return Array.from(this.templateCache.keys());
  }

  /**
   * Preview template
   */
  public async previewTemplate(templateName: string, invoice: any): Promise<string> {
    try {
      const template = await this.getTemplate(templateName);
      const previewData = await this.renderPdf(invoice, template);
      
      // Return preview URL
      return `https://preview.financbase.com/templates/${templateName}/preview.pdf`;
    } catch (error) {
      throw new Error(`Failed to preview template: ${error.message}`);
    }
  }
}
