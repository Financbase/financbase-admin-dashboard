import { createOAuthHandler } from '@/lib/oauth/oauth-handler';

export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  created: number;
  metadata: Record<string, string>;
}

export interface StripePayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customer: string;
  created: number;
  description?: string;
  metadata: Record<string, string>;
}

export interface StripeInvoice {
  id: string;
  customer: string;
  amount_due: number;
  currency: string;
  status: string;
  created: number;
  due_date?: number;
  description?: string;
  metadata: Record<string, string>;
}

export class StripeIntegration {
  private oauthHandler: any;
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.oauthHandler = createOAuthHandler('stripe', {
      clientId: process.env.STRIPE_CLIENT_ID!,
      clientSecret: process.env.STRIPE_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/stripe/callback`,
      authorizationUrl: 'https://connect.stripe.com/oauth/authorize',
      tokenUrl: 'https://connect.stripe.com/oauth/token',
      scope: ['read_write'],
    });
  }

  /**
   * Get Stripe account information
   */
  async getAccountInfo(): Promise<any> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      'https://api.stripe.com/v1/account',
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to get Stripe account info: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Sync customers from Stripe
   */
  async syncCustomers(limit: number = 100): Promise<StripeCustomer[]> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      `https://api.stripe.com/v1/customers?limit=${limit}`,
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to sync customers: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((customer: any) => ({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      created: customer.created,
      metadata: customer.metadata,
    }));
  }

  /**
   * Sync payments from Stripe
   */
  async syncPayments(limit: number = 100): Promise<StripePayment[]> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      `https://api.stripe.com/v1/payment_intents?limit=${limit}`,
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to sync payments: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((payment: any) => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      customer: payment.customer,
      created: payment.created,
      description: payment.description,
      metadata: payment.metadata,
    }));
  }

  /**
   * Sync invoices from Stripe
   */
  async syncInvoices(limit: number = 100): Promise<StripeInvoice[]> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      `https://api.stripe.com/v1/invoices?limit=${limit}`,
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to sync invoices: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((invoice: any) => ({
      id: invoice.id,
      customer: invoice.customer,
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status,
      created: invoice.created,
      due_date: invoice.due_date,
      description: invoice.description,
      metadata: invoice.metadata,
    }));
  }

  /**
   * Create a customer in Stripe
   */
  async createCustomer(customerData: {
    email: string;
    name: string;
    metadata?: Record<string, string>;
  }): Promise<StripeCustomer> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      'https://api.stripe.com/v1/customers',
      this.accessToken,
      {
        method: 'POST',
        body: JSON.stringify(customerData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create customer: ${response.statusText}`);
    }

    const customer = await response.json();
    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      created: customer.created,
      metadata: customer.metadata,
    };
  }

  /**
   * Create an invoice in Stripe
   */
  async createInvoice(invoiceData: {
    customer: string;
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<StripeInvoice> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      'https://api.stripe.com/v1/invoices',
      this.accessToken,
      {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create invoice: ${response.statusText}`);
    }

    const invoice = await response.json();
    return {
      id: invoice.id,
      customer: invoice.customer,
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status,
      created: invoice.created,
      due_date: invoice.due_date,
      description: invoice.description,
      metadata: invoice.metadata,
    };
  }

  /**
   * Test the connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getAccountInfo();
      return true;
    } catch (error) {
      console.error('Stripe connection test failed:', error);
      return false;
    }
  }

  /**
   * Get webhook events (for incoming webhooks)
   */
  async getWebhookEvents(limit: number = 100): Promise<any[]> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      `https://api.stripe.com/v1/events?limit=${limit}`,
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to get webhook events: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }
}
