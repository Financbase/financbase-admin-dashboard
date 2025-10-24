import { createOAuthHandler } from '@/lib/oauth/oauth-handler';

export interface QuickBooksCustomer {
  Id: string;
  Name: string;
  CompanyName?: string;
  Email?: string;
  Phone?: string;
  BillAddr?: {
    Line1?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
    Country?: string;
  };
  metadata?: Record<string, any>;
}

export interface QuickBooksInvoice {
  Id: string;
  DocNumber: string;
  CustomerRef: {
    value: string;
    name: string;
  };
  TotalAmt: number;
  Balance: number;
  TxnDate: string;
  DueDate?: string;
  Line: Array<{
    DetailType: string;
    Amount: number;
    Description?: string;
  }>;
  metadata?: Record<string, any>;
}

export interface QuickBooksPayment {
  Id: string;
  TotalAmt: number;
  TxnDate: string;
  CustomerRef: {
    value: string;
    name: string;
  };
  PaymentMethodRef?: {
    value: string;
    name: string;
  };
  metadata?: Record<string, any>;
}

export class QuickBooksIntegration {
  private oauthHandler: any;
  private accessToken: string;
  private companyId: string;
  private baseUrl: string;

  constructor(accessToken: string, companyId: string, isSandbox: boolean = true) {
    this.accessToken = accessToken;
    this.companyId = companyId;
    this.baseUrl = isSandbox 
      ? 'https://sandbox-quickbooks.api.intuit.com' 
      : 'https://quickbooks.api.intuit.com';
    
    this.oauthHandler = createOAuthHandler('quickbooks', {
      clientId: process.env.QUICKBOOKS_CLIENT_ID!,
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/quickbooks/callback`,
      authorizationUrl: 'https://appcenter.intuit.com/connect/oauth2',
      tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      scope: ['com.intuit.quickbooks.accounting'],
    });
  }

  /**
   * Get company information
   */
  async getCompanyInfo(): Promise<any> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      `${this.baseUrl}/v3/company/${this.companyId}/companyinfo/${this.companyId}`,
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to get company info: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Sync customers from QuickBooks
   */
  async syncCustomers(): Promise<QuickBooksCustomer[]> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      `${this.baseUrl}/v3/company/${this.companyId}/customers`,
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to sync customers: ${response.statusText}`);
    }

    const data = await response.json();
    return data.QueryResponse?.Customer?.map((customer: any) => ({
      Id: customer.Id,
      Name: customer.Name,
      CompanyName: customer.CompanyName,
      Email: customer.PrimaryEmailAddr?.Address,
      Phone: customer.PrimaryPhone?.FreeFormNumber,
      BillAddr: customer.BillAddr,
      metadata: customer,
    })) || [];
  }

  /**
   * Sync invoices from QuickBooks
   */
  async syncInvoices(): Promise<QuickBooksInvoice[]> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      `${this.baseUrl}/v3/company/${this.companyId}/invoices`,
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to sync invoices: ${response.statusText}`);
    }

    const data = await response.json();
    return data.QueryResponse?.Invoice?.map((invoice: any) => ({
      Id: invoice.Id,
      DocNumber: invoice.DocNumber,
      CustomerRef: invoice.CustomerRef,
      TotalAmt: invoice.TotalAmt,
      Balance: invoice.Balance,
      TxnDate: invoice.TxnDate,
      DueDate: invoice.DueDate,
      Line: invoice.Line,
      metadata: invoice,
    })) || [];
  }

  /**
   * Sync payments from QuickBooks
   */
  async syncPayments(): Promise<QuickBooksPayment[]> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      `${this.baseUrl}/v3/company/${this.companyId}/payments`,
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to sync payments: ${response.statusText}`);
    }

    const data = await response.json();
    return data.QueryResponse?.Payment?.map((payment: any) => ({
      Id: payment.Id,
      TotalAmt: payment.TotalAmt,
      TxnDate: payment.TxnDate,
      CustomerRef: payment.CustomerRef,
      PaymentMethodRef: payment.PaymentMethodRef,
      metadata: payment,
    })) || [];
  }

  /**
   * Create a customer in QuickBooks
   */
  async createCustomer(customerData: {
    Name: string;
    CompanyName?: string;
    Email?: string;
    Phone?: string;
    BillAddr?: {
      Line1?: string;
      City?: string;
      CountrySubDivisionCode?: string;
      PostalCode?: string;
      Country?: string;
    };
  }): Promise<QuickBooksCustomer> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      `${this.baseUrl}/v3/company/${this.companyId}/customers`,
      this.accessToken,
      {
        method: 'POST',
        body: JSON.stringify({
          Name: customerData.Name,
          CompanyName: customerData.CompanyName,
          PrimaryEmailAddr: customerData.Email ? { Address: customerData.Email } : undefined,
          PrimaryPhone: customerData.Phone ? { FreeFormNumber: customerData.Phone } : undefined,
          BillAddr: customerData.BillAddr,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create customer: ${response.statusText}`);
    }

    const data = await response.json();
    const customer = data.QueryResponse?.Customer?.[0];
    
    return {
      Id: customer.Id,
      Name: customer.Name,
      CompanyName: customer.CompanyName,
      Email: customer.PrimaryEmailAddr?.Address,
      Phone: customer.PrimaryPhone?.FreeFormNumber,
      BillAddr: customer.BillAddr,
      metadata: customer,
    };
  }

  /**
   * Create an invoice in QuickBooks
   */
  async createInvoice(invoiceData: {
    CustomerRef: { value: string };
    TxnDate: string;
    DueDate?: string;
    Line: Array<{
      DetailType: string;
      Amount: number;
      Description?: string;
    }>;
  }): Promise<QuickBooksInvoice> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      `${this.baseUrl}/v3/company/${this.companyId}/invoices`,
      this.accessToken,
      {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create invoice: ${response.statusText}`);
    }

    const data = await response.json();
    const invoice = data.QueryResponse?.Invoice?.[0];
    
    return {
      Id: invoice.Id,
      DocNumber: invoice.DocNumber,
      CustomerRef: invoice.CustomerRef,
      TotalAmt: invoice.TotalAmt,
      Balance: invoice.Balance,
      TxnDate: invoice.TxnDate,
      DueDate: invoice.DueDate,
      Line: invoice.Line,
      metadata: invoice,
    };
  }

  /**
   * Get account list
   */
  async getAccounts(): Promise<any[]> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      `${this.baseUrl}/v3/company/${this.companyId}/accounts`,
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to get accounts: ${response.statusText}`);
    }

    const data = await response.json();
    return data.QueryResponse?.Account || [];
  }

  /**
   * Get items/products
   */
  async getItems(): Promise<any[]> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      `${this.baseUrl}/v3/company/${this.companyId}/items`,
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to get items: ${response.statusText}`);
    }

    const data = await response.json();
    return data.QueryResponse?.Item || [];
  }

  /**
   * Test the connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getCompanyInfo();
      return true;
    } catch (error) {
      console.error('QuickBooks connection test failed:', error);
      return false;
    }
  }

  /**
   * Get reports
   */
  async getProfitAndLossReport(startDate: string, endDate: string): Promise<any> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      `${this.baseUrl}/v3/company/${this.companyId}/reports/ProfitAndLoss?start_date=${startDate}&end_date=${endDate}`,
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to get P&L report: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get balance sheet
   */
  async getBalanceSheetReport(asOfDate: string): Promise<any> {
    const response = await this.oauthHandler.makeAuthenticatedRequest(
      `${this.baseUrl}/v3/company/${this.companyId}/reports/BalanceSheet?as_of_date=${asOfDate}`,
      this.accessToken
    );

    if (!response.ok) {
      throw new Error(`Failed to get balance sheet: ${response.statusText}`);
    }

    return response.json();
  }
}
